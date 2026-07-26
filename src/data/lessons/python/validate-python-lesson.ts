import type {
  PythonLesson,
  PythonValidationRule,
} from "@/src/data/lessons/types";

type ValidationResult = {
  passed: boolean;
  message: string;
};

type Assignment = {
  name: string;
  expression: string;
};

type ValidationContext = {
  code: string;
  output: string;
  assignments: Assignment[];
  assignmentsByName: Map<string, Assignment>;
  numericAssignmentNames: Set<string>;
  computedAssignments: Map<string, Assignment>;
};

export function validatePythonLesson(
  code: string,
  output: string,
  lesson: PythonLesson
): ValidationResult {
  const validation = lesson.validation;
  return evaluateRules(code, output, validation.rules);
}

function normalizeOutput(output: string, ignoreWhitespace?: boolean) {
  const normalized = output.replace(/\r\n/g, "\n").trim();

  if (ignoreWhitespace) {
    return normalized.replace(/\s+/g, " ");
  }

  return normalized;
}

function parseAssignments(code: string) {
  return code
    .split("\n")
    .map((line) => line.replace(/#.*/, "").trim())
    .map((line) => line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      name: match[1],
      expression: match[2].trim(),
    }));
}

function parseSimpleBinaryExpression(expression: string, operator: string) {
  const escapedOperator = operator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = expression.match(
    new RegExp(`^(.+?)\\s*${escapedOperator}\\s*(.+?)$`)
  );

  if (!match) return null;

  return {
    left: match[1].trim(),
    right: match[2].trim(),
  };
}

function isIdentifier(value: string) {
  return /^[A-Za-z_]\w*$/.test(value);
}

function isNumericLiteral(value: string) {
  return /^-?\d+(\.\d+)?$/.test(value.trim());
}

function isStringLiteral(value: string) {
  return /^(['"]).*\1$/.test(value.trim());
}

function printsIdentifier(code: string, identifier: string) {
  const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const printCalls = code.matchAll(/\bprint\s*\(([^)]*)\)/g);

  for (const printCall of printCalls) {
    const printArgumentsWithoutStrings = printCall[1].replace(
      /(["'])(?:\\.|(?!\1).)*\1/g,
      ""
    );

    if (new RegExp(`\\b${escapedIdentifier}\\b`).test(printArgumentsWithoutStrings)) {
      return true;
    }
  }

  return false;
}

function evaluateRules(
  code: string,
  output: string,
  rules: PythonValidationRule[]
): ValidationResult {
  const context = createValidationContext(code, output);

  for (const rule of rules) {
    const result = evaluateRule(rule, context);

    if (!result.passed) {
      return result;
    }
  }

  return {
    passed: true,
    message: "Mission complete!",
  };
}

function createValidationContext(
  code: string,
  output: string
): ValidationContext {
  const assignments = parseAssignments(code);
  const numericAssignmentNames = new Set(
    assignments
      .filter((assignment) => isNumericLiteral(assignment.expression))
      .map((assignment) => assignment.name)
  );

  return {
    code,
    output,
    assignments,
    assignmentsByName: new Map(
      assignments.map((assignment) => [assignment.name, assignment])
    ),
    numericAssignmentNames,
    computedAssignments: new Map(),
  };
}

function evaluateRule(
  rule: PythonValidationRule,
  context: ValidationContext
): ValidationResult {
  if (rule.type === "exactOutput") {
    const studentOutput = normalizeOutput(context.output, rule.ignoreWhitespace);
    const expectedOutput = normalizeOutput(
      rule.expectedOutput,
      rule.ignoreWhitespace
    );

    if (studentOutput !== expectedOutput) {
      return {
        passed: false,
        message: rule.message ?? "Your output does not match the expected result yet.",
      };
    }

    return passed();
  }

  if (rule.type === "requiredCodeText") {
    if (!context.code.includes(rule.text)) {
      return {
        passed: false,
        message: rule.message ?? `Try using ${rule.text} in your code.`,
      };
    }

    return passed();
  }

  if (rule.type === "bannedCodeText") {
    if (context.code.includes(rule.text)) {
      return {
        passed: false,
        message: rule.message ?? `Make sure you change "${rule.text}" to something new.`,
      };
    }

    return passed();
  }

  if (rule.type === "minPrintCalls") {
    const printMatches = context.code.match(/\bprint\s*\(/g) ?? [];

    if (printMatches.length < rule.count) {
      return {
        passed: false,
        message: rule.message ?? `Try adding at least ${rule.count} print statements.`,
      };
    }

    return passed();
  }

  if (rule.type === "assignmentExists") {
    const assignment = context.assignmentsByName.get(rule.name);

    if (!assignment) {
      return {
        passed: false,
        message: rule.message ?? `Create a variable named ${rule.name}.`,
      };
    }

    if (rule.valueType === "numeric" && !isNumericLiteral(assignment.expression)) {
      return {
        passed: false,
        message: rule.message ?? `Set ${rule.name} equal to a number.`,
      };
    }

    if (rule.valueType === "string" && !isStringLiteral(assignment.expression)) {
      return {
        passed: false,
        message: rule.message ?? `Set ${rule.name} equal to text in quotation marks.`,
      };
    }

    return passed();
  }

  if (rule.type === "printIdentifier") {
    if (!printsIdentifier(context.code, rule.name)) {
      return {
        passed: false,
        message: rule.message ?? `Use print() to display ${rule.name}.`,
      };
    }

    return passed();
  }

  if (rule.type === "minNumericAssignments") {
    if (context.numericAssignmentNames.size < rule.count) {
      return {
        passed: false,
        message: rule.message ?? `Create at least ${rule.count} number variables first.`,
      };
    }

    return passed();
  }

  if (rule.type === "computedAssignment") {
    const assignment = findComputedAssignment(context.assignments, rule);

    if (!assignment) {
      return {
        passed: false,
        message: rule.message ?? "Create a variable that computes the answer from earlier variables.",
      };
    }

    context.computedAssignments.set(rule.id, assignment);
    return passed();
  }

  if (rule.type === "printComputedAssignment") {
    const assignment = context.computedAssignments.get(rule.computedAssignmentId);

    if (!assignment) {
      return {
        passed: false,
        message:
          rule.message ??
          "Create the computed variable before trying to print it.",
      };
    }

    if (!printsIdentifier(context.code, assignment.name)) {
      return {
        passed: false,
        message: rule.message ?? `Use print() to display ${assignment.name}.`,
      };
    }

    return passed();
  }

  return {
    passed: false,
    message: "This lesson has a validation rule that is not supported yet.",
  };
}

function findComputedAssignment(
  assignments: Assignment[],
  rule: Extract<PythonValidationRule, { type: "computedAssignment" }>
) {
  const availableNumericVariables = new Set<string>();

  for (const assignment of assignments) {
    const expression = parseSimpleBinaryExpression(
      assignment.expression,
      rule.operator
    );

    if (
      expression &&
      isIdentifier(expression.left) &&
      isIdentifier(expression.right) &&
      rule.operands === "previousNumericAssignments" &&
      availableNumericVariables.has(expression.left) &&
      availableNumericVariables.has(expression.right)
    ) {
      return assignment;
    }

    if (isNumericLiteral(assignment.expression)) {
      availableNumericVariables.add(assignment.name);
    }
  }

  return undefined;
}

function passed(): ValidationResult {
  return {
    passed: true,
    message: "Passed",
  };
}
