import "./styles.css";
import { serverUrlFromPage } from "@sdm/core/client";
import { renderGameScreen } from "./ui/index.ts";

/**
 * In local dev the server runs on :2567; deployed builds are served by the server itself, at the root of its
 * own address or under /team-4/ behind the gateway, so the address comes from the page, not location.origin.
 * Not used yet: the game screen still runs on sample data until it connects to the room.
 */
export const SERVER_URL: string =
  import.meta.env.VITE_SERVER_URL ??
  (import.meta.env.DEV ? "http://localhost:2567" : serverUrlFromPage(location.href));

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
