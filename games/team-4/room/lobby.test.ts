import { createGameServer, createGameServerContext } from "@sdm/host";
import { boot, type ColyseusTestServer } from "@sdm/host/testing";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { rooms } from "./index.ts";

const ctx = createGameServerContext("team-4-lobby");
let colyseus: ColyseusTestServer;

beforeAll(async () => {
  colyseus = await boot(createGameServer({ gameId: "team-4-lobby", rooms }, ctx), 2697);
});

afterAll(async () => {
  await colyseus?.shutdown();
});

beforeEach(async () => {
  await colyseus.cleanup();
});

describe("Team 4 multiplayer lobby", () => {
  it("creates a private room and synchronizes both players", async () => {
    const a = await colyseus.sdk.create("lobby", {
      private: true,
      name: "Lyra",
    });
    await a.waitForInitialState();

    const code = a.state.code as string;
    expect(code).toMatch(/^[A-HJ-NP-Z]{4}$/);
    const registered = ctx.registry.byCode(code.toLowerCase());
    expect(registered?.roomId).toBe(a.roomId);

    const b = await colyseus.sdk.joinById(a.roomId, { name: "Partner" });
    await b.waitForInitialState();

    await expect.poll(() => a.state.players.size).toBe(2);
    expect(a.state.players.get(a.sessionId)?.slot).toBe(1);
    expect(b.state.players.get(b.sessionId)?.slot).toBe(2);
    expect(b.state.players.get(a.sessionId)?.name).toBe("Lyra");
    expect(a.state.players.get(b.sessionId)?.name).toBe("Partner");
  });

  it("rejects a third player", async () => {
    const a = await colyseus.sdk.create("lobby", {
      private: true,
      name: "First",
    });
    await a.waitForInitialState();

    const b = await colyseus.sdk.joinById(a.roomId, { name: "Second" });
    await b.waitForInitialState();

    await expect(colyseus.sdk.joinById(a.roomId, { name: "Third" })).rejects.toThrow();

    expect(b.state.players.size).toBe(2);
  });

  it("synchronizes Ready and Not ready inputs", async () => {
    const a = await colyseus.sdk.create("lobby", {
      private: true,
      name: "Lyra",
    });
    await a.waitForInitialState();

    const b = await colyseus.sdk.joinById(a.roomId, { name: "Partner" });
    await b.waitForInitialState();
    await expect.poll(() => a.state.players.size).toBe(2);

    a.send("input", { seq: 1, data: { ready: true } });
    b.send("input", { seq: 1, data: { ready: true } });

    await expect.poll(() => [...a.state.players.values()].every((player) => player.ready)).toBe(true);
    await expect.poll(() => b.state.players.get(a.sessionId)?.ready).toBe(true);

    a.send("input", { seq: 2, data: { ready: false } });
    await expect.poll(() => b.state.players.get(a.sessionId)?.ready).toBe(false);
  });

  it("keeps a dropped player's seat and reconnects it", async () => {
    const a = await colyseus.sdk.create("lobby", {
      private: true,
      name: "Lyra",
    });
    await a.waitForInitialState();

    const b = await colyseus.sdk.joinById(a.roomId, { name: "Partner" });
    await b.waitForInitialState();
    await expect.poll(() => a.state.players.size).toBe(2);

    a.send("input", { seq: 1, data: { ready: true } });
    await expect.poll(() => a.state.players.get(a.sessionId)?.ready).toBe(true);

    const token = b.reconnectionToken;
    const sessionId = b.sessionId;
    await b.leave(false);

    await expect.poll(() => a.state.seats.get(sessionId)?.connected).toBe(false);
    await expect.poll(() => a.state.players.get(a.sessionId)?.ready).toBe(false);
    expect(a.state.players.has(sessionId)).toBe(true);

    const reconnected = await colyseus.sdk.reconnect(token);
    await reconnected.waitForInitialState();

    expect(reconnected.sessionId).toBe(sessionId);
    await expect.poll(() => a.state.seats.get(sessionId)?.connected).toBe(true);
    expect(reconnected.state.players.get(sessionId)?.name).toBe("Partner");
  });

  it("removes a player after an explicit Leave", async () => {
    const a = await colyseus.sdk.create("lobby", {
      private: true,
      name: "Lyra",
    });
    await a.waitForInitialState();

    const b = await colyseus.sdk.joinById(a.roomId, { name: "Partner" });
    await b.waitForInitialState();
    await expect.poll(() => a.state.players.size).toBe(2);

    a.send("input", { seq: 1, data: { ready: true } });
    await expect.poll(() => a.state.players.get(a.sessionId)?.ready).toBe(true);

    const departingId = b.sessionId;
    await b.leave();

    await expect.poll(() => a.state.players.has(departingId)).toBe(false);
    await expect.poll(() => a.state.seats.has(departingId)).toBe(false);
    await expect.poll(() => a.state.players.get(a.sessionId)?.ready).toBe(false);
  });
});
