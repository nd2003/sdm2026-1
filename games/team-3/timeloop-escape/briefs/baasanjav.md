# Agent brief: Baasanjav (room design & UI, horror escape room)

> The agent loads this automatically when you tell it your name (see `AGENTS.md`). Work on branch `issue-2-4-room-ui`.

## Step 0: role switch (do this first, once)

On 2026-11-06 Zaid swapped the devs' roles. Before doing anything else:
1. On your **old** branch `issue-1-3-mechanics`, commit all your uncommitted work and push it.
2. Post this on each of your old issues (#1, #3, #6): `Status: handoff`, `Branch: issue-1-3-mechanics @ <hash>`, and a short note on what's done and what's left for Abdullah.
3. Check that Abdullah has handed off too: `gh issue view 2 --comments` must show a `Status: handoff` comment from abdullahwaseem6. **If it's not there, tell your human and stop.** Don't touch `issue-2-4-room-ui` yet, because Abdullah may still have unpushed work on it.
4. Then run `git switch issue-2-4-room-ui && git pull`, read the handoff note, and continue below. Skip Step 0 in later sessions once your handoff comment exists.

## Design direction: scary escape room

Zaid wants the game to feel like a **horror escape room**, not a cosy puzzle. Abdullah already built a working room, UI and lobby on this branch, so **restyle and extend it** instead of rewriting it.
- Dark, dim room lit by a flickering bulb or flashlight-style vignette, with grime, stains and a heavy locked door
- Muted, desaturated colours. The only strong colours are the **blue** painting (the puzzle needs it) and blood-red danger cues
- A creepy typewriter or handwritten font from Google Fonts, and the journal as a stained, torn notebook
- Tension rising as the timer drops: stronger red pulse, screen shake or flicker in the last 10s, and a harsh glitch or static flash on loop reset
- Optional: short ambient sound or a heartbeat in the last 10s (browser audio, files in `assets/`, small, with a mute button)
- Keep it readable and accessible: text contrast, focusable objects, and `prefers-reduced-motion` turning off shake and flicker

You're helping build **Time Loop Escape**, a browser game. The player has 60 seconds to escape a room. When time runs out the room resets and items are lost, but the clues the player found are kept.

**Read `README.md` and `AGENTS.md` before writing any code.** `AGENTS.md` has the shared contract. Follow it exactly, because a teammate builds the other half against it at the same time.

## Current work

**Phase 2 (2026-11-07): port to the course repo.** The game in this repo is done and frozen. `main` @ 6562cea is the final version, with both halves plus Zaid's QA fixes. **Your only current task is issue #19** in this repo. It has the steps and the "Done when" list. Older issues (#2, #4, #7, #11–#14, #17) are closed out by this, so don't keep working on them here. Don't push any more game changes to `issue-2-4-room-ui`.

The port work happens in nd2003/sdm2026-1 under `games/team-3/`. Clone it next to this repo if you haven't already, and read its `CLAUDE.md`, `server/CLAUDE.md` and `GETTING_STARTED.md` first. You own the **client side**: `client/` (Vite + TypeScript), the room view, HUD, lobby, chat and styles. Abdullah owns the server room and the shared state shape that you render from.

The sections below describe the older, finished work.

## Your scope

You own GitHub issues **#2 (Room & objects)**, **#4 (UI)** and **#7 (Lobby & opponent UI)**. You may only edit:

- `js/room.js`
- `js/ui.js`
- `style.css`
- `assets/`
- `index.html` (only to add markup inside the existing elements)

**Don't touch** `js/state.js`, `js/main.js` or `js/puzzles.js`. They and `js/net.js` belong to Abdullah, who now owns the timer, the reset, networking and all the puzzle logic.

## What to build

### `js/room.js`: `buildRoom()`
- Create one clickable element per object inside `#room`, each with id `obj-<id>`.
- Puzzle objects: `note`, `painting` (clearly **blue**), `cabinet`, `photo`, `computer`, `door`. Add 2–3 decoy objects (for example a lamp or a bookshelf) so the room isn't solved by clicking everything once.
- Every click calls `onObjectClick(id)`. That's all room.js does, with no puzzle logic.
- Art: CSS shapes, emoji or simple SVG are fine to start with. Put image files in `assets/`.

### `js/ui.js`: `render()`
`render()` draws everything from `game` and is safe to call many times per second:
- `#timer` ← `game.timeLeft`, and `#loop-count` ← `"Loop " + game.loop`
- `#inventory` ← `game.items`
- `#journal` ← `game.clues`. This journal is the heart of the game, so make it look like a notebook that survives the reset.
- `#message` ← `game.message`
- Room visual states from `game.flags`: painting shifted when `paintingMoved`, cabinet `open` when `cabinetOpen`, door looks unlocked when `doorUnlocked`
- Win screen when `game.won`. Add a short "the loop resets…" flash when `game.loop` goes up.

## Two-player update (issue #7)

The game is now an **online two-player race**. Read "Two-player race" in `AGENTS.md` first. Add to `render()`:

- `#lobby` (when `phase === "lobby"`): a name input and a Join button that calls `connect(name)`. After joining, show "Waiting for an opponent…" (that's when `playerName` is set but you're still in the lobby). Hide the room until `phase === "playing"`.
- `#opponent` (while playing): the opponent's name, their loop, and their progress as `step` out of 5 (a bar or 5 dots).
- When `phase === "over"`: "You escaped first!" if `winner === playerName`, otherwise "<name> escaped first". This replaces the single-player win screen.

Add this to your temp stubs:
```js
if (typeof connect === "undefined") window.connect = (name) => { game.playerName = name; game.phase = "playing"; game.opponent = { name: "Bot", loop: 1, step: 2 }; render(); };
```



Until the mechanics code is merged, add temporary stubs at the **bottom of `ui.js`** so you can open `index.html` and click around:

```js
// TEMP STUBS: delete once state.js / puzzles.js / main.js are merged
if (typeof onObjectClick === "undefined") {
  window.onObjectClick = (id) => { game.message = "Clicked " + id; render(); };
}
if (typeof startLoop === "undefined") { buildRoom(); render(); }
```

## Done when
- [ ] The lobby shows on load, Join works, and the room is hidden until the match starts
- [ ] The opponent panel and the win/lose screen render correctly from `game` (try setting fields in the console)
- [ ] Opening `index.html` shows the room with all 6 puzzle objects and the decoys, the HUD, the inventory, the journal and the message area
- [ ] Clicking any object calls `onObjectClick` with the right id
- [ ] Setting `game.flags.cabinetOpen = true; render()` in the console visibly opens the cabinet (same for the painting and door)
- [ ] The room looks and feels scary (see Design direction), and `prefers-reduced-motion` disables shake and flicker
- [ ] No console errors
- [ ] Everything committed and pushed to `issue-2-4-room-ui` (no PR, never `main`), and Zaid told it's ready
