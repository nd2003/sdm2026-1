/**
 * Time Loop Escape HUD: the timer with its shrinking time bar, the level and loop count, the object message,
 * the inventory (lost every loop) and the clue journal (kept across loops). Ported from render() in the team's
 * plain-JS game (games/team-3/timeloop-escape/js/ui.js). It only shows the state it is given.
 */

/** What the HUD shows. Everything comes from the server state. */
export interface HudView {
  timeLeft: number;
  loopSeconds: number;
  loop: number;
  stage: number;
  items: string[];
  clues: string[];
  message: string;
  escaped: boolean;
}

const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Creates the HUD elements inside root, with the ids room.css styles. */
export function mountHud(root: HTMLElement): void {
  root.insertAdjacentHTML(
    "beforeend",
    `<div id="hud"><span id="timer" role="timer" aria-live="off">60s</span><span id="loop-count">Level 1/3 · Loop 1</span></div>
    <div id="message" role="status" aria-live="polite"></div>
    <div id="inventory"></div>
    <div id="journal"></div>`,
  );
}

/** Shows the given state. New items and clues get the "new" class, so they flash once. */
export function updateHud(root: HTMLElement, view: HudView): void {
  const $ = (id: string): HTMLElement => root.querySelector(`#${id}`) as HTMLElement;
  const t = Math.max(0, Math.ceil(view.timeLeft));
  const timer = $("timer");
  timer.textContent = `${t}s`;
  timer.classList.toggle("low", t <= 10 && !view.escaped);
  $("hud").style.setProperty("--time", String(Math.min(1, t / (view.loopSeconds || 60))));
  $("loop-count").textContent = `Level ${view.stage}/3 · Loop ${view.loop}`;

  const msg = $("message");
  if (msg.textContent !== view.message) {
    msg.textContent = view.message;
    msg.classList.remove("pop");
    void msg.offsetWidth; // restart the pop animation
    msg.classList.add("pop");
  }

  // Inventory: resets every loop
  const inv = $("inventory");
  const had = Number(inv.dataset.count ?? view.items.length);
  inv.innerHTML = `<h2>Inventory</h2>${
    view.items.length
      ? `<ul>${view.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
      : '<p class="empty">Empty pockets.</p>'
  }`;
  for (const [i, li] of inv.querySelectorAll("li").entries()) if (i >= had) li.classList.add("new");
  inv.dataset.count = String(view.items.length);

  // Journal: survives the reset, and scrolls to the clue just written
  const journal = $("journal");
  const known = Number(journal.dataset.count ?? view.clues.length);
  journal.innerHTML = `<h2>Journal</h2>${
    view.clues.length
      ? `<ol>${view.clues.map((c) => `<li${c.startsWith("Memory:") ? ' class="memory"' : ""}>${esc(c)}</li>`).join("")}</ol>`
      : '<p class="empty">Nothing written yet. Clues you find stay here, even when the loop resets.</p>'
  }`;
  for (const [i, li] of journal.querySelectorAll("li").entries()) if (i >= known) li.classList.add("new");
  if (view.clues.length > known) journal.scrollTop = journal.scrollHeight;
  journal.dataset.count = String(view.clues.length);
}
