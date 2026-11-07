/**
 * Time Loop Escape screens (owner: Abdullah, team port file split): the lobby with the loop-length
 * picker, the loop-reset overlay, the end cards, the quit confirm and the first-start "How co-op works"
 * card. Baasanjav's client owns the room art and in-game UI; these screens only use his colour and
 * font tokens (CSS variables in screens.css, with fallbacks).
 */
import "./screens.css";
import type { Player, TimeLoopState } from "../shared/index.ts";

const LOOP_CHOICES = [60, 90, 120] as const;
const AUTO_RETURN_SECONDS = 20;
const COOP_SEEN_KEY = "tle:coopSeen";

const esc = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Moves keyboard focus to the first button or field of a freshly shown screen. */
function focusFirst(el: HTMLElement): void {
  setTimeout(() => el.querySelector<HTMLElement>("input:not([type=radio]), input:checked, button")?.focus());
}
function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // private mode or blocked storage: show the card again, nothing breaks
  }
}
function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore: only a convenience
  }
}

// ---------- lobby ----------
export interface LobbyOptions {
  name?: string;
  code?: string;
  error?: string;
  build?: string;
}
export interface LobbyActions {
  create(name: string, seconds: 60 | 90 | 120): void;
  join(name: string, code: string): void;
}

/** Lobby: name, Create with the loop-length picker, or Join with a 4-letter code. */
export function renderLobby(root: HTMLElement, opts: LobbyOptions, actions: LobbyActions): void {
  root.innerHTML = `
    <main class="tle-screen tle-lobby">
      <h1 class="tle-title">Time Loop Escape</h1>
      <p class="tle-sub">Two night auditors sign in at 23:59. The door only ever lets one out.</p>
      <form class="tle-card" novalidate>
        <label class="tle-field">Your name
          <input name="name" maxlength="20" autocomplete="nickname" value="${esc(opts.name ?? "")}" required>
        </label>
        <fieldset class="tle-loops">
          <legend>Time per loop</legend>
          ${LOOP_CHOICES.map(
            (s) => `
            <label class="tle-loop">
              <input type="radio" name="seconds" value="${s}" ${s === 60 ? "checked" : ""}>
              <span class="tle-tag" aria-hidden="true">${s}<small>s</small></span>
              <span class="tle-sr">${s} seconds</span>
            </label>`,
          ).join("")}
        </fieldset>
        <button class="tle-btn" name="how" value="create">Create room</button>
        <div class="tle-or">or</div>
        <label class="tle-field">Room code
          <input name="code" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false"
                 placeholder="QXTR" value="${esc((opts.code ?? "").toUpperCase())}">
        </label>
        <button class="tle-btn tle-btn-quiet" name="how" value="join">Join room</button>
        <p class="tle-error" role="alert" ${opts.error ? "" : "hidden"}>${esc(opts.error ?? "")}</p>
      </form>
      ${opts.build ? `<p class="tle-build">${esc(opts.build)}</p>` : ""}
    </main>`;
  const form = root.querySelector("form") as HTMLFormElement;
  const error = root.querySelector(".tle-error") as HTMLElement;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const code = String(data.get("code") ?? "")
      .trim()
      .toUpperCase();
    const how = (e.submitter as HTMLButtonElement | null)?.value ?? (code ? "join" : "create");
    const problem = !name
      ? "Enter your name first."
      : how === "join" && !/^[A-Z]{4}$/.test(code)
        ? "A room code is 4 letters, like QXTR."
        : "";
    error.hidden = !problem;
    error.textContent = problem;
    if (problem) return;
    if (how === "join") actions.join(name, code);
    else actions.create(name, Number(data.get("seconds") ?? 60) as 60 | 90 | 120);
  });
  focusFirst(root);
}

// ---------- in-game overlays: reset, end, quit confirm, how co-op works ----------
export interface ScreenActions {
  /** Send `leave` and go back to the lobby (the name is kept). */
  quit(): void;
  /** Back to the lobby to start a new room. */
  mainMenu(): void;
  /** A new room with the same name and loop length. */
  playAgain(): void;
}

let layer: HTMLElement | null = null;
let shownKey = "";
let quitAsked = false;
let dismissedResetLoop = 0;
let coopDismissed = false;
let countdown: ReturnType<typeof setInterval> | null = null;

function overlay(): HTMLElement {
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "tle-overlays";
    document.body.append(layer);
    layer.addEventListener("click", (e) => {
      const act = (e.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act;
      if (act)
        actionsRef?.[act as keyof ScreenActions | "dismiss-reset" | "dismiss-coop" | "cancel-quit"]?.();
    });
  }
  return layer;
}
type AllActions = ScreenActions & Record<string, () => void>;
let actionsRef: AllActions | null = null;

/** Opens the in-game quit confirm (the HUD and ⚙ Quit buttons call this). */
export function askQuit(): void {
  quitAsked = true;
  shownKey = ""; // redraw on the next sync
}

