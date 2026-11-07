/** Clock ticking during the run, synthesized with the Web Audio API so no audio files ship with the game. */
import type { EscapeSnapshot } from "../shared/escape.ts";
import { audio, noiseBuffer } from "./footsteps.ts";

/** Seconds left at which the ticking turns urgent. */
export const urgentSeconds = 10;

export type Tick = { tock: boolean; urgent: boolean };

/**
 * The tick to play when the run timer dropped by a second within the same attempt, or null.
 * Ticks alternate between tick (even seconds) and tock (odd seconds), and turn urgent near the end.
 */
export function clockTick(previous: EscapeSnapshot | undefined, next: EscapeSnapshot): Tick | null {
  if (!previous || previous.attempt !== next.attempt || next.phase !== "running") return null;
  if (next.seconds >= previous.seconds) return null;
  return { tock: next.seconds % 2 === 1, urgent: next.seconds <= urgentSeconds };
}

/** One clock tick: a tiny escapement click rung through the clock's case, with a soft knock of the body. */
export function playTick({ tock, urgent }: Tick) {
  const context = audio();
  if (!context) return;
  const at = context.currentTime;
  const out = context.createGain();
  out.gain.value = urgent ? 0.55 : 0.25;
  out.connect(context.destination);

  const click = context.createBufferSource();
  click.buffer = noiseBuffer(context, 0.04);
  const ring = context.createBiquadFilter();
  ring.type = "bandpass";
  ring.frequency.value = (tock ? 2200 : 2900) * (urgent ? 1.25 : 1);
  ring.Q.value = urgent ? 22 : 12;
  const clickLevel = context.createGain();
  clickLevel.gain.setValueAtTime(1, at);
  clickLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
  click.connect(ring).connect(clickLevel).connect(out);
  click.start(at);
  click.stop(at + 0.04);

  const knock = context.createOscillator();
  knock.type = "triangle";
  knock.frequency.value = tock ? 520 : 640;
  const knockLevel = context.createGain();
  knockLevel.gain.setValueAtTime(0.0001, at);
  knockLevel.gain.exponentialRampToValueAtTime(0.3, at + 0.002);
  knockLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
  knock.connect(knockLevel).connect(out);
  knock.start(at);
  knock.stop(at + 0.03);
}
