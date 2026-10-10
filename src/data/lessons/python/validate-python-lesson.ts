import type { PythonLesson } from "@/src/data/lessons/types";

export type PythonValidationResult = {
  output: string;
  displayOutput?: string;
  error: string | null;
  passed: boolean;
  message: string;
};

/** Runs Python and checks the lesson in an isolated, cancellable worker. */
export function validatePythonLesson(
  code: string,
  lesson: PythonLesson,
  inputs: string[] = [],
  signal?: AbortSignal,
  onInput?: (prompt: string, output: string) => Promise<string>,
  onOutput?: (output: string) => void,
): Promise<PythonValidationResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("/python/lesson-worker.js");
    let timer: ReturnType<typeof setTimeout>;
    const cleanUp = () => {
      clearTimeout(timer);
      worker.terminate();
      signal?.removeEventListener("abort", abort);
    };
    const fail = (message: string) => {
      cleanUp();
      reject(new Error(message));
    };
    const abort = () => fail("Run cancelled.");
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) {
      abort();
      return;
    }
    timer = setTimeout(() => fail("Python could not load in time. Check your connection and try again."), 60000);
    let remaining = lesson.validation.executionTimeoutMs ?? 3000;
    let started = 0;
    const resumeTimer = () => {
      started = Date.now();
      timer = setTimeout(() => fail("Your program took too long. Check for an endless loop and try again."), remaining);
    };
    worker.onmessage = async ({ data }) => {
      if (data.type === "ready") {
        clearTimeout(timer);
        resumeTimer();
      } else if (data.type === "input" && onInput) {
        clearTimeout(timer);
        remaining = Math.max(0, remaining - (Date.now() - started));
        try {
          const answer = await onInput(data.prompt, data.output);
          if (signal?.aborted) return;
          resumeTimer();
          worker.postMessage({ type: "input", answer });
        } catch {
          fail("Input cancelled.");
        }
      } else if (data.type === "output") {
        onOutput?.(data.output);
      } else if (data.type === "result") {
        cleanUp();
        resolve(data.result);
      } else if (data.type === "error") {
        fail(data.message);
      }
    };
    worker.onerror = () => fail("Could not start Python. Check your connection and try again.");
    worker.postMessage({ code, validation: lesson.validation, inputs, interactive: Boolean(onInput) });
  });
}
