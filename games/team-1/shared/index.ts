import { type SchemaType, schema, t } from "@colyseus/schema";
import { z } from "zod";

export const GAME_ID = "team-1";

export const Player = schema(
  {
    name: t.string().default(""),
    color: t.string().default("#ffffff"),
    x: t.number().default(0),
    y: t.number().default(0),
    score: t.uint16().default(0),
    connected: t.boolean().default(true),
    lastSeq: t.uint32().default(0),
  },
  "Player",
);
export type Player = SchemaType<typeof Player>;

export const Pickup = schema({ x: t.number().default(0), y: t.number().default(0) }, "Pickup");
export type Pickup = SchemaType<typeof Pickup>;

export const SampleState = schema(
  {
    tick: t.uint32().default(0),
    code: t.string().default(""),
    paused: t.boolean().default(false),
    players: t.map(Player),
    pickups: t.map(Pickup),
  },
  "SampleState",
);
export type SampleState = SchemaType<typeof SampleState>;

export const SampleInputSchema = z.object({
  dx: z.number().min(-1).max(1),
  dy: z.number().min(-1).max(1),
});
export type SampleInput = z.infer<typeof SampleInputSchema>;

export const SampleConfigSchema = z.object({
  version: z.string(),
  tickRate: z.number().int().min(10).max(120),
  maxPlayers: z.number().int().min(1).max(16),
  arena: z.object({ width: z.number().positive(), height: z.number().positive() }),
  player: z.object({
    speed: z.number().positive().describe("Arena units per second"),
    radius: z.number().positive(),
  }),
  pickups: z.object({
    count: z.number().int().nonnegative(),
    radius: z.number().positive(),
    points: z.number().int().positive(),
  }),
});
export type SampleConfig = z.infer<typeof SampleConfigSchema>;
