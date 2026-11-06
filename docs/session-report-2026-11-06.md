# Time Loop Escape: session report, 6 November 2026

**Team 3:** Zaid Akroush (lead, QA and integration), Abdullah Waseem (puzzles and game logic), Baasanjav Batchuluun (visual design and UI), Yigit Cem Akbas (backend, working separately).
**Repository:** https://github.com/zaid-akroush/timeloop-escape
**How we worked:** AI first, as the course asks. Each person ran their own AI coding agent. Zaid's agent (Claude Code) did the setup, the shared rules, QA and integration. Every change and every message between people is recorded in the repository's commits and GitHub issues.

## What we built today

A browser escape-room game. You are trapped in a room that resets when the timer runs out. Your items are lost, but the clues you found stay in your journal.

Over the day the game went through three designs:

1. **Single player:** escape one room in 60 seconds.
2. **Two-player race:** two players on two devices, and the first one out wins.
3. **Co-op (current):** two players must help each other escape. Each player's clues are hidden in the *other* player's room, so they have to talk through an in-game chat. Nobody wins alone.

**Working on `main` (demo version):** lobby, the office room with 5 chained puzzles (note → painting → key → cabinet → photo year → computer password → door), a horror visual style with a flashlight view, a 2-player race against a simulated opponent, and win and death screens. All 22 automated checks passed, both locally and on GitHub Actions.

**Done on the dev branches, not yet merged:**
- Co-op: room codes, split clues, chat, and a win that only counts when both players escape.
- Answers that change every match (seeded random).
- No skipping: objects only respond once you've found their clue, and wrong guesses are blocked.
- An input box inside the game instead of browser popups.
- 3 levels, with +60 s on entering each new level.
- Choosable loop length (60/90/120 s).
- Settings with the flickering light on/off, a full-window layout, a title screen, and a story ("Meridian Trust, floor 14").

## How the team was organised

- **One file per area, one owner per file,** so people working at the same time don't overwrite each other.
- **A shared contract** (`AGENTS.md`) lists the names both halves of the code must agree on: functions, state fields, object ids and network messages.
- **One brief per person** (`briefs/`). A teammate tells their agent their name, and the agent loads that person's tasks.
- **Communication through GitHub issues only.** Agents post status updates in a fixed format (`Status / Branch / Done / Tested / Needs`), and Zaid posts instructions there. When a teammate types **"check what zaid sent"**, their agent reads and carries out all new instructions.
- **Branch workflow:** each dev pushes only to their own branch. Only Zaid (as admin) can push to `main`, and a GitHub ruleset enforces this. Zaid combines the branches with real merges, so each person's commits keep their name.

## Issues we ran into and how we solved them

