/**
 * Time Loop Escape dev client (placeholder). A plain-text view of the server-authoritative game so
 * the room logic can be played and tested: one button per object on your level, the input box, chat
 * and the journal. Baasanjav's client port (team issue #19) replaces the view with the real art.
 * Keeps the platform pieces: lobby (create / join by code), F8 bug reports and the ~ debug console
 * (`skip` jumps a level, debug builds only).
 */
import { Client, type Room } from "@colyseus/sdk";
import {
  type BuildInfo,
  buildInviteLink,
  createBugReporter,
  createDebugOverlay,
  createFrameMeter,
  createLogBuffer,
  normalizeRoomCode,
  readClientParams,
  serverUrlFromPage,
} from "@sdm/core/client";
import {
  ClientMessage,
  type DebugResult,
  HealthResponseSchema,
  JoinByCodeResponseSchema,
  type Notice,
  Routes,
  ServerMessage,
} from "@sdm/core/shared";
import { timeLoopGame } from "../shared/game.ts";
import type { TimeLoopInput, TimeLoopState } from "../shared/index.ts";
import { OBJECT_IDS } from "../shared/puzzles.ts";

/** In local dev the server runs on :2567; deployed builds are served by the server itself. */
export const SERVER_URL: string =
  import.meta.env.VITE_SERVER_URL ??
  (import.meta.env.DEV ? "http://localhost:2567" : serverUrlFromPage(location.href));

const ROOM_NAME = "game";
const TOKEN_KEY = "sdm:reconnectionToken";
const CODE_KEY = "sdm:roomCode";

/** F8 bug reports open a pre-filled issue here, labelled with this team. Teams set their own label. */
const ISSUE_REPO = "nd2003/sdm2026-1";
const TEAM_LABEL = "team-3";

const app = document.getElementById("app") as HTMLElement;
const params = readClientParams(location.search);
const client = new Client(SERVER_URL);
// Recent console output goes into F8 bug reports.
const logs = createLogBuffer();
logs.captureConsole();

async function main(): Promise<void> {
  const health = HealthResponseSchema.parse(await (await fetch(`${SERVER_URL}${Routes.health}`)).json());
  const room = (await tryReconnect()) ?? (params.room ? await joinByCode(params.room) : null);
  if (room) play(room, health);
  else showLobby(health);
}

async function tryReconnect(): Promise<Room<TimeLoopState> | null> {
  const token = safeSession(() => sessionStorage.getItem(TOKEN_KEY));
  if (!token) return null;
  try {
    return await client.reconnect<TimeLoopState>(token);
  } catch {
    // Seat expired or room closed: fall back to the saved code, as a new player.
    safeSession(() => sessionStorage.removeItem(TOKEN_KEY));
    const code = safeSession(() => sessionStorage.getItem(CODE_KEY));
    return code ? joinByCode(code).catch(() => null) : null;
  }
}

