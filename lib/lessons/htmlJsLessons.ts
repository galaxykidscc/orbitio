export type HtmlJsLesson = {
  id: number;
  slug: string;
  title: string;
  badge: string;
  story: string;
  objective: string;
  steps: string[];
  hints: string[];
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  requiredLessonId: number | null;
};

export const htmlJsLessons: HtmlJsLesson[] = [
  {
    id: 1,
    slug: "repair-the-signal-beacon",
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
    requiredLessonId: null,
  },

  {
    id: 2,
    slug: "wake-the-forest-gate",
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
    requiredLessonId: 1,
  },
];

export function getHtmlJsLessonBySlug(slug: string) {
  return htmlJsLessons.find((lesson) => lesson.slug === slug);
}