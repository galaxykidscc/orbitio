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
    "Press Run when you are ready!",
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
    mode: "flexible",
    requiredKeywords: ["input(", "user_name", "print("],
    minPrintStatements: 1,
  },
};
