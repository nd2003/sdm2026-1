/**
team-4/32-game-state-inventory
 * Server rooms for this game. Add a factory per room here (see server/template/room/index.ts);
 * the host registers them by name.
 * The template ships with none yet — the shared room base (fixed tick, replays, debug
 * Server rooms for this game. Add each Room class here; the host registers them by name.
 * The Team 4 game ships with none yet — the shared room base (fixed tick, replays, debug
 feature/team-4
 * commands) is the next platform task.
 */
import type { RoomFactory } from "@sdm/host";

export const rooms: Record<string, RoomFactory> = {};
