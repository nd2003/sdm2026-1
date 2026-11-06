import "./styles.css";
import { renderGameScreen } from "./ui/index.ts";

const app = document.getElementById("app");

function main(): void {
  if (!app) return;

  app.style.padding = "0";
  const game = renderGameScreen(app, {
    roomId: "ROOM 01 // OFFICE",
    roomCode: "RM-04",
    player1Name: "You",
    player2Name: "Drek",
    timeLeftSeconds: 60,
    loopDurationSeconds: 60,
    loopCount: 1,
    connectedPlayers: 2,
    maxPlayers: 2,
    score: 1,
    statusText: "Ready",
  });

  // 60-second Time Loop countdown: ticks only while timerRunning is true
  setInterval(() => {
    const current = game.getState();
    if (!current.timerRunning || current.escaped) return;

    if (current.timeLeftSeconds > 0) {
      game.update({ timeLeftSeconds: current.timeLeftSeconds - 1 });
    }
  }, 1000);
}

main();
