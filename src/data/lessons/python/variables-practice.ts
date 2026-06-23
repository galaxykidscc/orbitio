import type { PythonLesson } from "../types";
import { PythonLessonValidation } from "@/src/data/lessons/types";

export const practiceUsingPrint: PythonLesson = {
  id: "variables-practice",
  slug: "variables-practice",
  type: "python",
  title: "Variables Practice",
  badge: "Python Starter",
  story:
    "Nova's voice system is working now, but the asteroid crash scrambled part of its memory. Nova can remember words, names, and numbers, but it needs a better way to store them. To help Nova recover, you will use variables to save important mission information, like Nova's name and power level.",
  objective:
    "Create variables to store information about Nova, then use print statements to display those variables in the mission log.",
  steps: [
    "Create a variable called robot_name and set it equal to Nova.",
    "Create a variable called power_level and set it equal to a number.",
    //*HINT* power_level = 200
    "Use print() to display robot_name.",
    "Use print() to display power_level.",
    "Press Run when you are ready!",
  ],
  hints: [
    "Variables are how we store data in python, print can be useful to you as the programmer to see the current value of your variables",
  ],
  estimatedMinutes: 10,
  starterCode: `robot_name = 
power_level = 0

print()
print()
`,
  validation: {
    mode: "flexible",
    requiredKeywords: ["print(", "power_level", "robot_name"],
    minPrintStatements: 2,
  },
};
