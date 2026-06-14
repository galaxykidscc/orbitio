import Link from "next/link";
import {
  getTrackCompletionCount,
  temporaryUserProgress,
} from "@/src/data/progress/progress";
import {
  getTracksWithLessons,
} from "@/src/data/tracks/tracks";

export default function MissionsPage() {
  const tracks = getTracksWithLessons();
  const firstTrack = tracks[0];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="max-w-3xl">
            <p className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-800">
              Orbitio
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Learn to code through missions and free play
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Choose a mission chain, follow the path, or jump into the lab to
              practice on your own.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {firstTrack && (
                <Link
                  href={`/missions/${firstTrack.slug}`}
                  className="rounded-xl bg-violet-900 px-5 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  Start {firstTrack.title}
                </Link>
              )}

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
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-900">
                Mission Chains
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {tracks.length} tracks
              </span>
            </div>

            <div className="grid gap-4">
              {tracks.map((track) => {
                const completedCount = getTrackCompletionCount(
                  track,
                  temporaryUserProgress
                );
                const firstLesson = track.lessons[0];

                return (
                  <article
                    key={track.slug}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-violet-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-violet-800">
                          {track.lessonType.toUpperCase()} Track
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-slate-900">
                          {track.title}
                        </h3>
                        <p className="mt-2 text-slate-600">
                          {track.description}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                        {completedCount}/{track.lessonSlugs.length} complete
                      </span>
                    </div>

                    {firstLesson && (
                      <p className="mt-4 text-sm text-slate-600">
                        First mission:{" "}
                        <span className="font-semibold text-slate-800">
                          {firstLesson.title}
                        </span>
                      </p>
                    )}

                    <Link
                      href={`/missions/${track.slug}`}
                      className="mt-4 inline-block text-sm font-semibold text-violet-800"
                    >
                      Open track
                    </Link>
                  </article>
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
