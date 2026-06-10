import { htmlJsLessons } from "@/lib/lessons/htmlJsLessons";

export const completedLessonIds: number[] = [];
// Temporary mock progress.
// Later this should come from a database, localStorage, or user account.

export function isLessonUnlocked(
  lessonId: number,
  requiredLessonId: number | null,
  completedIds: number[]
) {
  if (requiredLessonId === null) return true;
  return completedIds.includes(requiredLessonId);
}

export function getNextLesson(lessonId: number) {
  return htmlJsLessons.find((lesson) => lesson.requiredLessonId === lessonId);
}