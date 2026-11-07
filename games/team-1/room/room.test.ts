import type { Room } from "@colyseus/sdk";
import { createGameRoom, createGameServer, createGameServerContext } from "@sdm/host";
import { boot, type ColyseusTestServer } from "@sdm/host/testing";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { timeLoopGame } from "../shared/game.ts";
import { GAME_ID, type TimeLoopInput } from "../shared/index.ts";
import type { Target } from "../shared/rules.ts";
import { rooms } from "./index.ts";

// Team 1's game on a real Colyseus server: real websockets, the real room base and real timing.

const ctx = createGameServerContext(GAME_ID);
const quick = { ...timeLoopGame, config: { ...timeLoopGame.config, reconnectSeconds: 1 } };

let colyseus: ColyseusTestServer;

beforeAll(async () => {
  colyseus = await boot(
    createGameServer(
      { gameId: GAME_ID, rooms: { ...rooms, quick: (deps) => createGameRoom(quick, deps) } },
      ctx,
    ),
    2611,
  );
});
afterAll(() => colyseus.shutdown());
beforeEach(() => colyseus.cleanup());

const seqs = new WeakMap<object, number>();

/** Sends one action the way the client does: an input with the next sequence number. */
function send(client: Room, data: TimeLoopInput): void {
  const seq = (seqs.get(client) ?? 0) + 1;
  seqs.set(client, seq);
  client.send("input", { seq, data });
}

const tap = (client: Room, target: Target) => send(client, { type: "interact", target });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Waits for the state the server sends back to match, instead of guessing how long it takes. */
async function until(done: () => boolean, ms = 4_000): Promise<void> {
  const end = Date.now() + ms;
  while (!done()) {
    if (Date.now() > end) throw new Error("timed out waiting for the room state");
    await sleep(25);
  }
}

/** Two players in one room: Ada creates it, Bo joins by its code. */
async function pair(options: Record<string, unknown> = {}) {
  const a = await colyseus.sdk.create("game", { private: true, name: "Ada", ...options });
  await a.waitForInitialState();
  const roomId = ctx.registry.byCode(a.state.code as string)?.roomId;
  const b = await colyseus.sdk.joinById(roomId as string, { name: "Bo" });
  await b.waitForInitialState();
  await until(() => a.state.players.size === 2 && b.state.players.size === 2);
  return { a, b };
}

async function startPlaying(...clients: Room[]): Promise<void> {
  await until(() => clients.every((c) => c.state.phase === "briefing"));
  for (const c of clients) send(c, { type: "ready" });
  await until(() => clients.every((c) => c.state.phase === "playing"));
}

describe("Time Loop Escape on a real server", () => {
  it("two players create and join by code, and each gets a seat of their own", async () => {
    const { a, b } = await pair();
    expect(a.state.code).toMatch(/^[A-Z]{4}$/);
    await until(() => a.state.phase === "briefing");
    expect(a.state.players.get(a.sessionId)?.slot).toBe(1);
    expect(a.state.players.get(b.sessionId)?.slot).toBe(2);
    expect(b.state.players.get(a.sessionId)?.name).toBe("Ada");
    expect(a.state.solo).toBe(false);
  });

  it("starts the loop once both are ready and runs the clock", async () => {
    const { a, b } = await pair();
    await startPlaying(a, b);
    const start = a.state.timeLeft as number;
    expect(start).toBeLessThanOrEqual(90);
    await until(() => (b.state.timeLeft as number) < start, 3_000);
  });

  it("an action by one player reaches the other player's screen through the server", async () => {
    const { a, b } = await pair();
    await startPlaying(a, b);
    tap(b, "note");
    await until(() => Array.from(a.state.clues2 as string[]).includes("blue4"));
    expect(Array.from(b.state.clues2 as string[])).toContain("blue4");
    expect(Array.from(a.state.clues1 as string[])).toEqual([]);
  });

  it("refuses an action that belongs to the other detective", async () => {
    const { a, b } = await pair();
    await startPlaying(a, b);
    tap(a, "note");
    await until(() => (b.state.events.length as number) > 0);
    const last = b.state.events[b.state.events.length - 1];
    expect(last.kind).toBe("warn");
    expect(last.by).toBe(1);
    expect(Array.from(a.state.clues2 as string[])).toEqual([]);
  });

  it("uses the loop time the creator picked, and ignores one that is not on the list", async () => {
    const sixty = await colyseus.sdk.create("game", { private: true, name: "Ada", solo: true, time: 60 });
    await sixty.waitForInitialState();
    await startPlaying(sixty);
    expect(sixty.state.loopTime).toBe(60);
    expect(sixty.state.timeLeft).toBeLessThanOrEqual(60);
    expect(sixty.state.timeLeft).toBeGreaterThan(55);

    const odd = await colyseus.sdk.create("game", { private: true, name: "Bo", solo: true, time: 45 });
    await odd.waitForInitialState();
    await until(() => odd.state.phase === "briefing");
    expect(odd.state.loopTime).toBe(90);
  });

  it("refuses a join whose options are malformed", async () => {
    await expect(colyseus.sdk.create("game", { private: true, time: "abc" })).rejects.toThrow();
  });

  it("Play alone starts straight away, and pausing stops the clock", async () => {
    const solo = await colyseus.sdk.create("game", { private: true, name: "Ada", solo: true });
    await solo.waitForInitialState();
    await startPlaying(solo);
    expect(solo.state.solo).toBe(true);
    send(solo, { type: "pause" });
    await until(() => solo.state.held === true);
    const frozen = solo.state.timeLeft as number;
    await sleep(1_300);
    expect(solo.state.timeLeft).toBe(frozen);
    send(solo, { type: "resume" });
    await until(() => (solo.state.timeLeft as number) < frozen, 3_000);
  });

  it("a dropped player gets the same seat back, and the clock waits for them", async () => {
    const { a, b } = await pair();
    await startPlaying(a, b);
    const token = b.reconnectionToken;
    const seat = b.sessionId;
    await b.leave(false);
    await until(() => a.state.seats.get(seat)?.connected === false);
    const frozen = a.state.timeLeft as number;
    await sleep(1_300);
    expect(a.state.timeLeft).toBe(frozen);

    const again = await colyseus.sdk.reconnect(token);
    await until(() => a.state.seats.get(seat)?.connected === true);
    expect(again.sessionId).toBe(seat);
    expect(a.state.players.get(seat)?.slot).toBe(2);
  });

  it("goes back to one player when somebody who joined a Play alone room leaves for good", async () => {
    const solo = await colyseus.sdk.create("quick", { private: true, name: "Ada", solo: true });
    await solo.waitForInitialState();
    const roomId = ctx.registry.byCode(solo.state.code as string)?.roomId;
    const guest = await colyseus.sdk.joinById(roomId as string, { name: "Bo" });
    await guest.waitForInitialState();
    await until(() => solo.state.players.size === 2 && solo.state.solo === false);
    await guest.leave(false);
    await until(() => solo.state.players.size === 1 && solo.state.solo === true, 5_000);
  });
});
