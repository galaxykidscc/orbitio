"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideRuntime>;
  }
}

type PyodideRuntime = {
  setStdout: (options: { batched: (text: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<unknown>;
};

const starterPython = `print("Hello from Python!")

name = "Coder"
print("Welcome,", name)

for i in range(3):
    print("Count:", i + 1)
`;

let pyodidePromise: Promise<PyodideRuntime> | null = null;

async function getPyodide() {
  if (!window.loadPyodide) {
    throw new Error("Pyodide has not loaded yet. Please wait a moment and try again.");
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

export default function PythonPlaygroundPage() {
  const [code, setCode] = useState(starterPython);
  const [output, setOutput] = useState("Click Run to execute Python.");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running Python...");

    try {
      const result = await runPythonCode(code);
      setOutput(result);
    } catch (error: unknown) {
      setOutput(`Python Error:\n${getErrorMessage(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(starterPython);
    setOutput("Click Run to execute Python.");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Python Playground
              </h1>
              <p className="mt-2 text-slate-600">
                Write Python on the left and click Run to see the output.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
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
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
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
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Output</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                Python Results
              </span>
            </div>

            <div className="h-[560px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 font-mono text-sm text-emerald-300">
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
