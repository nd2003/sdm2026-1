// Owner: UI (see README)
// render() redraws everything from `game`. Cheap and idempotent: safe to call every tick.
function render() {
  const $ = (id) => document.getElementById(id);
  const set = (el, prop, v) => { if (el && el["_" + prop] !== v) el[prop] = el["_" + prop] = v; };  // skip writes we already made
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };  // restart a CSS animation

  // Phase: CSS shows the lobby or the game from body[data-phase]
  const phase = game.phase || "lobby";
  document.body.dataset.phase = phase;
  updateSound();

  // Lobby: create or join a room, then "waiting" with the code once connect() has set playerName
  const lobby = $("lobby"), url = new URLSearchParams(location.search);
  set(lobby, "innerHTML", phase !== "lobby" ? "" : game.playerName
    ? `<div class="card"><h1>Time Loop Escape</h1>
        <p class="wait" role="status"><span class="spinner" aria-hidden="true"></span>Waiting for your partner, ${esc(game.playerName)}…</p>
        <p>Send your partner this room code:</p>
        <div class="code-row"><strong id="room-code-shown">${esc(game.code)}</strong><button type="button" id="copy-code">Copy</button></div></div>`
    : `<form class="card" id="lobby-form" novalidate><h1>Time Loop Escape</h1>
        <p>Two people are trapped, and neither gets out alone. Half of your clues are in your partner's room.</p>
        <label for="player-name">Your name</label>
        <input id="player-name" maxlength="20" autocomplete="nickname" placeholder="e.g. Sam" value="${esc(url.get("name") || "")}">
        <div class="ways">
          <div class="way"><h2>Create a room</h2>
            <label for="loop-seconds">Time per loop</label>
            <select id="loop-seconds"><option value="60">60 seconds</option><option value="90">90 seconds</option><option value="120">120 seconds</option></select>
            <button name="how" value="create">Create room</button></div>
          <div class="way"><h2>Join a room</h2>
            <label for="room-code">Room code</label>
            <input id="room-code" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="QXTR" value="${esc((url.get("room") || "").toUpperCase())}">
            <button name="how" value="join">Join room</button></div>
        </div>
        <p id="lobby-error" role="alert" hidden></p>
        <button class="solo" name="how" value="solo">Play alone with a practice partner</button></form>`);
  if (phase === "lobby" && !game.playerName && !lobby._focused) { lobby._focused = true; setTimeout(() => $("player-name")?.focus()); }

  // Partner panel: name, level, loop, progress as 7 steps, and whether they're already out
  const o = game.partner, opp = $("opponent");
  set(opp, "innerHTML", !o ? "" : `<h2>${esc(o.name)} <small>Level ${o.stage || 1}/3 · Loop ${o.loop}</small></h2>
    <ol class="steps" aria-label="${esc(o.name)}: step ${o.step} of 7">`
    + ["Note", "Key", "Cabinet", "PC", "Lv 2", "Casket", "Lv 3"].map((s, i) => `<li${i < o.step ? ' class="done"' : ""}>${s}</li>`).join("") + "</ol>"
    + (o.escaped ? '<p class="partner-out">Escaped, waiting for you</p>' : ""));
  if (o && o.step > (opp._step ?? o.step)) replay(opp, "bump");  // flashes when they get further
  opp._step = o ? o.step : 0;

  // HUD
  const t = Math.max(0, Math.ceil(game.timeLeft)), stage = game.stage || 1, out = !!(game.flags && game.flags.escaped);
  set($("timer"), "textContent", "" + t + "s");
  $("timer").classList.toggle("low", t <= 10 && !out);
  document.body.classList.toggle("hurry", t <= 10 && !out && !game.won && phase === "playing");  // whole room goes red in the last 10s
  $("hud").style.setProperty("--time", Math.min(1, t / (game.loopSeconds || 60)));  // drives the shrinking time bar
  set($("loop-count"), "textContent", `Level ${stage}/3 · Loop ${game.loop}`);
  if (stage > Number(document.body.dataset.stage || stage)) replay($("bonus"), "show");  // +1:00 for reaching a new level
  document.body.dataset.stage = stage;
  if (phase !== "lobby" && $("room")._seed !== game.seed) { $("room")._seed = game.seed; placeObjects(); }

  // Chat: kept across loops, and it scrolls to the newest line
  const log = $("chat-log"), lines = game.chat || [];
  set(log, "innerHTML", lines.length
    ? lines.map((m) => `<li${m.from === game.playerName ? ' class="me"' : ""}><b>${m.from === game.playerName ? "You" : esc(m.from)}:</b> ${esc(m.text)}</li>`).join("")
    : '<li class="empty">Tell your partner what you find. Half of your clues are in their room.</li>');
  if (lines.length !== log._count) { log._count = lines.length; log.scrollTop = log.scrollHeight; }

  // In-game input, whenever an object needs typing
  const box = $("game-input"), asking = phase === "playing" ? game.input : null;
  box.hidden = !asking;
  if (asking && box._for !== asking.for) {
    box._for = asking.for;
    $("game-input-label").textContent = asking.label;
    $("game-input-text").value = "";
    setTimeout(() => $("game-input-text").focus());
  }
  if (!asking) box._for = null;

  // Out of the building, waiting for the partner
  document.body.classList.toggle("waiting", out && phase === "playing");
  const note = $("room").querySelector(".out-note") || $("room").appendChild(Object.assign(document.createElement("div"), { className: "out-note" }));
  set(note, "textContent", out ? `You're out. Talk ${o ? o.name : "your partner"} through it.` : "");

  // Inventory (resets every loop)
  const inv = $("inventory");
  const had = inv._count ?? game.items.length;
  set(inv, "innerHTML", "<h2>Inventory</h2>" + (game.items.length
    ? "<ul>" + game.items.map((i) => `<li>${i === "key" ? '<svg viewBox="0 0 60 28" aria-hidden="true"><path d="M23 14h34M46 14v8M52 14v6" fill="none" stroke="#85683c" stroke-width="4"></path><circle cx="14" cy="14" r="10" fill="none" stroke="#85683c" stroke-width="4"></circle></svg>' : ""}${esc(i)}</li>`).join("") + "</ul>"
    : '<p class="empty">Empty pockets.</p>'));
  inv.querySelectorAll("li").forEach((li, i) => { if (i >= had) li.classList.add("new"); });
  inv._count = game.items.length;

  // Clue journal (survives the reset). The newest clue gets highlighted when it's written.
  const journal = $("journal");
  const known = journal._count ?? game.clues.length;  // first render: nothing counts as new
  set(journal, "innerHTML", "<h2>Journal</h2>" + (game.clues.length
    ? "<ol>" + game.clues.map((c) => `<li>${esc(c)}</li>`).join("") + "</ol>"
    : '<p class="empty">Nothing written yet. Clues you find stay here, even when the loop resets.</p>'));
  journal.querySelectorAll("li").forEach((li, i) => { if (i >= known) li.classList.add("new"); });
  if (game.clues.length > known) journal.scrollTop = journal.scrollHeight;  // show the clue just written
  journal._count = game.clues.length;

  // Message: pops each time an object says something new
  const msg = $("message");
  if (msg.textContent !== (game.message || "")) {
    msg.textContent = game.message || "";
    if (game.message) replay(msg, "pop");
  }
  msg.setAttribute("aria-live", "polite");

  // Room visual states
  const f = game.flags || {};
  $("room").style.setProperty("--dread", Math.min(game.loop, 5));  // the figure stands closer every loop
  $("obj-painting")?.style.setProperty("--clicks", f.paintingClicks || 0);  // tilts a bit more on every click
  $("obj-painting")?.classList.toggle("moved", !!f.paintingMoved);
  $("obj-cabinet")?.classList.toggle("open", !!f.cabinetOpen);
  $("obj-door")?.classList.toggle("unlocked", !!f.doorUnlocked);
  $("obj-computer")?.classList.toggle("unlocked", !!f.doorUnlocked);  // screen turns green after the right password

  // Loop-reset flash when game.loop goes up (last loop stored on the DOM, not as extra global state)
  const prev = Number(document.body.dataset.loop || game.loop);
  if (game.loop > prev) {
    let flash = $("loop-flash");
    if (!flash) {
      flash = document.createElement("div");
      flash.id = "loop-flash";
      flash.setAttribute("role", "status");
      document.body.append(flash);
    }
    flash.innerHTML = `<div>Time's up. The loop resets…<small>Your items are gone, but your journal remembers. Loop ${game.loop}</small></div>`;
    replay(flash, "show");
    replay($("journal"), "remember");  // glows as the flash fades: "your clues survived"
  }
  document.body.dataset.loop = game.loop;

  // End screen: both escaped, or the partner left
  const over = phase === "over";
  let win = $("win");
  if (over && !win) {
    win = document.createElement("div");
    win.id = "win";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", "Result");
    document.body.append(win);
  }
  if (win) {
    win.hidden = !over;
    const who = esc(o ? o.name : "Your partner"), loops = `${game.loop} loop${game.loop === 1 ? "" : "s"}`;
    set(win, "innerHTML", `<div class="${game.won ? "first" : "second"}"><h1>${game.won ? "You both got out" : "Your partner left"}</h1>`
      + `<p>${game.won ? `You and ${who} escaped together after ${loops}.` : `${who} is gone, and nobody leaves floor 14 alone.`}</p>`
      + `<button type="button" onclick="location.reload()">Play again</button></div>`);
    if (over && !win._focused) { win._focused = true; setTimeout(() => win.querySelector("button")?.focus()); }  // keyboard users land on "Play again"
  }
}

