/** Death sound when the run is lost, synthesized with the Web Audio API so no audio files ship with the game. */
import type { EscapeSnapshot } from "../shared/escape.ts";
import { audio, noiseBuffer } from "./footsteps.ts";

export type DeathCause = "ghost" | "time";

/**
 * Why the patients died, when the run changed from running to failed within the same attempt, or null.
 * Running out of time leaves the timer at zero; the ghost catches the players with time still left.
 */
export function deathCause(previous: EscapeSnapshot | undefined, next: EscapeSnapshot): DeathCause | null {
  if (!previous || previous.attempt !== next.attempt) return null;
  if (previous.phase !== "running" || next.phase !== "failed") return null;
  return next.seconds === 0 ? "time" : "ghost";
}

/** Life draining away: two dissonant tones sliding down together while the sound closes in. */
function fall(context: AudioContext, at: number, out: AudioNode) {
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, at);
  filter.frequency.exponentialRampToValueAtTime(180, at + 2.4);
  const level = context.createGain();
  level.gain.setValueAtTime(0.0001, at);
  level.gain.exponentialRampToValueAtTime(0.3, at + 0.08);
  level.gain.exponentialRampToValueAtTime(0.0001, at + 2.6);
  filter.connect(level).connect(out);
  for (const [from, to] of [
    [220, 55],
    [233, 58],
  ] as const) {
    const tone = context.createOscillator();
    tone.type = "sawtooth";
    tone.frequency.setValueAtTime(from, at);
    tone.frequency.exponentialRampToValueAtTime(to, at + 2.4);
    tone.connect(filter);
    tone.start(at);
    tone.stop(at + 2.6);
  }
}

/** One low heartbeat thump. */
function thump(context: AudioContext, at: number, level: number, out: AudioNode) {
  const beat = context.createOscillator();
  beat.type = "sine";
  beat.frequency.setValueAtTime(70, at);
  beat.frequency.exponentialRampToValueAtTime(40, at + 0.12);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.15);
  beat.connect(gain).connect(out);
  beat.start(at);
  beat.stop(at + 0.16);
}

/** The last heartbeats: each lub-dub weaker and further apart than the one before, then nothing. */
function heartbeat(context: AudioContext, at: number, out: AudioNode) {
  let beatAt = at;
  for (const [level, gap] of [
    [0.8, 0.75],
    [0.55, 1.05],
    [0.3, 0],
  ] as const) {
    thump(context, beatAt, level, out);
    thump(context, beatAt + 0.2, level * 0.6, out);
    beatAt += gap;
  }
}

/** Caught by the ghost: a shriek that tears upwards and falls away, with a rush of breath. */
function shriek(context: AudioContext, at: number, out: AudioNode) {
  const voice = context.createOscillator();
  voice.type = "sawtooth";
  voice.frequency.setValueAtTime(700, at);
  voice.frequency.exponentialRampToValueAtTime(2300, at + 0.25);
  voice.frequency.exponentialRampToValueAtTime(500, at + 0.9);
  const vibrato = context.createOscillator();
  vibrato.frequency.value = 11;
  const vibratoDepth = context.createGain();
  vibratoDepth.gain.value = 60;
  vibrato.connect(vibratoDepth).connect(voice.frequency);
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 2;
  const level = context.createGain();
  level.gain.setValueAtTime(0.0001, at);
  level.gain.exponentialRampToValueAtTime(0.25, at + 0.05);
  level.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
  voice.connect(filter).connect(level).connect(out);
  voice.start(at);
  vibrato.start(at);
  voice.stop(at + 0.9);
  vibrato.stop(at + 0.9);

  const breath = context.createBufferSource();
  breath.buffer = noiseBuffer(context, 0.7);
  const breathFilter = context.createBiquadFilter();
  breathFilter.type = "highpass";
  breathFilter.frequency.value = 1500;
  const breathLevel = context.createGain();
  breathLevel.gain.setValueAtTime(0.2, at);
  breathLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.7);
  breath.connect(breathFilter).connect(breathLevel).connect(out);
  breath.start(at);
  breath.stop(at + 0.7);
}

/** Out of time: one deep, inharmonic bell toll that hangs in the air. */
function toll(context: AudioContext, at: number, out: AudioNode) {
  for (const [ratio, level, seconds] of [
    [1, 0.35, 3.5],
    [2, 0.15, 2.8],
    [2.4, 0.12, 2.2],
    [3, 0.08, 1.8],
    [4.2, 0.05, 1.2],
  ] as const) {
    const partial = context.createOscillator();
    partial.type = "sine";
    partial.frequency.value = 98 * ratio;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    partial.connect(gain).connect(out);
    partial.start(at);
    partial.stop(at + seconds);
  }
}

/** The patients die: the cause's accent, a falling drone and the last, slowing heartbeats. */
export function playDeath(cause: DeathCause) {
  const context = audio();
  if (!context) return;
  const out = context.createGain();
  out.gain.value = 0.7;
  out.connect(context.destination);
  const now = context.currentTime;
  if (cause === "ghost") shriek(context, now, out);
  else toll(context, now, out);
  fall(context, now + 0.15, out);
  heartbeat(context, now + 0.9, out);
}
