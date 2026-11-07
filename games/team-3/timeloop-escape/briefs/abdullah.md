# Agent brief: Abdullah (puzzles & game mechanics)

> The agent loads this automatically when you tell it your name (see `AGENTS.md`). Work on branch `issue-1-3-mechanics`.

## Step 0: role switch (do this first, once)

On 2026-11-06 Zaid swapped the devs' roles. Before doing anything else:
1. On your **old** branch `issue-2-4-room-ui`, commit all your uncommitted work and push it.
2. Post this on each of your old issues (#2, #4, #7): `Status: handoff`, `Branch: issue-2-4-room-ui @ <hash>`, and a short note on what's done and what's left for Baasanjav.
3. Check that Baasanjav has handed off too: `gh issue view 3 --comments` must show a `Status: handoff` comment from BaasanjavBatchuluun. **If it's not there, tell your human and stop.** Don't touch `issue-1-3-mechanics` yet, because Baasanjav may still have unpushed work on it.
4. Then run `git switch issue-1-3-mechanics && git pull`, read the handoff note, and continue below. Skip Step 0 in later sessions once your handoff comment exists.

You're helping build **Time Loop Escape**, a browser game. The player has 60 seconds to escape a room. When time runs out the room resets and items are lost, but the clues the player found are kept.

**Read `README.md` and `AGENTS.md` before writing any code.** `AGENTS.md` has the shared contract. Follow it exactly, because a teammate builds the other half against it at the same time.

## Current work

**Phase 2 (2026-11-07): port to the course repo.** The game in this repo is done and frozen. `main` @ 6562cea is the final version, with both halves plus Zaid's QA fixes. **Your only current task is issue #18** in this repo. It has the steps and the "Done when" list. Older issues (#1, #3, #6, #8–#10, #15, #16) are finished, so don't redo them. Don't push any more game changes to `issue-1-3-mechanics`.

The port work happens in nd2003/sdm2026-1 under `games/team-3/`. Clone it next to this repo if you haven't already, and read its `CLAUDE.md`, `server/CLAUDE.md` and `GETTING_STARTED.md` first. You own the **server side**: the Colyseus room, shared types, `config/game.json` and the logic tests. Baasanjav owns the **client side**. yigitcemakbas (team-3) did the platform work, so ask him on the course issue if the room template is unclear.

The sections below describe the older, finished work.

## Your scope

You own GitHub issues **#1 (Core loop)**, **#3 (Puzzles)** and **#6 (Networking)**. Baasanjav already built a first version of #1 and #3 on this branch, so build on it instead of rewriting it. You may only edit:

- `js/state.js`
- `js/main.js`
- `js/puzzles.js`
- `js/net.js`

**Don't touch** `js/room.js`, `js/ui.js`, `style.css` or `assets/`. Those belong to Baasanjav, who now owns the room design and `render()`.

## What to build

### `js/state.js`: the loop
- `startLoop()`: set `timeLeft = 60` and tick once a second, calling `render()` on each tick. At 0, call `resetLoop()`.
- `resetLoop()`: clear `items`, `flags` and `message`, and set `won = false`. **Keep `clues`.** Then `loop++` and start the timer again.
- `addItem(id)`, `hasItem(id)`, `addClue(text)` (no duplicates), `setFlag(name, value)` and `say(text)` (sets `game.message`). Each one calls `render()`.
- Stop the timer when `game.won` is true.
- Optional: save `clues` and `loop` to `localStorage` so a page reload doesn't wipe them. Wrap that in try/catch.

### `js/main.js`
On page load: `buildRoom(); startLoop();`

### `js/puzzles.js`: `onObjectClick(id)`
Make the puzzles feel like a real escape room: messages should be short, tense and creepy ("Something scratches behind the wall."), not friendly. Keep the object ids, flags and steps from `AGENTS.md` unchanged so the design side still matches.

This is the chain from the README. Use the flag and item names from `AGENTS.md`:
1. `note` → `addClue("BLUE - 4")`
2. `painting` → `paintingClicks++`. At exactly 4 clicks, set `paintingMoved`, `addItem("key")` and `say()` that a key fell out.
3. `cabinet` → with the key: set `cabinetOpen` and `addClue("Find the year on the photograph")`. Without it: `say("It's locked.")`.
4. `photo` → `say()` text showing the year (pick one, for example 1987). Optionally add it as a clue too.
5. `computer` → `prompt("Password:")`. The correct year sets `doorUnlocked`. A wrong one makes it `say("Access denied.")`.
6. `door` → if `doorUnlocked`, set `game.won = true` and `render()`. Otherwise `say("The door won't budge.")`.
7. Any other id (a decoy) → `say()` something flavourful.

## Two-player update (issue #6)

The game is now an **online two-player race**. Read "Two-player race" in `AGENTS.md` first. On your branch, also own `js/net.js`:

- `connect(name)`: with `?server=` in the URL, open a `WebSocket`, send `join`, and route incoming JSON to `onNetMessage`. Without it, run a **fake opponent**: start the match immediately, then raise its step by 1 every ~12s and declare it the winner at step 5. Keep it under 20 lines.
- `send(type, data)`: a no-op in fake mode. In fake mode, `escaped` should make you the winner.
- `onNetMessage(msg)`: handle `start`, `progress`, `winner` and `opponent-left` exactly as the contract table says.
- `state.js`: add `phase`, `playerName`, `opponent` and `winner` to `game`. The timer must stop when `phase === "over"`. `resetLoop()` sends `progress` with step 0.
- `puzzles.js`: send `progress` at each step (1–4). At the door, send `escaped`.
- `main.js`: on load, call `buildRoom(); render();` only. Don't call `startLoop()`; `start` does that now.



Until the design code is merged, add temporary stubs at the **top of `main.js`** (above the `buildRoom(); startLoop();` call) so you can test from the browser console:

```js
// TEMP STUBS: delete once room.js / ui.js are merged
if (typeof render === "undefined") window.render = () => console.log(JSON.stringify(game));
if (typeof buildRoom === "undefined") window.buildRoom = () => {};
```

Then test from the console with calls like `onObjectClick("note")` and `onObjectClick("painting")` ×4.

## Done when
- [ ] Offline (no `?server`): `connect("Me")` in the console starts the match, the fake opponent progresses, and whoever escapes first wins
- [ ] Every message matches the table in `AGENTS.md`
- [ ] The timer counts 60 → 0, then the loop resets: items and flags are gone, clues are kept, and `loop` goes up
- [ ] The full chain note → painting ×4 → key → cabinet → photo → computer → door wins
- [ ] Clicking the cabinet before getting the key says it's locked
- [ ] No console errors
- [ ] Everything committed and pushed to `issue-1-3-mechanics` (no PR, never `main`), and Zaid told it's ready
