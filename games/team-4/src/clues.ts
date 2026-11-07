
import { gameState, addClue } from "./gameState";
import { clues } from "./gameData";

export function discoverClue(clueId: string): void {
  const clueExists = clues.some(clue => clue.id === clueId);

  if (!clueExists) {
    console.log("This clue does not exist.");
    return;
  }

  if (!gameState.discoveredClues.includes(clueId)) {
    addClue(clueId);
    console.log("New clue discovered!");
  } else {
    console.log("You have already discovered this clue.");
  }
}

export function hasDiscoveredClue(clueId: string): boolean {
  return gameState.discoveredClues.includes(clueId);
}

export function getDiscoveredClues() {
  return clues.filter(clue =>
    gameState.discoveredClues.includes(clue.id)
  );
}
