import type { PythonLesson } from "../types";

export const novaStatusReport: PythonLesson = {
  id: "python-nova's-status-report",
  slug: "nova's-status-report",
  type: "python",
  title: "Nova's Status Report",
  badge: "Python Starter",
  story:
    "Nova’s voice system is working, and its memory is starting to come back online. Now Nova needs to send a full status report before leaving the crash site. The console is empty this time, so you will need to build the report from scratch using everything you have practiced so far.",
  objective:
    "Create variables to store information about Nova, then use print statements to display a short mission status report.",
  steps: [
    "Create a variable called robot_name and set it equal to Nova.",
    "Create a variable called location and set it equal to forest crash site.",
    "Create a variable called power_level and set it equal to a number.",
    "Use print() to display a greeting message.",
    "Use print() to display the robot_name variable.",
    "Use print() to display the location variable.",
    "Use print() to display the power_level variable.",
    "Press Run when you are ready!"
  ],
  hints: [
    "Text values need quotation marks, like robot_name = \"Nova\".",
    "Numbers do not need quotation marks, like power_level = 85.",
    "To print a variable, do not put the variable name inside quotation marks.",
    "Example: print(robot_name)",
  ],
  estimatedMinutes: 10,
  starterCode: ``,
  validation: {
    mode: "flexible",
    requiredKeywords: [
      "robot_name",
      "location",
      "power_level",
      "print(",
    ],
    minPrintStatements: 4,
  },
};
