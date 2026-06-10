import Link from "next/link";
import { htmlJsLessons } from "@/lib/lessons/htmlJsLessons";
import {
  completedLessonIds,
  isLessonUnlocked,
} from "@/lib/lessons/lessonProgress";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="max-w-3xl">
            <p className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-800">
              Code Tutor
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Learn to code through missions and free play
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Follow the mission path in order, or jump into the lab to practice
              on your own.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/lesson/html-js/repair-the-signal-beacon"
                className="rounded-xl bg-violet-900 px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Start Mission 1
              </Link>

              <Link
                href="/playground/html-js"
                className="rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
              >
                Open Free Play Lab
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Mission Path
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                Sequential Progression
              </span>
            </div>

            <div className="grid gap-4">
              {htmlJsLessons.map((lesson) => {
                const unlocked = isLessonUnlocked(
                  lesson.id,
                  lesson.requiredLessonId,
                  completedLessonIds
                );

                return (
                  <div
                    key={lesson.slug}
                    className={`rounded-2xl border p-5 transition ${
                      unlocked
                        ? "border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-white hover:shadow-sm"
                        : "border-slate-200 bg-slate-100 opacity-75"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {lesson.title}
                      </h3>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          unlocked
                            ? "bg-violet-100 text-violet-800"
                            : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        {unlocked ? lesson.badge : "Locked"}
                      </span>
                    </div>

                    <p className="text-slate-600">{lesson.objective}</p>

                    {unlocked ? (
                      <Link
                        href={`/lesson/html-js/${lesson.slug}`}
                        className="mt-4 inline-block text-sm font-semibold text-violet-800"
                      >
                        Open mission →
                      </Link>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-slate-500">
                        Complete the previous mission to unlock this lesson.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Free Play Lab
              </h2>
              <p className="mt-3 text-slate-600">
                Practice on your own, test ideas, and build without mission
                goals.
              </p>

              <Link
                href="/playground/html-js"
                className="mt-5 inline-block rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Open Lab
              </Link>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-amber-900">
                Mission Rules
              </h2>

              <div className="mt-4 space-y-3 text-amber-900">
                <p>1. Missions are meant to be completed in order.</p>
                <p>2. Each mission teaches the skills needed for the next one.</p>
                <p>3. Free Play Lab is always open for practice.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}