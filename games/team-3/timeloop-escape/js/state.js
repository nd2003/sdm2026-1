// Owner: Core loop (see README)
// The ONLY shared state. Everyone reads it; change it only through the functions below.
const LOOP_SECONDS = 60; // tuning: becomes config/game.json in the course port

const game = {
  loop: 1,
  timeLeft: LOOP_SECONDS,
  items: [], // resets every loop
  flags: {}, // resets every loop: e.g. { paintingClicks: 2, cabinetOpen: true }
  clues: [], // KEPT across loops: e.g. ["BLUE - 4"]
  message: "", // resets every loop: last thing an object "said"
  won: false,
  // two-player race (never reset by a loop)
  phase: "lobby", // "lobby" -> "playing" -> "over"
  playerName: null,
  opponent: null, // { name, loop, step } once the match starts
  winner: null,
};

function startLoop() {
  const loop = game.loop;
  game.timeLeft = LOOP_SECONDS;
  const timer = setInterval(() => {
    // no global handle: a finished loop's timer stops itself. The timer is just a counter (no Date.now).
    if (game.won || game.phase === "over" || game.loop !== loop) return clearInterval(timer);
    game.timeLeft--;
    if (game.timeLeft <= 0) resetLoop();
    else render();
  }, 1000);
  render();
}

function resetLoop() {
  game.items = [];
  game.flags = {};
  game.message = "";
  game.won = false;
  game.loop++; // never touch game.clues here
  send("progress", { loop: game.loop, step: 0 });
  startLoop();
}

function addItem(id) {
  game.items.push(id);
  render();
}

function hasItem(id) {
  return game.items.includes(id);
}

function addClue(text) {
  if (!game.clues.includes(text)) game.clues.push(text);
  render();
}

function setFlag(name, value) {
  game.flags[name] = value;
  render();
}

function say(text) {
  game.message = text;
  render();
}
