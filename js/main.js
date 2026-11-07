// Wires everything together. Keep this tiny.
// Wait in the lobby: connect(name) from the Join button starts the match, and "start" calls startLoop().
buildRoom();
render();

// ponytail: demo mode for presentations, becomes the course platform's ?debug tools in the port.
// With ?debug in the URL, anyone can press Shift+N to skip to the next level (not while typing).
CONFIG.demoSkip = new URLSearchParams(location.search).has("debug");
addEventListener("keydown", (e) => {
  if (e.shiftKey && e.key.toUpperCase() === "N" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) adminSkip();
});
