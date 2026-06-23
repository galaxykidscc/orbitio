import { getLessonBySlug } from "../lessons/registry";
import type { Lesson, LessonType } from "../lessons/types";

export type Track = {
  slug: string;
  title: string;
  description: string;
  lessonType: LessonType;
  lessonSlugs: string[];
};

export type TrackWithLessons = Track & {
  lessons: Lesson[];
};

export const tracks: Track[] = [
  {
    slug: "web-basics",
    title: "Web Basics",
    description: "Start your coding journey with HTML, CSS, and JavaScript.",
    lessonType: "html-js",
    lessonSlugs: ["repair-the-signal-beacon", "wake-the-forest-gate"],
  },
  {
    slug: "python-basics",
    title: "Python Basics",
    description: "Use Python to print messages, store values, and solve small puzzles.",
    lessonType: "python",
    lessonSlugs: ["power-up-the-robot", "practice-using-print", "variables-practice"],
  },
  {
  slug: "scratch-basics",
  title: "Scratch Basics",
  description: "Create playful animations with sprites, events, and motion blocks.",
  lessonType: "scratch",
  lessonSlugs: ["animate-the-moon-cat"],
},
];

export function getTrackBySlug(slug: string) {
  return tracks.find((track) => track.slug === slug);
}

export function getLessonsForTrack(track: Track) {
  return track.lessonSlugs
    .map((lessonSlug) => getLessonBySlug(lessonSlug))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

export function getTrackWithLessonsBySlug(slug: string) {
  const track = getTrackBySlug(slug);
  if (!track) return undefined;

  return {
    ...track,
    lessons: getLessonsForTrack(track),
  };
}

export function getTracksWithLessons() {
  return tracks.map((track) => ({
    ...track,
    lessons: getLessonsForTrack(track),
  }));
}

export function isLessonInTrack(track: Track, lessonSlug: string) {
  return track.lessonSlugs.includes(lessonSlug);
}
