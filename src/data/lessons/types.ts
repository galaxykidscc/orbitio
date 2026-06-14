// src/data/lessons/types.ts

export type LessonType = "html-js" | "python" | "scratch" | "roblox";

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
  expectedOutput?: string;
};

export type ScratchLesson = BaseLesson & {
  type: "scratch";
  projectPrompt: string;
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