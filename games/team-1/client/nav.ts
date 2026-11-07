/**
 * Where the player is: the screens before a room, then the room itself (waiting, briefing, play, end).
 * Each step gets its own browser history entry, so the browser's Back button moves between them
 * instead of leaving the game, which on Railway would land on the platform index.
 */
export type Step = "start" | "intro" | "lobby" | "room";

export type BackAction = { kind: "show"; step: "start" | "intro" | "lobby" } | { kind: "ask-leave" };

const STEPS: readonly string[] = ["start", "intro", "lobby", "room"];

/** The step stored in a history entry, or null for an entry the game did not make. */
export function stepOf(entry: unknown): Step | null {
  const step = (entry as { tle?: unknown } | null)?.tle;
  return typeof step === "string" && STEPS.includes(step) ? (step as Step) : null;
}

/**
 * What to do when the browser's Back button lands on `entry`. Inside a room the answer is always to
 * ask first. An entry of a room that was already left, or one the game did not make, is not worth
 * going back to: the lobby and the first screen are.
 */
export function onBrowserBack(current: Step, entry: unknown): BackAction {
  if (current === "room") return { kind: "ask-leave" };
  const step = stepOf(entry);
  if (step === null) return { kind: "show", step: "start" };
  return { kind: "show", step: step === "room" ? "lobby" : step };
}
