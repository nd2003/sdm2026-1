/**
 * Time Loop Escape as a platform GameDefinition. The room is authoritative: clients send inputs
 * (click / input / chat / leave), this runs the puzzles and changes the synced state.
 * Pure and browser-safe: no Colyseus server, no clocks, no Math.random(). Time is counted in ticks.
 */
import type { GameDefinition } from "@sdm/core/sim";
import rawConfig from "../config/game.json" with { type: "json" };
import {
  ChatLine,
  GAME_ID,
  Player,
  type TimeLoopConfig,
  TimeLoopConfigSchema,
  type TimeLoopInput,
  TimeLoopInputSchema,
  TimeLoopJoinOptionsSchema,
  TimeLoopState,
} from "./index.ts";
import {
  answer,
  type Ctx,
  click,
  openingLine,
  partnerOf,
  say,
  secondPassed,
  seedAnswers,
  skipLevel,
  startLoop,
} from "./puzzles.ts";

/** Checked at load: a bad config file stops the server at startup with the zod message. */
const config = TimeLoopConfigSchema.parse(rawConfig);

/** Ends the match for the player who stays: their partner quit, left or never came back. */
function partnerGone(ctx: Ctx, playerId: string): void {
  if (ctx.state.phase !== "playing") return;
  ctx.state.partnerLeft = true;
  ctx.state.phase = "over";
  const stays = partnerOf(ctx, playerId);
  if (stays) say(stays, "Your partner left. Nobody leaves floor 14 alone.");
}

export const timeLoopGame: GameDefinition<TimeLoopState, TimeLoopInput, TimeLoopConfig> = {
  id: GAME_ID,
  createState: () => new TimeLoopState(),
  inputSchema: TimeLoopInputSchema,
  joinOptionsSchema: TimeLoopJoinOptionsSchema,
  config,
  configSchema: TimeLoopConfigSchema,

  init(ctx) {
    ctx.state.loopSeconds = ctx.config.loopSeconds;
    seedAnswers(ctx); // every answer in this room comes from ctx.rng
  },

  join(ctx, playerId, options) {
    if (ctx.state.players.size >= 2 || ctx.state.phase !== "lobby")
      throw new Error("This room already has two players.");
    const player = new Player();
    player.name = String(options.name);
    player.role = ctx.state.players.size === 0 ? "A" : "B";
    if (player.role === "A" && typeof options.seconds === "number") ctx.state.loopSeconds = options.seconds;
    ctx.state.players.set(playerId, player);
    if (ctx.state.players.size < 2) return; // waiting for the partner
    ctx.state.phase = "playing";
    for (const p of ctx.state.players.values()) {
      startLoop(ctx, p);
      say(p, openingLine(1));
    }
  },

  leave(ctx, playerId) {
    partnerGone(ctx, playerId);
    ctx.state.players.delete(playerId);
  },

  step(ctx, inputs) {
    for (const { playerId, data } of inputs) {
      const p = ctx.state.players.get(playerId);
      if (!p) continue;
      if (data.kind === "click") click(ctx, playerId, p, data.id);
      else if (data.kind === "input") answer(ctx, playerId, p, data.text);
      else if (data.kind === "chat") {
        if (ctx.state.phase !== "playing") continue;
        const line = new ChatLine();
        line.from = p.name;
        line.fromId = playerId;
        line.text = data.text;
        ctx.state.chat.push(line);
      } else if (data.kind === "leave") partnerGone(ctx, playerId);
    }
    // One game second every tickRate ticks: each player's own loop counts down.
    if (ctx.tick > 0 && ctx.tick % ctx.config.tickRate === 0)
      for (const [id, p] of ctx.state.players) secondPassed(ctx, id, p);
  },

  commands: {
    /** `skip [playerId]`: debug only (?debug). As if this level's exit were solved. Replaces the admin Skip button. */
    skip(ctx, [id]) {
      const playerId = id ?? [...ctx.state.players.keys()][0] ?? "";
      const p = ctx.state.players.get(playerId);
      if (!p) throw new Error(`no player ${playerId}`.trim());
      skipLevel(ctx, playerId, p);
      return `${p.name} is on level ${p.stage}${p.escaped ? " (escaped)" : ""}`;
    },
  },
};
