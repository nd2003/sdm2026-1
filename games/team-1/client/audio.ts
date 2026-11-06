/** Minimal Web Audio API sound engine — all sounds synthesized, no assets needed. */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  return _ctx;
}

function tone(freq: number, dur: number, vol = 0.08, type: OscillatorType = "sine", delay = 0): void {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.05);
  } catch {
    // Audio blocked or not available — silent
  }
}

export const audio = {
  click(): void {
    tone(700, 0.06, 0.07, "square");
  },

  success(): void {
    tone(523, 0.14, 0.1);
    tone(659, 0.14, 0.1, "sine", 0.13);
    tone(784, 0.22, 0.09, "sine", 0.26);
  },

  fail(): void {
    tone(200, 0.38, 0.14, "sawtooth");
  },

  clue(): void {
    tone(440, 0.09, 0.09);
    tone(550, 0.14, 0.09, "sine", 0.11);
  },

  alarm(): void {
    for (let i = 0; i < 4; i++) {
      tone(880, 0.09, 0.18, "square", i * 0.22);
    }
  },

  loopReset(): void {
    for (let i = 0; i < 7; i++) {
      tone(880 - i * 90, 0.14, 0.09, "sawtooth", i * 0.055);
    }
  },

  safeBeep(): void {
    tone(1046, 0.08, 0.1, "square");
  },

  safeOpen(): void {
    for (let i = 0; i < 5; i++) {
      tone(220 + i * 110, 0.1, 0.08, "sine", i * 0.07);
    }
  },

  usbPickup(): void {
    tone(330, 0.1, 0.1);
    tone(440, 0.1, 0.09, "sine", 0.08);
  },

  win(): void {
    const melody = [523, 659, 784, 1047, 1319, 1568];
    melody.forEach((f, i) => {
      tone(f, 0.5, 0.1, "sine", i * 0.17);
    });
  },
};
