"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { getHtmlJsLessonBySlug } from "@/lib/lessons/htmlJsLessons";
import {
  completedLessonIds,
  isLessonUnlocked,
} from "@/lib/lessons/lessonProgress";

type Tab = "html" | "css" | "javascript";

type ConsoleMessage = {
  type: "log" | "error";
  text: string;
};

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: "on" as const,
};

export default function HtmlJsLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [ready, setReady] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");

  const [runCode, setRunCode] = useState({
    html: "",
    css: "",
    js: "",
  });

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);

  useEffect(() => {
    params.then(({ slug }) => {
      const lesson = getHtmlJsLessonBySlug(slug);

      if (!lesson) {
        setSlug(slug);
        setReady(true);
        return;
      }

      setSlug(slug);
      setHtml(lesson.starterHtml);
      setCss(lesson.starterCss);
      setJs(lesson.starterJs);
      setRunCode({
        html: lesson.starterHtml,
        css: lesson.starterCss,
        js: lesson.starterJs,
      });
      setConsoleMessages([
        { type: "log", text: "Mission ready. Click Run to test your changes." },
      ]);
      setReady(true);
    });
  }, [params]);

  const lesson = getHtmlJsLessonBySlug(slug);

  const unlocked = lesson
  ? isLessonUnlocked(lesson.id, lesson.requiredLessonId, completedLessonIds)
  : false;

  const stepChecks = useMemo(() => {
    if (!lesson) return [];

    const step1 =
      html.toLowerCase().includes("online") ||
      html.toLowerCase().includes("awake");

    const step2 = css.includes("color:") && css !== lesson.starterCss;

    const jsLower = js.toLowerCase();
    const step3 =
      jsLower.includes("online") ||
      jsLower.includes("open") ||
      jsLower.includes("awake");

    return [step1, step2, step3];
  }, [html, css, js, lesson]);

  const completedSteps = stepChecks.filter(Boolean).length;
  const totalSteps = lesson?.steps.length ?? 0;
  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
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
    if (!lesson) return;

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

  if (!ready) {
    return <main className="p-6">Loading lesson...</main>;
  }

  if (!lesson) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <p className="mt-2 text-slate-600">
          No HTML/JS lesson exists for this slug yet.
        </p>
      </main>
    );
  }

  if (!unlocked) {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-3 inline-block rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
            Locked Mission
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            This mission is not unlocked yet
          </h1>

          <p className="mt-4 text-slate-600">
            You need to complete the previous lesson before starting{" "}
            <span className="font-semibold">{lesson.title}</span>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl bg-violet-900 px-5 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Back to Mission Path
            </Link>

            <Link
              href="/playground/html-js"
              className="rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
            >
              Open Free Play Lab
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <ConsoleListener onMessage={setConsoleMessages} />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-800">
                  {lesson.badge}
                </p>
                <h1 className="text-3xl font-bold text-slate-900">
                  {lesson.title}
                </h1>
                <p className="mt-2 max-w-3xl text-slate-600">{lesson.story}</p>
              </div>

              <div className="flex flex-wrap gap-3">
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
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>
                  Mission Progress: {completedSteps} / {totalSteps} steps
                </span>
                <span>{progressPercent}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-violet-700 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {missionComplete && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-lg font-bold text-emerald-800">
                  Mission Complete
                </p>
                <p className="mt-1 text-emerald-700">
                  Great job. You completed this lesson.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Objective</h2>
              <p className="mt-3 text-slate-600">{lesson.objective}</p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Mission Steps</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  {completedSteps}/{totalSteps}
                </span>
              </div>

              <ol className="mt-4 space-y-4">
                {lesson.steps.map((step, index) => {
                  const done = stepChecks[index];

                  return (
                    <li key={index} className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          done
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-violet-100 text-violet-800"
                        }`}
                      >
                        {done ? "✓" : index + 1}
                      </div>

                      <div>
                        <p
                          className={
                            done
                              ? "font-semibold text-emerald-700"
                              : "text-slate-700"
                          }
                        >
                          {step}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {done ? "Completed" : "Not completed yet"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-amber-900">Hints</h2>
              <ul className="mt-4 space-y-3">
                {lesson.hints.map((hint, index) => (
                  <li key={index} className="text-amber-900">
                    • {hint}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
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