// Wires everything together. Keep this tiny.
// Wait in the lobby: connect(name) from the Join button starts the match, and "start" calls startLoop().
buildRoom();
render();

// ponytail: demo mode for presentations, becomes the course platform's ?debug tools in the port.
// CONFIG.demoSkip (or ?debug in the URL) shows a red "Skip level" button, and Shift+N does the same (not while typing).
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
document.body.append(skipButton);
setInterval(() => {
  // ponytail: polls instead of hooking render() (ui.js isn't mine)
  skipButton.hidden = !(CONFIG.demoSkip && game.phase === "playing" && !game.flags.escaped);
}, 250);
addEventListener("keydown", (e) => {
  if (
    e.shiftKey &&
    e.key.toUpperCase() === "N" &&
    !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")
  )
    adminSkip();
});
