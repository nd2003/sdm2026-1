# Instructions for AI coding agents

## Start here: who are you working for?

The human will start the session by telling you their name. Match it to a brief, ignoring case and spelling variants, and follow that brief:

| Name (any of) | Brief |
|---|---|
| Abdullah, Abdallah, abdullahwaseem6 | `briefs/abdullah.md` |
| Baasanjav, BaasanjavBatchuluun | `briefs/baasanjav.md` |
| Zaid, zaid-akroush | `briefs/zaid.md` (QA and integration) |

Then:
1. Run `git switch main && git pull` to get the latest code.
2. Read `README.md`, the rest of this file, and the brief.
3. Create or switch to the branch named in the brief.
4. Tell the human in 2–3 lines which issues and files you're taking, then start working.

If they didn't give a name, ask for it. If the name isn't in the table, ask who they are and don't edit anything. A teammate without a brief should ask zaid-akroush to add one.

These rules apply to every agent working in this repo (Claude Code, Codex, Copilot, Cursor, and others). Read `README.md` first for how the game works.

## Ponytail mode (required)

Every agent works in **ponytail mode**: build the laziest solution that works.

Claude Code gets the `ponytail` plugin from `.claude/settings.json`, so accept the install prompt. If it doesn't load, run `/plugin marketplace add DietrichGebert/ponytail` and then `/plugin install ponytail@ponytail`. Other agents follow the rules below directly.

1. Before writing anything, ask: does this need to exist? Is it already in the repo? Does plain JS, CSS or HTML already do it? Then write the minimum code that works.
2. Don't add abstractions, classes, config or helpers "for later". Fewest files and the shortest diff win, but only after you understand the code you're changing.
3. Mark deliberate shortcuts with `// ponytail: <limit>, <upgrade path>`.
4. Never cut validation, error handling, accessibility basics, or anything the brief asks for.
5. After code, give at most three short lines of explanation.

## Stay in your lane

The devs (and their agents) work here at the same time, each in their own files. Only edit the files that belong to the issue you're working on:

| Area | Files | Issue |
|---|---|---|
| Core loop | `js/state.js`, `js/main.js` | #1 |
| Room & objects | `js/room.js`, `assets/` | #2 |
| Puzzles | `js/puzzles.js` | #3 |
| Networking (2-player) | `js/net.js` | #5 |
| Lobby & opponent UI | `js/ui.js`, `style.css` | #6 |
| UI | `js/ui.js`, `style.css` | #4 |

If the task seems to need a change in someone else's file, don't make it. Stop and tell the human, or write what's needed as a comment on the matching issue.

## Shared contract (do not break)

- `game` in `js/state.js` is the only shared state. Don't create other global state.
- `items`, `flags`, `message` and `won` reset every loop. `clues` persist across loops. That rule is the whole game, so never clear `clues` on reset.
- Don't rename or remove anything below without an agreement on the issue first.
- Declare contract functions with `function name() {}`, not `const name = () =>`. The QA test looks them up on `window`.

**Who defines what**

| Name | Defined in | Called by | Does |
|---|---|---|---|
| `buildRoom()` | `room.js` | `main.js`, once at startup | Creates the clickable objects inside `#room` |
| `onObjectClick(id)` | `puzzles.js` | `room.js`, on every click | Runs the puzzle logic for that object |
| `startLoop()` / `resetLoop()` | `state.js` | `main.js` / the timer | Starts the 60s timer / resets when it hits 0 |
| `addItem(id)`, `hasItem(id)`, `addClue(text)`, `setFlag(name, value)`, `say(text)` | `state.js` | `puzzles.js` | Change state, then call `render()` |
| `render()` | `ui.js` | `state.js`, after every change and every tick | Redraws the HUD, inventory, journal, message, room states and win screen from `game` |

**Object ids** (used by both room and puzzles): `note`, `painting`, `cabinet`, `photo`, `computer`, `door`. Decoy objects use any other id. `onObjectClick` should just `say()` something for them.

**Flags** (`game.flags`): `paintingClicks` (number), `paintingMoved`, `cabinetOpen`, `doorUnlocked` (booleans). `render()` uses these to show visual states, for example adding the class `open` to `#obj-cabinet`.

**Items**: `key`.

**DOM ids**: `#timer`, `#loop-count`, `#room`, `#inventory`, `#journal`, `#message`, `#lobby`, `#opponent` (all in `index.html`). Each object element gets the id `obj-<id>`, for example `#obj-painting`.

## Two-player race (online)

Two players on two devices. Each one runs their own copy of the room with their own 60s loops, and the **first to walk out the door wins**. The backend (yigitcemakbas, separate) only relays messages and picks the winner. All game logic stays in the browser.

**New state in `game`** (none of it resets on a loop):
- `phase`: `"lobby"` → `"playing"` → `"over"`
- `playerName`: your name. `winner`: the winner's name, or `null`.
- `opponent`: `{ name, loop, step }`, or `null` before the match starts

**Progress steps** (what the opponent sees): 1 = found "BLUE - 4", 2 = got the key, 3 = cabinet open, 4 = door unlocked, 5 = escaped. A loop reset reports step 0.

**`js/net.js`** (owned by the mechanics dev):

| Name | Called by | Does |
|---|---|---|
| `connect(name)` | `ui.js` (the lobby's Join button) | Sets `playerName` and connects to `?server=ws://…` from the page URL. With no `?server`, it starts a local **fake opponent** right away so the game is playable offline. |
| `send(type, data)` | `state.js`, `puzzles.js` | Sends `{type, ...data}` as JSON |
| `onNetMessage(msg)` | the socket or the fake opponent | Handles the server messages below, then calls `render()` |

**Messages** (JSON over WebSocket; this is the contract with the backend):

| Direction | Message | Meaning |
|---|---|---|
| client → server | `{type:"join", name}` | Find me a match |
| client → server | `{type:"progress", loop, step}` | My progress changed |
| client → server | `{type:"escaped", loop, timeLeft}` | I walked out the door |
| server → client | `{type:"start", opponent}` | Match found → `phase = "playing"`, `startLoop()` |
| server → client | `{type:"progress", loop, step}` | The opponent's progress → `game.opponent` |
| server → client | `{type:"winner", name}` | The race is over → `phase = "over"`, stop the timer |
| server → client | `{type:"opponent-left"}` | The opponent quit → you win by default |

`main.js` no longer calls `startLoop()` on load. It calls `buildRoom(); render();` and waits in the lobby.

## Tech rules

- Use plain HTML/CSS/JS with classic `<script>` tags. `index.html` must keep working when opened directly from disk (`file://`).
- Don't use ES modules, npm, bundlers, frameworks, or build steps.
- Don't add dependencies.

## Git

**Only Zaid pushes to `main`.** GitHub rejects a push to `main` from anyone else.

- Work only on the branch named in your brief. Commit often and push it: `git push -u origin <your-branch>`.
- Never push, merge, rebase or force-push onto `main`, and never touch anyone else's branch.
- Don't open pull requests or merge anything. Zaid pulls your branch, combines it with the other half, tests the result and pushes it to `main`.
- To pick up changes that landed on `main`, run `git pull origin main` while on your branch. If it conflicts outside your own files, stop and tell your human.
- When your "Done when" checklist is complete, push your branch and tell Zaid it's ready.
- Before finishing, open `index.html` in a browser and check that the console has no errors.
- Open `test.html` too. Every test for your half must pass. Tests for the other person's half may fail until their code is merged.
