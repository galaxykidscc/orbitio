# Lesson Architecture

Orbitio lessons are data-driven. Most new lessons should be added by editing
lesson data and track data, not by creating new routes.

This guide is written for developers who are still getting comfortable with the
codebase. If you are adding a normal lesson to an existing lesson type, follow
the checklist near the end.

## Route Structure

Mission routes are generic:

- `/missions` lists all mission tracks.
- `/missions/[trackSlug]` shows one track and its ordered lesson chain.
- `/missions/[trackSlug]/[lessonSlug]` loads one lesson from that track.

The route does not know about a specific subject like HTML, Python, Scratch, or
Roblox. It loads the track, finds the lesson by slug, and passes both into the
lesson renderer.

Free Play Lab routes are separate:

- `/playground/html-js`
- `/playground/python`

Keep playground pages for open-ended practice. Mission lessons should stay in
the `/missions` flow.

## Lesson Data

Lesson types live in `src/data/lessons/types.ts`.

All lessons share these base fields:

- `id`: A unique internal id. Use a stable, descriptive value.
- `slug`: The URL-safe lesson name used in mission links.
- `type`: The renderer type, such as `html-js` or `python`.
- `title`: The display title shown to students.
- `badge`: Optional short label, such as `Beginner Mission`.
- `story`: Optional mission setup text.
- `objective`: The main learning goal.
- `steps`: The checklist students should complete.
- `hints`: Optional help text.
- `estimatedMinutes`: Optional time estimate.

Each lesson type also has fields for its specific workspace:

- `html-js`: `starterHtml`, `starterCss`, and `starterJs`
- `python`: `starterCode` and optional `expectedOutput`
- `scratch`: `projectPrompt` and `checklist`
- `roblox`: `studioSteps` and optional `scriptStarter`

Lesson files are grouped by type:

- `src/data/lessons/html-js/lessons.ts`
- `src/data/lessons/python/lessons.ts`
- `src/data/lessons/scratch/lessons.ts`
- `src/data/lessons/roblox/lessons.ts`

The registry in `src/data/lessons/registry.ts` combines those arrays into
`allLessons`. The rest of the app uses the registry helper functions instead of
importing each lesson file directly.

## Track Data

Tracks live in `src/data/tracks/tracks.ts`.

A track has:

- `slug`: The URL-safe track name.
- `title`: The display name.
- `description`: Short text shown on the missions pages.
- `lessonType`: The main lesson type for the track.
- `lessonSlugs`: The lessons in the order students should complete them.

The order in `lessonSlugs` is important. It controls the mission chain display
and the temporary unlock behavior.

Track helper functions:

- `getTrackBySlug(slug)` finds a track definition.
- `getLessonsForTrack(track)` resolves `lessonSlugs` into lesson objects.
- `getTrackWithLessonsBySlug(slug)` returns a track plus its resolved lessons.
- `getTracksWithLessons()` returns all tracks plus their resolved lessons.
- `isLessonInTrack(track, lessonSlug)` checks whether a lesson belongs to a
  track.

## Renderer Flow

The generic lesson route is
`app/missions/[trackSlug]/[lessonSlug]/page.tsx`.

It does this:

1. Reads `trackSlug` and `lessonSlug` from the URL.
2. Loads the track with `getTrackWithLessonsBySlug`.
3. Looks for the lesson inside that track's resolved lessons.
4. Shows a 404 if the track or lesson is missing.
5. Passes the lesson and track to `components/lessons/LessonRenderer.tsx`.

`LessonRenderer` switches on `lesson.type`:

- `html-js` renders `HtmlJsLessonView`
- `python` renders `PythonLessonView`
- `scratch` renders `ScratchLessonView`
- `roblox` renders `RobloxLessonView`

Each lesson view owns the editor, preview, output, or checklist experience for
that lesson type. Shared page layout belongs in `LessonShell`.

## Progress Shape

Progress is temporary for now and lives in `src/data/progress/progress.ts`.

The current shape is:

```ts
export type UserProgress = {
  completedLessonSlugs: string[];
};
```

The temporary progress object is:

```ts
export const temporaryUserProgress: UserProgress = {
  completedLessonSlugs: [],
};
```

The progress helpers use lesson slugs:

- `getTrackCompletionCount(track, progress)` counts completed lessons in a
  track.
- `isLessonUnlocked(lessonSlug, progress)` unlocks the first lesson in a track
  and then requires each previous lesson to be completed.

Because progress is slug-based, keep lesson slugs stable after launch. Changing
a slug later would make saved completion data point at the old name.

## Where Supabase Will Plug In

Supabase should replace the temporary progress source, not the lesson data.

The likely future flow:

1. Keep lesson definitions in `src/data/lessons`.
2. Keep track order in `src/data/tracks`.
3. Fetch the signed-in user's completed lesson slugs from Supabase.
4. Convert the Supabase result into the same `UserProgress` shape.
5. Pass that progress object into `getTrackCompletionCount` and
   `isLessonUnlocked`.

This keeps the app easy to test. Static curriculum content stays in the repo,
while user-specific completion state comes from Supabase.

Avoid adding Supabase-specific logic inside lesson files or renderer components.
Those components should receive progress data from a route, layout, server
action, or another thin data-loading layer.

## Adding A Lesson To An Existing Track

1. Pick the correct lesson type.
2. Open that lesson type's file in `src/data/lessons`.
3. Add a new lesson object to the exported lesson array.
4. Make sure `id` and `slug` are unique.
5. Add the new lesson's `slug` to the correct track's `lessonSlugs` array in
   `src/data/tracks/tracks.ts`.
6. Run `npm run lint`.
7. Run `npx tsc --noEmit --pretty false`.
8. Open the track page and the lesson page in the browser.

For example, to add a third Web Basics lesson:

1. Add the lesson object to `src/data/lessons/html-js/lessons.ts`.
2. Add its slug to the end of the `web-basics` track:

```ts
lessonSlugs: [
  "repair-the-signal-beacon",
  "wake-the-forest-gate",
  "your-new-lesson-slug",
],
```

## Adding A New Track

1. Add any needed lessons to the correct lesson data file.
2. Add a new track object to the `tracks` array in
   `src/data/tracks/tracks.ts`.
3. Set `lessonType` to the type used by the lessons in the track.
4. Put the lesson slugs in the order students should complete them.
5. Check `/missions` to confirm the new track appears.
6. Check `/missions/[trackSlug]` to confirm lessons appear in the right order.

## Adding A New Lesson Type

Adding a new lesson type is a larger change than adding a lesson.

You will need to:

1. Add the new type to `LessonType` in `src/data/lessons/types.ts`.
2. Add a new lesson-specific type to the `Lesson` union.
3. Create a new lesson data folder under `src/data/lessons`.
4. Import the new lesson array in `src/data/lessons/registry.ts`.
5. Create a new lesson view component in `components/lessons`.
6. Add a new `case` to `LessonRenderer`.
7. Add at least one track that uses the new lesson type.
8. Run lint, TypeScript, and browser checks.

## Common Mistakes

- Do not hard-code a lesson route for one subject. Use the generic mission
  route.
- Do not add Free Play Lab pages to a mission track. Labs are separate from
  curriculum progress.
- Do not forget to add the lesson slug to a track. A lesson in the registry will
  not appear in the mission chain until a track references it.
- Do not reuse slugs. Slugs are used for URLs and progress.
- Do not put Supabase reads or writes inside static lesson data files.