// Co-op panels that live for the whole page: chat, the in-game input and the +1:00 flash. Created once, filled by render().
(() => {
  const $ = (id) => document.getElementById(id);
  document.body.insertAdjacentHTML("beforeend", `
    <section id="chat" aria-label="Chat with your partner">
      <h2>Chat</h2>
      <ul id="chat-log" aria-live="polite"></ul>
      <form id="chat-form"><label for="chat-text" class="sr-only">Message</label><input id="chat-text" maxlength="200" autocomplete="off" placeholder="Tell your partner…"><button>Send</button></form>
    </section>
    <form id="game-input" hidden><label id="game-input-label" for="game-input-text"></label>
      <input id="game-input-text" autocomplete="off" spellcheck="false">
      <div class="row"><button>Enter</button><button type="button" id="game-input-cancel">Step back</button></div></form>`);
  $("hud").insertAdjacentHTML("beforeend", '<span id="bonus" aria-hidden="true">+1:00</span>');

  $("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    sendChat($("chat-text").value);
    $("chat-text").value = "";
  });
  $("game-input").addEventListener("submit", (e) => { e.preventDefault(); onInput($("game-input-text").value); });
  $("game-input-cancel").addEventListener("click", () => onInput(null));
  $("game-input").addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); onInput(null); } });

  // The lobby form is redrawn by render(), so its events are handled here.
  $("lobby").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("player-name").value.trim(), code = $("room-code").value.trim().toUpperCase();
    const how = document.activeElement === $("room-code") ? "join" : e.submitter?.value || "create";
    const problem = !name ? "Enter your name first." : how === "join" && !/^[A-Z]{4}$/.test(code) ? "A room code is 4 letters, like QXTR." : "";
    const error = $("lobby-error");
    error.hidden = !problem;
    error.textContent = problem;
    if (problem) return;
    if (how === "create") connect(name, makeRoomCode(), Number($("loop-seconds").value));
    else if (how === "join") connect(name, code);
    else connect(name);
  });
  $("lobby").addEventListener("click", (e) => {
    if (e.target.id !== "copy-code") return;
    const done = () => { e.target.textContent = "Copied"; };
    const fallback = () => {
      const range = document.createRange();
      range.selectNodeContents($("room-code-shown"));
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      e.target.textContent = document.execCommand("copy") ? "Copied" : "Press Ctrl+C";
    };
    if (navigator.clipboard) navigator.clipboard.writeText(game.code).then(done, fallback); else fallback();
  });
})();
// Music and settings. Settings belong to this device, not the match, so they live here and not in `game`.
// The music is generated in the browser, so there are no audio files and it works from file://.
const updateSound = (() => {
  const $ = (id) => document.getElementById(id);
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("tle-settings")) || {}; } catch {}
  const opts = {
    muted: !!saved.muted,
    volume: saved.volume ?? .7,
    noFlicker: saved.noFlicker ?? matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
  const save = () => { try { localStorage.setItem("tle-settings", JSON.stringify(opts)); } catch {} };

  document.body.insertAdjacentHTML("beforeend", `
    <button id="settings-btn" type="button" aria-expanded="false" aria-controls="settings-panel">⚙ Settings</button>
    <div id="settings-panel" role="group" aria-label="Settings" hidden>
      <h2>Settings</h2>
      <button id="set-mute" type="button"></button>
      <label for="set-volume">Music volume</label>
      <input id="set-volume" type="range" min="0" max="1" step="0.05">
      <button id="set-flicker" type="button"></button>
      <p>Stops the flickering light, the screen shake and the flashing static.</p>
    </div>`);

  // Audio graph: everything goes through master, so mute and volume are one setting.
  let ctx, master, bus, echo, filter, droneGain, mode = "", melodyTimer, heartTimer, melodyStep = 0;
  const level = () => (opts.muted ? 0 : opts.volume);
  const fade = (param, to, seconds) => { param.cancelScheduledValues(ctx.currentTime); param.setTargetAtTime(to, ctx.currentTime, seconds / 3); };
  const tone = (type, freq, out, gain = 1) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = gain;
    o.connect(g).connect(out);
    o.start();
    return { o, g };
  };
  const NOTES = [220, 261.63, 233.08, 196, 174.61, 220, 329.63, 311.13];  // A minor, with flat seconds that sound wrong
  const GAPS = [5000, 3500, 7000, 4000, 9000, 3000, 6000, 8000];  // ponytail: fixed order, no random needed
  const note = () => {
    const t = ctx.currentTime, freq = NOTES[melodyStep % NOTES.length];
    for (const [type, f, peak] of [["sine", freq, .13], ["triangle", freq * 2.01, .025]]) {
      const { o, g } = tone(type, f, bus, 0);
      g.connect(echo);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, t + 4);
      o.stop(t + 4.1);
    }
  };
  const melody = () => {
    if (mode === "play") note();
    melodyTimer = setTimeout(melody, GAPS[melodyStep++ % GAPS.length]);
  };
  const thump = (at, peak) => {
    const { o, g } = tone("sine", 62, bus, 0);
    o.frequency.setValueAtTime(62, at);
    o.frequency.exponentialRampToValueAtTime(38, at + .18);
    g.gain.setValueAtTime(peak, at);
    g.gain.exponentialRampToValueAtTime(.001, at + .26);
    o.stop(at + .3);
  };
  const heart = () => { const t = ctx.currentTime; thump(t, .6); thump(t + .22, .4); };
  const deathHit = () => {
    const t = ctx.currentTime;
    for (const [type, f, peak] of [["sine", 38, .8], ["sawtooth", 233.08, .12], ["sawtooth", 246.94, .12], ["sawtooth", 261.63, .12]]) {
      const { o, g } = tone(type, f, bus, 0);
      g.gain.setValueAtTime(peak, t);
      g.gain.exponentialRampToValueAtTime(.001, t + 1.8);
      o.stop(t + 1.9);
    }
  };

  const update = () => {
    const over = game.phase === "over", dead = document.body.classList.contains("dead"), out = game.flags && game.flags.escaped;
    const next = dead ? "dead" : over || game.won ? "end" : game.phase === "playing" ? (game.timeLeft <= 10 && !out ? "hurry" : "play") : "lobby";
    if (!ctx || next === mode) { mode = next; return; }
    mode = next;
    clearInterval(heartTimer);
    fade(filter.frequency, next === "hurry" ? 420 : 170, 1);
    fade(droneGain.gain, { lobby: .6, play: 1, hurry: 1.25, end: 0, dead: 0 }[next], next === "dead" ? .6 : 2);
    if (next === "hurry") { heart(); heartTimer = setInterval(heart, 950); }
    if (next === "dead") setTimeout(deathHit, 900);  // lands as the figure reaches you
    if (next === "dead" || next === "end") clearTimeout(melodyTimer);
  };

  const start = () => {
    if (ctx) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      ctx = new Audio();
      const limiter = ctx.createDynamicsCompressor();
      master = ctx.createGain();
      master.gain.value = level();
      master.connect(limiter).connect(ctx.destination);
      bus = ctx.createGain();
      bus.connect(master);
      const delay = ctx.createDelay(1), feedback = ctx.createGain(), dull = ctx.createBiquadFilter();
      echo = ctx.createGain();
      delay.delayTime.value = .47; feedback.gain.value = .5; dull.type = "lowpass"; dull.frequency.value = 1400;
      echo.connect(delay).connect(dull).connect(feedback).connect(delay);
      dull.connect(bus);
      filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 170;
      droneGain = ctx.createGain();
      droneGain.gain.value = 0;
      filter.connect(droneGain).connect(bus);
      for (const [type, f, gain] of [["sawtooth", 55, .16], ["sawtooth", 55.5, .16], ["sine", 82.41, .2], ["triangle", 110.7, .04]]) tone(type, f, filter, gain);
      tone("sine", .06, filter.frequency, 50);  // the drone slowly breathes
      tone("sawtooth", 120, bus, .006);  // the buzz of the ceiling tube
      mode = "";
      update();
      melody();
      ctx.resume().catch(() => {});
    } catch { ctx = null; }  // no sound is better than a broken game
  };
  // Browsers only allow sound after the player does something.
  for (const type of ["pointerdown", "keydown"]) addEventListener(type, start, { capture: true });
  document.addEventListener("visibilitychange", () => { if (ctx) (document.hidden ? ctx.suspend() : ctx.resume()).catch(() => {}); });

  // Settings panel
  const apply = () => {
    $("set-mute").textContent = opts.muted ? "Unmute music" : "Mute music";
    $("set-mute").setAttribute("aria-pressed", opts.muted);
    $("set-volume").value = opts.volume;
    $("set-flicker").textContent = opts.noFlicker ? "Allow flickering" : "Stop flickering";
    $("set-flicker").setAttribute("aria-pressed", opts.noFlicker);
    document.body.classList.toggle("no-flicker", opts.noFlicker);
    if (ctx) fade(master.gain, level(), .15);
    save();
  };
  const toggle = (open) => {
    $("settings-panel").hidden = !open;
    $("settings-btn").setAttribute("aria-expanded", open);
  };
  $("settings-btn").addEventListener("click", () => toggle($("settings-panel").hidden));
  $("set-mute").addEventListener("click", () => { opts.muted = !opts.muted; apply(); });
  $("set-volume").addEventListener("input", (e) => { opts.volume = +e.target.value; opts.muted = false; apply(); });
  $("set-flicker").addEventListener("click", () => { opts.noFlicker = !opts.noFlicker; apply(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("settings-panel").hidden) { toggle(false); $("settings-btn").focus(); } });
  addEventListener("pointerdown", (e) => { if (!e.target.closest?.("#settings-panel, #settings-btn")) toggle(false); });
  apply();
  return update;
})();
