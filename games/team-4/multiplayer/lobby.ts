export type PartnerStatus = "waiting" | "connected" | "disconnected" | "error";

export function renderLobby(container: HTMLElement, partnerStatus: PartnerStatus = "waiting"): void {
  const statusText: Record<PartnerStatus, string> = {
    waiting: "Waiting for player...",
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Connection unavailable",
  };

  const messages: Record<PartnerStatus, string> = {
    waiting: "Waiting for your partner to join.",
    connected: "Both players connected.",
    disconnected: "Your partner disconnected. Waiting for them to reconnect.",
    error: "Unable to connect to the session. Please try again.",
  };

  const partnerName = partnerStatus === "connected" || partnerStatus === "disconnected" ? "Partner" : "—";

  container.innerHTML = `
    <section class="multiplayer-lobby">
      <h1>Time Loop Escape</h1>
      <h2>Multiplayer Lobby</h2>

      <div class="player-list">
        <article class="player-card">
          <h3>Player 1</h3>
          <p>You</p>
          <p>Connected</p>
        </article>

        <article class="player-card">
          <h3>Player 2</h3>
          <p>${partnerName}</p>
          <p>${statusText[partnerStatus]}</p>
        </article>
      </div>

      <p role="status">${messages[partnerStatus]}</p>
    </section>
  `;
}
