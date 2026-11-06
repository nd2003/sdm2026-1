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

  // Lobby: name + Join, then "waiting" once connect() has set playerName
  const lobby = $("lobby");
  set(lobby, "innerHTML", phase !== "lobby" ? "" : game.playerName
    ? `<div class="card"><h1>Time Loop Escape</h1><p class="wait" role="status"><span class="spinner" aria-hidden="true"></span>Waiting for an opponent, ${esc(game.playerName)}…</p></div>`
    : `<form class="card"><h1>Time Loop Escape</h1>
        <p>Race another player out of a room that resets every 60 seconds. Your items vanish each loop. Your clues don't.</p>
        <label for="player-name">Your name</label>
        <div class="row"><input id="player-name" required maxlength="20" autocomplete="nickname" placeholder="e.g. Abdallah"><button>Join</button></div></form>`);
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
      : `<div class="${first ? "first" : "second"}"><h1>${first ? "You escaped first!" : "You died"}</h1>`
        + `<p>${first ? `${esc(game.opponent?.name || "Your opponent")} didn't make it. It took you ${loops}.` : `${esc(game.winner || "Your opponent")} escaped first. You were on loop ${game.loop}.`}</p>`
        + `<button type="button" onclick="location.reload()">Play again</button></div>`);
    if (over && !win._focused) { win._focused = true; setTimeout(() => win.querySelector("button")?.focus()); }  // keyboard users land on "Play again"
  }
}

// TEMP STUBS: delete once state.js / puzzles.js / main.js are merged
if (typeof onObjectClick === "undefined") {
  window.onObjectClick = (id) => { game.message = "Clicked " + id; render(); };
}
if (typeof connect === "undefined") window.connect = (name) => { game.playerName = name; game.phase = "playing"; game.opponent = { name: "Bot", loop: 1, step: 2 }; render(); };
if (typeof startLoop === "undefined") { buildRoom(); render(); }
