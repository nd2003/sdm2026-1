import { runReplay, Simulation } from "@sdm/core/server";
import { describe, expect, it } from "vitest";
import { timeLoopGame } from "./game.ts";
import type { TimeLoopInput } from "./index.ts";
import { type Answers, answersFor, type Ctx, photoIsRemote } from "./puzzles.ts";

/** A two-player match in the pure simulation: "a" created the room (role A), "b" joined (role B). */
function match(seed = 7, seconds?: number) {
  const sim = new Simulation(timeLoopGame, { seed, roomId: "r", sha: "t", startedAt: "x", mode: "live" });
  sim.join("a", { name: "Ada", seconds });
  sim.join("b", { name: "Bo" });
  const seq: Record<string, number> = { a: 0, b: 0 };
  const ctx = { state: sim.state, config: timeLoopGame.config } as unknown as Ctx;
  const send = (id: "a" | "b", data: TimeLoopInput) => {
    sim.queueInput(id, { seq: ++(seq[id] as number), data });
    sim.tick();
  };
  const click = (id: "a" | "b", obj: string) => send(id, { kind: "click", id: obj });
  const type = (id: "a" | "b", text: string | null) => send(id, { kind: "input", text });
  const chat = (id: "a" | "b", text: string) => send(id, { kind: "chat", text });
  const seconds_ = (n: number) => {
    for (let i = 0; i < n * timeLoopGame.config.tickRate; i++) sim.tick();
  };
  const player = (id: "a" | "b") =>
    sim.state.players.get(id) as NonNullable<ReturnType<typeof sim.state.players.get>>;
  const answers = (id: "a" | "b"): Answers => answersFor(ctx, id === "a" ? "A" : "B");
  return { sim, ctx, click, type, chat, seconds: seconds_, player, answers };
}

/** Plays one player out of all three levels, with the partner reading out the clues in their room. */
function escapeAll(m: ReturnType<typeof match>, id: "a" | "b") {
  const other = id === "a" ? "b" : "a";
  const me = m.answers(id);
  m.chat(other, `your painting is ${me.color} ${me.clicks}`);
  for (let i = 0; i < me.clicks; i++) m.click(id, "painting");
  m.click(id, "cabinet");
  m.click(id, "photo");
  if (photoIsRemote(m.ctx)) m.chat(other, `your year is ${me.year}`);
  m.click(id, "computer");
  m.type(id, me.year);
  m.click(id, "door");
  m.click(id, `casket-${me.casket}`);
  m.click(id, "fusebox");
  m.click(id, "keypad");
  m.type(id, me.keypad);
  m.click(id, "hatch");
  m.click(id, "lift-breaker");
  m.chat(other, `vent code ${me.vent}`);
  m.click(id, "vent");
  m.type(id, me.vent);
}

