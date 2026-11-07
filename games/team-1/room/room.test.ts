import { createGameServer, createGameServerContext } from "@sdm/host";
import { boot, type ColyseusTestServer } from "@sdm/host/testing";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { GAME_ID, type TimeLoopState } from "../shared/index.ts";
import { rooms } from "./index.ts";

/** Each room test file boots its own server; 2601 and 2602 belong to the platform's tests. */
const PORT = 2611;

const ctx = createGameServerContext(GAME_ID);
let colyseus: ColyseusTestServer;

beforeAll(async () => {
  colyseus = await boot(createGameServer({ gameId: GAME_ID, rooms }, ctx), PORT);
});
afterAll(() => colyseus.shutdown());
beforeEach(() => colyseus.cleanup());

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Detective 1 creates a private room; detective 2 joins it with the 4-letter code, as the lobby does. */
async function twoDetectives() {
  const a = await colyseus.sdk.create("game", { private: true, name: "Ada" });
  await a.waitForInitialState();
  const code = a.state.code as string;
  const roomId = ctx.registry.byCode(code.toLowerCase())?.roomId as string;
  const b = await colyseus.sdk.joinById(roomId, { name: "Bo" });
  await b.waitForInitialState();
  const room = colyseus.getRoomById<TimeLoopState>(roomId);
  await room.waitForNextTimestep();
  await room.waitForNextPatch();
  return { a, b, code, room };
}

describe("time loop escape room", () => {
  it("lets two detectives meet by room code and opens the first briefing", async () => {
    const { a, b, code, room } = await twoDetectives();
    expect(code).toMatch(/^[A-Z]{4}$/);
    expect(room.state.players.get(a.sessionId)?.slot).toBe(1);
    expect(room.state.players.get(b.sessionId)?.slot).toBe(2);
    expect(b.state.players.get(a.sessionId)?.name).toBe("Ada");
    expect(room.state.phase).toBe("briefing");
  });

  it("turns away a third player, because the game is for two", async () => {
    const { room } = await twoDetectives();
    await expect(colyseus.sdk.joinById(room.roomId, { name: "Cy" })).rejects.toThrow();
    expect(room.state.players.size).toBe(2);
  });

  it("starts the clock when both are ready and applies a detective's click on the server", async () => {
    const { a, b, room } = await twoDetectives();
    a.send("input", { seq: 1, data: { type: "ready" } });
    b.send("input", { seq: 1, data: { type: "ready" } });
    await room.waitForNextTimestep();
    await room.waitForNextTimestep();
    expect(room.state.phase).toBe("playing");

    // The note belongs to detective 2: detective 1's click is refused, detective 2's is read into their journal.
    a.send("input", { seq: 2, data: { type: "interact", target: "note" } });
    b.send("input", { seq: 2, data: { type: "interact", target: "note" } });
    await room.waitForNextTimestep();
    await room.waitForNextTimestep();
    await room.waitForNextPatch();
    expect([...room.state.clues1]).toEqual([]);
    expect([...room.state.clues2]).toEqual(["blue4"]);
    expect(b.state.seats.get(b.sessionId)?.lastSeq).toBe(2);
  });

  it("ignores an action that fails the input schema", async () => {
    const { a, room } = await twoDetectives();
    a.send("input", { seq: 1, data: { type: "interact", target: "window" } });
    await room.waitForNextTimestep();
    await room.waitForNextTimestep();
    expect(room.state.seats.get(a.sessionId)?.lastSeq).toBe(0);
  });

  it("pauses the clock while a detective is away and gives them their seat back", async () => {
    const { a, b, room } = await twoDetectives();
    a.send("input", { seq: 1, data: { type: "ready" } });
    b.send("input", { seq: 1, data: { type: "ready" } });
    await room.waitForNextTimestep();
    await room.waitForNextTimestep();
    expect(room.state.phase).toBe("playing");

    const token = b.reconnectionToken;
    const sessionId = b.sessionId;
    await b.leave(false);
    await sleep(50);
    expect(room.state.seats.get(sessionId)?.connected).toBe(false);
    const subTick = room.state.subTick;
    const timeLeft = room.state.timeLeft;
    for (let i = 0; i < 3; i++) await room.waitForNextTimestep();
    expect(room.state.subTick).toBe(subTick);
    expect(room.state.timeLeft).toBe(timeLeft);

    const again = await colyseus.sdk.reconnect(token);
    await sleep(50);
    expect(again.sessionId).toBe(sessionId);
    expect(room.state.seats.get(sessionId)?.connected).toBe(true);
    expect(room.state.players.get(sessionId)?.slot).toBe(2);
  });

  it("starts a solo room with one detective", async () => {
    const solo = await colyseus.sdk.create("game", { private: true, name: "Ada", solo: true });
    await solo.waitForInitialState();
    const room = colyseus.getRoomById<TimeLoopState>(solo.roomId);
    await room.waitForNextTimestep();
    expect(room.state.solo).toBe(true);
    expect(room.state.phase).toBe("briefing");
    solo.send("input", { seq: 1, data: { type: "ready" } });
    await room.waitForNextTimestep();
    await room.waitForNextTimestep();
    expect(room.state.phase).toBe("playing");
  });
});
