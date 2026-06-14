import LessonShell from "./LessonShell";
import type { RobloxLesson } from "@/src/data/lessons/types";
import type { Track } from "@/src/data/tracks/tracks";

type RobloxLessonViewProps = {
  lesson: RobloxLesson;
  track: Track;
};

export default function RobloxLessonView({
  lesson,
  track,
}: RobloxLessonViewProps) {
  return (
    <LessonShell lesson={lesson} track={track}>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Studio Steps</h2>
        <ol className="mt-4 space-y-3">
          {lesson.studioSteps.map((step, index) => (
            <li key={step} className="flex gap-3 text-slate-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {lesson.scriptStarter && (
        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-white">Script Starter</h2>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-emerald-300">
            <code>{lesson.scriptStarter}</code>
          </pre>
        </section>
      )}
    </LessonShell>
  );
}
