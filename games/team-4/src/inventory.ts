

import { gameState } from "./gameState";
import { items } from "./gameData";

export function collectItem(itemId: string): void {
  const itemExists = items.some(item => item.id === itemId);

  if (!itemExists) {
    console.log("This item does not exist.");
    return;
  }

  if (!gameState.inventory.includes(itemId)) {
    gameState.inventory.push(itemId);
    console.log("Item collected!");
  } else {
    console.log("You already have this item.");
  }
}

export function removeItem(itemId: string): void {
  gameState.inventory = gameState.inventory.filter(
    id => id !== itemId
  );
}

export function hasItem(itemId: string): boolean {
  return gameState.inventory.includes(itemId);
}

export function getInventory() {
  return items.filter(item =>
    gameState.inventory.includes(item.id)
  );
}
