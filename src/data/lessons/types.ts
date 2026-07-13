// src/data/lessons/types.ts

export type LessonType = "html-js" | "python" | "scratch" | "roblox";

export type PythonValidationRule =
  | {
      type: "exactOutput";
      expectedOutput: string;
      ignoreWhitespace?: boolean;
      message?: string;
    }
  | {
      type: "requiredCodeText";
      text: string;
      message?: string;
    }
  | {
      type: "bannedCodeText";
      text: string;
      message?: string;
    }
  | {
      type: "minPrintCalls";
      count: number;
      message?: string;
    }
  | {
      type: "assignmentExists";
      name: string;
      valueType?: "any" | "numeric" | "string";
      message?: string;
    }
  | {
      type: "printIdentifier";
      name: string;
      message?: string;
    }
  | {
      type: "minNumericAssignments";
      count: number;
      message?: string;
    }
  | {
      type: "computedAssignment";
      id: string;
      operator: "+" | "-" | "*" | "/";
      operands: "previousNumericAssignments";
      message?: string;
    }
  | {
      type: "printComputedAssignment";
      computedAssignmentId: string;
      message?: string;
    };

export type PythonLessonValidation =
  {
    mode: "rules";
    rules: PythonValidationRule[];
  };

export type BaseLesson = {
  id: string;
  slug: string;
  type: LessonType;
  title: string;
  badge?: string;
  story?: string;
  objective: string;
  steps: string[];
  hints?: string[];
  estimatedMinutes?: number;
};

export type HtmlJsLesson = BaseLesson & {
  type: "html-js";
  starterHtml: string;
  starterCss: string;
  starterJs: string;
};

export type PythonLesson = BaseLesson & {
  type: "python";
  starterCode: string;
  validation: PythonLessonValidation;
};

export type ScratchInstructionSection = {
  id: string;
  title: string;
  goal: string;
  instructions: string[];
  hint?: string;
};

export type ScratchLesson = BaseLesson & {
  type: "scratch";
  projectPrompt: string;
  instructionSections: ScratchInstructionSection[];
  checklist: string[];
};

export type RobloxLesson = BaseLesson & {
  type: "roblox";
  studioSteps: string[];
  scriptStarter?: string;
};

export type Lesson =
  | HtmlJsLesson
  | PythonLesson
  | ScratchLesson
  | RobloxLesson;
