"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { completeLesson } from "@/src/data/progress/progress";
import { validatePythonLesson } from "@/src/data/lessons/python/validate-python-lesson";
import type { PythonLesson } from "@/src/data/lessons/types";
import type { Track } from "@/src/data/tracks/tracks";

type PythonLessonViewProps = {
  lesson: PythonLesson;
  track: Track;
};

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: "on" as const,
};

export default function PythonLessonView({
  lesson,
  track,
}: PythonLessonViewProps) {
  const [code, setCode] = useState(lesson.starterCode);
  const [output, setOutput] = useState("Click Run to execute Python.");
  const [validationMessage, setValidationMessage] = useState(
    "Run your code to check this mission."
  );
  const [missionComplete, setMissionComplete] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [inputPrompt, setInputPrompt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const inputResolver = useRef<((answer: string) => void) | null>(null);
  const activeRun = useRef<AbortController | null>(null);
  useEffect(() => () => {
    activeRun.current?.abort();
    inputResolver.current?.("");
  }, []);
  const [editorWidth, setEditorWidth] = useState(62);
  const [instructionsHeight, setInstructionsHeight] = useState(58);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const currentLessonIndex = track.lessonSlugs.indexOf(lesson.slug);
  const nextLessonSlug = track.lessonSlugs[currentLessonIndex + 1];

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running Python...");
    setValidationMessage("Checking your mission...");

    const controller = new AbortController();
    activeRun.current?.abort();
    activeRun.current = controller;
    setMissionComplete(false);

    try {
      const result = await validatePythonLesson(
        code, lesson, [], controller.signal,
        (prompt, printedOutput) => new Promise<string>((resolve) => {
          setOutput(printedOutput);
          setInputPrompt(prompt || "Enter a value:");
          setAnswer("");
          setValidationMessage("Your program is waiting for your answer.");
          inputResolver.current = resolve;
        }),
        (printedOutput) => {
          if (!controller.signal.aborted) setOutput(printedOutput);
        },
      );
      if (controller.signal.aborted) return;
      setOutput((result.displayOutput ?? result.output) + (result.error ? `\nPython Error:\n${result.error}` : "") || "Done.");
      setMissionComplete(result.passed);
      setValidationMessage(result.message);
      if (result.passed) completeLesson(lesson.slug);
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      setValidationMessage(error instanceof Error ? error.message : String(error));
      setOutput("Run stopped.");
      setMissionComplete(false);
    } finally {
      if (!controller.signal.aborted) {
        activeRun.current = null;
        setInputPrompt(null);
        inputResolver.current = null;
        setIsRunning(false);
      }
    }
  };

  const handleReset = () => {
    activeRun.current?.abort();
    activeRun.current = null;
    setIsRunning(false);
    setCode(lesson.starterCode);
    setInputPrompt(null);
    inputResolver.current?.("");
    inputResolver.current = null;
    setOutput("Click Run to execute Python.");
    setValidationMessage("Run your code to check this mission.");
    setMissionComplete(false);
  };

  const startHorizontalResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    event.preventDefault();
    const bounds = workspace.getBoundingClientRect();

    beginResize("col-resize", (pointerEvent) => {
      const nextWidth =
        ((pointerEvent.clientX - bounds.left) / bounds.width) * 100;
      const maximumWidth = ((bounds.width - 372) / bounds.width) * 100;
      setEditorWidth(clamp(nextWidth, 35, Math.min(75, maximumWidth)));
    });
  };

  const startVerticalResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rightPanel = rightPanelRef.current;
    if (!rightPanel) return;

    event.preventDefault();
    const bounds = rightPanel.getBoundingClientRect();

    beginResize("row-resize", (pointerEvent) => {
      const nextHeight =
        ((pointerEvent.clientY - bounds.top) / bounds.height) * 100;
      const maximumHeight = ((bounds.height - 192) / bounds.height) * 100;
      setInstructionsHeight(clamp(nextHeight, 25, Math.min(75, maximumHeight)));
    });
  };

  const workspaceStyle = {
    "--editor-width": `${editorWidth}%`,
  } as CSSProperties;

  const rightPanelStyle = {
    "--instructions-height": `${instructionsHeight}%`,
  } as CSSProperties;

  return (
    <main className="min-h-dvh bg-slate-100 lg:h-dvh lg:overflow-hidden">
      <header className="flex min-h-20 flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <Link
            href={`/missions/${track.slug}`}
            className="text-sm font-semibold text-violet-800"
          >
            Back to {track.title}
          </Link>
          <div className="mt-1 flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
              {lesson.badge ?? track.title}
            </span>
            <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="rounded-xl bg-violet-900 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
          >
            Reset
          </button>
        </div>
      </header>

      <div
        ref={workspaceRef}
        style={workspaceStyle}
        className="grid gap-4 p-4 lg:h-[calc(100dvh-6.5rem)] lg:grid-cols-[minmax(0,var(--editor-width))_12px_minmax(360px,1fr)] lg:gap-0 lg:p-5"
      >
        <section className="flex min-h-[600px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-sm lg:min-h-0">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <h2 className="font-semibold text-white">Python Editor</h2>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
              PYTHON
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language="python"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={editorOptions}
            />
          </div>
        </section>

        <div
          role="separator"
          aria-label="Resize editor and lesson panels"
          aria-orientation="vertical"
          aria-valuenow={Math.round(editorWidth)}
          onPointerDown={startHorizontalResize}
          className="group hidden cursor-col-resize touch-none items-center justify-center lg:flex"
        >
          <div className="h-16 w-1 rounded-full bg-slate-300 transition group-hover:bg-violet-500 group-active:bg-violet-700" />
        </div>

        <div
          ref={rightPanelRef}
          style={rightPanelStyle}
          className="grid min-h-0 gap-4 lg:grid-rows-[minmax(0,var(--instructions-height))_12px_minmax(180px,1fr)] lg:gap-0"
        >
          <section className="min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Instructions</h2>

            {lesson.story && (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {lesson.story}
              </p>
            )}

            {lesson.example && (
              <section className="mt-5 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-bold text-violet-800">{lesson.example.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lesson.example.explanation}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="min-w-0 rounded-lg bg-slate-950 p-3">
                    <h4 className="text-xs font-semibold text-white">Example code</h4>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-100"><code>{lesson.example.code}</code></pre>
                  </div>
                  <div className="min-w-0 rounded-lg bg-slate-900 p-3">
                    <h4 className="text-xs font-semibold text-white">Example output</h4>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-emerald-300">{lesson.example.output}</pre>
                    {lesson.example.outputNote && <p className="mt-3 text-xs leading-5 text-slate-300">{lesson.example.outputNote}</p>}
                  </div>
                </div>
              </section>
            )}

            <div className="mt-5 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-violet-800">
                {lesson.example ? "Your Exercise" : "Objective"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {lesson.objective}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-violet-800">
                Mission Steps
              </h3>
              <ol className="mt-3 space-y-3">
                {lesson.steps.map((step, index) => {
                  const hint = lesson.hints?.[index];

                  return (
                    <li key={step} className="flex gap-3 text-sm text-slate-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="pt-0.5 leading-5">{step}</p>
                        {hint && (
                          <details className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                            <summary className="cursor-pointer font-semibold text-amber-950">
                              Show hint
                            </summary>
                            <p className="mt-2 whitespace-pre-line leading-5 text-amber-900">
                              {hint}
                            </p>
                          </details>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          <div
            role="separator"
            aria-label="Resize instructions and output panels"
            aria-orientation="horizontal"
            aria-valuenow={Math.round(instructionsHeight)}
            onPointerDown={startVerticalResize}
            className="group hidden cursor-row-resize touch-none items-center justify-center lg:flex"
          >
            <div className="h-1 w-16 rounded-full bg-slate-300 transition group-hover:bg-violet-500 group-active:bg-violet-700" />
          </div>

          <section className="flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm lg:min-h-0">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <h2 className="font-semibold text-white">Output</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                Python Results
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-900 p-4 font-mono text-sm text-emerald-300">
              <pre className="whitespace-pre-wrap">{output}</pre>
              {inputPrompt !== null && (
                <form className="mt-3" onSubmit={(event) => {
                  event.preventDefault();
                  const resolve = inputResolver.current;
                  inputResolver.current = null;
                  setInputPrompt(null);
                  setValidationMessage("Checking your mission...");
                  resolve?.(answer);
                }}>
                  <label htmlFor="python-answer" className="mb-2 block">{inputPrompt}</label>
                  <div className="flex gap-2">
                    <input id="python-answer" autoFocus autoComplete="off"
                      className="min-w-0 flex-1 rounded border border-slate-500 bg-slate-950 px-3 py-2 text-white"
                      value={answer} onChange={(event) => setAnswer(event.target.value)} />
                    <button type="submit" className="rounded bg-emerald-400 px-4 py-2 font-semibold text-slate-950">Submit</button>
                  </div>
                </form>
              )}
            </div>
            <div
              className={`border-t px-4 py-3 text-sm ${
                missionComplete
                  ? "border-emerald-800 bg-emerald-950 text-emerald-200"
                  : "border-slate-800 bg-slate-950 text-slate-300"
              }`}
            >
              <p className="font-semibold">
                {missionComplete ? "Mission validated" : "Validation"}
              </p>
              <p className="mt-1">{validationMessage}</p>
              {missionComplete && nextLessonSlug && (
                <Link
                  href={`/missions/${track.slug}/${nextLessonSlug}`}
                  className="mt-3 inline-block rounded-lg bg-emerald-400 px-3 py-2 font-semibold text-emerald-950 transition hover:bg-emerald-300"
                >
                  Continue to next mission
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function beginResize(
  cursor: "col-resize" | "row-resize",
  onMove: (event: PointerEvent) => void
) {
  const previousCursor = document.body.style.cursor;
  const previousUserSelect = document.body.style.userSelect;

  document.body.style.cursor = cursor;
  document.body.style.userSelect = "none";

  const finishResize = () => {
    document.body.style.cursor = previousCursor;
    document.body.style.userSelect = previousUserSelect;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", finishResize);
    window.removeEventListener("pointercancel", finishResize);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", finishResize);
  window.addEventListener("pointercancel", finishResize);
}
