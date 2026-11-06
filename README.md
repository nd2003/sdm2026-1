# Time Loop Escape

**Two-player online race:** both players are trapped in identical rooms on their own devices, and the first one out wins.

You're trapped in a room with 60 seconds to escape. When the timer hits zero the room resets and your items disappear, **but you keep every clue you found.** Each loop teaches you a bit more until you know the full escape sequence.

## Run it

Open `index.html` in a browser. No install or build step.

## Getting started (team)

```bash
git clone https://github.com/zaid-akroush/timeloop-escape.git
cd timeloop-escape
claude        # or your agent of choice
```

Claude Code will ask to install the **ponytail** plugin, which keeps code minimal. Say yes. Then just tell the agent your name (for example "I'm Abdullah"). It looks up your brief in `briefs/` and starts on your part.

## Testing

Open `test.html` in a browser. It plays the full escape sequence and the loop reset, then shows PASS or FAIL for each step. Zaid also runs it on GitHub Actions after combining everyone's work.

## Play two-player

Open `index.html?server=ws://<backend-address>` on both devices. Without `?server`, you race a fake offline opponent, which is handy for development.

## Escape sequence (first room)

1. Find the clue **"BLUE - 4"**, then click the blue painting 4 times. It moves aside and reveals a key.
2. Use the key to open the cabinet. Inside is the clue **"Find the year on the photograph"**.
3. Find the year on the photograph.
4. Type the year as the password on the computer. This unlocks the exit door.
5. Walk out.

## Who owns what

Each person owns one file, which keeps merge conflicts rare.

| Area | Files | Owner |
|---|---|---|
| QA and integration: tests, PR review, making the halves fit | `test.html`, `.github/` | @zaid-akroush |
| Networking: lobby connection, progress, winner | `js/net.js` | @BaasanjavBatchuluun |
| Core loop: timer, reset, knowledge that persists | `js/state.js`, `js/main.js` | @BaasanjavBatchuluun |
| Room & objects: layout, art, clickable objects | `js/room.js`, `assets/` | @abdullahwaseem6 |
| Puzzles: painting, cabinet, photo, computer, door | `js/puzzles.js` | @BaasanjavBatchuluun |
| UI: HUD, inventory, clue journal, end screens | `js/ui.js`, `style.css` | @abdullahwaseem6 |

## Shared contract

`game` in `js/state.js` is the only shared state:

- `items` and `flags` **reset** every loop.
- `clues` **persist** across loops.

Room calls `onObjectClick(id)`, and puzzles call the state functions (`addItem`, `addClue`, …). After any change, UI's `render()` redraws the screen. If you need a new field or function, agree on it in the issue first.

## Workflow

- Using an AI agent? It must follow `AGENTS.md`. Claude Code loads it automatically through `CLAUDE.md`, and most other agents read `AGENTS.md` directly.

- Each person works and pushes **only on their own branch** (it's named in their brief).
- Only Zaid pushes to `main`, and GitHub blocks everyone else. Zaid pulls both branches, combines them, runs the tests and pushes the result to `main`.
- No pull requests needed. Push your branch and tell Zaid when it's ready.
