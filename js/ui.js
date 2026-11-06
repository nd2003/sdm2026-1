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

  // Lobby: name + Join, then "waiting" once connect() has set playerName
  const lobby = $("lobby");
  set(lobby, "innerHTML", phase !== "lobby" ? "" : game.playerName
    ? `<div class="card"><h1>Time Loop Escape</h1><p class="wait" role="status"><span class="spinner" aria-hidden="true"></span>Waiting for an opponent, ${esc(game.playerName)}…</p></div>`
    : `<form class="card"><h1>Time Loop Escape</h1>
        <p>Race another player out of a room that resets every 60 seconds. Your items vanish each loop. Your clues don't.</p>
        <label for="player-name">Your name</label>
        <div class="row"><input id="player-name" required maxlength="20" autocomplete="nickname" placeholder="e.g. Sam"><button>Join</button></div></form>`);
  const form = lobby.querySelector("form");
  if (form && !form.onsubmit) {
    form.onsubmit = (e) => { e.preventDefault(); const name = $("player-name").value.trim(); if (name) connect(name); };
    setTimeout(() => $("player-name")?.focus());
  }

  // Opponent panel: name, loop, progress as 5 steps (1 clue, 2 key, 3 cabinet, 4 door unlocked, 5 escaped)
  const o = game.opponent, opp = $("opponent");
  set(opp, "innerHTML", !o ? "" : `<h2>${esc(o.name)} <small>Loop ${o.loop}</small></h2>
    <ol class="steps" aria-label="${esc(o.name)}: step ${o.step} of 5">`
    + ["Clue", "Key", "Cabinet", "Door", "Out"].map((s, i) => `<li${i < o.step ? ' class="done"' : ""}>${s}</li>`).join("") + "</ol>");
  if (o && o.step > (opp._step ?? o.step)) replay(opp, "bump");  // flashes when they get closer
  opp._step = o ? o.step : 0;

  // HUD
  const t = Math.max(0, Math.ceil(game.timeLeft));
  set($("timer"), "textContent", "" + t + "s");
  $("timer").classList.toggle("low", t <= 10);
  document.body.classList.toggle("hurry", t <= 10 && !game.won && phase === "playing");  // whole room goes red in the last 10s
  $("hud").style.setProperty("--time", t / 60);  // drives the shrinking time bar
  set($("loop-count"), "textContent", "Loop " + game.loop);

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

  // End screen: race result once the server picks a winner; "checking" while we wait for it after walking out
  const over = phase === "over", showEnd = over || game.won;
  let win = $("win");
  if (showEnd && !win) {
    win = document.createElement("div");
    win.id = "win";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", "Race result");
    document.body.append(win);
  }
  if (win) {
    win.hidden = !showEnd;
    const first = game.winner === game.playerName;
    document.body.classList.toggle("dead", over && !first);  // plays the death scene in style.css
    const loops = `${game.loop} loop${game.loop === 1 ? "" : "s"}`;
    set(win, "innerHTML", !over
      ? `<div><h1>You're out!</h1><p class="wait"><span class="spinner" aria-hidden="true"></span>Checking who escaped first…</p></div>`
      : `<div class="${first ? "first" : "second"}"><h1>${!first ? "You died" : game.won ? "You escaped first!" : "You win"}</h1>`
        + `<p>${first ? (game.won ? `${esc(game.opponent?.name || "Your opponent")} didn't make it. It took you ${loops}.` : `${esc(game.opponent?.name || "Your opponent")} left the race.`) : `${esc(game.winner || "Your opponent")} escaped first. You were on loop ${game.loop}.`}</p>`
        + `<button type="button" onclick="location.reload()">Play again</button></div>`);
    if (over && !win._focused) { win._focused = true; setTimeout(() => win.querySelector("button")?.focus()); }  // keyboard users land on "Play again"
  }
}

// Music and settings. Settings belong to this device, not the race, so they live here and not in `game`.
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
    <button id="settings-btn" type="button" aria-expanded="false" aria-controls="settings-panel">Settings</button>
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
    const over = game.phase === "over", dead = over && game.winner !== game.playerName;
    const next = dead ? "dead" : over || game.won ? "end" : game.phase === "playing" ? (game.timeLeft <= 10 ? "hurry" : "play") : "lobby";
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
