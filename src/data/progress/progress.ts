import { tracks, type Track } from "../tracks/tracks";

export type UserProgress = {
  completedLessonSlugs: string[];
};

export const temporaryUserProgress: UserProgress = {
  completedLessonSlugs: [],
};

export function getTrackCompletionCount(
  track: Track,
  progress: UserProgress = temporaryUserProgress
) {
  return track.lessonSlugs.filter((lessonSlug) =>
    progress.completedLessonSlugs.includes(lessonSlug)
  ).length;
}

export function isLessonUnlocked(
  lessonSlug: string,
  progress: UserProgress = temporaryUserProgress
) {
  const track = tracks.find((currentTrack) =>
    currentTrack.lessonSlugs.includes(lessonSlug)
  );

  if (!track) return true;

  const lessonIndex = track.lessonSlugs.indexOf(lessonSlug);
  if (lessonIndex <= 0) return true;

  const previousLessonSlug = track.lessonSlugs[lessonIndex - 1];
  return progress.completedLessonSlugs.includes(previousLessonSlug);
}
