"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

type Tab = "html" | "css" | "javascript";

type ConsoleMessage = {
  type: "log" | "error";
  text: string;
};

const starterHtml = `<h1>Welcome to Free Play Lab</h1>
<p>Experiment with HTML, CSS, and JavaScript.</p>
<button id="btn">Click me</button>
<div id="output"></div>`;

const starterCss = `body {
  font-family: Arial, sans-serif;
  padding: 16px;
  background: #f8fafc;
}

h1 {
  color: #4c077c;
}

button {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #e0415f;
  color: white;
  cursor: pointer;
}

#output {
  margin-top: 16px;
  font-weight: bold;
  color: #377c07;
}`;

const starterJs = `console.log("Free Play Lab loaded");

document.getElementById("btn")?.addEventListener("click", () => {
  const output = document.getElementById("output");
  if (output) {
    output.textContent = "Nice work! You triggered JavaScript.";
  }

  console.log("Button clicked");
});`;

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: "on" as const,
};

export default function FreePlayLabPage() {
  const [activeTab, setActiveTab] = useState<Tab>("html");

  const [html, setHtml] = useState(starterHtml);
  const [css, setCss] = useState(starterCss);
  const [js, setJs] = useState(starterJs);

  const [runCode, setRunCode] = useState({
    html: starterHtml,
    css: starterCss,
    js: starterJs,
  });

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([
    { type: "log", text: "Free Play Lab ready. Click Run to test your code." },
  ]);

  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${runCode.css}</style>
        </head>
        <body>
          ${runCode.html}

          <script>
            (function() {
              const sendToParent = (type, args) => {
                window.parent.postMessage(
                  {
                    source: "code-tutor-playground",
                    type,
                    messages: args.map((arg) => {
                      if (typeof arg === "string") return arg;
                      try {
                        return JSON.stringify(arg);
                      } catch {
                        return String(arg);
                      }
                    }),
                  },
                  "*"
                );
              };

              const originalLog = console.log;
              const originalError = console.error;

              console.log = function(...args) {
                sendToParent("log", args);
                originalLog.apply(console, args);
              };

              console.error = function(...args) {
                sendToParent("error", args);
                originalError.apply(console, args);
              };

              window.onerror = function(message, source, lineno, colno) {
                sendToParent("error", [
                  "JavaScript Error: " + message + " (line " + lineno + ", col " + colno + ")"
                ]);
              };
            })();
          </script>

          <script>${runCode.js}<\/script>
        </body>
      </html>
    `;
  }, [runCode]);

  const handleRun = () => {
    setConsoleMessages([{ type: "log", text: "Running code..." }]);
    setRunCode({ html, css, js });
  };

  const handleReset = () => {
    setHtml(starterHtml);
    setCss(starterCss);
    setJs(starterJs);
    setRunCode({
      html: starterHtml,
      css: starterCss,
      js: starterJs,
    });
    setConsoleMessages([
      { type: "log", text: "Lab reset. Starter code restored." },
    ]);
    setActiveTab("html");
  };

  const currentCode =
    activeTab === "html" ? html : activeTab === "css" ? css : js;

  const handleCodeChange = (value: string) => {
    if (activeTab === "html") setHtml(value);
    if (activeTab === "css") setCss(value);
    if (activeTab === "javascript") setJs(value);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <ConsoleListener onMessage={setConsoleMessages} />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 inline-block rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
                Free Play
              </p>
              <h1 className="text-3xl font-bold text-slate-900">
                HTML / JavaScript Free Play Lab
              </h1>
              <p className="mt-2 max-w-3xl text-slate-600">
                Experiment, test ideas, and build whatever you want. This lab is
                for open practice, not guided missions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRun}
                className="rounded-xl bg-violet-900 px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Run
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("html")}
                className={`rounded-xl px-4 py-2 font-semibold transition ${
                  activeTab === "html"
                    ? "bg-violet-900 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                HTML
              </button>

              <button
                onClick={() => setActiveTab("css")}
                className={`rounded-xl px-4 py-2 font-semibold transition ${
                  activeTab === "css"
                    ? "bg-violet-900 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                CSS
              </button>

              <button
                onClick={() => setActiveTab("javascript")}
                className={`rounded-xl px-4 py-2 font-semibold transition ${
                  activeTab === "javascript"
                    ? "bg-violet-900 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                JavaScript
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {activeTab === "html"
                  ? "HTML Editor"
                  : activeTab === "css"
                    ? "CSS Editor"
                    : "JavaScript Editor"}
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {activeTab.toUpperCase()}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <Editor
                height="620px"
                language={activeTab}
                value={currentCode}
                onChange={(value) => handleCodeChange(value || "")}
                theme="vs-dark"
                options={editorOptions}
              />
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  Live Output
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <iframe
                  title="Preview"
                  srcDoc={srcDoc}
                  sandbox="allow-scripts"
                  className="h-[320px] w-full bg-white"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Console</h2>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  JavaScript Messages
                </span>
              </div>

              <div className="h-[260px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-3 font-mono text-sm">
                {consoleMessages.length === 0 ? (
                  <p className="text-slate-400">No console output yet.</p>
                ) : (
                  <div className="space-y-2">
                    {consoleMessages.map((message, index) => (
                      <div
                        key={index}
                        className={
                          message.type === "error"
                            ? "text-red-400"
                            : "text-emerald-300"
                        }
                      >
                        <span className="mr-2 text-slate-500">
                          {message.type === "error" ? "error>" : "log>"}
                        </span>
                        {message.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ConsoleListener({
  onMessage,
}: {
  onMessage: React.Dispatch<React.SetStateAction<ConsoleMessage[]>>;
}) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.source !== "code-tutor-playground") return;

      const text = Array.isArray(event.data.messages)
        ? event.data.messages.join(" ")
        : String(event.data.messages ?? "");

      onMessage((prev) => [
        ...prev,
        {
          type: event.data.type === "error" ? "error" : "log",
          text,
        },
      ]);
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, [onMessage]);

  return null;
}