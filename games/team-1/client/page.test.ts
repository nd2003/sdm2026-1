import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TARGETS } from "../shared/rules.ts";
import { TAPS } from "./targets.ts";

// The client finds its elements by id, and throws when one is missing. These tests read the page and
// the client code, so renaming or deleting an element that the game needs fails here and not in a
// player's browser.

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const html = read("../index.html");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1] as string);
const idSet = new Set(ids);

/** Ids the client builds from a number or a slot, as in ui.ts: `scene-${n}`, `p${slot}-name` and so on. */
const BUILT_IDS = [
  ...[1, 2, 3].map((n) => `scene-${n}`),
  ...[1, 2].flatMap((slot) => ["name", "status", "key", "slot"].map((part) => `p${slot}-${part}`)),
  ...[1, 2].map((slot) => `player-${slot}-card`),
  ...["start", "intro", "lobby", "game", "win", "ended", "brief", "wait", "reset", "lost", "paused"].map(
    (screen) => `screen-${screen}`,
  ),
];

/** Every id written as a plain string where the client looks an element up. */
function lookedUpIds(): string[] {
  const found = new Set<string>();
  const lookups = /\b(?:el|setHidden|setClass|setText|bind|bindEnter|getElementById)\(\s*"([a-z0-9-]+)"/g;
  for (const file of ["ui.ts", "view.ts", "main.ts"]) {
    for (const match of read(`./${file}`).matchAll(lookups)) found.add(match[1] as string);
  }
  return [...found];
}

describe("the page", () => {
  it("has no two elements with the same id", () => {
    const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(repeated).toEqual([]);
  });

  it("has an element for every object a player can click", () => {
    const missing = Object.keys(TAPS).filter((id) => !idSet.has(id));
    expect(missing).toEqual([]);
  });

  it("sends exactly the actions the server knows, one per object", () => {
    const sent = Object.values(TAPS);
    expect(new Set(sent).size).toBe(sent.length);
    expect([...sent].sort()).toEqual([...TARGETS].sort());
  });

  it("has every element the client looks up by id", () => {
    const lookups = lookedUpIds();
    expect(lookups.length).toBeGreaterThan(50);
    expect(lookups.filter((id) => !idSet.has(id))).toEqual([]);
  });

  it("has every element the client builds an id for", () => {
    expect(BUILT_IDS.filter((id) => !idSet.has(id))).toEqual([]);
  });
});
