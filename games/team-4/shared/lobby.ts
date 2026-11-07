import { type SchemaType, schema, t } from "@colyseus/schema";
import { BaseState, RoomSettingsSchema } from "@sdm/core/sim";
import { z } from "zod";

export const LobbyPlayer = schema(
  {
    name: t.string().default(""),
    slot: t.uint8().default(1),
    ready: t.boolean().default(false),
  },
  "Team4LobbyPlayer",
);
export type LobbyPlayer = SchemaType<typeof LobbyPlayer>;

export const LobbyState = BaseState.extend({ players: t.map(LobbyPlayer) }, "Team4LobbyState");
export type LobbyState = SchemaType<typeof LobbyState>;

export const LobbyInputSchema = z.object({
  ready: z.boolean(),
});
export type LobbyInput = z.infer<typeof LobbyInputSchema>;

export const LobbyJoinSchema = z.object({
  name: z.string().trim().min(1).max(24),
});

export const LobbyConfigSchema = RoomSettingsSchema.extend({
  maxPlayers: z.literal(2),
});
export type LobbyConfig = z.infer<typeof LobbyConfigSchema>;
