/**
 * Server rooms for this game. Add a factory per room here (see server/template/room/index.ts);
 * the host registers them by name.
 * The template ships with none yet — the shared room base (fixed tick, replays, debug
 * commands) is the next platform task.
 */
import type { RoomFactory } from "@sdm/host";

export const rooms: Record<string, RoomFactory> = {};
