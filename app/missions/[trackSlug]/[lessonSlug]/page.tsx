import { notFound } from "next/navigation";
import LessonRenderer from "@/components/lessons/LessonRenderer";
import { getTrackWithLessonsBySlug } from "@/src/data/tracks/tracks";

export default async function MissionLessonPage({
  params,
}: {
  params: Promise<{ trackSlug: string; lessonSlug: string }>;
}) {
  const { trackSlug, lessonSlug } = await params;

  const track = getTrackWithLessonsBySlug(trackSlug);
  if (!track) {
    notFound();
  }

  const lesson = track.lessons.find(
    (currentLesson) => currentLesson.slug === lessonSlug
  );

  if (!lesson) {
    notFound();
  }

  return <LessonRenderer lesson={lesson} track={track} />;
}
