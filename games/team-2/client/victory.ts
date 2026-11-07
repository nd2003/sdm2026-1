/** Victory sound when the patients escape, synthesized with the Web Audio API so no audio files ship with the game. */
import type { EscapeSnapshot } from "../shared/escape.ts";
import { audio, noiseBuffer } from "./footsteps.ts";

/** True when the run changed from running to escaped within the same attempt (not on join or restart). */
export function escaped(previous: EscapeSnapshot | undefined, next: EscapeSnapshot): boolean {
  return (
    previous !== undefined &&
    previous.attempt === next.attempt &&
    previous.phase === "running" &&
    next.phase === "escaped"
  );
}

/** C major rising to the octave: the notes of the freedom chime, in hertz. */
const chime = [523.25, 659.25, 783.99, 1046.5];
const noteGap = 0.14;

/** The heavy exit lock giving way: a deep thud with a burst of released air. */
function release(context: AudioContext, at: number, out: AudioNode) {
  const thud = context.createOscillator();
  thud.type = "triangle";
  thud.frequency.setValueAtTime(110, at);
  thud.frequency.exponentialRampToValueAtTime(55, at + 0.25);
  const thudLevel = context.createGain();
  thudLevel.gain.setValueAtTime(0.0001, at);
  thudLevel.gain.exponentialRampToValueAtTime(0.8, at + 0.006);
  thudLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
  thud.connect(thudLevel).connect(out);
  thud.start(at);
  thud.stop(at + 0.3);

  const air = context.createBufferSource();
  air.buffer = noiseBuffer(context, 0.5);
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3000, at);
  filter.frequency.exponentialRampToValueAtTime(300, at + 0.5);
  const airLevel = context.createGain();
  airLevel.gain.setValueAtTime(0.25, at);
  airLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
  air.connect(filter).connect(airLevel).connect(out);
  air.start(at);
  air.stop(at + 0.5);
}

/** One bell-like note: a pure tone with a quieter, slightly sharp overtone, ringing out slowly. */
function bell(context: AudioContext, at: number, frequency: number, seconds: number, out: AudioNode) {
  for (const [ratio, level] of [
    [1, 0.22],
    [2.76, 0.06],
  ] as const) {
    const tone = context.createOscillator();
    tone.type = "sine";
    tone.frequency.value = frequency * ratio;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    tone.connect(gain).connect(out);
    tone.start(at);
    tone.stop(at + seconds);
  }
}

/** A soft, high shimmer swelling under the last note, like light pouring through the open door. */
function shimmer(context: AudioContext, at: number, out: AudioNode) {
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer(context, 1.6);
  const filter = context.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 6000;
  const level = context.createGain();
  level.gain.setValueAtTime(0.0001, at);
  level.gain.exponentialRampToValueAtTime(0.05, at + 0.4);
  level.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
  noise.connect(filter).connect(level).connect(out);
  noise.start(at);
  noise.stop(at + 1.6);
}

/** The exit lock gives way and a bright chime rises: the patients are free. */
export function playVictory() {
  const context = audio();
  if (!context) return;
  const out = context.createGain();
  out.gain.value = 0.7;
  out.connect(context.destination);
  const now = context.currentTime;
  release(context, now, out);
  const first = now + 0.3;
  chime.forEach((frequency, index) => {
    const last = index === chime.length - 1;
    bell(context, first + index * noteGap, frequency, last ? 2.2 : 1.2, out);
  });
  shimmer(context, first + (chime.length - 1) * noteGap, out);
}
