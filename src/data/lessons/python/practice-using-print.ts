import type { PythonLesson } from "../types";
import { PythonLessonValidation } from "@/src/data/lessons/types";

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
    "Change the Hello World so that Nova says hello to you (Use your own name).",
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
    mode: "flexible",
    requiredKeywords: ["print("],
    minPrintStatements: 2,
    bannedText: ["Hello World"],
  },
};
