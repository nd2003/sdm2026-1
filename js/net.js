// Owner: mechanics dev (see AGENTS.md "Co-op v2")
// Three ways to play, picked in connect():
// - ?server=ws://... : the relay server pairs the two players.
// - a room code, no server: two tabs in the same browser pair up through BroadcastChannel (real 2-player, no backend).
// - no code: solo, with a fake partner who chats you the clues from "their" room.

let link = null;    // ponytail: net.js's own connection (WebSocket or BroadcastChannel), not game state; Colyseus replaces it
let isHost = false; // created the room (sent seconds): in tab mode the host plays the server's part
let tabId = null;   // tab mode: tells tabs apart even when both players use the same name

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
  if (link || game.phase !== "lobby") return;  // already joined or waiting (double click)
  game.playerName = name;
  game.code = code ? code.toUpperCase() : null;
  isHost = !!seconds;
  // 60/90/120 for everyone; 600 only for the name admin (ponytail: testing cheat, a ?debug option in the port).
  // Anything else falls back to 60.
  if (seconds) seconds = [60, 90, 120].includes(seconds) || (seconds === 600 && isAdmin()) ? seconds : 60;
  if (seconds) game.loopSeconds = seconds;
  const server = new URLSearchParams(location.search).get("server");
  tabId = makeRoomCode() + makeRoomCode();
  const join = { type: "join", name, code: game.code, seconds, id: tabId };
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
    addEventListener("pagehide", () => link && link.postMessage({ type: "partner-left" }));
    if (!isHost) setTimeout(() => {  // nobody created this code (or it's a typo): say so instead of waiting forever
      if (game.phase === "lobby" && game.playerName) say(`Still waiting. Nobody has opened room ${game.code} yet. Check the code, or ask your partner to create it.`);
    }, CONFIG.joinWaitSeconds * 1000);
  } else {
    return fakePartner();
  }
  render();  // shows "Waiting for your partner…"
}

// Tab mode: the host answers a join with "start" for both sides, like the server would.
function onTabMessage(msg, myJoin) {
  if (!msg) return;
  if (msg.type === "join") {
    if (game.phase !== "lobby") { if (isHost) link.postMessage({ type: "full", for: msg.id }); return; }  // a third tab
    if (!isHost) { if (msg.seconds) link.postMessage(myJoin); return; }  // host arrived after me: say hi again
    const seed = seedFromCode(game.code), seconds = game.loopSeconds;
    link.postMessage({ type: "start", for: msg.id, partner: game.playerName, role: "B", seed, seconds });
    onNetMessage({ type: "start", partner: msg.name, role: "A", seed, seconds });
    return;
  }
  if ((msg.type === "start" || msg.type === "full") && msg.for !== tabId) return;  // meant for another tab
  if (msg.type === "leave") msg = { type: "partner-left" };  // tab mode: no server to translate it
  onNetMessage(msg);
}

function send(type, data) {
  const msg = { type, ...data };
  if (link instanceof WebSocket) { if (link.readyState === WebSocket.OPEN) link.send(JSON.stringify(msg)); }
  else if (link) link.postMessage(msg);
  if (type === "escaped" && !(link instanceof WebSocket)) checkBothOut();  // no server to send "won"
}

function sendChat(text) {
  text = String(text || "").trim().slice(0, CONFIG.chatMax);
  if (!text || game.phase !== "playing") return;
  game.chat.push({ from: game.playerName, text, mine: true });  // mine: works even if both players share a name
  send("chat", { text });
  render();
}

// Quit: tell the partner (they get partner-left), go back to the lobby, keep the name for the next game.
function quitGame() {
  if (game.phase === "lobby" && !link) return;
  send("leave", {});
  if (link && link.close) link.close();
  link = null;
  isHost = false;
  Object.assign(game, {
    phase: "lobby", code: null, role: null, seed: 0, partner: null, chat: [], clues: [], items: [], flags: {},
    message: "", messageKind: "", won: false, stage: 1, loop: 1, input: null, timeLeft: game.loopSeconds,
  });  // playerName stays
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
      say(openingLine(1));
      break;
    case "progress": {
      if (!game.partner) break;
      const before = game.partner.stage, stage = msg.stage || 1;
      Object.assign(game.partner, { loop: msg.loop, step: msg.step, stage });
      if (stage > before && game.phase === "playing" && !game.flags.escaped)  // tell the player their partner moved on
        say(`${game.partner.name} reached ${stage === 2 ? "the casket corridor" : "the lift shaft"}.`);
      break;
    }
    case "chat":
      if (game.partner && msg.text) game.chat.push({ from: game.partner.name, text: String(msg.text).slice(0, CONFIG.chatMax) });
      break;
    case "escaped":
      if (game.partner) game.partner.escaped = true;
      if (game.partner && !game.flags.escaped) say(`${game.partner.name} made it out. They're waiting for you. Ask them what they know.`);
      if (!(link instanceof WebSocket)) checkBothOut();
      break;
    case "won":
      game.won = true;
      game.phase = "over";  // startLoop's timer sees this and stops
      break;
    case "full":  // the room already has two players: back to the lobby form
      if (game.phase !== "lobby") return;
      say(`Room ${game.code} is already full. Pick another code, or create your own room.`);
      if (link && link.close) link.close();
      link = null;
      game.playerName = null;
      game.code = null;
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
const FAKE_LINES = [  // [its progress step, what it says], sent at CONFIG.fakePartner.clueAt[i], then it escapes
  [1, (a) => `There's a note for you in my room: "${a.color} - ${a.clicks}". It's in your handwriting. How?`],
  [3, (a) => (photoIsRemote() ? `Your computer password is ${a.year}. It's on the photo in my room.` : "The photo in my room has my year. Yours is on your photo.")],
  [5, (a) => `A card in my cabinet, for you: your code sleeps in the ${a.casket.toUpperCase()} casket. Don't open the other one.`],
  [6, (a) => `My casket had a scrap for you: the vent code is ${a.vent}. Something in the other casket is still moving.`],
];
function fakePartner() {
  const fake = CONFIG.fakePartner;
  game.code = makeRoomCode();
  onNetMessage({ type: "start", partner: fake.name, role: "A", seed: seedFromCode(game.code), seconds: game.loopSeconds });
  let t = 0;
  const timer = setInterval(() => {
    if (game.phase !== "playing") return clearInterval(timer);
    t++;
    const i = fake.clueAt.indexOf(t);
    if (i >= 0 && FAKE_LINES[i]) {
      const [step, line] = FAKE_LINES[i];
      onNetMessage({ type: "chat", text: line(puzzleAnswers(game.role)) });
      onNetMessage({ type: "progress", loop: 1, step, stage: step >= 5 ? 2 : 1 });  // it never loops
    }
    if (t === fake.escapeAt) {
      onNetMessage({ type: "chat", text: "I'm out. It's dawn out here. Don't make me leave without you." });
      onNetMessage({ type: "progress", loop: 1, step: 7, stage: 3 });
      onNetMessage({ type: "escaped" });
    }
  }, 1000);
}