async function joinByCode(raw: string): Promise<Room<TimeLoopState>> {
  const code = normalizeRoomCode(raw);
  if (!code) throw new Error("A room code is four letters.");
  const res = await fetch(`${SERVER_URL}${Routes.joinByCode}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? `HTTP ${res.status}`);
  const { roomId } = JoinByCodeResponseSchema.parse(await res.json());
  return client.joinById<TimeLoopState>(roomId, { name: params.name ?? "player" });
}

function showLobby(health: BuildInfo, error?: string): void {
  app.innerHTML = `
    <h1>Time Loop Escape</h1>
    <div>env ${health.env} · ${health.sha.slice(0, 7)}</div>
    <p><button id="create">Create room</button></p>
    <p><input id="code" maxlength="4" placeholder="CODE" size="6" /> <button id="join">Join by code</button></p>
    <p class="bad" id="error">${error ?? ""}</p>`;
  const fail = (err: unknown) => showLobby(health, err instanceof Error ? err.message : String(err));
  app.querySelector("#create")?.addEventListener("click", () => {
    client
      .create<TimeLoopState>(ROOM_NAME, { private: true, name: params.name ?? "player" })
      .then((room) => play(room, health), fail);
  });
  app.querySelector("#join")?.addEventListener("click", () => {
    const input = app.querySelector<HTMLInputElement>("#code");
    joinByCode(input?.value ?? "").then((room) => play(room, health), fail);
  });
}

function play(room: Room<TimeLoopState>, health: BuildInfo): void {
  safeSession(() => sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken));
  app.innerHTML = `<div id="hud"></div><canvas id="view" width="640" height="120"></canvas><div id="game"></div>`;
  const hud = app.querySelector("#hud") as HTMLElement;
  const view = app.querySelector("#game") as HTMLElement;
  const canvas = app.querySelector("#view") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // F8: screenshot + logs + room details → saved on the server, with a link to a pre-filled issue.
  createBugReporter({
    serverUrl: SERVER_URL,
    issueRepo: ISSUE_REPO,
    teamLabel: TEAM_LABEL,
    logs,
    getCanvas: () => canvas,
    getContext: () => ({
      game: timeLoopGame.id,
      build: health,
      roomId: room.roomId,
      roomCode: room.state.code || null,
      playerId: room.sessionId,
      tick: room.state.tick,
      scenario: params.scenario,
      net: null,
      url: location.href,
      userAgent: navigator.userAgent,
    }),
  });

  let seq = 0;
  let left = false;
  const send = (data: TimeLoopInput) => room.send("input", { seq: ++seq, data });
  const showMessage = (text: string) => {
    hud.dataset.locked = "1";
    hud.textContent = text;
  };
  room.onMessage(ServerMessage.Notice, (notice: Notice) => showMessage(notice.text));
  const overlay = createDebugOverlay({
    build: health,
    startOpen: params.debug,
    console: { send: (command) => room.send(ClientMessage.DebugCommand, command) },
  });
  room.onMessage(ServerMessage.DebugStats, () => {});
  room.onMessage(ServerMessage.DebugResult, (result: DebugResult) => overlay.handleDebugResult(result));
  room.onLeave(() => {
    left = true;
    showMessage("Disconnected. Refresh to rejoin.");
  });

  // Event delegation: the view is redrawn from state, so its buttons are found by data attributes.
  view.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.obj) send({ kind: "click", id: target.dataset.obj });
    if (target.dataset.cancel) send({ kind: "input", text: null });
    if (target.dataset.leave) send({ kind: "leave" });
  });
  view.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const field = form.querySelector("input") as HTMLInputElement;
    if (form.dataset.form === "chat" && field.value.trim()) send({ kind: "chat", text: field.value.trim() });
    if (form.dataset.form === "answer") send({ kind: "input", text: field.value });
    field.value = "";
  });

  const esc = (t: string) => t.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  let lastHtml = "";
  const meter = createFrameMeter(performance.now());
  const frame = (now: number) => {
    const state = room.state;
    if (state.code) safeSession(() => sessionStorage.setItem(CODE_KEY, state.code));
    const me = state.players?.get(room.sessionId);
    const partner = [...(state.players?.entries() ?? [])].find(([id]) => id !== room.sessionId)?.[1];
    const ids = OBJECT_IDS.slice(...(me?.stage === 2 ? [13, 21] : me?.stage === 3 ? [21] : [0, 13]));
    const html = !me
      ? "<p>Joining…</p>"
      : state.phase === "lobby"
        ? `<p>Waiting for your partner. Room code <b>${esc(state.code)}</b>.</p>`
        : `<p>Level ${me.stage}/3 · loop ${me.loop} · ${me.timeLeft}s${me.escaped ? " · you're out" : ""}
             · partner: ${esc(partner?.name ?? "-")} (level ${partner?.stage ?? "-"}${partner?.escaped ? ", out" : ""})</p>
           <p class="${esc(me.messageKind)}"><i>${esc(me.message)}</i></p>
           ${state.phase === "over" ? `<h2>${state.won ? "You both got out" : "Your partner left"}</h2>` : ""}
           <p>${ids.map((id) => `<button data-obj="${id}">${id}</button>`).join(" ")}</p>
           ${me.input ? `<form data-form="answer">${esc(me.input.label)}: <input autofocus> <button>Enter</button> <button type="button" data-cancel="1">Step back</button></form>` : ""}
           <p>Items: ${esc([...me.items].join(", ") || "-")}</p>
           <form data-form="chat"><input placeholder="Tell your partner…"> <button>Send</button> <button type="button" data-leave="1">Quit</button></form>
           <ul>${[...state.chat].map((m) => `<li><b>${esc(m.from)}</b>: ${esc(m.text)}</li>`).join("")}</ul>
           <h3>Journal</h3><ol>${[...me.clues].map((c) => `<li>${esc(c)}</li>`).join("")}</ol>`;
    if (html !== lastHtml) {
      lastHtml = html;
      view.innerHTML = html;
    }
    ctx.fillStyle = "#11161d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d6dde4";
    ctx.fillText(
      me ? `Level ${me.stage} · ${me.timeLeft}s · ${me.message.slice(0, 90)}` : "Joining…",
      10,
      60,
    );

    const invite = state.code ? buildInviteLink(location.href, state.code) : "(quick match)";
    if (!hud.dataset.locked) hud.textContent = `code ${state.code || "-"} · invite ${invite}`;
    const { fps, frameMs } = meter.frame(now);
    overlay.update({
      roomId: room.roomId,
      roomCode: state.code || null,
      playerId: room.sessionId,
      tick: state.tick ?? null,
      pingMs: null,
      patchesPerSecond: null,
      bytesPerSecond: null,
      fps,
      frameMs,
    });
    if (!left) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** sessionStorage can throw in private windows; the game still works without it. */
function safeSession<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

main().catch((err) => {
  app.innerHTML = `<div class="bad">Can't reach the server at ${SERVER_URL}</div><div>${String(err)}</div>`;
});
