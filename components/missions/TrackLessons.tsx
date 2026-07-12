"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  isLessonUnlocked,
  readStoredUserProgress,
  subscribeToStoredUserProgress,
  temporaryUserProgress,
} from "@/src/data/progress/progress";
import type { TrackWithLessons } from "@/src/data/tracks/tracks";

type TrackLessonsProps = {
  track: TrackWithLessons;
};

export default function TrackLessons({ track }: TrackLessonsProps) {
  const progress = useSyncExternalStore(
    subscribeToStoredUserProgress,
    readStoredUserProgress,
    () => temporaryUserProgress
  );

  return (
    <div className="grid gap-4">
      {track.lessons.map((lesson, index) => {
        const completed = progress.completedLessonSlugs.includes(lesson.slug);
        const unlocked = isLessonUnlocked(lesson.slug, progress);

        return (
          <article
            key={lesson.slug}
            className={`rounded-2xl border p-5 transition ${
              unlocked
                ? "border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-white hover:shadow-sm"
                : "border-slate-200 bg-slate-100 opacity-75"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-800">
                  Mission {index + 1}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {lesson.title}
                </h3>
                <p className="mt-2 text-slate-600">{lesson.objective}</p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  completed
                    ? "bg-emerald-100 text-emerald-800"
                    : unlocked
                      ? "bg-violet-100 text-violet-800"
                      : "bg-slate-300 text-slate-700"
                }`}
              >
                {completed
                  ? "Completed"
                  : unlocked
                    ? lesson.badge ?? "Unlocked"
                    : "Locked"}
              </span>
            </div>

            {unlocked ? (
              <Link
                href={`/missions/${track.slug}/${lesson.slug}`}
                className="mt-4 inline-block text-sm font-semibold text-violet-800"
              >
                {completed ? "Review mission" : "Open mission"}
              </Link>
            ) : (
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Complete the previous mission to unlock this lesson.
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
