export interface HiddenObject {
  id: string;
  name: string;
  found: boolean;
  iconSvg: string;
}

export type GamePhase = "playing" | "gameover" | "victory";

export interface GameState {
  phase: GamePhase;
  timeLeft: number;
  hintsLeft: number;
  score: number;
  wrongClicks: number;
  objects: HiddenObject[];
}
