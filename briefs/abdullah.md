# Agent brief: Abdullah (room, objects & UI)

> The agent loads this automatically when you tell it your name (see `AGENTS.md`). Work on branch `issue-2-4-room-ui`.

You're helping build **Time Loop Escape**, a browser game. The player has 60 seconds to escape a room. When time runs out the room resets and items are lost, but the clues the player found are kept.

**Read `README.md` and `AGENTS.md` before writing any code.** `AGENTS.md` has the shared contract. Follow it exactly, because a teammate builds the other half against it at the same time.

## Your scope

You own GitHub issues **#2 (Room & objects)** and **#4 (UI)**. You may only edit:

- `js/room.js`
- `js/ui.js`
- `style.css`
- `assets/`
- `index.html` (only to add markup inside the existing elements)

**Don't touch** `js/state.js`, `js/main.js` or `js/puzzles.js`. Those belong to BaasanjavBatchuluun, who writes the timer, the reset and all the puzzle logic.

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



Until Baasanjav's code lands, add temporary stubs at the **bottom of `ui.js`** so you can open `index.html` and click around:

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
- [ ] No console errors
- [ ] Everything committed and pushed to `issue-2-4-room-ui` (no PR, never `main`), and Zaid told it's ready
