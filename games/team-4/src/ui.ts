
import { getInventory } from "./inventory";
import { getDiscoveredClues } from "./clues";

export function renderInventory(): string {
  const inventory = getInventory();

  if (inventory.length === 0) {
    return "<p>Your inventory is empty.</p>";
  }

  return `
    <ul>
      ${inventory.map(item => `
        <li>
          <strong>${item.name}</strong>
          <p>${item.description}</p>
        </li>
      `).join("")}
    </ul>
  `;
}

export function renderClues(): string {
  const discoveredClues = getDiscoveredClues();

  if (discoveredClues.length === 0) {
    return "<p>You haven't discovered any clues yet.</p>";
  }

  return `
    <ul>
      ${discoveredClues.map(clue => `
        <li>
          <strong>${clue.title}</strong>
          <p>${clue.description}</p>
        </li>
      `).join("")}
    </ul>
  `;
}
