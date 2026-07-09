import { tracks, type Track } from "../tracks/tracks";

const progressStorageKey = "orbitio:user-progress";
const progressChangedEvent = "orbitio:progress-changed";

export type UserProgress = {
  completedLessonSlugs: string[];
};

export const temporaryUserProgress: UserProgress = {
  completedLessonSlugs: [],
};

let cachedStoredProgress: string | null = null;
let cachedUserProgress: UserProgress = temporaryUserProgress;

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

export function readStoredUserProgress(): UserProgress {
  if (typeof window === "undefined") {
    return temporaryUserProgress;
  }

  try {
    const storedProgress = window.localStorage.getItem(progressStorageKey);
    if (storedProgress === cachedStoredProgress) {
      return cachedUserProgress;
    }

    cachedStoredProgress = storedProgress;

    if (!storedProgress) {
      cachedUserProgress = temporaryUserProgress;
      return cachedUserProgress;
    }

    const parsedProgress = JSON.parse(storedProgress) as Partial<UserProgress>;
    const completedLessonSlugs = Array.isArray(
      parsedProgress.completedLessonSlugs
    )
      ? parsedProgress.completedLessonSlugs.filter(
          (lessonSlug): lessonSlug is string => typeof lessonSlug === "string"
        )
      : [];

    cachedUserProgress = { completedLessonSlugs };
    return cachedUserProgress;
  } catch {
    cachedUserProgress = temporaryUserProgress;
    return cachedUserProgress;
  }
}

export function saveUserProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;

  cachedUserProgress = progress;
  cachedStoredProgress = JSON.stringify(progress);
  window.localStorage.setItem(progressStorageKey, cachedStoredProgress);
  window.dispatchEvent(new Event(progressChangedEvent));
}

export function completeLesson(lessonSlug: string) {
  const progress = readStoredUserProgress();

  if (progress.completedLessonSlugs.includes(lessonSlug)) {
    return progress;
  }

  const nextProgress = {
    completedLessonSlugs: [...progress.completedLessonSlugs, lessonSlug],
  };

  saveUserProgress(nextProgress);
  return nextProgress;
}

export function subscribeToStoredUserProgress(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === progressStorageKey) {
      onStoreChange();
    }
  };

  window.addEventListener(progressChangedEvent, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(progressChangedEvent, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}
