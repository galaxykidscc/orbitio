import type { PythonLesson } from "../types";

export const powerUpTheRobot: PythonLesson = {
  id: "python-power-up-the-robot",
  slug: "power-up-the-robot",
  type: "python",
  title: "Mission 1: Power Up the Robot",
  badge: "Python Starter",
  story:
    "A tiny helper robot is waiting for its first command. Use Python print statements to wake it up and send a status report.",
  objective:
    "Write Python that prints a greeting, stores the robot name in a variable, and reports that the robot is ready.",
  steps: [
    "Print a greeting for the robot.",
    "Create a variable named robot_name.",
    "Print the robot_name variable followed by the text is ready. (including the period).",
  ],
  hints: [
    "Use print() to show text in Python.",
    'Variables can store text like robot_name = "Nova".',
    "You can print more than one thing with commas.",
  ],
  estimatedMinutes: 10,
  starterCode: `print("Hello, robot!")

robot_name = "Nova"
print(robot_name, "is waiting for instructions.")
`,
  validation: {
    mode: "template",
    solution: `print(__greeting__)
robot_name = __name__
print(robot_name, "is ready.")`,
    alternatives: [
      `print(__greeting__)
robot_name = __name__
print(f"{robot_name} is ready.")`,
      `print(__greeting__)
robot_name = __name__
print(robot_name + " is ready.")`,
    ],
    placeholders: {
      __greeting__: { type: "string", pattern: ".*\\b(?:hello|hi|hey)\\b.*" },
      __name__: { type: "string", pattern: ".*\\S.*" },
    },
    message: "Print a greeting, store the robot's name in robot_name, then print its name followed by is ready.",
  },
};