describe("Time Loop Escape room logic", () => {
  it("starts when the second player joins: roles A/B, the creator's loop length, an opening line", () => {
    const m = match(3, 90);
    expect(m.sim.state.phase).toBe("playing");
    expect([m.player("a").role, m.player("b").role]).toEqual(["A", "B"]);
    expect(m.player("a").timeLeft).toBe(90);
    expect(m.player("b").message).toMatch(/partner can see things you can't/);
    expect(() => m.sim.join("c", { name: "Cy" })).toThrow();
  });

  it("loop length: 60/90/120 for anyone, 600 only for an admin creator, anything else falls back to 60", () => {
    expect(match(3, 120).player("a").timeLeft).toBe(120);
    const length = (name: string, seconds: number) => {
      const sim = new Simulation(timeLoopGame, {
        seed: 1,
        roomId: "r",
        sha: "t",
        startedAt: "x",
        mode: "live",
      });
      sim.join("a", { name, seconds });
      return sim.state.loopSeconds;
    };
    expect(length("Sam", 600)).toBe(60);
    expect(length("admin", 600)).toBe(600);
    expect(length("ADMIN", 600)).toBe(600);
    expect(length("Sam", 45)).toBe(60);
  });

  it("answers differ per player and nothing reacts before its clue is known", () => {
    const m = match(11);
    expect(m.answers("a")).not.toEqual(m.answers("b"));
    m.click("a", "painting");
    expect(m.player("a").items.length).toBe(0);
    expect(m.player("a").message).toMatch(/in your partner's room/);
    m.click("a", "computer");
    expect(m.player("a").input).toBeUndefined();
  });

  it("the full co-op escape: both out through the vent means a win, one alone does not", () => {
    const m = match(5);
    escapeAll(m, "a");
    expect(m.player("a").escaped).toBe(true);
    expect(m.player("a").stage).toBe(3);
    expect(m.sim.state.won).toBe(false);
    expect(m.player("b").message).toMatch(/made it out/);
    escapeAll(m, "b");
    expect(m.sim.state.won).toBe(true);
    expect(m.sim.state.phase).toBe("over");
  });

  it("each new level adds levelBonus seconds", () => {
    const m = match(8);
    const me = m.answers("a");
    m.chat("b", `${me.color} ${me.clicks}`);
    for (let i = 0; i < me.clicks; i++) m.click("a", "painting");
    m.click("a", "cabinet");
    m.click("a", "photo");
    m.chat("b", me.year);
    m.click("a", "computer");
    m.type("a", me.year);
    const before = m.player("a").timeLeft;
    m.click("a", "door");
    expect(m.player("a").stage).toBe(2);
    // the click's own tick can also be a game second, so allow one second of countdown
    expect(m.player("a").timeLeft).toBeGreaterThanOrEqual(before + timeLoopGame.config.levelBonus - 1);
  });

  it("a loop reset sends you back to level 1, explains itself, sets justReset and keeps the journal", () => {
    const m = match(9);
    m.click("a", "note");
    m.click("a", "shelf");
    const clues = [...m.player("a").clues];
    m.seconds(timeLoopGame.config.loopSeconds);
    const a = m.player("a");
    expect(a.loop).toBe(2);
    expect(a.stage).toBe(1);
    expect(a.timeLeft).toBe(timeLoopGame.config.loopSeconds);
    expect(a.message).toBe("Time ran out. The loop reset: your items are gone, your journal stays.");
    expect(a.messageKind).toBe("reset");
    expect(a.flags.get("justReset")).toBe(1);
    expect(clues.every((c) => a.clues.includes(c))).toBe(true);
    m.click("a", "clock");
    expect(a.flags.has("justReset")).toBe(false);
  });

  it("a wrong code locks the input for wrongCodeLock seconds, an empty one costs nothing", () => {
    const m = match(12);
    const me = m.answers("a");
    m.chat("b", `${me.color} ${me.clicks}`);
    for (let i = 0; i < me.clicks; i++) m.click("a", "painting");
    m.click("a", "cabinet");
    m.click("a", "computer");
    m.type("a", "");
    expect(m.player("a").flags.has("lockedUntil")).toBe(false);
    m.click("a", "computer");
    m.type("a", "0000");
    m.click("a", "computer");
    expect(m.player("a").input).toBeUndefined();
    m.seconds(timeLoopGame.config.wrongCodeLock + 1);
    m.click("a", "computer");
    expect(m.player("a").input?.for).toBe("computer");
  });

  it("the vent needs liftPower, and the lift never takes you out", () => {
    const m = match(4);
    m.sim.applyDebug("a", "skip", ["a"]);
    m.sim.applyDebug("a", "skip", ["a"]);
    expect(m.player("a").stage).toBe(3);
    m.click("a", "vent");
    expect(m.player("a").input).toBeUndefined();
    expect(m.player("a").message).toMatch(/fan blades are still spinning/);
    m.click("a", "lift");
    m.click("a", "gate");
    expect(m.player("a").escaped).toBe(false);
    m.click("a", "hatch");
    expect(m.player("a").items.includes("fuse")).toBe(true);
    m.click("a", "lift-breaker");
    expect(m.player("a").flags.get("liftPower")).toBe(1);
  });

  it("a stuck first-timer gets a hint sooner than in loop 3", () => {
    const { hints, loopSeconds } = timeLoopGame.config;
    const early = match(6);
    early.seconds(hints.afterEarly + 1);
    expect(early.player("a").messageKind).toBe("hint");
    const veteran = match(6);
    veteran.seconds(loopSeconds * 2 + 1); // loops 1 and 2 run out (the clock starts one tick after joining)
    expect(veteran.player("a").loop).toBe(3);
    veteran.seconds(hints.afterEarly + 1);
    expect(veteran.player("a").messageKind).not.toBe("hint");
    veteran.seconds(hints.after - hints.afterEarly);
    expect(veteran.player("a").messageKind).toBe("hint");
  });

  it("leave ends the game for the partner with partnerLeft", () => {
    const m = match(2);
    m.sim.queueInput("b", { seq: 1, data: { kind: "leave" } });
    m.sim.tick();
    expect(m.sim.state.phase).toBe("over");
    expect(m.sim.state.partnerLeft).toBe(true);
    expect(m.sim.state.won).toBe(false);
    expect(m.player("a").message).toMatch(/partner left/i);
  });

  it("the debug skip command moves a level and escapes from level 3", () => {
    const m = match(1);
    expect(m.sim.applyDebug("a", "skip", ["a"])).toMatch(/level 2/);
    m.sim.applyDebug("a", "skip", ["a"]);
    expect(m.sim.applyDebug("a", "skip", ["a"])).toMatch(/escaped/);
    expect(() => m.sim.applyDebug("a", "skip", ["ghost"])).toThrow();
  });

  it("a scripted match re-runs from its replay to the same state hash", () => {
    const m = match(21);
    escapeAll(m, "a");
    m.seconds(3);
    const replay = m.sim.snapshot();
    expect(runReplay(timeLoopGame, replay).stateHash).toBe(replay.final?.stateHash);
  });
});
