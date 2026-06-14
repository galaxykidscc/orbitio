import LessonShell from "./LessonShell";
import type { ScratchLesson } from "@/src/data/lessons/types";
import type { Track } from "@/src/data/tracks/tracks";

type ScratchLessonViewProps = {
  lesson: ScratchLesson;
  track: Track;
};

export default function ScratchLessonView({
  lesson,
  track,
}: ScratchLessonViewProps) {
  return (
    <LessonShell lesson={lesson} track={track}>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Project Prompt</h2>
        <p className="mt-3 text-slate-600">{lesson.projectPrompt}</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Build Checklist</h2>
        <ol className="mt-4 space-y-3">
          {lesson.checklist.map((item, index) => (
            <li key={item} className="flex gap-3 text-slate-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>
    </LessonShell>
  );
}
