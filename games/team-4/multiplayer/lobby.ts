export type PartnerStatus = "waiting" | "connected" | "disconnected" | "error";

export interface LobbyView {
  playerName: string;
  roomCode: string;
  localSlot: 1 | 2;
  ready: boolean;
  partnerReady: boolean;
  onReady: () => void;
  onLeave: () => void;
}

// Presentation only: a multiplayer service can supply this state and these callbacks.
export function renderLobby(
  container: HTMLElement,
  partnerStatus: PartnerStatus = "waiting",
  view?: LobbyView,
): void {
  const statusText: Record<PartnerStatus, string> = {
    waiting: "Waiting for player...",
    connected: "Connected · Not ready",
    disconnected: "Disconnected",
    error: "Connection unavailable",
  };
  const messages: Record<PartnerStatus, string> = {
    waiting: "Waiting for your partner to join.",
    connected: "Both players connected. Mark yourself ready when you are prepared.",
    disconnected: "Your partner disconnected. Waiting for them to reconnect.",
    error: "Unable to connect to the session. Please try again or leave the room.",
  };
  container.innerHTML = `
    <section class="multiplayer-lobby" aria-label="Multiplayer lobby">
      <h1>Time Loop Escape</h1>
      <h2>Multiplayer Lobby</h2>
      <p class="room-code"></p>
      <div class="player-list">
        <article class="player-card"><h3>Player 1</h3><p class="player-name"></p><p class="player-status"></p></article>
        <article class="player-card"><h3>Player 2</h3><p class="player-name"></p><p class="player-status"></p></article>
      </div>
      <p role="status" aria-live="polite"></p>
      <div class="lobby-actions"></div>
    </section>`;
  const section = container.querySelector<HTMLElement>(".multiplayer-lobby");
  if (section) {
    section.dataset.state =
      partnerStatus === "connected" && view?.ready && view.partnerReady ? "ready" : partnerStatus;
  }
  const localIndex = view?.localSlot === 2 ? 1 : 0;
  const cards = container.querySelectorAll<HTMLElement>(".player-card");
  cards.forEach((card, index) => {
    const local = index === localIndex;
    card.dataset.state = local
      ? view?.ready
        ? "ready"
        : "waiting"
      : partnerStatus === "connected" && view?.partnerReady
        ? "ready"
        : partnerStatus;
    const name = card.querySelector<HTMLElement>(".player-name");
    const status = card.querySelector<HTMLElement>(".player-status");
    if (name)
      name.textContent = local
        ? `${view?.playerName ?? "You"} (you)`
        : partnerStatus === "connected" || partnerStatus === "disconnected"
          ? "Partner"
          : "—";
    if (status)
      status.textContent = local
        ? view?.ready
          ? "Connected · Ready"
          : "Connected · Not ready"
        : partnerStatus === "connected" && view?.partnerReady
          ? "Connected · Ready"
          : statusText[partnerStatus];
  });
  const room = container.querySelector<HTMLElement>(".room-code");
  if (room) room.textContent = view ? `Room code: ${view.roomCode}` : "Sample lobby";
  const message = container.querySelector<HTMLElement>('[role="status"]');
  if (message)
    message.textContent =
      partnerStatus === "connected" && view?.ready && view.partnerReady
        ? "Both players are ready. This preview does not start a game."
        : messages[partnerStatus];
  const actions = container.querySelector<HTMLElement>(".lobby-actions");
  if (view && actions) {
    const ready = document.createElement("button");
    ready.type = "button";
    ready.textContent = view.ready ? "Not ready" : "Ready";
    ready.setAttribute("aria-pressed", String(view.ready));
    ready.disabled = partnerStatus === "error";
    ready.addEventListener("click", view.onReady);
    const leave = document.createElement("button");
    leave.type = "button";
    leave.textContent = "Leave";
    leave.addEventListener("click", view.onLeave);
    actions.append(ready, leave);
  }
}
