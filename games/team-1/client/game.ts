/** Game state types and pure logic — no DOM access here. */

export type GamePhase = "start" | "playing" | "resetting" | "won";
export type PlayerId = 1 | 2;

export interface Clue {
  id: string;
  loop: number;
  icon: string;
  text: string;
  detail: string;
}

export interface GameState {
  phase: GamePhase;
  loop: number;
  timeLeft: number;
  timerHandle: ReturnType<typeof setInterval> | null;

  // Per-loop state (reset each loop)
  paintClicks: number;
  keyVisible: boolean;
  keyHolder: PlayerId | null;
  cabinetOpen: boolean;
  safeVisible: boolean;
  safeOpen: boolean;
  laptopDone: boolean;

  // Persistent across loops (inventory)
  usbHolder: PlayerId | null;

  // Knowledge persists across loops
  clues: Clue[];
  activePlayer: PlayerId;
}

export const CLUE_DEFS: Record<string, { icon: string; text: string; detail: string }> = {
  blue4: {
    icon: "🎨",
    text: "Blue — 4",
    detail: "The blue painting on the wall — click it exactly 4 times.",
  },
  findyear: {
    icon: "🔑",
    text: "Key secured. Safe revealed.",
    detail: "The painting swings open. A key drops — and a wall safe is exposed.",
  },
  year1998: {
    icon: "📸",
    text: "The year is 1998",
    detail: "Enter 1998 on the laptop to unlock the exit door.",
  },
  ciphercard: {
    icon: "🃏",
    text: "Cipher: R=2  Y=8  G=4  B=7",
    detail: "Rainbow order → 2847. That's the vault combination.",
  },
  usbfound: {
    icon: "💾",
    text: "USB drive secured",
    detail: "The laptop needs the USB drive inserted before accepting any code.",
  },
};

export const CODE_ANSWER = "1998";
export const SAFE_CODE = "2847";
export const LOOP_DURATION = 120;

export function makeState(): GameState {
  return {
    phase: "start",
    loop: 1,
    timeLeft: LOOP_DURATION,
    timerHandle: null,
    paintClicks: 0,
    keyVisible: false,
    keyHolder: null,
    cabinetOpen: false,
    safeVisible: false,
    safeOpen: false,
    laptopDone: false,
    usbHolder: null,
    clues: [],
    activePlayer: 1,
  };
}

export function hasClue(state: GameState, id: string): boolean {
  return state.clues.some((c) => c.id === id);
}

export function addClue(state: GameState, id: string): boolean {
  if (hasClue(state, id)) return false;
  const def = CLUE_DEFS[id];
  if (!def) return false;
  state.clues.push({ id, loop: state.loop, icon: def.icon, text: def.text, detail: def.detail });
  return true;
}

export function resetLoop(state: GameState): void {
  if (state.timerHandle !== null) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
  state.loop += 1;
  state.timeLeft = LOOP_DURATION;
  state.paintClicks = 0;
  state.keyVisible = false;
  state.keyHolder = null;
  state.cabinetOpen = false;
  state.safeVisible = false;
  state.safeOpen = false;
  state.laptopDone = false;
  // usbHolder and clues intentionally persist across loops
}

export function switchPlayer(state: GameState): void {
  state.activePlayer = state.activePlayer === 1 ? 2 : 1;
}
