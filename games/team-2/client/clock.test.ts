import { describe, expect, it } from "vitest";
import type { EscapeSnapshot } from "../shared/escape.ts";
import { clockTick } from "./clock.ts";

const snapshot = (
  seconds: number,
  phase: EscapeSnapshot["phase"] = "running",
  attempt = 1,
): EscapeSnapshot => ({
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

describe("clock ticking", () => {
  it("ticks each second the run timer drops, alternating tick and tock", () => {
    expect(clockTick(snapshot(120), snapshot(119))).toEqual({ tock: true, urgent: false });
    expect(clockTick(snapshot(119), snapshot(118))).toEqual({ tock: false, urgent: false });
  });

  it("turns urgent in the last ten seconds", () => {
    expect(clockTick(snapshot(11), snapshot(10))).toEqual({ tock: false, urgent: true });
    expect(clockTick(snapshot(2), snapshot(1))).toEqual({ tock: true, urgent: true });
  });

  it("stays silent on join, at the start, when the time is unchanged, after the run and across attempts", () => {
    expect(clockTick(undefined, snapshot(100))).toBeNull();
    expect(clockTick(snapshot(180, "waiting"), snapshot(180))).toBeNull();
    expect(clockTick(snapshot(50), snapshot(50))).toBeNull();
    expect(clockTick(snapshot(1), snapshot(0, "failed"))).toBeNull();
    expect(clockTick(snapshot(30), snapshot(29, "escaped"))).toBeNull();
    expect(clockTick(snapshot(5, "failed", 1), snapshot(180, "running", 2))).toBeNull();
  });
});
