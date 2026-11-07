import { createGameRoom, type RoomFactory } from "@sdm/host";
import { lobbyGame } from "../shared/lobbyGame.ts";

export const rooms: Record<string, RoomFactory> = {
  lobby: (deps) => createGameRoom(lobbyGame, deps),
};
