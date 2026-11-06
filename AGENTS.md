# Instructions for AI coding agents

## Start here: who are you working for?

The human will start the session by telling you their name. Match it to a brief, ignoring case and spelling variants, and follow that brief:

| Name (any of) | Brief |
|---|---|
| Abdullah, Abdallah, abdullahwaseem6 | `briefs/abdullah.md` (puzzles & mechanics) |
| Baasanjav, BaasanjavBatchuluun | `briefs/baasanjav.md` (room design & UI) |
| Zaid, zaid-akroush | `briefs/zaid.md` (QA and integration) |

**Roles were swapped on 2026-11-06.** Do your brief's "Step 0: role switch" before anything else.

Then:
1. Run `git switch main && git pull` to get the latest code.
2. Read `README.md`, the rest of this file, and the brief.
3. Create or switch to the branch named in the brief.
4. Tell the human in 2–3 lines which issues and files you're taking, then start working.

### "Check what Zaid sent"

When the human says **"check what zaid sent"** (or anything like it), do the whole job yourself, without asking the human for more:
1. Work out who they are. If they didn't say a name, run `gh api user -q .login` and match it to the table above.
2. Run `git switch main && git pull`, then **reread this file and your brief**, because Zaid may have changed them.
3. Find your issues (`gh issue list --assignee @me`), then read every comment from zaid-akroush on them (`gh issue view <N> --comments`) that's newer than your own last `Status:` comment. These are instructions from your team lead.
4. Do **all** of them, oldest first: handoffs, branch switches, fixes, new features, and any changed rule in this file or your brief. Commit and push to your branch as you go.
5. Stop and ask the human only if an instruction would break a rule in this file, delete work, or touch another dev's files or branch.
6. When you're done, post one `Status:` comment (format under "Talking to Zaid") on each issue you worked on, and tell your human in 2–3 lines what you did.

If no name matches, ask who they are. If the name isn't in the table, ask who they are and don't edit anything. A teammate without a brief should ask zaid-akroush to add one.

These rules apply to every agent working in this repo (Claude Code, Codex, Copilot, Cursor, and others). Read `README.md` first for how the game works.

## Talking to Zaid (required)

Zaid's agent does QA and integration. It talks to you only through **your GitHub issues** (#1–#4, #6, #7), because those comments survive between sessions and the course evaluation reads them.

- **At the start of every session**, read the comments on your issues: `gh issue view <N> --comments`. Anything from zaid-akroush is review feedback. Handle it before starting new work.
- **When you finish a chunk or get blocked**, push your branch, then post one comment on the issue:
  ```
  Status: ready | in progress | blocked
  Branch: <branch> @ <short commit hash>
  Done: <checklist items finished>
  Tested: <what you ran; test.html results for your half>
  Needs from Zaid / the other dev: <contract questions, or "nothing">
  ```
- Never change the contract on your own. If you need a new name, flag, message or field, ask in an issue comment and wait for Zaid to update `AGENTS.md`.

## Final destination: the course repo

The finished game goes into the professor's repo, https://github.com/nd2003/sdm2026-1, under **`games/team-3/`** (we are **team-3**: label `team-3`, titles `[team-3] ...`, branches `team-3/<issue>-<desc>`). Its rules live in its **`CLAUDE.md`** (its `AGENTS.md` only points there). Also read `GETTING_STARTED.md` and `server/CLAUDE.md` once. Rules that matter **now**, so the port is easy:

- **The course grades only what's visible in that repo:** issues, PRs, commits, and whether contributions are spread across members. Write clear commit messages here too, because your commits get merged (not copied) so your name stays on them.
- **The port target is TypeScript + Vite on the client, with a Colyseus server that's authoritative.** Clients send inputs (for example "clicked painting") and the server runs the puzzle logic. So:
  - Keep all puzzle logic inside `onObjectClick`, and have it change only `game`. No DOM access in `puzzles.js`/`state.js`, and no DOM state in `ui.js` that the game logic depends on.
  - In game logic, never use `Math.random()` (the course requires a seeded random) or `Date.now()`. The timer is just a counter.
  - Tuning numbers (60s, 4 clicks, the year) go at the top of the file as constants. They become `config/game.json` later.
- **Branch flow there:** `team-3/<issue>-<desc>` → PR into **`feature/team-3`** (a teammate reviews) → `feature/team-3` → `main` once CI is green → `main` → `prod` (release). Never open a team PR straight into `main`.
- **Stack there:** Node 22, pnpm 10.28, TypeScript, Vite, Colyseus 0.18. CI runs `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` on Ubuntu, Windows and macOS.
- **URL params there** (`@sdm/core/client`): `?room=ABCD` (4-letter room code), `?name=`, `?debug`, `?scenario=`. Our `?server=` goes away in the port.
- `net.js` and the message table get replaced by Colyseus state sync during the port. Keep them small and don't over-build them.
- Everything is in English: code, comments, commits and issues.

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
| Networking (2-player) | `js/net.js` | #6 |
| Lobby & opponent UI | `js/ui.js`, `style.css` | #7 |
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

Two players on two devices. Each one runs their own copy of the room with their own 60s loops, and the **first to walk out the door wins**. The backend (yigitcemakbas, our team-3 server dev) only relays messages and picks the winner. After the port it becomes our Colyseus room in `games/team-3/room/`. All game logic stays in the browser.

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

## Credit: your name on your work

The course grades how the work is spread across members, using commits, issues and PRs.
- Commit from your own laptop with your own git identity, so GitHub links each commit to your account. Check with `git config user.email`; it must be an email on your GitHub account.
- Don't add `Co-Authored-By` or "Generated with" lines to commits, PRs or comments.
- Write commit messages and status comments about what *you* changed, in plain words.
- Zaid combines branches with real merges (`git merge --no-ff`), never squash, cherry-pick or copy-paste. That way every commit keeps its original author.

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
