import { Game } from "./game.ts";
import "./style.css";

function simulateLoad(): void {
  const fill = document.getElementById("loading-fill");
  if (!fill) return;
  let pct = 0;
  const id = setInterval(() => {
    pct += Math.random() * 18 + 6;
    fill.style.width = `${Math.min(pct, 92)}%`;
    if (pct >= 92) clearInterval(id);
  }, 80);
}

simulateLoad();

window.addEventListener("load", () => {
  setTimeout(() => {
    new Game();
  }, 900);
});
