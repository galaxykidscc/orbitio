"use client";

import { useMemo, useState } from "react";
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
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    lesson.checklist.map(() => false)
  );

  const completedSteps = checkedItems.filter(Boolean).length;
  const missionComplete =
    lesson.checklist.length > 0 && completedSteps === lesson.checklist.length;

  const checklistProgress = useMemo(() => {
    if (lesson.checklist.length === 0) return 0;
    return Math.round((completedSteps / lesson.checklist.length) * 100);
  }, [completedSteps, lesson.checklist.length]);

  const toggleChecklistItem = (index: number) => {
    setCheckedItems((currentItems) =>
      currentItems.map((item, currentIndex) =>
        currentIndex === index ? !item : item
      )
    );
  };

  return (
    <LessonShell
      lesson={lesson}
      track={track}
      missionComplete={missionComplete}
      mainClassName="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"
      actions={
        <a
          href="https://scratch.mit.edu/projects/editor/"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
        >
          Open Scratch
        </a>
      }
    >
      <nav className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Lesson Steps
        </h2>

        <ol className="mt-4 space-y-2">
          {lesson.instructionSections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-800"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">
                  {index + 1}
                </span>
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ol>

        <a
          href="#checklist"
          className="mt-4 flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-800"
        >
          <span>Checklist</span>
          <span>{checklistProgress}%</span>
        </a>
      </nav>

      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-700">
            Build In Scratch
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Project Prompt
          </h2>
          <p className="mt-3 max-w-3xl text-slate-700">
            {lesson.projectPrompt}
          </p>
        </section>

        {lesson.instructionSections.map((section, index) => (
          <section
            id={section.id}
            key={section.id}
            className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-2 text-slate-600">{section.goal}</p>

                <ol className="mt-5 space-y-3">
                  {section.instructions.map((instruction) => (
                    <li key={instruction} className="flex gap-3 text-slate-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>

                {section.hint && (
                  <details className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <summary className="cursor-pointer font-bold text-amber-950">
                      Need a hint?
                    </summary>
                    <p className="mt-3 text-amber-900">{section.hint}</p>
                  </details>
                )}
              </div>
            </div>
          </section>
        ))}

        <section
          id="checklist"
          className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                Finish Line
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Build Checklist
              </h2>
            </div>

            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              {completedSteps}/{lesson.checklist.length} complete
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${checklistProgress}%` }}
            />
          </div>

          <div className="mt-5 space-y-3">
            {lesson.checklist.map((item, index) => {
              const checked = checkedItems[index];

              return (
                <label
                  key={item}
                  className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                    checked
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:border-orange-200 hover:bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklistItem(index)}
                    className="mt-1 h-5 w-5 accent-emerald-600"
                  />
                  <span
                    className={
                      checked
                        ? "font-semibold text-emerald-800"
                        : "text-slate-700"
                    }
                  >
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </div>
    </LessonShell>
  );
}
