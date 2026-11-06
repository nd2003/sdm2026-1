// Owner: mechanics dev (see AGENTS.md "Co-op v2")
// Three ways to play, picked in connect():
// - ?server=ws://... : the relay server pairs the two players.
// - a room code, no server: two tabs in the same browser pair up through BroadcastChannel (real 2-player, no backend).
// - no code: solo, with a fake partner who chats you the clues from "their" room.
const FAKE_PARTNER_NAME = "The Other";

let link = null;    // ponytail: net.js's own connection (WebSocket or BroadcastChannel), not game state; Colyseus replaces it
let isHost = false; // created the room (sent seconds): in tab mode the host plays the server's part

function makeRoomCode() {  // 4 letters A-Z (course format). Not game logic, so real randomness is fine here.
  return Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => String.fromCharCode(65 + (n % 26))).join("");
}

// Same-browser tabs: BroadcastChannel. Pages opened from disk (file://) don't share an origin, so BroadcastChannel
// can't reach the other tab; there, storage events carry the messages instead (Chrome shares localStorage across file://).
function tabChannel(code) {
  if (location.protocol !== "file:") return new BroadcastChannel("tle-" + code);
  const key = "tle-" + code, ch = {};
  ch.postMessage = (msg) => { try { localStorage.setItem(key, JSON.stringify([msg, Math.random()])); } catch (e) { console.error("Can't reach the other tab", e); } };  // random only makes each write unique
  addEventListener("storage", (e) => {
    if (e.key !== key || !e.newValue) return;
    try { ch.onmessage && ch.onmessage({ data: JSON.parse(e.newValue)[0] }); } catch (err) { console.error("Bad tab message", err); }
  });
  return ch;
}

function seedFromCode(code) {  // FNV-1a: same code -> same seed -> same match on both screens
  let h = 2166136261;
  for (const c of code) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

// name: player name. code: room code to create/join (omit for solo). seconds: 60/90/120, only when creating.
function connect(name, code, seconds) {
  if (game.playerName) return;  // already joined (double click)
  game.playerName = name;
  game.code = code ? code.toUpperCase() : null;
  isHost = !!seconds;
  if (seconds) game.loopSeconds = seconds;
  const server = new URLSearchParams(location.search).get("server");
  const join = { type: "join", name, code: game.code, seconds };
  if (server) {
    link = new WebSocket(server);
    link.onopen = () => link.send(JSON.stringify(join));
    link.onmessage = (e) => {
      try { onNetMessage(JSON.parse(e.data)); } catch (err) { console.error("Bad server message", e.data, err); }
    };
    link.onerror = () => say("The line goes dead. Can't reach the server.");
  } else if (game.code) {
    link = tabChannel(game.code);
    link.onmessage = (e) => onTabMessage(e.data, join);
    link.postMessage(join);
    addEventListener("pagehide", () => link.postMessage({ type: "partner-left" }));
  } else {
    return fakePartner();
  }
  render();  // shows "Waiting for your partner…"
}

// Tab mode: the host answers a join with "start" for both sides, like the server would.
function onTabMessage(msg, myJoin) {
  if (!msg) return;
  if (msg.type === "join") {
    if (game.phase !== "lobby") return;
    if (!isHost) { if (msg.seconds) link.postMessage(myJoin); return; }  // host arrived after me: say hi again
    const seed = seedFromCode(game.code), seconds = game.loopSeconds;
    link.postMessage({ type: "start", for: msg.name, partner: game.playerName, role: "B", seed, seconds });
    onNetMessage({ type: "start", partner: msg.name, role: "A", seed, seconds });
    return;
  }
  if (msg.type === "start" && msg.for !== game.playerName) return;  // a start meant for another tab
  onNetMessage(msg);
}

function send(type, data) {
  const msg = { type, ...data };
  if (link instanceof WebSocket) { if (link.readyState === WebSocket.OPEN) link.send(JSON.stringify(msg)); }
  else if (link) link.postMessage(msg);
  if (type === "escaped" && !(link instanceof WebSocket)) checkBothOut();  // no server to send "won"
}

function sendChat(text) {
  text = String(text || "").trim().slice(0, 200);
  if (!text || game.phase !== "playing") return;
  game.chat.push({ from: game.playerName, text });
  send("chat", { text });
  render();
}

function checkBothOut() {
  if (game.flags.escaped && game.partner?.escaped) onNetMessage({ type: "won" });
}

function onNetMessage(msg) {
  switch (msg && msg.type) {
    case "start":
      if (game.phase !== "lobby") return;
      game.partner = { name: msg.partner?.name ?? msg.partner, loop: 1, step: 0, stage: 1, escaped: false };
      game.role = msg.role;
      game.seed = msg.seed >>> 0;
      game.loopSeconds = msg.seconds || game.loopSeconds;
      seedRandom(game.seed);
      game.phase = "playing";
      startLoop();
      break;
    case "progress":
      if (game.partner) Object.assign(game.partner, { loop: msg.loop, step: msg.step, stage: msg.stage || 1 });
      break;
    case "chat":
      if (game.partner && msg.text) game.chat.push({ from: game.partner.name, text: String(msg.text).slice(0, 200) });
      break;
    case "escaped":
      if (game.partner) game.partner.escaped = true;
      if (!(link instanceof WebSocket)) checkBothOut();
      break;
    case "won":
      game.won = true;
      game.phase = "over";  // startLoop's timer sees this and stops
      break;
    case "partner-left":
      if (game.phase !== "playing") return;
      game.phase = "over";  // won stays false: the UI shows "Your partner left"
      break;
    default:
      console.warn("Unknown message", msg);
  }
  render();
}

// Solo: a fake partner in a room you can't see. It chats you the clues that sit in "its" room, then escapes.
const FAKE_SCRIPT = [  // [seconds after start, what it does]
  [6,   (a) => `There's a note for you in my room: "${a.color} - ${a.clicks}". It's in your handwriting. How?`],
  [18,  (a) => (photoIsRemote() ? `My photo has you in it. Back says it's for you: ${a.year}.` : "My photo is for me. Check yours.")],
  [30,  (a) => `A card in my cabinet, for you: your code sleeps in the ${a.casket.toUpperCase()} casket. Don't open the other one.`],
  [45,  (a) => `My casket had a scrap for you: floor ${a.floor}. Something in the other casket is still moving.`],
  [100, () => "I'm out. It's dawn out here. Don't make me leave without you."],
];
function fakePartner() {
  game.code = makeRoomCode();
  onNetMessage({ type: "start", partner: FAKE_PARTNER_NAME, role: "A", seed: seedFromCode(game.code), seconds: game.loopSeconds });
  let t = 0;
  const timer = setInterval(() => {
    if (game.phase !== "playing") return clearInterval(timer);
    t++;
    for (const [at, line] of FAKE_SCRIPT) {
      if (t !== at) continue;
      onNetMessage({ type: "chat", text: line(puzzleAnswers(game.role)) });
      onNetMessage({ type: "progress", loop: 1 + Math.floor(t / game.loopSeconds), step: Math.min(7, Math.round(t / 15)), stage: t < 45 ? 1 : t < 90 ? 2 : 3 });
    }
    if (t === 100) onNetMessage({ type: "escaped" });
  }, 1000);
}
