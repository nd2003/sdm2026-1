// Owner: UI (see README)
// render() redraws everything from `game`. Cheap and idempotent: safe to call every tick.
function render() {
  const $ = (id) => document.getElementById(id);
  const set = (el, prop, v) => { if (el && el[prop] !== v) el[prop] = v; };  // skip no-op DOM writes
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // HUD
  const t = Math.max(0, Math.ceil(game.timeLeft));
  set($("timer"), "textContent", "⏳ " + t + "s");
  $("timer").classList.toggle("low", t <= 10);
  set($("loop-count"), "textContent", "Loop " + game.loop);

  // Inventory (resets every loop)
  set($("inventory"), "innerHTML", "<h2>Inventory</h2>" + (game.items.length
    ? "<ul>" + game.items.map((i) => `<li>${i === "key" ? "🔑 " : ""}${esc(i)}</li>`).join("") + "</ul>"
    : '<p class="empty">Empty pockets.</p>'));

  // Clue journal (survives the reset)
  set($("journal"), "innerHTML", "<h2>📓 Journal</h2>" + (game.clues.length
    ? "<ol>" + game.clues.map((c) => `<li>${esc(c)}</li>`).join("") + "</ol>"
    : '<p class="empty">Nothing written yet…</p>'));

  // Message
  set($("message"), "textContent", game.message || "");
  $("message").setAttribute("aria-live", "polite");

  // Room visual states
  const f = game.flags || {};
  $("obj-painting")?.classList.toggle("moved", !!f.paintingMoved);
  $("obj-cabinet")?.classList.toggle("open", !!f.cabinetOpen);
  $("obj-door")?.classList.toggle("unlocked", !!f.doorUnlocked);

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
    flash.textContent = "⏰ Time's up. The loop resets… (Loop " + game.loop + ")";
    flash.classList.remove("show");
    void flash.offsetWidth;  // restart the CSS animation
    flash.classList.add("show");
  }
  document.body.dataset.loop = game.loop;

  // Win screen
  let win = $("win");
  if (game.won && !win) {
    win = document.createElement("div");
    win.id = "win";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", "You escaped");
    document.body.append(win);
  }
  if (win) {
    win.hidden = !game.won;
    set(win, "innerHTML", `<div><h1>🎉 You escaped!</h1><p>It took you ${game.loop} loop${game.loop === 1 ? "" : "s"}.</p>`
      + `<button type="button" onclick="location.reload()">Play again</button></div>`);
  }
}

// TEMP STUBS: delete once state.js / puzzles.js / main.js are merged
if (typeof onObjectClick === "undefined") {
  window.onObjectClick = (id) => { game.message = "Clicked " + id; render(); };
}
if (typeof startLoop === "undefined") { buildRoom(); render(); }
