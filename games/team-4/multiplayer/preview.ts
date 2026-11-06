function requiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing interface element: ${selector}`);
  }
  return element;
}

import type { PartnerStatus } from "./lobby";
import { renderLobby } from "./lobby";

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
        <input id="room-code" name="roomCode" maxlength="6" placeholder="ABC123" autocapitalize="characters" spellcheck="false" />
        <p id="room-help">Create a sample room, or enter any six letters or digits to simulate joining one.</p>
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
    roomCode = codeInput.value.trim().toUpperCase();
    if (join && !/^[A-Z0-9]{6}$/.test(roomCode)) {
      error.textContent = "Enter a room code containing six letters or digits.";
      codeInput.setAttribute("aria-invalid", "true");
      codeInput.focus();
      return;
    }
    if (!join) {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      roomCode = Array.from(
        crypto.getRandomValues(new Uint8Array(6)),
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
