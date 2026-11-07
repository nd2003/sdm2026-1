// Wires everything together. Keep this tiny.
// Wait in the lobby: connect(name) from the Join button starts the match, and "start" calls startLoop().
buildRoom();
render();

// ponytail: the game's single Skip level button, becomes the course platform's ?debug command in the port.
// Shown with ?debug in the URL (any name) or for the name "admin". Shift+N does the same (not while typing).
CONFIG.demoSkip = CONFIG.demoSkip || new URLSearchParams(location.search).has("debug");
const skipButton = document.createElement("button");
skipButton.type = "button";
skipButton.id = "demo-skip";
skipButton.textContent = "Skip level \u23ED";
skipButton.title = "Demo: jump to the next level";
skipButton.hidden = true;
Object.assign(skipButton.style, {
  position: "fixed",
  left: "16px",
  bottom: "16px",
  zIndex: "20",
  padding: "10px 18px",
  cursor: "pointer",
  background: "#c62828",
  color: "#fff",
  border: "2px solid #ff8a80",
  borderRadius: "8px",
  font: "bold 15px system-ui, sans-serif",
  boxShadow: "0 4px 14px #000a",
});
skipButton.addEventListener("click", () => {
  adminSkip();
  skipButton.blur();
});
const restartButton = document.createElement("button");
restartButton.type = "button";
restartButton.id = "demo-restart";
restartButton.textContent = "Restart loop \u21BB";
restartButton.title = "Demo: reset this loop (items lost, journal keeps)";
restartButton.hidden = true;
Object.assign(restartButton.style, {
  position: "fixed",
  left: "16px",
  bottom: "56px",
  zIndex: "20",
  padding: "10px 18px",
  cursor: "pointer",
  background: "#856404",
  color: "#fff",
  border: "2px solid #ffeaa7",
  borderRadius: "8px",
  font: "bold 15px system-ui, sans-serif",
  boxShadow: "0 4px 14px #000a",
});
restartButton.addEventListener("click", () => {
  resetLoop();
  restartButton.blur();
});
document.body.append(skipButton);
document.body.append(restartButton);
setInterval(() => {
  // ponytail: polls instead of hooking render() (ui.js isn't mine)
  const admin = CONFIG.demoSkip || isAdmin();
  skipButton.hidden = !(admin && game.phase === "playing" && !game.flags.escaped);
  restartButton.hidden = !(admin && game.phase === "playing");
}, 250);
addEventListener("keydown", (e) => {
  if (
    e.shiftKey &&
    e.key.toUpperCase() === "N" &&
    !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")
  )
    adminSkip();
});
