// src/data/lessons/registry.ts

import type { Lesson } from "./types";
import { htmlJsLessons } from "./html-js";
import { pythonLessons } from "./python";
import { robloxLessons } from "./roblox";
import { scratchLessons } from "./scratch";

export const allLessons: Lesson[] = [
  ...htmlJsLessons,
  ...pythonLessons,
  ...scratchLessons,
  ...robloxLessons,
];

export function getLessonBySlug(slug: string) {
  return allLessons.find((lesson) => lesson.slug === slug);
}

export function getLessonsByType(type: Lesson["type"]) {
  return allLessons.filter((lesson) => lesson.type === type);
}
