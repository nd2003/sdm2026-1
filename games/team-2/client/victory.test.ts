import { describe, expect, it } from "vitest";
import type { EscapeSnapshot } from "../shared/escape.ts";
import { escaped } from "./victory.ts";

const snapshot = (phase: EscapeSnapshot["phase"], attempt = 1): EscapeSnapshot => ({
  phase,
  patients: [],
  attempt,
  seconds: 42,
  paper: "1234",
  inventory: [],
  paintingCut: true,
  cabinetOpen: true,
  year: "1973",
  ghostSeconds: null,
  message: "",
});

describe("victory sound", () => {
  it("plays when the run is won", () => {
    expect(escaped(snapshot("running"), snapshot("escaped"))).toBe(true);
  });

  it("stays silent on join, while still running, on failure and across attempts", () => {
    expect(escaped(undefined, snapshot("escaped"))).toBe(false);
    expect(escaped(snapshot("escaped"), snapshot("escaped"))).toBe(false);
    expect(escaped(snapshot("running"), snapshot("running"))).toBe(false);
    expect(escaped(snapshot("running"), snapshot("failed"))).toBe(false);
    expect(escaped(snapshot("escaped", 1), snapshot("running", 2))).toBe(false);
  });
});
