// Owner: Core loop (see README)
// The ONLY shared state. Everyone reads it; change it only through the functions below.
// Every tuning number in the game, in one place. In the course port this becomes config/game.json.
const CONFIG = {
  loopSeconds: 60,        // default loop length; the room creator picks 60 / 90 / 120
  levelBonus: 60,         // seconds added when you enter level 2 and level 3
  wrongCodeLock: 5,       // seconds an input stays locked after a wrong code
  vampireDrain: 20,       // seconds the wrong casket takes
  hintAfter: 25,          // seconds stuck on the same step before a whisper hints at it (0 = no hints)
  demoSkip: false,        // demo mode: anyone may skip levels (main.js turns it on for ?debug in the URL)
  night: "13 October",    // the night that repeats every year
  painting: { colors: ["BLUE", "RED", "GREEN", "WHITE", "BLACK"], minClicks: 3, maxClicks: 6 },
  years: [1950, 1999],    // computer passwords are picked from this range
  keypadDigits: 3,        // level 2 exit code length
  floors: [2, 19],        // level 3 lift floors
  chatMax: 200,           // characters per chat line
  joinWaitSeconds: 15,    // tab mode: tell a joiner nobody opened the room yet
  fakePartner: {          // solo practice partner: when it sends each clue, and when it escapes
    name: "The Other",
    clueAt: [6, 18, 30, 45],
    escapeAt: 100,
  },
};

const game = {
  loop: 1,
  timeLeft: CONFIG.loopSeconds,
  items: [],     // resets every loop
  flags: {},     // resets every loop: e.g. { paintingClicks: 2, cabinetOpen: true }. flags.escaped = I'm out (my timer stops)
  clues: [],     // KEPT across loops: e.g. ["BLUE - 4"]
  message: "",   // resets every loop: last thing an object "said"
  won: false,    // true once BOTH players escaped
  stage: 1,      // level 1 office -> 2 corridors -> 3 lift shaft; back to 1 every loop
  input: null,   // { for: "<object id>", label } while the UI shows the in-game input; onInput() answers it
  // co-op match (never reset by a loop)
  phase: "lobby",     // "lobby" -> "playing" -> "over"
  playerName: null,
  code: null,         // 4-letter room code, null when playing solo
  role: null,         // "A" (created the room) or "B"
  seed: 0,            // from the room code: the only source of randomness in game logic
  loopSeconds: CONFIG.loopSeconds,
  partner: null,      // { name, loop, step, stage, escaped } once the match starts
  chat: [],           // [{ from, text }], kept across loops
};

// Seeded random (mulberry32). Game logic never uses Math.random(), so a room code always gives the same match.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let nextRandom = mulberry32(0);  // ponytail: the PRNG's position (not game state), restarted from game.seed when a match starts
function seedRandom(seed) { nextRandom = mulberry32(seed); }
function rand() { return nextRandom(); }  // 0 <= rand() < 1

function startLoop() {
  const loop = game.loop;
  game.timeLeft = game.loopSeconds;
  const timer = setInterval(() => {
    // no global handle: a finished loop's timer stops itself. The timer is just a counter (no Date.now).
    if (game.phase === "over" || game.flags.escaped || game.loop !== loop) return clearInterval(timer);
    if (isAdmin() && game.timeLeft <= 1) return render();  // ponytail: testing cheat (puzzles.js), admin's clock never runs out
    game.timeLeft--;
    if (game.timeLeft <= 0) return resetLoop();
    hintTick();  // puzzles.js: a whisper when you've been stuck too long
    render();
  }, 1000);
  render();
}

function resetLoop() {
  game.items = [];
  game.flags = {};
  game.message = "";
  game.input = null;
  game.stage = 1;  // back to level 1, everything relocked
  game.loop++;     // never touch game.clues or game.chat here
  send("progress", { loop: game.loop, step: 0, stage: 1 });
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
