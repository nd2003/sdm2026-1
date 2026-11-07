import { describe, expect, it } from "vitest";
import { onBrowserBack, stepOf } from "./nav.ts";

describe("stepOf", () => {
  it("reads the step the game stored in a history entry", () => {
    expect(stepOf({ tle: "lobby" })).toBe("lobby");
    expect(stepOf({ tle: "room" })).toBe("room");
  });

  it("ignores entries the game did not make", () => {
    expect(stepOf(null)).toBeNull();
    expect(stepOf(undefined)).toBeNull();
    expect(stepOf({})).toBeNull();
    expect(stepOf({ tle: "somewhere" })).toBeNull();
    expect(stepOf("lobby")).toBeNull();
  });
});

describe("onBrowserBack", () => {
  it("always asks before leaving a room, whatever entry the browser landed on", () => {
    expect(onBrowserBack("room", { tle: "lobby" })).toEqual({ kind: "ask-leave" });
    expect(onBrowserBack("room", null)).toEqual({ kind: "ask-leave" });
  });

  it("goes back to the previous screen before a room", () => {
    expect(onBrowserBack("lobby", { tle: "intro" })).toEqual({ kind: "show", step: "intro" });
    expect(onBrowserBack("lobby", { tle: "start" })).toEqual({ kind: "show", step: "start" });
    expect(onBrowserBack("intro", { tle: "start" })).toEqual({ kind: "show", step: "start" });
  });

  it("does not bring back a room that was already left", () => {
    expect(onBrowserBack("lobby", { tle: "room" })).toEqual({ kind: "show", step: "lobby" });
  });

  it("falls back to the first screen for an entry it does not know", () => {
    expect(onBrowserBack("lobby", null)).toEqual({ kind: "show", step: "start" });
    expect(onBrowserBack("intro", { tle: "?" })).toEqual({ kind: "show", step: "start" });
  });
});
