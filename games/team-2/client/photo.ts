/** Paper sound for the staff photograph, synthesized with the Web Audio API so no audio files ship with the game. */
import type { EscapeSnapshot } from "../shared/escape.ts";
import { audio, noiseBuffer } from "./footsteps.ts";

/** True when the photograph's year was revealed within the same attempt (not on join or restart). */
export function photoRevealed(previous: EscapeSnapshot | undefined, next: EscapeSnapshot): boolean {
  return (
    previous !== undefined &&
    previous.attempt === next.attempt &&
    previous.year === null &&
    next.year !== null
  );
}

const crinkleSeconds = 0.2;
const slideSeconds = 0.28;

/** Filtered noise with its own level envelope, connected to `out` and started at `at`. */
function noise(
  context: AudioContext,
  out: AudioNode,
  at: number,
  seconds: number,
  type: BiquadFilterType,
  frequency: number,
  q: number,
) {
  const source = context.createBufferSource();
  source.buffer = noiseBuffer(context, seconds);
  const filter = context.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  const gain = context.createGain();
  source.connect(filter).connect(gain).connect(out);
  source.start(at);
  source.stop(at + seconds);
  return gain.gain;
}

/** Dry paper crinkling: sparse, bright crackles as the photo is gripped. */
function crinkle(context: AudioContext, at: number, out: AudioNode) {
  const level = noise(context, out, at, crinkleSeconds, "bandpass", 4800, 0.8);
  const points = 90;
  const curve = new Float32Array(points);
  for (let i = 0; i < points; i += 1) curve[i] = Math.random() < 0.35 ? 0.2 + Math.random() * 0.4 : 0;
  level.setValueCurveAtTime(curve, at, crinkleSeconds);
}

/** The photo sliding out of its frame: a soft, smooth hiss that swells and fades. */
function slide(context: AudioContext, at: number, out: AudioNode) {
  const level = noise(context, out, at, slideSeconds, "bandpass", 2200, 0.7);
  level.setValueAtTime(0.0001, at);
  level.exponentialRampToValueAtTime(0.25, at + slideSeconds * 0.4);
  level.exponentialRampToValueAtTime(0.0001, at + slideSeconds);
}

/** The photo turned over: a crisp snap of the edge and a soft flap of air. */
function flick(context: AudioContext, at: number, out: AudioNode) {
  const snap = noise(context, out, at, 0.03, "highpass", 3000, 0.7);
  snap.setValueAtTime(0.5, at);
  snap.exponentialRampToValueAtTime(0.0001, at + 0.03);
  const flap = noise(context, out, at + 0.01, 0.08, "lowpass", 700, 0.7);
  flap.setValueAtTime(0.4, at + 0.01);
  flap.exponentialRampToValueAtTime(0.0001, at + 0.09);
}

/** An old photograph crinkled, slid out of its frame and turned over. */
export function playPhoto() {
  const context = audio();
  if (!context) return;
  const out = context.createGain();
  out.gain.value = 0.7;
  out.connect(context.destination);
  const now = context.currentTime;
  crinkle(context, now, out);
  slide(context, now + crinkleSeconds * 0.7, out);
  flick(context, now + crinkleSeconds * 0.7 + slideSeconds, out);
}
