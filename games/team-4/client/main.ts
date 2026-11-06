import "./styles.css";
import { renderGameScreen } from "./ui/index.ts";

const app = document.getElementById("app");

function main(): void {
  if (!app) return;

  app.style.padding = "0";
  const game = renderGameScreen(app, {
    roomId: "ROOM-04",
    timeLeftSeconds: 60,
    loopDurationSeconds: 60,
    loopCount: 1,
    connectedPlayers: 2,
    maxPlayers: 2,
    score: 0,
    statusText: "Time Loop Active",
  });

  // 60-second Time Loop countdown: resets room & items at 00:00, keeps clues
  setInterval(() => {
    const current = game.getState();
    if (current.escaped) return;

    if (current.timeLeftSeconds > 0) {
      game.update({ timeLeftSeconds: current.timeLeftSeconds - 1 });
    }
  }, 1000);
}

main();
