import type { PythonLesson } from "../types";

export const syntaxErrors: PythonLesson = {
  id: "syntax-errors",
  slug: "syntax-errors",
  type: "python",
  title: "Syntax Errors",
  badge: "Python Starter",
  story:
    "Python needs instructions to be written in a specific way. When something is missing, like a quotation mark or a parenthesis, Python cannot understand the code. This is called a syntax error. In this lesson, you will fix broken code so the program can run correctly.",
  objective:
    "Fix the syntax errors in the code so both messages print correctly.",
  steps: [
    "Look carefully at each line of code.",
    "Find the missing quotation mark or parenthesis.",
    "Fix the syntax errors without changing the message text.",
    "Press Run to test your code.",
  ],
  hints: [
    "A syntax error means Python cannot understand how the code is written.",
    "Text inside print() needs quotation marks around it.",
    "Every opening parenthesis ( needs a closing parenthesis ).",
    "Check the end of each line carefully.",
  ],
  estimatedMinutes: 10,
  starterCode: `print(Python is ready!"
printNo syntax errors!
`,
  validation: {
    mode: "rules",
    rules: [],
  },
};