/** Call every frame with the synced state: shows the right overlay, or none. Cheap when nothing changes. */
export function syncScreens(state: TimeLoopState, myId: string, actions: ScreenActions): void {
  const me = state.players.get(myId);
  const partner = [...state.players.entries()].find(([id]) => id !== myId)?.[1];
  actionsRef = {
    ...actions,
    "dismiss-reset": () => {
      dismissedResetLoop = me?.loop ?? 0;
      shownKey = "";
    },
    "dismiss-coop": () => {
      coopDismissed = true;
      storageSet(COOP_SEEN_KEY, "1");
      shownKey = "";
    },
    "cancel-quit": () => {
      quitAsked = false;
      shownKey = "";
    },
    quit: () => {
      quitAsked = false;
      shownKey = "";
      actions.quit();
    },
  };
  const [key, html] = pick(state, me, partner);
  if (key === shownKey) return;
  shownKey = key;
  const el = overlay();
  el.classList.toggle("tle-no-motion", reducedMotion());
  el.innerHTML = html;
  if (html) focusFirst(el);
  if (countdown) clearInterval(countdown);
  countdown = null;
  const timer = el.querySelector<HTMLElement>("[data-countdown]");
  if (timer) {
    let left = AUTO_RETURN_SECONDS;
    countdown = setInterval(() => {
      left--;
      timer.textContent = String(left);
      if (left <= 0 && countdown) {
        clearInterval(countdown);
        actions.mainMenu();
      }
    }, 1000);
  }
}

/** Which overlay belongs on screen now, as [cache key, html]. */
function pick(state: TimeLoopState, me: Player | undefined, partner: Player | undefined): [string, string] {
  if (!me) return ["none", ""];
  const loops = (n: number) => `${n} loop${n === 1 ? "" : "s"}`;
  const endButtons = `
    <div class="tle-row">
      <button class="tle-btn" data-act="playAgain">Play again</button>
      <button class="tle-btn tle-btn-quiet" data-act="mainMenu">Main menu</button>
    </div>
    <p class="tle-small">Back to the main menu in <span data-countdown>${AUTO_RETURN_SECONDS}</span>s</p>`;
  if (state.phase === "over" && state.won)
    return [
      "won",
      card(
        "won",
        "YOU BOTH ESCAPED",
        `<p>${esc(me.name)} (${loops(me.loop)}) and ${esc(partner?.name ?? "your partner")} (${loops(partner?.loop ?? 1)}).</p>
       <p class="tle-small">For the first time, two names are signed out of the visitor log.</p>${endButtons}`,
      ),
    ];
  if (state.phase === "over" && state.partnerLeft)
    return [
      "left",
      card("left", "GAME OVER", `<p>Your partner left. Nobody leaves floor 14 alone.</p>${endButtons}`),
    ];
  if (quitAsked)
    return [
      "quit",
      card(
        "quit",
        "Leave the room?",
        `<p>Your partner will be left alone on floor 14, and their game ends.</p>
       <div class="tle-row"><button class="tle-btn tle-btn-quiet" data-act="cancel-quit">Stay</button>
       <button class="tle-btn tle-btn-blood" data-act="quit">Quit</button></div>`,
        "alertdialog",
      ),
    ];
  if (me.escaped)
    return [
      `out:${partner?.stage}`,
      card(
        "out",
        "You're out",
        `<p>Waiting for ${esc(partner?.name ?? "your partner")}… (level ${partner?.stage ?? "?"}/3)</p>
       <p class="tle-small">Keep talking them through it in the chat.</p>`,
        "status",
        true,
      ),
    ];
  if (me.flags.get("justReset") && dismissedResetLoop !== me.loop)
    return [
      `reset:${me.loop}`,
      card(
        "reset",
        `TIME RAN OUT: LOOP ${me.loop}`,
        `<p>Lost: ${["key", "fuse", "your place on level 2 and 3"].map((x) => `<s>${x}</s>`).join(", ")}</p>
       <p>Journal kept: <b>${me.clues.length}</b> clue${me.clues.length === 1 ? "" : "s"}</p>
       <button class="tle-btn" data-act="dismiss-reset">Back to the office</button>`,
      ),
    ];
  if (state.phase === "playing" && me.loop === 1 && !coopDismissed && !storageGet(COOP_SEEN_KEY))
    return [
      "coop",
      card(
        "coop",
        "How co-op works",
        `<ol>
         <li>You and your partner are in the same building, but each of you has your own room.</li>
         <li><b>Half of your clues are in their room.</b> Anything that says "this isn't for you" belongs to them: read it out in the chat.</li>
         <li>When time runs out the loop resets: items are lost, the journal stays.</li>
         <li>Nobody wins alone. You both have to get out.</li>
       </ol>
       <button class="tle-btn" data-act="dismiss-coop">Got it</button>`,
      ),
    ];
  return ["none", ""];
}

function card(kind: string, title: string, body: string, role = "dialog", passThrough = false): string {
  return `<div class="tle-scrim ${passThrough ? "tle-pass" : ""}">
    <section class="tle-card tle-${kind}" role="${role}" aria-modal="${!passThrough}" aria-labelledby="tle-h-${kind}">
      <h2 id="tle-h-${kind}">${title}</h2>${body}
    </section></div>`;
}
