import { objects } from "./gameData";
import { gameState, markObjectInteracted } from "./gameState";

export function getObject(objectId: string) {
  return objects.find((object) => object.id === objectId);
}

export function interactWithObject(objectId: string) {
  const object = getObject(objectId);

  if (!object) {
    console.log("This object does not exist.");
    return undefined;
  }

  markObjectInteracted(objectId);

  return object;
}

export function hasInteractedWithObject(objectId: string): boolean {
  return gameState.interactedObjects.includes(objectId);
}
