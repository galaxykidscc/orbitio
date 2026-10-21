import type { PythonLesson } from "../types";

const conversionTemplates = ["int", "float"].flatMap((conversion) =>
  ["__feet__ * 12", "12 * __feet__"].flatMap((calculation) =>
    [
      "print(str(__feet__) + __feet_message__ + str(__inches__) + __inches_message__)",
      "print(__feet__, __feet_message__, __inches__, __inches_message__)",
    ].map((display) =>
      `__feet__ = ${conversion}(input(__prompt__))
__inches__ = ${calculation}
${display}`
    )
  )
);

export const novasRepairMeasurements: PythonLesson = {
  id: "python-novas-repair-measurements",
  slug: "novas-repair-measurements",
  type: "python",
  title: "Fix Nova's Repair Tool",
  badge: "Python Challenge",
  story:
    "Nova has found a damaged panel on the ship. The repair plans list its measurements in feet, but Nova's cutting tool measures in inches! Build a converter so Nova can prepare the right-sized replacement and get the crew ready for their next adventure.",
  objective:
    "Write a program that asks the user for a measurement in feet and converts it to inches. There are 12 inches in 1 foot. Calculate the result from whatever measurement the user enters, then print a message containing both the original feet measurement and the converted inches.",
  steps: [
    "Ask the user for a measurement in feet with input(), convert the answer to a number, and store it in a variable with a name you choose.",
    "Multiply the measurement by 12 and store the result in a variable with a name you choose.",
    "Use both variables in a printed message that tells Nova the original measurement in feet and its equivalent in inches. Choose your own variable names.",
    "Press Run and enter a measurement of your choice. Run again with a different measurement to check that your converter works for different inputs.",
  ],
  hints: [
    'For example, length = int(input("How many feet? ")) reads whole feet. Pick your own variable name. Use float() instead to accept measurements such as 2.5.',
    "Python uses * for multiplication. Each foot contains 12 inches, so multiply the feet measurement by 12.",
    'Use str() to join numbers with text. For example: print(str(feet) + " feet is equivalent to " + str(inch) + " inches congrats!"). Replace feet and inch with your variable names. You can also use commas in print().',
    "Examples: 2 feet becomes 24 inches, 5 feet becomes 60 inches, and 0 feet becomes 0 inches. These are examples, not fixed answers to put in your code.",
  ],
  estimatedMinutes: 10,
  starterCode: "",
  validation: {
    mode: "template",
    solution: conversionTemplates[0],
    alternatives: conversionTemplates.slice(1),
    placeholders: {
      __feet__: { type: "identifier" },
      __feet_message__: { type: "string", pattern: ".*\\S.*" },
      __inches_message__: { type: "string", pattern: ".*\\b(?:inch|inches)\\b.*" },
      __inches__: { type: "identifier" },
      __prompt__: { type: "string", pattern: ".*\\S.*" },
    },
    cases: [
      { label: "2 feet", inputs: ["2"] },
      { label: "1 foot", inputs: ["1"] },
      { label: "5 feet", inputs: ["5"] },
      { label: "0 feet", inputs: ["0"] },
    ],
    message:
      "Ask for a measurement with input(), convert it with int() or float(), store it in a variable, multiply by 12 into your result variable, and print a message using both variables that identifies the result in inches.",
  },
};