| # | Problem | What we did |
|---|---|---|
| 1 | The repository was empty, and four people needed to start at once without blocking each other. | Picked plain HTML/CSS/JS (nothing to install). Split the code into files with one owner each, wrote a shared contract, and added temporary placeholder code so each half could run before the other existed. |
| 2 | Each person's AI agent needed to know what to work on. | Added `AGENTS.md` (read by all common agents) and `CLAUDE.md` (for Claude Code). Saying your name loads your brief. |
| 3 | Risk of people pushing straight to `main`. | Added a GitHub ruleset so only the admin can update `main`. Devs push to their own branches, and Zaid integrates. |
| 4 | The automatic QA run failed on every push early in the day, because the game code didn't exist yet. | Made the QA workflow manual. Zaid runs it after integrating. |
| 5 | We wanted every agent to write minimal code. Auto-installing the "ponytail" coding plugin for teammates was blocked by Claude Code's safety check, because it installs third-party code on other people's machines. | Wrote the rules into `AGENTS.md` for all agents. Zaid then explicitly approved the plugin, and it was added to the project settings. |
| 6 | The game design changed twice (single player → race → co-op), which broke the shared contract each time. | Rewrote the contract section each time, opened new issues with "Done when" checklists, and marked old sections as out of date. |
| 7 | One teammate opened a pull request, which went against the agreed no-PR workflow for this repo. | It was closed, and the workflow was clarified in the instructions. |
| 8 | **Role swap mid-day:** Zaid swapped the two devs' areas (design ↔ game logic). The risk was that someone's unpushed work would be lost or overwritten. | Added a handoff step: commit and push everything, then post a `Status: handoff`, and only then take over the other branch. One handoff wasn't posted, so Zaid confirmed the branch was safe and approved it on that person's behalf. |
| 9 | Teammates' laptops still had the old instructions, so the "check what zaid sent" phrase wasn't known there yet. | Told them to type "pull main, then check what zaid sent" the first time. |
| 10 | **The flashlight lagged** when moving the mouse. | QA found the cause: every mouse move recalculated the whole room and redrew a full-screen gradient, and a "breathing" animation redrew every drawing each frame. We wrote and tested a patch (the beam became its own layer moved by the GPU, at most one update per frame). The design dev applied it under their own name. |
| 11 | **Credit:** commits carried "Co-Authored-By: Claude" lines, and the course grades each member's contribution. | Turned those lines off for the project, and made sure integration uses real merges so every commit keeps its author. Already-pushed commits were left unchanged, because rewriting shared history is against the course rules. |
| 12 | **Backend not available yet:** the course platform's game server ("room base") is still a pending platform task. | Built offline modes so the game can be tested now: a simulated partner for solo play, and two browser tabs pairing up with no server. The network code is kept small so it can later be replaced by the course's Colyseus server. |
| 13 | Two tabs opened from disk (`file://`) can't talk through `BroadcastChannel`, because the browser treats each file as its own origin. | The mechanics dev added a fallback through `localStorage` events, and tested two real tabs both ways. |
| 14 | **Keeping in sync with the course repo,** whose rules changed during the day (new branch flow `team-3/…` → `feature/team-3` → `main` → `prod`, a new scaffold script, new URL parameters). | Re-read the course rules and updated our port plan and agent instructions to match. |
| 15 | Bugs found during testing. | Each dev fixed their own: Join clicked twice opened two connections, the fake opponent's loop number was stuck, cancelling the password box, the end screen when the opponent quits, a placeholder name in the lobby, the blue painting fading under the red warning light, and a long journal stretching the page. |
| 16 | After co-op, the old automated test still tested the race game and browser popups, so it fails against the new code. | A QA agent is rewriting `test.html` for the co-op rules and testing the combined build (in progress at the time of writing). |
| 17 | Zaid's feedback after playing: the game looks too simple, and there's no music. | Opened issues #13 (visual overhaul), #14 (music and sound effects, started on the first click because browsers block autoplay) and #15 (more interactive story objects in every room). |

## Contributions (commits, as of the end of the session)

| Branch | Abdullah | Baasanjav | Zaid (setup, contract, QA, integration) |
|---|---|---|---|
| `main` | 11 | 9 | 26 |
| `issue-1-3-mechanics` | 13 | 9 | 26 |
| `issue-2-4-room-ui` | 11 | 14 | 25 |

The counts overlap across branches, because each branch also contains `main`. Abdullah and Baasanjav each wrote the code for their own areas. Zaid's commits are mostly setup, documentation, tests and merges.

## GitHub issues opened today

- **Closed:** #2 Room & objects, #4 UI.
- **Open, Abdullah:** #1 Core loop, #3 Puzzles, #6 Networking, #8 Co-op mechanics, #9 Seeded puzzles / no skipping / in-game input, #10 3 levels, #15 More to do in every room.
- **Open, Baasanjav:** #7 Lobby & opponent panel, #11 Settings / full screen / title, #12 Co-op UI, #13 Visual overhaul, #14 Music and sound effects.

Several of the open issues are finished on the dev branches and will close when they're merged to `main`.

## Next steps

1. Finish QA on the combined co-op build, send each dev the bugs in their own files, and merge both branches to `main` once the new tests pass.
2. Finish the visual overhaul, music and room content (#13–#15).
3. Build the full level 2 and level 3 puzzles (the corridor design is already proposed by Abdullah).
4. When the course platform's game server is ready: move the game into `games/team-3/` in the course repository (TypeScript, Vite, Colyseus), with each person porting their own part through `[team-3]` issues and pull requests into `feature/team-3`.
