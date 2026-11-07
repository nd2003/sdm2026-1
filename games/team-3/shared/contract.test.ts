import { describe, expect, it } from "vitest";
import config from "../config/game.json" with { type: "json" };
import {
  Player,
  TimeLoopConfigSchema,
  TimeLoopInputSchema,
  TimeLoopJoinOptionsSchema,
  TimeLoopState,
} from "./index.ts";

describe("Time Loop Escape contract", () => {
  it("ships a config file that matches its schema", () => {
    expect(() => TimeLoopConfigSchema.parse(config)).not.toThrow();
  });

  it("accepts only the four input kinds, with checked payloads", () => {
    expect(TimeLoopInputSchema.safeParse({ kind: "click", id: "painting" }).success).toBe(true);
    expect(TimeLoopInputSchema.safeParse({ kind: "input", text: null }).success).toBe(true);
    expect(TimeLoopInputSchema.safeParse({ kind: "chat", text: "  " }).success).toBe(false);
    expect(TimeLoopInputSchema.safeParse({ kind: "chat", text: "x".repeat(201) }).success).toBe(false);
    expect(TimeLoopInputSchema.safeParse({ kind: "leave" }).success).toBe(true);
    expect(TimeLoopInputSchema.safeParse({ kind: "teleport" }).success).toBe(false);
  });

  it("lets the creator pick 60, 90 or 120 second loops and nothing else", () => {
    expect(TimeLoopJoinOptionsSchema.parse({ name: "Ada", seconds: 90 }).seconds).toBe(90);
    expect(TimeLoopJoinOptionsSchema.safeParse({ name: "Ada", seconds: 45 }).success).toBe(false);
  });

  it("builds state with players keyed by session id", () => {
    const state = new TimeLoopState();
    const player = new Player();
    player.name = "QA-1";
    state.players.set("session-1", player);
    expect(state.players.get("session-1")?.name).toBe("QA-1");
    expect(state.phase).toBe("lobby");
  });
});
