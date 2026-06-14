import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isLessonUnlocked,
  temporaryUserProgress,
} from "@/src/data/progress/progress";
import {
  getTrackWithLessonsBySlug,
} from "@/src/data/tracks/tracks";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ trackSlug: string }>;
}) {
  const { trackSlug } = await params;
  const track = getTrackWithLessonsBySlug(trackSlug);

  if (!track) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <Link href="/missions" className="text-sm font-semibold text-violet-800">
            Back to missions
          </Link>

          <div className="mt-6 max-w-3xl">
            <p className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-800">
              Mission Chain
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {track.title}
            </h1>

            <p className="mt-4 text-lg text-slate-600">{track.description}</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-900">Lessons</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {track.lessons.length} missions
              </span>
            </div>

            <div className="grid gap-4">
              {track.lessons.map((lesson, index) => {
                const unlocked = isLessonUnlocked(
                  lesson.slug,
                  temporaryUserProgress
                );

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
                        <p className="mt-2 text-slate-600">
                          {lesson.objective}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          unlocked
                            ? "bg-violet-100 text-violet-800"
                            : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        {unlocked ? lesson.badge ?? "Unlocked" : "Locked"}
                      </span>
                    </div>

                    {unlocked ? (
                      <Link
                        href={`/missions/${track.slug}/${lesson.slug}`}
                        className="mt-4 inline-block text-sm font-semibold text-violet-800"
                      >
                        Open mission
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
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Free Play Lab</h2>
              <p className="mt-3 text-slate-600">
                Practice without mission goals whenever you want to experiment.
              </p>

              <Link
                href="/playground/html-js"
                className="mt-5 inline-block rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Open Lab
              </Link>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-amber-900">Track Rules</h2>

              <div className="mt-4 space-y-3 text-amber-900">
                <p>1. Work through missions in order.</p>
                <p>2. Each mission prepares you for the next one.</p>
                <p>3. Free Play Lab stays open for practice.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
