/* A fresh worker for each Run isolates Python state and permits hard timeouts. */
let pendingInput;
self.publishLessonOutput = (output) => self.postMessage({ type: "output", output });
self.requestLessonInput = (prompt, output) => new Promise((resolve) => {
  pendingInput = resolve;
  self.postMessage({ type: "input", prompt, output });
});
self.onmessage = async ({ data }) => {
  if (data.type === "input") {
    pendingInput?.(data.answer);
    pendingInput = undefined;
    return;
  }
  try {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js");
    const pyodide = await self.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
    });
    const response = await fetch("/python/validate.py");
    if (!response.ok) throw new Error("Could not load lesson validation.");
    await pyodide.runPythonAsync(await response.text());
    pyodide.globals.set("lesson_request", JSON.stringify(data));
    self.postMessage({ type: "ready" });
    const result = await pyodide.runPythonAsync(data.interactive ? "validate_interactive_request(lesson_request)" : "validate_request(lesson_request)");
    self.postMessage({ type: "result", result: JSON.parse(result) });
  } catch (error) {
    self.postMessage({ type: "error", message: String(error) });
  }
};
