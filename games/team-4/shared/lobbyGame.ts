import type { GameDefinition } from "@sdm/core/sim";
import rawConfig from "../config/lobby.json" with { type: "json" };
import {
  type LobbyConfig,
  LobbyConfigSchema,
  type LobbyInput,
  LobbyInputSchema,
  LobbyJoinSchema,
  LobbyPlayer,
  LobbyState,
} from "./lobby.ts";

export const lobbyGame: GameDefinition<LobbyState, LobbyInput, LobbyConfig> = {
  id: "team-4-lobby",
  createState: () => new LobbyState(),
  inputSchema: LobbyInputSchema,
  joinOptionsSchema: LobbyJoinSchema,
  config: LobbyConfigSchema.parse(rawConfig),
  configSchema: LobbyConfigSchema,

  init() {},

  join(ctx, playerId, options) {
    const occupied = new Set([...ctx.state.players.values()].map((player) => player.slot));
    const slot = [1, 2].find((candidate) => !occupied.has(candidate));
    if (slot === undefined) throw new Error("The lobby is full.");

    const player = new LobbyPlayer();
    player.name = LobbyJoinSchema.parse(options).name;
    player.slot = slot;
    ctx.state.players.set(playerId, player);

    for (const existing of ctx.state.players.values()) {
      existing.ready = false;
    }
  },

  leave(ctx, playerId) {
    ctx.state.players.delete(playerId);
    for (const player of ctx.state.players.values()) {
      player.ready = false;
    }
  },

  disconnect(ctx) {
    for (const player of ctx.state.players.values()) {
      player.ready = false;
    }
  },

  reconnect(ctx) {
    for (const player of ctx.state.players.values()) {
      player.ready = false;
    }
  },

  step(ctx, inputs) {
    for (const input of inputs) {
      const player = ctx.state.players.get(input.playerId);
      const seat = ctx.state.seats.get(input.playerId);
      if (player && seat?.connected) {
        player.ready = input.data.ready;
      }
    }
  },
};
