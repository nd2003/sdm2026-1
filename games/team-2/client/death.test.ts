import { describe, expect, it } from "vitest";
import type { EscapeSnapshot } from "../shared/escape.ts";
import { deathCause } from "./death.ts";

const snapshot = (phase: EscapeSnapshot["phase"], seconds: number, attempt = 1): EscapeSnapshot => ({
  phase,
  patients: [],
  attempt,
  seconds,
  paper: null,
  inventory: [],
  paintingCut: false,
  cabinetOpen: false,
  year: null,
  ghostSeconds: null,
  message: "",
});

describe("death sound", () => {
  it("tells a ghost death from running out of time", () => {
    expect(deathCause(snapshot("running", 87), snapshot("failed", 87))).toBe("ghost");
    expect(deathCause(snapshot("running", 1), snapshot("failed", 0))).toBe("time");
  });

  it("stays silent on join, while running, on escape and across attempts", () => {
    expect(deathCause(undefined, snapshot("failed", 0))).toBeNull();
    expect(deathCause(snapshot("failed", 0), snapshot("failed", 0))).toBeNull();
    expect(deathCause(snapshot("running", 50), snapshot("running", 49))).toBeNull();
    expect(deathCause(snapshot("running", 30), snapshot("escaped", 30))).toBeNull();
    expect(deathCause(snapshot("failed", 0, 1), snapshot("running", 180, 2))).toBeNull();
  });
});
