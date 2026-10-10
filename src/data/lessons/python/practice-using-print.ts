import type { PythonLesson } from "../types";

export const practiceUsingPrint: PythonLesson = {
  id: "practice-using-print",
  slug: "practice-using-print",
  type: "python",
  title: "Practice Using Print",
  badge: "Python Starter",
  story:
    "You are in the forest alone when an asteroid lands in the forest and you go to check it out. Once you arrive at the site you see a robot named Nova",
  objective:
    "Right now Nova can only say Hello World. So you need to fix the print statement so that they can say hello to you instead and say its name.",
  steps: [
    "Change Hello World to a greeting such as Hello, Alex! using your own name.",
    "Create a new print statement so that Nova says their name.",
    "Press Run when you are ready!",
  ],
  hints: [
    "Use print() to show text in Python.",
  ],
  estimatedMinutes: 10,
  starterCode: `print("Hello World")

`,
  validation: {
    mode: "template",
    solution: `print(__greeting__)
print(__introduction__)`,
    placeholders: {
      __greeting__: { type: "string", pattern: "(?!.*\\bworld\\b)(?:hello|hi|hey)[ ,!]+\\S.*" },
      __introduction__: { type: "string", pattern: ".*\\bNova\\b.*" },
    },
    message: "Print a greeting such as Hello, Alex! using your name, then a message that names Nova.",
  },
};
