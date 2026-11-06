import type { PartnerStatus } from "./lobby";
import { renderLobby } from "./lobby";

const app = document.querySelector<HTMLElement>("#app");

if (app) {
  const lobbyContainer = document.createElement("div");
  const controls = document.createElement("div");
  controls.className = "lobby-preview-controls";

  const label = document.createElement("p");
  label.textContent = "Preview controls — simulated players";
  controls.append(label);

  const options: { label: string; status: PartnerStatus }[] = [
    { label: "Waiting", status: "waiting" },
    { label: "Partner joins", status: "connected" },
    { label: "Partner disconnects", status: "disconnected" },
    { label: "Connection error", status: "error" },
  ];

  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;

    button.addEventListener("click", () => {
      renderLobby(lobbyContainer, option.status);
    });

    controls.append(button);
  }

  app.replaceChildren(lobbyContainer, controls);
  renderLobby(lobbyContainer);
}
