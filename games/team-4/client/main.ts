import "./styles.css";
import { serverUrlFromPage } from "@sdm/core/client";
import { renderGameScreen } from "./ui/index.ts";

/**
 * In local dev the server runs on :2567; deployed builds are served by the server itself, at the root of its
 * own address or under /team-4/ behind the gateway, so the address comes from the page, not location.origin.
 */
export const SERVER_URL: string =
  import.meta.env.VITE_SERVER_URL ??
  (import.meta.env.DEV ? "http://localhost:2567" : serverUrlFromPage(location.href));

const app = document.getElementById("app");

function main(): void {
  if (!app) return;

  app.style.padding = "0";
  const game = renderGameScreen(app, {
    roomId: "ROOM 01 // OUTBREAK BIO-BUNKER",
    roomCode: "TL-04",
    player1Name: "Saif",
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
