import type { PythonLesson } from "../types";

export const novasCenturyScanner: PythonLesson = {
  id: "python-novas-century-scanner",
  slug: "novas-century-scanner",
  type: "python",
  title: "Nova's Century Scanner",
  badge: "Python Challenge",
  story:
    "Nova is preparing the ship's crew records for a journey among the stars. Its century scanner can predict the year an explorer will turn 100, but the program is missing! Help Nova ask for the explorer's name and age, think for three seconds, and announce their milestone year.",
  objective:
    "Create a program that asks the user to enter their name and their age. Your program should then print a message that says 'Please wait while I think....' for 3 seconds. Then print out a message addressed to them that tells them the year that they will turn 100 years old.",

  example: {
    title: "Example: Give Nova time to think",
    explanation:
      "sleep pauses a program before it continues to the next line. In Orbitio, import time and use time.sleep(3) to wait for three seconds. Study this example, then use sleep in your own solution to the exercise below.",
    code: `import time

print("Nova is scanning...")
time.sleep(3)
print("Scan complete!")`,
    output: `Nova is scanning...
Scan complete!`,
    outputNote:
      "Nova is scanning... appears first. Scan complete! appears three seconds later.",
  },
  steps: [
    "Ask for the explorer's name with input() and store it in user_name. You can use a made-up explorer name.",
    "Ask for their age with input(), convert it to a whole number with int(), and store it in age. Assume they have already had their birthday this year.",
    "Set current_year to date.today().year. Calculate year_of_100 by adding the number of years until age 100 to current_year.",
    "Print exactly: Please wait while I think....",
    "Use time.sleep(3) to pause for three seconds while Nova thinks.",
    "Print a message addressed to user_name that includes year_of_100, such as: Explorer Luna, you will turn 100 in the year 2116!",
    "Press Run, answer the name and age prompts, and check Nova's prediction. Run again with a different age to test your calculation.",
  ],
  hints: [
    'Use user_name = input("Explorer, what is your name? ").',
    'input() returns text. Use age = int(input("How old are you? ")) to turn the answer into a number.',
    "Add from datetime import date to use date.today().year. There are 100 - age years left until the explorer turns 100. Try year_of_100 = current_year + (100 - age).",
    'Use print("Please wait while I think...."). Keep all four dots!',
    "Use import time as shown in the example, then put time.sleep(3) between your thinking message and your prediction.",
    'You can combine words and variables with commas: print("Explorer", user_name, "you will turn 100 in the year", year_of_100).',
    "For example, in 2026 an explorer who has already turned 10 will turn 100 in 2116. Enter whole-number ages in the browser prompts.",
  ],
  estimatedMinutes: 15,
  starterCode: "",
  validation: {
    mode: "template",
    executionTimeoutMs: 10000,
    solution: `import time
from datetime import date
user_name = input(__name_prompt__)
age = int(input(__age_prompt__))
current_year = date.today().year
year_of_100 = current_year + (100 - age)
print("Please wait while I think....")
time.sleep(3)
print("Explorer", user_name, "you will turn 100 in the year", year_of_100)`,
    alternatives: [
      `import time
from datetime import date
user_name = input(__name_prompt__)
age = input(__age_prompt__)
current_year = date.today().year
year_of_100 = current_year - int(age) + 100
print("Please wait while I think....")
time.sleep(3)
print(user_name + " you will turn 100 in the year " + str(year_of_100))`,
      `import time
from datetime import date
user_name = input(__name_prompt__)
age = int(input(__age_prompt__))
current_year = date.today().year
year_of_100 = current_year + (100 - age)
print("Please wait while I think....")
time.sleep(3)
print(f"Explorer {user_name}, you will turn 100 in the year {year_of_100}!")`,
    ],
    placeholders: {
      __name_prompt__: { type: "string", pattern: ".*\\S.*" },
      __age_prompt__: { type: "string", pattern: ".*\\S.*" },
    },
    cases: [
      { label: "a young explorer", inputs: ["Luna", "10"] },
      { label: "a different explorer and age", inputs: ["Sam Rivera", "37"] },
      { label: "an explorer turning 100 this year", inputs: ["Alex", "100"] },
    ],
    message:
      "Ask for a name and age, calculate the century year from the current year, print the exact thinking message, pause with time.sleep(3), then print the name and predicted year. Follow the lesson's variable names and order.",
  },
};
