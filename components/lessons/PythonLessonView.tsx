"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import type { PythonLesson } from "@/src/data/lessons/types";
import type { Track } from "@/src/data/tracks/tracks";

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideRuntime>;
  }
}

type PyodideRuntime = {
  setStdout: (options: { batched: (text: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<unknown>;
};

type PythonLessonViewProps = {
  lesson: PythonLesson;
  track: Track;
};

let pyodidePromise: Promise<PyodideRuntime> | null = null;

async function getPyodide() {
  if (!window.loadPyodide) {
    throw new Error("Python is still loading. Try again in a moment.");
  }

  if (!pyodidePromise) {
    pyodidePromise = window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
    });
  }

  return pyodidePromise;
}

async function runPythonCode(code: string): Promise<string> {
  const pyodide = await getPyodide();
  let output = "";

  pyodide.setStdout({
    batched: (text: string) => {
      output += text + "\n";
    },
  });

  try {
    await pyodide.runPythonAsync(code);
    return output.trim() || "Done.";
  } catch (error: unknown) {
    return `Python Error:\n${getErrorMessage(error)}`;
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

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
  const [isRunning, setIsRunning] = useState(false);
  const [editorWidth, setEditorWidth] = useState(62);
  const [instructionsHeight, setInstructionsHeight] = useState(58);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running Python...");

    try {
      setOutput(await runPythonCode(code));
    } catch (error: unknown) {
      setOutput(`Python Error:\n${getErrorMessage(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(lesson.starterCode);
    setOutput("Click Run to execute Python.");
  };

  const startHorizontalResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    event.preventDefault();
    const bounds = workspace.getBoundingClientRect();

    beginResize("col-resize", (pointerEvent) => {
      const nextWidth = ((pointerEvent.clientX - bounds.left) / bounds.width) * 100;
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

            <div className="mt-5 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-violet-800">
                Objective
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
                            <p className="mt-2 leading-5 text-amber-900">
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
