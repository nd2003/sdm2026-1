/**
 * Contract for Time Loop Escape (team-3): room state, input and config.
 * The server room (room/) and the client (client/) both import this, so it must stay browser-safe.
 * The client contract is posted on issue #197. Change it only together with the client owner.
 */
import { type SchemaType, schema, t } from "@colyseus/schema";
import { BaseState, RoomSettingsSchema } from "@sdm/core/sim";
import { z } from "zod";

export const GAME_ID = "team-3";

/** One chat line. `fromId` is the sender's sessionId, so two players with the same name still work. */
export const ChatLine = schema(
  {
    from: t.string().default(""),
    fromId: t.string().default(""),
    text: t.string().default(""),
  },
  "ChatLine",
);
export type ChatLine = SchemaType<typeof ChatLine>;

/** The in-game input box the client shows while `player.input` is set. */
export const InputRequest = schema(
  {
    for: t.string().default(""), // "computer" | "keypad" | "vent"
    label: t.string().default(""), // "Password" | "Code" | "Vent code"
  },
  "InputRequest",
);
export type InputRequest = SchemaType<typeof InputRequest>;

/** One player's own copy of the escape: their loop, timer, level, items and journal. */
export const Player = schema(
  {
    name: t.string().default(""),
    role: t.string().default(""), // "A" created the room, "B" joined
    loop: t.uint16().default(1),
    timeLeft: t.uint16().default(0), // seconds
    stage: t.uint8().default(1), // 1 office, 2 casket corridor, 3 lift shaft
    step: t.uint8().default(0), // progress the partner sees, 0-9
    items: t.array("string"), // reset every loop
    clues: t.array("string"), // the journal, kept across loops
    flags: t.map("number"), // 0/1 booleans and numbers, reset every loop
    message: t.string().default(""),
    messageKind: t.string().default(""), // "" | "hint" | "reset"
    input: t.ref(InputRequest).optional(),
    escaped: t.boolean().default(false),
  },
  "Player",
);
export type Player = SchemaType<typeof Player>;

/** Extends BaseState (tick, code, paused, seats). */
export const TimeLoopState = BaseState.extend(
  {
    phase: t.string().default("lobby"), // "lobby" | "playing" | "over"
    loopSeconds: t.uint16().default(60),
    won: t.boolean().default(false), // both players escaped
    partnerLeft: t.boolean().default(false), // over because a player quit or left
    /** Keyed by sessionId. */
    players: t.map(Player),
    chat: t.array(ChatLine), // kept across loops
  },
  "TimeLoopState",
);
export type TimeLoopState = SchemaType<typeof TimeLoopState>;

/** Everything a client can send. One message per action; the server validates each one. */
export const TimeLoopInputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("click"), id: z.string().min(1).max(32) }),
  z.object({ kind: z.literal("input"), text: z.string().max(32).nullable() }), // null = cancel
  z.object({ kind: z.literal("chat"), text: z.string().trim().min(1).max(200) }),
  z.object({ kind: z.literal("leave") }), // quit: the partner's game ends with partnerLeft
]);
export type TimeLoopInput = z.infer<typeof TimeLoopInputSchema>;

/** What a client passes when it creates or joins a room. The creator picks the loop length. */
export const TimeLoopJoinOptionsSchema = z.object({
  name: z.string().trim().min(1).max(20).default("player"),
  /** 60/90/120; 600 only for an admin creator. The room's join() falls back to 60 for anything else. */
  seconds: z.number().int().positive().optional(),
});

/** Room settings plus tuning values, loaded from config/game.json. Designers edit the JSON, not code. */
export const TimeLoopConfigSchema = RoomSettingsSchema.extend({
  loopSeconds: z
    .number()
    .int()
    .positive()
    .describe("Default loop length; the room creator can pick 60/90/120"),
  levelBonus: z.number().int().nonnegative().describe("Seconds added on entering level 2 and level 3"),
  wrongCodeLock: z.number().int().nonnegative().describe("Seconds an input stays locked after a wrong code"),
  vampireDrain: z.number().int().nonnegative().describe("Seconds the wrong casket takes"),
  hints: z.object({
    after: z.number().int().nonnegative().describe("Seconds stuck on one step before a hint (0 = off)"),
    afterEarly: z.number().int().nonnegative().describe("The same for first-timers, loops 1..earlyLoops"),
    earlyLoops: z.number().int().nonnegative(),
  }),
  painting: z.object({
    colors: z.array(z.string()).min(1),
    minClicks: z.number().int().positive(),
    maxClicks: z.number().int().positive(),
  }),
  years: z.tuple([z.number().int(), z.number().int()]),
  keypadDigits: z.number().int().min(2).max(6),
  ventDigits: z.number().int().min(2).max(6),
  night: z.string(),
});
export type TimeLoopConfig = z.infer<typeof TimeLoopConfigSchema>;
