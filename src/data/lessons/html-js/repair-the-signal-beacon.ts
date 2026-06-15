import type { HtmlJsLesson } from "../types";

export const repairTheSignalBeacon: HtmlJsLesson = {
  id: "html-js-repair-the-signal-beacon",
  slug: "repair-the-signal-beacon",
  type: "html-js",
  title: "Mission 1: Repair the Signal Beacon",
  badge: "Beginner Mission",
  story:
    "A remote beacon has gone offline. Your job is to restore its signal so nearby explorers can find their way home.",
  objective:
    "Update the page so the beacon looks active and the button shows a success message when clicked.",
  steps: [
    "Change the heading from 'Beacon Offline' to 'Beacon Online'.",
    "Change the heading color so it feels active, bright, or safe.",
    "Update the button click so the output says the beacon is now online.",
  ],
  hints: [
    "HTML controls the text content.",
    "CSS controls colors and style.",
    "JavaScript can change text after a button click.",
  ],
  starterHtml: `<h1 id="title">Beacon Offline</h1>
<p>Mission Control needs your help. Repair the signal beacon.</p>
<button id="btn">Activate Beacon</button>
<div id="output"></div>`,
  starterCss: `body {
  font-family: Arial, sans-serif;
  padding: 16px;
  background: #f8fafc;
}

h1 {
  color: #7c2d12;
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
}`,
  starterJs: `console.log("Mission loaded");

document.getElementById("btn")?.addEventListener("click", () => {
  const output = document.getElementById("output");
  if (output) {
    output.textContent = "Beacon activation attempt detected.";
  }

  console.log("Activate button clicked");
});`,
};
