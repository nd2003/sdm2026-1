# Agent brief: Baasanjav (game mechanics)

> The agent loads this automatically when you tell it your name (see `AGENTS.md`). Work on branch `issue-1-3-mechanics`.

You're helping build **Time Loop Escape**, a browser game. The player has 60 seconds to escape a room. When time runs out the room resets and items are lost, but the clues the player found are kept.

**Read `README.md` and `AGENTS.md` before writing any code.** `AGENTS.md` has the shared contract. Follow it exactly, because a teammate builds the other half against it at the same time.

## Your scope

You own GitHub issues **#1 (Core loop)** and **#3 (Puzzles)**. You may only edit:

- `js/state.js`
- `js/main.js`
- `js/puzzles.js`

**Don't touch** `js/room.js`, `js/ui.js`, `style.css` or `assets/`. Those belong to Abdullah, who builds the room visuals and `render()`.

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
This is the chain from the README. Use the flag and item names from `AGENTS.md`:
1. `note` → `addClue("BLUE - 4")`
2. `painting` → `paintingClicks++`. At exactly 4 clicks, set `paintingMoved`, `addItem("key")` and `say()` that a key fell out.
3. `cabinet` → with the key: set `cabinetOpen` and `addClue("Find the year on the photograph")`. Without it: `say("It's locked.")`.
4. `photo` → `say()` text showing the year (pick one, for example 1987). Optionally add it as a clue too.
5. `computer` → `prompt("Password:")`. The correct year sets `doorUnlocked`. A wrong one makes it `say("Access denied.")`.
6. `door` → if `doorUnlocked`, set `game.won = true` and `render()`. Otherwise `say("The door won't budge.")`.
7. Any other id (a decoy) → `say()` something flavourful.

## Working without the other half

Until Abdullah's code lands, add temporary stubs at the **top of `main.js`** (above the `buildRoom(); startLoop();` call) so you can test from the browser console:

```js
// TEMP STUBS: delete once room.js / ui.js are merged
if (typeof render === "undefined") window.render = () => console.log(JSON.stringify(game));
if (typeof buildRoom === "undefined") window.buildRoom = () => {};
```

Then test from the console with calls like `onObjectClick("note")` and `onObjectClick("painting")` ×4.

## Done when
- [ ] The timer counts 60 → 0, then the loop resets: items and flags are gone, clues are kept, and `loop` goes up
- [ ] The full chain note → painting ×4 → key → cabinet → photo → computer → door wins
- [ ] Clicking the cabinet before getting the key says it's locked
- [ ] No console errors
- [ ] Everything committed and pushed to `issue-1-3-mechanics` (no PR, never `main`), and Zaid told it's ready
