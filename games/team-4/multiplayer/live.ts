import { Client, type Room } from "@colyseus/sdk";
import { buildInviteLink, normalizeRoomCode, readClientParams } from "@sdm/core/client";
import {
  ClientMessage,
  JoinByCodeResponseSchema,
  type Notice,
  Routes,
  ServerMessage,
} from "@sdm/core/shared";
import type { LobbyState } from "../shared/lobby";
import { type PartnerStatus, renderLobby } from "./lobby";

function required<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);
  if (!element) throw new Error(`Missing interface element: ${selector}`);
  return element;
}

const serverUrl: string =
  import.meta.env.VITE_SERVER_URL ??
  (import.meta.env.DEV
    ? `${location.protocol}//${location.hostname}:2567`
    : new URL("../", location.href).href.replace(/\/$/, ""));

const client = new Client(serverUrl);
const tokenKey = `team-4:lobby:${serverUrl}:token`;

function safeStorage<T>(action: () => T): T | null {
  try {
    return action();
  } catch {
    return null;
  }
}

const app = required<HTMLElement>(document, "#app");
app.innerHTML = `
  <section class="session-entry" aria-labelledby="entry-heading">
    <h1 id="entry-heading">Time Loop Escape</h1>
    <h2>Multiplayer Lobby</h2>
    <p>Create a private room or join your partner using their room code.</p>
    <form>
      <label for="player-name">Player name</label>
      <input id="player-name" maxlength="24" required autocomplete="nickname" />
      <label for="room-code">Room code (required to join)</label>
      <input id="room-code" maxlength="4" placeholder="QXTR"
        autocapitalize="characters" spellcheck="false"
        aria-describedby="room-help" />
      <p id="room-help">Room codes contain four letters, excluding I and O.</p>
      <div class="lobby-actions">
        <button type="submit" value="create">Create Game</button>
        <button type="submit" value="join">Join Game</button>
      </div>
      <p class="entry-error" role="alert"></p>
    </form>
  </section>
  <div class="session-lobby" hidden></div>`;

const entry = required<HTMLElement>(app, ".session-entry");
const form = required<HTMLFormElement>(entry, "form");
const nameInput = required<HTMLInputElement>(entry, "#player-name");
const codeInput = required<HTMLInputElement>(entry, "#room-code");
const error = required<HTMLElement>(entry, ".entry-error");
const lobby = required<HTMLElement>(app, ".session-lobby");

const params = readClientParams(location.search);
nameInput.value = params.name ?? "";
if (params.room && !/[IO]/.test(params.room)) {
  codeInput.value = params.room;
} else if (new URLSearchParams(location.search).has("room")) {
  error.textContent = "This invite link has an invalid room code.";
}

let activeRoom: Room<LobbyState> | null = null;
let busy = false;
let sequence = 0;
let lastView = "";
let connectionMessage = "";

function setBusy(value: boolean): void {
  busy = value;
  form.setAttribute("aria-busy", String(value));
  for (const control of form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button")) {
    control.disabled = value;
  }
}

function showEntry(message = ""): void {
  lobby.hidden = true;
  entry.hidden = false;
  error.textContent = message;
  setBusy(false);
}

