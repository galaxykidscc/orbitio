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
    "Print a ready message that uses the robot name.",
  ],
  hints: [
    "Use print() to show text in Python.",
    'Variables can store text like robot_name = "Bolt".',
    "You can print more than one thing with commas.",
  ],
  estimatedMinutes: 10,
  starterCode: `print("Hello, robot!")

robot_name = "Bolt"
print(robot_name, "is waiting for instructions.")
`,
  expectedOutput: "Hello, robot!\nBolt is ready!",
};
