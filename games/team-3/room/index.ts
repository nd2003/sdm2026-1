/**
 * Server rooms for this game. Each entry builds a Room class from the host's shared deps, e.g.
 * `{ game: (deps) => createGameRoom(myGame, deps) }` (see server/template/room/index.ts).
 */
import type { RoomFactory } from "@sdm/host";

export const rooms: Record<string, RoomFactory> = {};
