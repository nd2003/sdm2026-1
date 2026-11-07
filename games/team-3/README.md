# Team 3: Time Loop Escape

This folder holds Team 3's game. Follow the workflow in [AGENTS.md](../../AGENTS.md); issues and pull requests for this folder carry the `team-3` label.

**Time Loop Escape** is a two-player co-op horror escape room. Two night auditors sign in to floor 14 of Meridian Trust at 23:59, and the door only ever lets one of them out. Each player is in their own copy of the building with their own timer, but **half of your clues are in your partner's room**, so you have to talk. Nobody wins alone: you both have to get out.

## How to play

- When the timer runs out, the **loop resets**: your items are gone and you're back in the office, but your **journal keeps every clue**. Each loop you get a little further.
- Anything that says "this isn't for you" belongs to your partner. Read it out in the chat.
- Objects ignore you until you've found their clue, and a wrong code locks the input for a few seconds.

| Level | Where | The way out |
|---|---|---|
| 1 | The office | A note, the painting (colour and click count from your partner), the key, the cabinet, the year on the photo, the computer, then the door |
| 2 | The casket corridor | Pick the right casket (your partner knows which, the other one bites), restore power at the fuse box, then the keypad code |
| 3 | The lift shaft | The lift is a trap. Find the fuse in the roof hatch, power the breaker, then open the vent with the code from your partner's room |

Each new level adds time to the clock. The answers change every match.

## Run it

```bash
pnpm install
pnpm --filter @team-3/game dev
```

Open the printed URL, **Create room** (pick 60, 90 or 120 seconds per loop) and send the 4-letter code or invite link to your partner, who uses **Join room**. Open it in two tabs to play both sides yourself.

The original plain-JS version is kept in [`timeloop-escape/`](timeloop-escape/) as the reference until the port is finished. Open `timeloop-escape/index.html` directly in a browser; "Play alone with a practice partner" works without a server.

## Test it

```bash
pnpm exec vitest run games/team-3
pnpm preflight
```

The Vitest tests drive the room logic in the platform's pure `Simulation` (a full co-op escape, loop reset, locks, vent power, hints, leaving, the debug skip, a replay hash) and the room against a test server. The plain-JS reference has its own browser test, [`timeloop-escape/test.html`](timeloop-escape/test.html).

## Debug and tuning

- **Skip a level:** in a debug build, open the console with `~` and run `skip`.
- **Tuning:** loop length, time per new level, lock and bite penalties, hint delays and code lengths live in [`config/game.json`](config/game.json). Edit the JSON, not the code.

## Folder layout

| Path | What it is |
|---|---|
| [`shared/index.ts`](shared/index.ts) | The contract: room state, inputs, join options and config schema |
| `shared/game.ts` | The `GameDefinition` the room runs: joining, inputs, ticks, the `skip` command |
| `shared/puzzles.ts` | Puzzles, hints and story for all three levels |
| [`room/`](room/) | Registers the Colyseus room |
| [`client/`](client/) | The browser client and its screens |
| [`config/game.json`](config/game.json) | Tuning values |
| [`timeloop-escape/`](timeloop-escape/) | The original plain-JS game, imported with its full history |

## Team

Zaid Akroush (lead, QA and integration), Abdullah Waseem (game logic, room and screens), Baasanjav Batchuluun (art, room design and UI), Yigit Cem Akbas (server platform).
