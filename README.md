This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:
## start from the directroy that contains the application code
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Python lesson validation rules

Python lessons use rule-based validation. New Python lessons should define validation with `mode: "rules"` in the lesson file under `src/data/lessons/python`.

```ts
validation: {
  mode: "rules",
  rules: [
    { type: "minPrintCalls", count: 2 },
    { type: "assignmentExists", name: "robot_name", valueType: "string" },
    { type: "printIdentifier", name: "robot_name" },
  ],
}
```

Rules run in order. The first failed rule shows its message to the student, so put basic requirements before more specific checks. Most rules accept an optional `message` field when the default feedback is not specific enough.

Available rules:

- `exactOutput`: checks the program output exactly.
- `requiredCodeText`: checks that specific text appears in the code. Use sparingly because it is easy to make too strict or too loose.
- `bannedCodeText`: fails if specific starter text or a forbidden shortcut is still present.
- `minPrintCalls`: requires at least a certain number of `print(...)` calls.
- `assignmentExists`: requires a variable assignment, optionally with `valueType: "string"` or `valueType: "numeric"`.
- `printIdentifier`: requires printing a variable, not just printing the variable name as text.
- `minNumericAssignments`: requires at least a certain number of numeric variable assignments.
- `computedAssignment`: requires a variable computed from earlier numeric variables with `+`, `-`, `*`, or `/`.
- `printComputedAssignment`: requires printing the variable found by a prior `computedAssignment` rule.

For math lessons, prefer computed rules over exact output. This avoids accepting hardcoded answers like `print(65)` while still allowing students to choose their own variable names.

```ts
validation: {
  mode: "rules",
  rules: [
    { type: "minNumericAssignments", count: 2 },
    {
      type: "computedAssignment",
      id: "total",
      operator: "+",
      operands: "previousNumericAssignments",
      message: "Create a total variable by adding your number variables together.",
    },
    {
      type: "printComputedAssignment",
      computedAssignmentId: "total",
    },
  ],
}
```

This accepts code like:

```python
first_number = 45
second_number = 10

tot_num = first_number + second_number

print(tot_num)
```

It rejects hardcoded computations like:

```python
first_number = 45
second_number = 25

total_number = 40 + 25

print(total_number)
```

For variable lessons, prefer `assignmentExists` plus `printIdentifier` instead of simple keyword checks:

```ts
validation: {
  mode: "rules",
  rules: [
    { type: "assignmentExists", name: "robot_name", valueType: "string" },
    { type: "assignmentExists", name: "power_level", valueType: "numeric" },
    { type: "minPrintCalls", count: 2 },
    { type: "printIdentifier", name: "robot_name" },
    { type: "printIdentifier", name: "power_level" },
  ],
}
```

Validation is intentionally lightweight and regex-based. It is good for beginner lessons, but it is not a full Python parser. If a future lesson needs loops, functions, conditionals, or deeper code understanding, add a new composable rule in `src/data/lessons/python/validate-python-lesson.ts` and document it here.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
