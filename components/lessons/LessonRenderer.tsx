import HtmlJsLessonView from "./HtmlJsLessonView";
import PythonLessonView from "./PythonLessonView";
import RobloxLessonView from "./RobloxLessonView";
import ScratchLessonView from "./ScratchLessonView";
import type { Lesson } from "@/src/data/lessons/types";
import type { Track } from "@/src/data/tracks/tracks";

type LessonRendererProps = {
  lesson: Lesson;
  track: Track;
};

export default function LessonRenderer({ lesson, track }: LessonRendererProps) {
  switch (lesson.type) {
    case "html-js":
      return <HtmlJsLessonView lesson={lesson} track={track} />;
    case "python":
      return <PythonLessonView lesson={lesson} track={track} />;
    case "scratch":
      return <ScratchLessonView lesson={lesson} track={track} />;
    case "roblox":
      return <RobloxLessonView lesson={lesson} track={track} />;
    default:
      return null;
  }
}
