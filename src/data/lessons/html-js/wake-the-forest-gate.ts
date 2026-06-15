import type { HtmlJsLesson } from "../types";

export const wakeTheForestGate: HtmlJsLesson = {
  id: "html-js-wake-the-forest-gate",
  slug: "wake-the-forest-gate",
  type: "html-js",
  title: "Mission 2: Wake the Forest Gate",
  badge: "Beginner Mission",
  story:
    "The ancient gate to the forest path is asleep. You need to rewrite the code to wake it up and open the trail.",
  objective:
    "Update the gate message, improve the styles, and make the button show that the path is open.",
  steps: [
    "Change the heading from 'Gate Sleeping' to 'Gate Awake'.",
    "Restyle the page so it feels magical or forest-themed.",
    "Make the button update the message to say the path is open.",
  ],
  hints: [
    "Use HTML to rename the gate.",
    "Use CSS colors like green, gold, or teal.",
    "Use JavaScript to update the message after a click.",
  ],
  starterHtml: `<h1 id="title">Gate Sleeping</h1>
<p>The forest gate is waiting for a signal.</p>
<button id="btn">Wake the Gate</button>
<div id="output"></div>`,
  starterCss: `body {
  font-family: Arial, sans-serif;
  padding: 16px;
  background: #f8fafc;
}

h1 {
  color: #444;
}

button {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #4c077c;
  color: white;
  cursor: pointer;
}

#output {
  margin-top: 16px;
  font-weight: bold;
}`,
  starterJs: `console.log("Forest mission loaded");

document.getElementById("btn")?.addEventListener("click", () => {
  const output = document.getElementById("output");
  if (output) {
    output.textContent = "The gate is starting to wake up...";
  }

  console.log("Wake button clicked");
});`,
};
