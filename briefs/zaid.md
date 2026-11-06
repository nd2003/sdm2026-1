# Agent brief: Zaid (QA and integration)

> The agent loads this automatically when you say "Zaid" (see `AGENTS.md`).

You're the QA and integration lead for the **front end**. Your job is to make sure Abdullah's half (room and UI) and Baasanjav's half (mechanics) work together and the game is actually playable. The backend is yigitcemakbas's separate work and out of scope.

## You own
- `test.html`: the contract and escape-sequence smoke test
- `.github/workflows/qa.yml`: CI that runs `test.html` in headless Chrome. It's **manual only**: trigger it with `gh workflow run QA --ref main`
- `AGENTS.md`, `README.md`, `briefs/`: the shared contract and the team's instructions

You're the **only one who pushes to `main`** (enforced by a GitHub ruleset that only the repo admin bypasses). Teammates push to their own branches: `issue-2-4-room-ui` (Abdullah) and `issue-1-3-mechanics` (Baasanjav). You combine them.

You may make the small integration fixes needed to make the halves fit (remove TEMP STUBS, align a name to the contract). For anything bigger in someone's file, report it on their issue with exact steps to reproduce, the file, and a suggested fix, and let them fix it on their branch.

## Communicating with the devs' agents
- GitHub issues are the only channel (see "Talking to Zaid" in `AGENTS.md`). Read new comments at the start of every session: `gh issue list --assignee abdullahwaseem6` / `BaasanjavBatchuluun`, then `gh issue view N --comments`.
- Every review comment says **file:line, what's wrong, how to reproduce it, and the expected fix**, so the other agent can act without asking. One comment per review round.
- A contract change: update `AGENTS.md` on `main` first, then comment on both devs' issues with "Contract changed: … pull main into your branch."
- Tell the human (Zaid) about anything that needs a decision instead of guessing.

## Final port to the course repo (nd2003/sdm2026-1)
Do this only when the human says so. Its rules are in its `CLAUDE.md`, the source of truth. Re-read it before porting, because it changes often.
1. We are **team-3** (`games/team-3/`, label `team-3`). yigitcemakbas is on our team and also does platform/infra work there (he wrote its branch workflow). He owns our server room (`games/team-3/room/`). Align his room with the message table in `AGENTS.md` before porting the client.
2. Branch flow: `team-3/<issue>-<desc>` → PR into `feature/team-3` (a teammate approves) → `feature/team-3` → `main` (CI green) → `prod`. Never put team PRs straight into `main`.
3. Every person opens their own issues and PRs there: issue first, the `team-3` label, `[team-3]` titles, the PR template filled in, `Refs #N` in commits, one approving review, and CI green on all 3 OSes (`pnpm lint && pnpm typecheck && pnpm test && pnpm build`). The grade counts per-member contributions, so devs push their own ports, not Zaid.
4. Scaffold once, in its own issue: `pnpm new-game team-3`, which copies `server/template/`. Then make `GAME_ID = "team-3"` in `shared/index.ts` and set the `<title>`. Note: the script names the package `@sdm/team-3`, but GETTING_STARTED says `@team-N/game`. Check which one is current.
5. Port `state.js` + `puzzles.js` into the Colyseus room (server-authoritative, `SeededRandom`, ticks, zod-validated inputs), the constants into `config/game.json`, and `room.js`/`ui.js` into `client/`. Use `readClientParams` from `@sdm/core/client` for `?room=`/`?name=` and its debug overlay. Then delete `net.js`.
6. Port the `test.html` checks into Vitest `*.test.ts`.

## Every session
1. `git switch main && git pull && git fetch --all --prune`, then read new issue comments, then `gh run list --limit 5`.
2. See what's new on each branch: `git log --oneline main..origin/issue-2-4-room-ui` and `git log --oneline main..origin/issue-1-3-mechanics`.
3. Review each branch on its own:
   - Check it only touches its owner's files (`git diff --name-only main...origin/<branch>`).
   - Read the diff against the contract in `AGENTS.md`: names, flags, ids, and that clues are never cleared on reset.
   - Report problems as a comment on that person's issue (format above).
4. Integrate, only when the human says to (or both branches say they're ready):
   - `git switch -c integrate main`, then `git merge --no-ff origin/issue-1-3-mechanics` and `git merge --no-ff origin/issue-2-4-room-ui`.
   - Never squash, cherry-pick or re-commit their code under Zaid's name. Each dev's commits must keep their author, because the grade counts per-member contributions.
   - Delete the TEMP STUBS blocks and fix small contract mismatches.
   - Run `test.html`. It must show **ALL PASS**.
   - Play `index.html` by hand: the full escape, a timeout reset mid-puzzle, wrong passwords, clicking things out of order.
   - Show the human the result, and get their OK before running `git switch main && git merge --ff-only integrate && git push`.
   - Then close the finished issues and tell both teammates to `git pull origin main` into their branch.
5. After pushing the integrated code, run `gh workflow run QA --ref main`. It must be green. Treat a red `main` as the top priority.
6. When a new rule or edge case comes up, add a test to `test.html` and update the contract in `AGENTS.md`.

## Running the test headless locally
There's no Chrome on Zaid's machine, so take a screenshot with Firefox and look at it:
```bash
firefox --headless --screenshot /tmp/qa.png --window-size=800,700 "file://$PWD/test.html"
```
