import { describe, expect, it } from "vitest";
import type { EscapeSnapshot } from "../shared/escape.ts";
import { photoRevealed } from "./photo.ts";

const snapshot = (year: string | null, attempt = 1): EscapeSnapshot => ({
  phase: "running",
  patients: [],
  attempt,
  seconds: 60,
  paper: "1234",
  inventory: [],
  paintingCut: true,
  cabinetOpen: true,
  year,
  ghostSeconds: null,
  message: "",
});

describe("photograph paper sound", () => {
  it("plays when the photograph's year is revealed", () => {
    expect(photoRevealed(snapshot(null), snapshot("1973"))).toBe(true);
  });

  it("stays silent on join, on a wrong code, once revealed, and across attempts", () => {
    expect(photoRevealed(undefined, snapshot("1973"))).toBe(false);
    expect(photoRevealed(snapshot(null), snapshot(null))).toBe(false);
    expect(photoRevealed(snapshot("1973"), snapshot("1973"))).toBe(false);
    expect(photoRevealed(snapshot(null, 1), snapshot("1973", 2))).toBe(false);
  });
});
