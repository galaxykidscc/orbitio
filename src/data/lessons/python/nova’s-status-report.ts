import type { PythonLesson } from "../types";

export const novaStatusReport: PythonLesson = {
  id: "python-nova's-status-report",
  slug: "nova's-status-report",
  type: "python",
  title: "Nova's Status Report",
  badge: "Python Starter",
  story:
    "Nova’s voice system is working, and its memory is starting to come back online. Before leaving the crash site, Nova needs a four-line status report: a greeting, its name, its location, and its power level. The console is empty this time, so you will need to build the report from scratch using everything you have practiced so far.",
  objective:
    "Create three variables, then write four separate print() statements: one greeting and one line for each variable, in the order shown below.",
  steps: [
    'First, create robot_name and set it to the text "Nova" (use this exact spelling and capitalization).',
    'Next, create location and set it to the text "forest crash site" (use these exact words in lowercase).',
    "Next, create power_level and set it to a number of your choice, such as 85. Do not put the number in quotation marks.",
    'After creating all three variables, write your first print() statement to display a greeting such as "Hello!". Include the word Hello, Hi, or Hey.',
    "Write a second, separate print() statement to display only the robot_name variable.",
    "Write a third, separate print() statement to display only the location variable.",
    "Write a fourth, separate print() statement to display only the power_level variable.",
    "Press Run. Check that the output has four lines in this order: greeting, robot name, location, power level.",
  ],
  hints: [
    'Text values need quotation marks: robot_name = "Nova".',
    'Keep all three words together in one string: "forest crash site".',
    "A number is written without quotation marks: power_level = 85.",
    'A greeting is text, so use quotation marks: print("Hello!").',
    "Print the variable without quotation marks: print(robot_name).",
    "Put print(location) on its own line after print(robot_name).",
    "Put print(power_level) on its own line after print(location).",
    "For a power level of 85, an example output is:\nHello!\nNova\nforest crash site\n85",
  ],
  estimatedMinutes: 10,
  starterCode: ``,
  validation: {
    mode: "template",
    solution: `robot_name = "Nova"
location = "forest crash site"
power_level = __power__
print(__greeting__)
print(robot_name)
print(location)
print(power_level)`,
    placeholders: {
      __power__: { type: "number" },
      __greeting__: { type: "string", pattern: ".*\\b(?:hello|hi|hey)\\b.*" },
    },
    message: "Create robot_name, location, and power_level in that order, using Nova, forest crash site, and a number. Then use four separate print() statements: a greeting containing Hello, Hi, or Hey; robot_name; location; power_level.",
  },
};
