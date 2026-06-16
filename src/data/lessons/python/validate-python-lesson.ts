import type { PythonLesson } from "@/src/data/lessons/types";

type ValidationResult = {
  passed: boolean;
  message: string;
};

export function validatePythonLesson(
  code: string,
  output: string,
  lesson: PythonLesson
): ValidationResult {
  const validation = lesson.validation;

  if (validation.mode === "exactOutput") {
    const studentOutput = normalizeOutput(output, validation.ignoreWhitespace);
    const expectedOutput = normalizeOutput(
      validation.expectedOutput,
      validation.ignoreWhitespace
    );

    if (studentOutput !== expectedOutput) {
      return {
        passed: false,
        message: "Your output does not match the expected result yet.",
      };
    }

    return {
      passed: true,
      message: "Mission complete!",
    };
  }

  if (validation.mode === "flexible") {
    const requiredKeywords = validation.requiredKeywords ?? [];

    for (const keyword of requiredKeywords) {
      if (!code.includes(keyword)) {
        return {
          passed: false,
          message: `Try using ${keyword} in your code.`,
        };
      }
    }

    if (validation.minPrintStatements) {
      const printMatches = code.match(/\bprint\s*\(/g) ?? [];

      if (printMatches.length < validation.minPrintStatements) {
        return {
          passed: false,
          message: `Try adding at least ${validation.minPrintStatements} print statements.`,
        };
      }
    }

    const bannedText = validation.bannedText ?? [];

    for (const text of bannedText) {
      if (code.includes(text)) {
        return {
          passed: false,
          message: `Make sure you change "${text}" to something new.`,
        };
      }
    }

    return {
      passed: true,
      message: "Mission complete!",
    };
  }

  return {
    passed: false,
    message: "This lesson does not have a valid validation rule.",
  };
}

function normalizeOutput(output: string, ignoreWhitespace?: boolean) {
  const normalized = output.replace(/\r\n/g, "\n").trim();

  if (ignoreWhitespace) {
    return normalized.replace(/\s+/g, " ");
  }

  return normalized;
}