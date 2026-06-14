"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import LessonShell from "./LessonShell";
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

  return (
    <LessonShell
      lesson={lesson}
      track={track}
      mainClassName="grid gap-6 lg:grid-cols-2"
      actions={
        <>
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
        </>
      }
    >
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Python Editor
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  PYTHON
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Editor
                  height="560px"
                  language="python"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={editorOptions}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Output</h2>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  Python Results
                </span>
              </div>

              <div className="h-[560px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 font-mono text-sm text-emerald-300">
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
    </LessonShell>
  );
}
