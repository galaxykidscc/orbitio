// src/data/lessons/registry.ts

import type { Lesson } from "./types";
import { htmlJsLessons } from "./html-js/lessons";
import { pythonLessons } from "./python/lessons";
import { robloxLessons } from "./roblox/lessons";
import { scratchLessons } from "./scratch/lessons";

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
