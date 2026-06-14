"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import LessonShell from "./LessonShell";
import type { HtmlJsLesson } from "@/src/data/lessons/types";
import type { Track } from "@/src/data/tracks/tracks";

type Tab = "html" | "css" | "javascript";

type ConsoleMessage = {
  type: "log" | "error";
  text: string;
};

type HtmlJsLessonViewProps = {
  lesson: HtmlJsLesson;
  track: Track;
};

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: "on" as const,
};

export default function HtmlJsLessonView({
  lesson,
  track,
}: HtmlJsLessonViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [html, setHtml] = useState(lesson.starterHtml);
  const [css, setCss] = useState(lesson.starterCss);
  const [js, setJs] = useState(lesson.starterJs);
  const [runCode, setRunCode] = useState({
    html: lesson.starterHtml,
    css: lesson.starterCss,
    js: lesson.starterJs,
  });
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([
    { type: "log", text: "Mission ready. Click Run to test your changes." },
  ]);

  const stepChecks = useMemo(() => {
    const htmlLower = html.toLowerCase();
    const jsLower = js.toLowerCase();

    return lesson.steps.map((_, index) => {
      if (index === 0) {
        return htmlLower.includes("online") || htmlLower.includes("awake");
      }

      if (index === 1) {
        return css.includes("color:") && css !== lesson.starterCss;
      }

      if (index === 2) {
        return (
          jsLower.includes("online") ||
          jsLower.includes("open") ||
          jsLower.includes("awake")
        );
      }

      return false;
    });
  }, [css, html, js, lesson]);

  const completedSteps = stepChecks.filter(Boolean).length;
  const totalSteps = lesson.steps.length;
  const missionComplete = totalSteps > 0 && completedSteps === totalSteps;

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
                    source: "orbitio-playground",
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
    setConsoleMessages([{ type: "log", text: "Running mission code..." }]);
    setRunCode({ html, css, js });
  };

  const handleReset = () => {
    setHtml(lesson.starterHtml);
    setCss(lesson.starterCss);
    setJs(lesson.starterJs);
    setRunCode({
      html: lesson.starterHtml,
      css: lesson.starterCss,
      js: lesson.starterJs,
    });
    setConsoleMessages([
      { type: "log", text: "Mission reset. Starter code restored." },
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
    <>
      <ConsoleListener onMessage={setConsoleMessages} />

      <LessonShell
        lesson={lesson}
        track={track}
        completedSteps={completedSteps}
        stepChecks={stepChecks}
        missionComplete={missionComplete}
        actions={
          <>
            <button
              onClick={handleRun}
              className="rounded-xl bg-violet-900 px-5 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Run Mission
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
              <div className="mb-4 flex flex-wrap gap-2">
                <EditorTab
                  active={activeTab === "html"}
                  label="HTML"
                  onClick={() => setActiveTab("html")}
                />
                <EditorTab
                  active={activeTab === "css"}
                  label="CSS"
                  onClick={() => setActiveTab("css")}
                />
                <EditorTab
                  active={activeTab === "javascript"}
                  label="JavaScript"
                  onClick={() => setActiveTab("javascript")}
                />
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
                  height="520px"
                  language={activeTab}
                  value={currentCode}
                  onChange={(value) => handleCodeChange(value || "")}
                  theme="vs-dark"
                  options={editorOptions}
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Preview
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                    Live Output
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <iframe
                    title="Preview"
                    srcDoc={srcDoc}
                    sandbox="allow-scripts"
                    className="h-[300px] w-full bg-white"
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

                <div className="h-[300px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-3 font-mono text-sm">
                  {consoleMessages.length === 0 ? (
                    <p className="text-slate-400">No console output yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {consoleMessages.map((message, index) => (
                        <div
                          key={`${message.type}-${index}`}
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
            </div>
      </LessonShell>
    </>
  );
}

function EditorTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 font-semibold transition ${
        active
          ? "bg-violet-900 text-white"
          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function ConsoleListener({
  onMessage,
}: {
  onMessage: React.Dispatch<React.SetStateAction<ConsoleMessage[]>>;
}) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.source !== "orbitio-playground") return;

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
