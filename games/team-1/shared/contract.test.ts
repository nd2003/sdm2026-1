import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TAPS } from "../client/targets.ts";
import config from "../config/game.json" with { type: "json" };
import {
  TimeLoopConfigSchema,
  TimeLoopInputSchema,
  TimeLoopJoinOptionsSchema,
  TimeLoopState,
} from "./index.ts";
import { LEVEL_COUNT, TARGETS } from "./rules.ts";

describe("time loop escape contract", () => {
  it("ships a config file that matches its schema, with one entry per room", () => {
    const parsed = TimeLoopConfigSchema.parse(config);
    expect(parsed.levels).toHaveLength(LEVEL_COUNT);
    expect(parsed.maxPlayers).toBe(2);
  });

  it("accepts every kind of player action", () => {
    for (const input of [
      { type: "interact", target: "note" },
      { type: "code", kind: "laptop", value: "1998" },
      { type: "share", clue: "blue4" },
      { type: "ready" },
      { type: "restart" },
    ]) {
      expect(TimeLoopInputSchema.safeParse(input).success).toBe(true);
    }
  });

  it("rejects actions the rules don't know", () => {
    for (const input of [
      { type: "interact", target: "window" },
      { type: "code", kind: "laptop", value: "123456789" },
      { type: "code", kind: "door", value: "1998" },
      { type: "share", clue: "nothing" },
      { type: "teleport" },
      {},
    ]) {
      expect(TimeLoopInputSchema.safeParse(input).success).toBe(false);
    }
  });

  it("cleans up join options and defaults to a two-player room", () => {
    expect(TimeLoopJoinOptionsSchema.parse({ name: "  Ada  " })).toEqual({ name: "Ada", solo: false });
    expect(TimeLoopJoinOptionsSchema.parse({})).toEqual({ name: "", solo: false });
    expect(TimeLoopJoinOptionsSchema.safeParse({ name: "x".repeat(25) }).success).toBe(false);
  });

  it("starts a new room in the lobby, in the first room", () => {
    const state = new TimeLoopState();
    expect(state.phase).toBe("waiting");
    expect(state.level).toBe(1);
    expect(state.solo).toBe(false);
  });

  it("gives every object in the rules exactly one clickable element in the page", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(Object.values(TAPS).sort()).toEqual([...TARGETS].sort());
    for (const id of Object.keys(TAPS)) {
      expect(html, `index.html has no #${id}`).toContain(`id="${id}"`);
    }
  });
});
