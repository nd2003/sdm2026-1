// Owner: mechanics dev (see AGENTS.md "Two-player race")
// Talks to the relay server, or fakes an opponent when the page has no ?server=ws://... in its URL.
const FAKE_OPPONENT_NAME = "The Other";
const FAKE_STEP_SECONDS = 20;  // fake opponent: one step this often, wins at step 5 (100s, so it is beatable in loop 2)

let socket = null;  // ponytail: net.js's own connection handle (not game state); replaced by Colyseus in the port

function connect(name) {
  if (game.playerName) return;  // already joined (double click on Join)
  game.playerName = name;
  const server = new URLSearchParams(location.search).get("server");
  if (!server) return fakeOpponent();
  render();  // shows "Waiting for an opponent…"
  socket = new WebSocket(server);
  socket.onopen = () => send("join", { name });
  socket.onmessage = (e) => {
    try { onNetMessage(JSON.parse(e.data)); } catch (err) { console.error("Bad server message", e.data, err); }
  };
  socket.onerror = () => say("The line goes dead. Can't reach the server.");
}

function send(type, data) {
  if (socket) {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type, ...data }));
  } else if (type === "escaped") {
    onNetMessage({ type: "winner", name: game.playerName });  // fake mode: escaping first wins
  }
}

function onNetMessage(msg) {
  switch (msg && msg.type) {
    case "start":
      if (game.phase !== "lobby") return;
      game.opponent = { name: msg.opponent?.name ?? msg.opponent, loop: 1, step: 0 };
      game.phase = "playing";
      startLoop();
      break;
    case "progress":
      if (game.opponent) Object.assign(game.opponent, { loop: msg.loop, step: msg.step });
      break;
    case "winner":
      game.winner = msg.name;
      game.phase = "over";  // startLoop's timer sees this and stops
      break;
    case "opponent-left":
      game.winner = game.playerName;  // you win by default
      game.phase = "over";
      break;
    default:
      console.warn("Unknown server message", msg);
  }
  render();
}

function fakeOpponent() {
  onNetMessage({ type: "start", opponent: FAKE_OPPONENT_NAME });
  let step = 0;
  const timer = setInterval(() => {
    if (game.phase !== "playing") return clearInterval(timer);
    step++;
    onNetMessage({ type: "progress", loop: 1 + Math.floor(step * FAKE_STEP_SECONDS / LOOP_SECONDS), step });  // its loop goes up like yours
    if (step === 5) onNetMessage({ type: "winner", name: FAKE_OPPONENT_NAME });
  }, FAKE_STEP_SECONDS * 1000);
}