function draw(room: Room<LobbyState>): void {
  if (activeRoom !== room) return;
  const state = room.state;
  const local = state.players?.get(room.sessionId);
  if (!local || !state.code) return;

  const partnerEntry = [...state.players.entries()].find(([id]) => id !== room.sessionId);
  const partnerId = partnerEntry?.[0];
  const partner = partnerEntry?.[1];
  const localConnected = state.seats.get(room.sessionId)?.connected === true;
  const partnerStatus: PartnerStatus =
    !localConnected || connectionMessage
      ? "error"
      : !partner
        ? "waiting"
        : partnerId && state.seats.get(partnerId)?.connected
          ? "connected"
          : "disconnected";

  sequence = Math.max(sequence, state.seats.get(room.sessionId)?.lastSeq ?? 0);

  // Ignore tick-only patches so keyboard focus stays on the current button.
  const signature = JSON.stringify([
    local.name,
    local.slot,
    local.ready,
    partner?.name,
    partner?.ready,
    partnerStatus,
    state.code,
    connectionMessage,
  ]);
  if (signature === lastView) return;
  lastView = signature;

  const buttons = [...lobby.querySelectorAll("button")];
  const focusedIndex = buttons.findIndex((button) => button === document.activeElement);

  renderLobby(lobby, partnerStatus, {
    playerName: local.name,
    partnerName: partner?.name,
    roomCode: state.code,
    localSlot: local.slot === 2 ? 2 : 1,
    ready: local.ready,
    partnerReady: partner?.ready ?? false,
    readyMessage: "Both players are ready.",
    onReady: () => {
      if (activeRoom !== room || !localConnected || connectionMessage) return;
      room.send(ClientMessage.Input, {
        seq: ++sequence,
        data: { ready: !room.state.players.get(room.sessionId)?.ready },
      });
    },
    onLeave: () => {
      activeRoom = null;
      safeStorage(() => sessionStorage.removeItem(tokenKey));
      void room.leave().catch(() => undefined);
      codeInput.value = "";
      lobby.replaceChildren();
      showEntry();
      nameInput.focus();
    },
  });

  if (connectionMessage) {
    required<HTMLElement>(lobby, '[role="status"]').textContent = connectionMessage;
  }

  const invite = document.createElement("a");
  invite.className = "invite-link";
  invite.href = buildInviteLink(location.href, state.code);
  invite.textContent = "Room invite link";
  lobby.append(invite);

  if (focusedIndex >= 0) {
    lobby.querySelectorAll<HTMLButtonElement>("button")[focusedIndex]?.focus();
  }
}

function enterRoom(room: Room<LobbyState>): void {
  activeRoom = room;
  sequence = 0;
  lastView = "";
  connectionMessage = "";
  safeStorage(() => sessionStorage.setItem(tokenKey, room.reconnectionToken));
  entry.hidden = true;
  lobby.hidden = false;
  lobby.textContent = "Connecting to your room…";
  setBusy(false);

  room.onMessage(ServerMessage.Notice, (notice: Notice) => {
    if (activeRoom !== room) return;
    connectionMessage = notice.text;
    draw(room);
  });
  room.onMessage(ServerMessage.DebugStats, () => undefined);
  room.onMessage(ServerMessage.DebugResult, () => undefined);
  room.onStateChange(() => {
    safeStorage(() => sessionStorage.setItem(tokenKey, room.reconnectionToken));
    draw(room);
  });
  room.onError(() => {
    if (activeRoom !== room) return;
    connectionMessage = "Connection problem. Refresh to try reconnecting, or leave the room.";
    draw(room);
  });
  room.onLeave(() => {
    if (activeRoom !== room) return;
    activeRoom = null;
    showEntry("Connection closed. Refresh to try reconnecting to your saved session.");
  });
  draw(room);
}

async function joinByCode(code: string, name: string): Promise<Room<LobbyState>> {
  const response = await fetch(`${serverUrl}${Routes.joinByCode}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (response.status === 404) throw new Error("No room was found with that code.");
  if (response.status === 409) throw new Error("That room is full.");
  if (!response.ok) throw new Error("Unable to join the room. Please try again.");
  const { roomId } = JoinByCodeResponseSchema.parse(await response.json());
  return client.joinById<LobbyState>(roomId, { name });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (busy || activeRoom) return;
  error.textContent = "";
  const name = nameInput.value.trim();
  if (!name || name.length > 24) {
    error.textContent = "Enter a player name between 1 and 24 characters.";
    nameInput.focus();
    return;
  }
  const join = (event.submitter as HTMLButtonElement | null)?.value === "join";
  const code = normalizeRoomCode(codeInput.value);
  if (join && (!code || /[IO]/.test(code))) {
    error.textContent = "Enter four letters, excluding I and O.";
    codeInput.focus();
    return;
  }

  setBusy(true);
  const request =
    join && code ? joinByCode(code, name) : client.create<LobbyState>("lobby", { private: true, name });

  void request.then(enterRoom).catch((reason: unknown) => {
    showEntry(
      reason instanceof Error ? reason.message : "Unable to connect. Check that the server is running.",
    );
  });
});

async function restoreSession(): Promise<void> {
  const token = safeStorage(() => sessionStorage.getItem(tokenKey));
  if (!token) return;
  setBusy(true);
  error.textContent = "Reconnecting to your room…";
  try {
    enterRoom(await client.reconnect<LobbyState>(token));
  } catch {
    safeStorage(() => sessionStorage.removeItem(tokenKey));
    showEntry("Your saved session expired. Create a room or join using its code.");
  }
}

void restoreSession();
