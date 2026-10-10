// src/data/lessons/types.ts

export type LessonType = "html-js" | "python" | "scratch" | "roblox";

/** Placeholder names are valid Python identifiers used inside the solution. */
export type PythonPlaceholder = {
  type: "integer" | "number" | "string" | "identifier";
  /** Optional full-string regular expression for text values (case insensitive). */
  pattern?: string;
};

export type PythonLessonValidation = {
  mode: "template" | "output";
  solution: string;
  placeholders?: Record<string, PythonPlaceholder>;
  /** Additional accepted structures; output is derived from the matched solution. */
  alternatives?: string[];
  cases?: { inputs: string[]; label: string }[];
  message?: string;
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
