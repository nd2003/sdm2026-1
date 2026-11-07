
export interface GameState {
    discoveredClues: string[];
    inventory: string[];
    interactedObjects: string[];
    solvedPuzzles: string[];
}

export const gameState: GameState = {
    discoveredClues: [],
    inventory: [],
    interactedObjects: [],
    solvedPuzzles: [],
}


export function addClue(clueId: string): void{
    if(!gameState.discoveredClues.includes(clueId)){
        gameState.discoveredClues.push(clueId);
    }
}

export function addItem(itemId: string): void{
    if(!gameState.inventory.includes(itemId)){
        gameState.inventory.push(itemId);
    }
}

export function markObjectInteracted(objectId: string): void{
    if(!gameState.interactedObjects.includes(objectId)){
        gameState.interactedObjects.push(objectId);
    }
}

export function solvePuzzle(puzzleId: string): void {
    if(!gameState.solvedPuzzles.includes(puzzleId)){
        gameState.solvedPuzzles.push(puzzleId);
    }
}
