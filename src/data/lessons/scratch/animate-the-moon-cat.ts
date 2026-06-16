import type { ScratchLesson } from "../types";

export const animateTheMoonCat: ScratchLesson = {
  id: "scratch-animate-the-moon-cat",
  slug: "animate-the-moon-cat",
  type: "scratch",
  title: "Mission 1: Animate the Moon Cat",
  badge: "Scratch Starter",
  story:
    "A moon cat is floating through space and needs your help to come alive with motion and sound.",
  objective:
    "Create a Scratch scene where a character moves, reacts, and says something when the project starts.",
  steps: [
    "Choose or draw a space-themed backdrop.",
    "Add a sprite that will become your moon cat.",
    "Use event and motion blocks to make the sprite move when the green flag is clicked.",
  ],
  hints: [
    "Start with the green flag event block.",
    "Try motion blocks like move, glide, or turn.",
    "Speech bubbles can help your character feel alive.",
  ],
  estimatedMinutes: 12,
  projectPrompt:
    "Build a tiny space animation in Scratch. Your moon cat should move across the stage and say a short message when the green flag is clicked.",
  instructionSections: [
    {
      id: "start-project",
      title: "Start a new Scratch project",
      goal: "Open Scratch and set up the stage for your animation.",
      instructions: [
        "Open Scratch in a new browser tab.",
        "Choose a space-themed backdrop, or paint your own simple moon scene.",
        "Keep Orbitio open next to Scratch so you can check each step as you work.",
      ],
      hint: "In Scratch, look near the lower-right corner for the backdrop chooser. You can search for space, stars, moon, or galaxy.",
    },
    {
      id: "choose-sprite",
      title: "Add your moon cat",
      goal: "Pick the character that will move through your scene.",
      instructions: [
        "Choose a cat sprite or another creature you want to animate.",
        "Rename the sprite so it is easy to recognize later.",
        "Drag the sprite to the place where the animation should start.",
      ],
      hint: "If the sprite is too large, select it and change the Size number. Try a value between 40 and 80.",
    },
    {
      id: "make-it-move",
      title: "Make the sprite move",
      goal: "Use event and motion blocks to start the animation.",
      instructions: [
        "Add a when green flag clicked block.",
        "Connect a motion block such as glide, move, or turn.",
        "Click the green flag to test what happens.",
      ],
      hint: "A glide block is a friendly first choice because it lets you choose where the sprite ends up and how long the movement takes.",
    },
    {
      id: "add-message",
      title: "Add a message",
      goal: "Make the moon cat say something when the project starts.",
      instructions: [
        "Add a Looks block that makes the sprite say a short message.",
        "Put the message before, during, or after the motion blocks.",
        "Test again and adjust the timing until the animation feels clear.",
      ],
      hint: "Try a short message like 'Moon mission ready!' or write your own line that fits your story.",
    },
  ],
  checklist: [
    "The project has a space-themed backdrop.",
    "The project has a cat or creature sprite.",
    "Clicking the green flag starts the animation.",
    "The sprite moves or glides across the stage.",
    "The sprite says a message using a Looks block.",
  ],
};
