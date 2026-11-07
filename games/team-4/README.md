# Team 4 Frontend

Frontend for Team 4's multiplayer game.

## Tech stack

- Vite
- TypeScript
- pnpm

## Run locally

From the repository root:

```bash
nvm use 22.21.1
pnpm install
pnpm --filter @team-4/game dev
```

Frontend:
http://localhost:5173/

Multiplayer server:
http://localhost:2567/

## Project structure

- `client/` - frontend code
- `client/ui/` - shared UI components
- `config/` - game configuration
- `room/` - multiplayer room logic
- `shared/` - shared types and contracts


## Workflow

Follow the repository workflow in [AGENTS.md](../../AGENTS.md).
Issues and pull requests for this folder use the `team-4` label.
