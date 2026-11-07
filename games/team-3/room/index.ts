/**
 * Server rooms for Time Loop Escape. The host registers them by name; clients create or join "game".
 */
import { createGameRoom, type RoomFactory } from "@sdm/host";
import { timeLoopGame } from "../shared/game.ts";

export const rooms: Record<string, RoomFactory> = {
  game: (deps) => createGameRoom(timeLoopGame, deps),
};
