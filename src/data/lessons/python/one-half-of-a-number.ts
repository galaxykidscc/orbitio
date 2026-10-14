import type { PythonLesson } from "../types";

export const oneHalfOfANumber: PythonLesson = {
  id: "python-one-half-of-a-number",
  slug: "one-half-of-a-number",
  type: "python",
  title: "Nova's Power Splitter",
  badge: "Python Practice",
  story:
    "Deep in the forest, Nova discovers two dark signal beacons that could guide a rescue ship to the crash site. Its power splitter is broken, so it needs your help to share a power reading equally between them. Write a program that asks for a number and calculates one half, then help Nova bring both beacons back to life.",
  objective:
    "Write a program that inputs any number and outputs one half of it. For example, if the user were to enter 10, the program would output 5.",
  example: {
    title: "Example: Power Nova's four guide lights",
    explanation:
      "Before repairing the beacons, Nova shares power equally among four guide lights. input() returns text, so use float() to convert it to a number, including a decimal. The / operator divides numbers. This example divides by 4; your mission is to split a number between two beacons by dividing by 2.",
    code: `number = float(input("Enter a number: "))
quarter = number / 4
print(quarter)`,
    output: `Enter a number:
3.0`,
    outputNote:
      "The user enters 12 power units, so each guide light receives 3.0 units. Test your two-beacon calculator with 10 → 5, 7 → 3.5, 2.5 → 1.25, -8 → -4, and 0 → 0. Negative numbers and zero are practice checks for your calculator. Python may print 5.0 instead of 5; both represent the same answer.",
  },
  steps: [
    "Use input() to ask the user to enter a number.",
    "Convert the answer to a number with float() so decimal inputs work too.",
    "Divide the number by 2 and store the result in a variable.",
    "Use print() to display only the result.",
    "Press Run and enter a number. Try an odd number, a decimal, a negative number, and zero as well.",
  ],
  hints: [
    'You can ask for a number with input("Enter a number: ").',
    "Wrap input() in float(): number = float(input(...)). int() does not accept decimal text such as 2.5.",
    "Use / for division. Avoid // because it rounds down and loses the fractional part.",
    "Print the result variable without quotation marks. You do not need a label or a sentence in the output.",
    "Half of 7 is 3.5. Half of -8 is -4. Half of 0 is 0.",
  ],
  estimatedMinutes: 10,
  starterCode: "",
  validation: {
    mode: "output",
    outputComparison: "numeric",
    solution: `number = float(input("Enter a number: "))
half = number / 2
print(half)`,
    cases: [
      { label: "10", inputs: ["10"] },
      { label: "an odd number", inputs: ["7"] },
      { label: "a decimal number", inputs: ["2.5"] },
      { label: "a negative number", inputs: ["-8"] },
      { label: "zero", inputs: ["0"] },
      { label: "another decimal number", inputs: ["0.125"] },
    ],
  },
};
