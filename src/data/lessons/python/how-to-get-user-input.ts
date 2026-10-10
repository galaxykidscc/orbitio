import type { PythonLesson } from "../types";

export const howToGetUserInput: PythonLesson = {
  id: "how-to-get-user-input",
  slug: "how-to-get-user-input",
  type: "python",
  title: "How to Get User Input",
  badge: "Python Starter",
  story:
    "Python programs can ask the user for information. In this lesson, you will use input() to ask for a name, store the answer in a variable, and print a message using that variable.",
  objective:
    "Use input() to collect information from the user, store it in a variable, and print the result.",
  steps: [
    "Create a variable called user_name.",
    "Use input() to ask the user for their name.",
    "Use print() to display the user_name variable.",
    "Press Run. When your program asks for your name, type it and press Enter.",
  ],
  hints: [
    "input() lets the user type an answer.",
    "You can store the answer in a variable.",
    "Example: name = input(\"What is your name? \")",
    "To print a variable, do not put quotation marks around the variable name.",
  ],
  estimatedMinutes: 10,
  starterCode: ``,

  validation: {
    mode: "template",
    solution: `user_name = input(__prompt__)
print(user_name)`,
    placeholders: { __prompt__: { type: "string", pattern: ".*\\S.*" } },
    cases: [
      { label: "a first name", inputs: ["Alex"] },
      { label: "a different name", inputs: ["Sam Rivera"] },
    ],
    message: "Ask for a name with input(), store it in user_name, and print user_name.",
  },
};
