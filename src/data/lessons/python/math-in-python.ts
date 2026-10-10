import type { PythonLesson } from "../types";

export const mathInPython: PythonLesson = {
  id: "math-in-python",
  slug: "math-in-python",
  type: "python",
  title: "Math in Python",
  badge: "Python Starter",
  story:
    "Python can do math with numbers and variables. In this lesson, you will create number variables, add them together, and print the answer. This helps you practice using Python like a calculator.",
  objective:
    "Use number variables and the + symbol to solve a simple math problem in Python.",
  steps: [
    "Set the first_number equal to 40.",
    "Set the second_number equal to 25.",
    "Create the total_number variable that adds first_number and second_number together.",
    "Use print() to display the total_number variable.",
    "Press Run when you are ready!",
  ],
  hints: [
    "Numbers do not need quotation marks.",
    "Use the + symbol to add numbers.",
    "You can store the answer in a new variable.",
    "Example: total = number_one + number_two",
    "To print a variable, do not put quotation marks around the variable name.",
  ],
  estimatedMinutes: 10,
  starterCode: `first_number = 
second_number = 

`,
  validation: {
    mode: "template",
    solution: `first_number = 40
second_number = 25
total_number = first_number + second_number
print(total_number)`,
    message: "Set the numbers to 40 and 25, add them into total_number, and print total_number.",
  },
};
