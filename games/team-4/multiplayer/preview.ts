import { buildInviteLink, normalizeRoomCode, readClientParams } from "@sdm/core/client";
import type { PartnerStatus } from "./lobby";
import { renderLobby } from "./lobby";

function requiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing interface element: ${selector}`);
  }
  return element;
}

const app = document.querySelector<HTMLElement>("#app");

if (app) {
  app.innerHTML = `
    <section class="session-entry" aria-labelledby="entry-heading">
      <h1 id="entry-heading">Time Loop Escape</h1>
      <h2>Multiplayer interface preview</h2>
      <p>Sample data only. These controls do not connect separate computers.</p>
      <form>
        <label for="player-name">Player name</label>
        <input id="player-name" name="playerName" maxlength="24" required autocomplete="nickname" />
        <label for="room-code">Room code (required to join)</label>
        <input id="room-code" name="roomCode" maxlength="4" placeholder="QXTR" autocapitalize="characters" spellcheck="false" />
        <p id="room-help">Create a sample room, or enter four letters (excluding I and O) to simulate joining one.</p>
        <div class="lobby-actions">
          <button type="submit" value="create">Create Game</button>
          <button type="submit" value="join">Join Game</button>
        </div>
        <p class="entry-error" role="alert"></p>
      </form>
    </section>
    <div class="session-lobby" hidden></div>
    <section class="lobby-preview-controls" aria-label="Simulated partner controls" hidden>
      <p>Preview controls — simulated players</p>
      <button type="button" data-status="waiting">Waiting</button>
      <button type="button" data-status="connected">Partner joins</button>
      <button type="button" data-status="disconnected">Partner disconnects</button>
      <button type="button" data-status="error">Connection error</button>
      <button type="button" class="partner-ready">Partner ready</button>
    </section>`;
  const entry = requiredElement<HTMLElement>(app, ".session-entry");
  const form = requiredElement<HTMLFormElement>(app, "form");
  const nameInput = requiredElement<HTMLInputElement>(app, "#player-name");
  const codeInput = requiredElement<HTMLInputElement>(app, "#room-code");
  codeInput.setAttribute("aria-describedby", "room-help");
  const error = requiredElement<HTMLElement>(app, ".entry-error");
  const inviteParams = readClientParams(location.search);
  if (inviteParams.name) nameInput.value = inviteParams.name;
  if (inviteParams.room && !/[IO]/.test(inviteParams.room)) {
    codeInput.value = inviteParams.room;
  } else if (new URLSearchParams(location.search).has("room")) {
    error.textContent = "This invite link has an invalid room code. Enter four letters, excluding I and O.";
  }
  const lobby = requiredElement<HTMLElement>(app, ".session-lobby");
  const controls = requiredElement<HTMLElement>(app, ".lobby-preview-controls");
  const partnerButton = requiredElement<HTMLButtonElement>(controls, ".partner-ready");
  let playerName = "";
  let roomCode = "";
  let localSlot: 1 | 2 = 1;
  let partnerStatus: PartnerStatus = "waiting";
  let ready = false;
  let partnerReady = false;

  function draw(): void {
    renderLobby(lobby, partnerStatus, {
      playerName,
      roomCode,
      localSlot,
      ready,
      partnerReady,
      onReady: () => {
        ready = !ready;
        draw();
        lobby.querySelector<HTMLButtonElement>("button")?.focus();
      },
      onLeave: () => {
        ready = false;
        partnerReady = false;
        roomCode = "";
        codeInput.value = "";
        partnerStatus = "waiting";
        lobby.hidden = true;
        controls.hidden = true;
        entry.hidden = false;
        lobby.replaceChildren();
        nameInput.focus();
      },
    });
    const inviteLink = document.createElement("a");
    inviteLink.className = "invite-link";
    inviteLink.href = buildInviteLink(location.href, roomCode);
    inviteLink.textContent = "Sample room invite link";
    inviteLink.title = "Preview only: this link fills in the room code.";
    lobby.append(inviteLink);
    partnerButton.disabled = partnerStatus !== "connected";
    partnerButton.textContent = partnerReady ? "Partner not ready" : "Partner ready";
    partnerButton.setAttribute("aria-pressed", String(partnerReady));
    // Partner controls stay mounted, preserving keyboard focus.
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    nameInput.removeAttribute("aria-invalid");
    codeInput.removeAttribute("aria-invalid");
    playerName = nameInput.value.trim();
    if (!playerName) {
      error.textContent = "Enter a player name.";
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
      return;
    }
    const join = (event.submitter as HTMLButtonElement | null)?.value === "join";
    roomCode = normalizeRoomCode(codeInput.value) ?? "";
    if (join && (!roomCode || /[IO]/.test(roomCode))) {
      error.textContent = "Enter four letters, excluding I and O.";
      codeInput.setAttribute("aria-invalid", "true");
      codeInput.focus();
      return;
    }
    if (!join) {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
      roomCode = Array.from(
        crypto.getRandomValues(new Uint8Array(4)),
        (value) => alphabet[value % alphabet.length],
      ).join("");
    }
    localSlot = join ? 2 : 1;
    partnerStatus = join ? "connected" : "waiting";
    ready = false;
    partnerReady = false;
    entry.hidden = true;
    lobby.hidden = false;
    controls.hidden = false;
    draw();
    lobby.querySelector<HTMLButtonElement>("button")?.focus();
  });
  controls.querySelectorAll<HTMLButtonElement>("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      partnerStatus = button.dataset.status as PartnerStatus;
      partnerReady = false;
      ready = false;
      draw();
    });
  });
  partnerButton.addEventListener("click", () => {
    partnerReady = !partnerReady;
    draw();
  });
}
