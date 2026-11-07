import { createGameRoom, createGameServer, createGameServerContext } from "@sdm/host";
import { boot, type ColyseusTestServer } from "@sdm/host/testing";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { timeLoopGame } from "../shared/game.ts";
import { rooms } from "./index.ts";

const ctx = createGameServerContext("team-3");
const prodDeps = { ...ctx.deps, env: "production" as const };
let colyseus: ColyseusTestServer;

beforeAll(async () => {
  colyseus = await boot(
    createGameServer(
      { gameId: "team-3", rooms: { ...rooms, prod: () => createGameRoom(timeLoopGame, prodDeps) } },
      ctx,
    ),
    2613,
  );
});
afterAll(() => colyseus.shutdown());
beforeEach(() => colyseus.cleanup());

describe("Time Loop Escape room", () => {
  it("two clients create and join by code, the match starts, and a chat line syncs to both", async () => {
    const a = await colyseus.sdk.create("game", { private: true, name: "Ada", seconds: 90 });
    await a.waitForInitialState();
    const code = a.state.code as string;
    expect(code).toMatch(/^[A-Z]{4}$/);
    const roomId = ctx.registry.byCode(code.toLowerCase())?.roomId as string;
    const b = await colyseus.sdk.joinById(roomId, { name: "Bo" });
    await b.waitForInitialState();
    await a.waitForNextPatch();
    expect(a.state.phase).toBe("playing");
    expect(a.state.loopSeconds).toBe(90);
    b.send("input", { seq: 1, data: { kind: "chat", text: "hello Ada" } });
    await a.waitForNextPatch();
    await a.waitForNextPatch();
    expect(a.state.chat.at(-1)?.text).toBe("hello Ada");
  });

  it("a malformed input is rejected and changes nothing", async () => {
    const room = await colyseus.createRoom("game", {});
    const client = await colyseus.connectTo(room, { name: "Ada" });
    client.send("input", { seq: 1, data: { kind: "teleport" } });
    await room.waitForNextTimestep();
    expect(room.state.players.get(client.sessionId)?.stage).toBe(1);
  });

  it("debug commands (skip) are rejected in production", async () => {
    const room = await colyseus.createRoom("prod", {});
    const client = await colyseus.connectTo(room, {});
    const reply = client.waitForMessage("debug:result");
    client.send("debug:command", { id: "1", command: "skip" });
    expect(await reply).toMatchObject({ ok: false });
  });
});
