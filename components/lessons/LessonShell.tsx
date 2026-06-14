"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Lesson } from "@/src/data/lessons/types";
import type { Track } from "@/src/data/tracks/tracks";

type LessonShellProps = {
  lesson: Lesson;
  track: Track;
  actions?: ReactNode;
  children: ReactNode;
  completedSteps?: number;
  stepChecks?: boolean[];
  mainClassName?: string;
  missionComplete?: boolean;
};

export default function LessonShell({
  lesson,
  track,
  actions,
  children,
  completedSteps,
  stepChecks,
  mainClassName = "space-y-6",
  missionComplete = false,
}: LessonShellProps) {
  const totalSteps = lesson.steps.length;
  const hasProgress = completedSteps !== undefined;
  const progressPercent =
    hasProgress && totalSteps > 0
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Link
            href={`/missions/${track.slug}`}
            className="text-sm font-semibold text-violet-800"
          >
            Back to {track.title}
          </Link>

          <div className="mt-5 flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-800">
                  {lesson.badge ?? track.title}
                </p>
                <h1 className="text-3xl font-bold text-slate-900">
                  {lesson.title}
                </h1>
                {lesson.story && (
                  <p className="mt-2 max-w-3xl text-slate-600">
                    {lesson.story}
                  </p>
                )}
              </div>

              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>

            {hasProgress && (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>
                    Mission Progress: {completedSteps} / {totalSteps} steps
                  </span>
                  <span>{progressPercent}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-violet-700 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {missionComplete && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-lg font-bold text-emerald-800">
                  Mission Complete
                </p>
                <p className="mt-1 text-emerald-700">
                  Great job. You completed this lesson.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Objective</h2>
              <p className="mt-3 text-slate-600">{lesson.objective}</p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Mission Steps
                </h2>
                {hasProgress && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {completedSteps}/{totalSteps}
                  </span>
                )}
              </div>

              <ol className="mt-4 space-y-4">
                {lesson.steps.map((step, index) => {
                  const done = stepChecks?.[index] ?? false;

                  return (
                    <li key={step} className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          done
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-violet-100 text-violet-800"
                        }`}
                      >
                        {done ? "OK" : index + 1}
                      </div>

                      <div>
                        <p
                          className={
                            done
                              ? "font-semibold text-emerald-700"
                              : "text-slate-700"
                          }
                        >
                          {step}
                        </p>
                        {hasProgress && (
                          <p className="mt-1 text-sm text-slate-500">
                            {done ? "Completed" : "Not completed yet"}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {lesson.hints && lesson.hints.length > 0 && (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <h2 className="text-lg font-bold text-amber-900">Hints</h2>
                <ul className="mt-4 space-y-3">
                  {lesson.hints.map((hint) => (
                    <li key={hint} className="text-amber-900">
                      {hint}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>

          <section className={mainClassName}>{children}</section>
        </div>
      </div>
    </main>
  );
}
