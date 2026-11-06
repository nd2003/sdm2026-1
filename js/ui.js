// Owner: UI (see README)
// render() redraws everything from `game`. Cheap and idempotent: safe to call every tick.
function render() {
  const $ = (id) => document.getElementById(id);
  const set = (el, prop, v) => { if (el && el["_" + prop] !== v) el[prop] = el["_" + prop] = v; };  // skip writes we already made
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };  // restart a CSS animation

  // HUD
  const t = Math.max(0, Math.ceil(game.timeLeft));
  set($("timer"), "textContent", "⏳ " + t + "s");
  $("timer").classList.toggle("low", t <= 10);
  document.body.classList.toggle("hurry", t <= 10 && !game.won);  // whole room goes red in the last 10s
  $("hud").style.setProperty("--time", t / 60);  // drives the shrinking time bar
  set($("loop-count"), "textContent", "Loop " + game.loop);

  // Inventory (resets every loop)
  const inv = $("inventory");
  const had = inv._count ?? game.items.length;
  set(inv, "innerHTML", "<h2>Inventory</h2>" + (game.items.length
    ? "<ul>" + game.items.map((i) => `<li>${i === "key" ? "🔑 " : ""}${esc(i)}</li>`).join("") + "</ul>"
    : '<p class="empty">Empty pockets.</p>'));
  inv.querySelectorAll("li").forEach((li, i) => { if (i >= had) li.classList.add("new"); });
  inv._count = game.items.length;

  // Clue journal (survives the reset). The newest clue gets highlighted when it's written.
  const journal = $("journal");
  const known = journal._count ?? game.clues.length;  // first render: nothing counts as new
  set(journal, "innerHTML", "<h2>📓 Journal</h2>" + (game.clues.length
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
  $("obj-painting")?.style.setProperty("--clicks", f.paintingClicks || 0);  // tilts a bit more on every click
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
    flash.innerHTML = `<div>⏰ Time's up. The loop resets…<small>Your items are gone, but your journal remembers. Loop ${game.loop}</small></div>`;
    replay(flash, "show");
    replay($("journal"), "remember");  // glows as the flash fades: "your clues survived"
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
    setTimeout(() => win.querySelector("button")?.focus());  // keyboard users land on "Play again"
  }
  if (win) {
    win.hidden = !game.won;
    set(win, "innerHTML", `<div><h1>🎉 You escaped!</h1><p>It took you ${game.loop} loop${game.loop === 1 ? "" : "s"}, with ${t}s left on the clock.</p>`
      + `<button type="button" onclick="location.reload()">Play again</button></div>`);
  }
}

// TEMP STUBS: delete once state.js / puzzles.js / main.js are merged
if (typeof onObjectClick === "undefined") {
  window.onObjectClick = (id) => { game.message = "Clicked " + id; render(); };
}
if (typeof startLoop === "undefined") { buildRoom(); render(); }
