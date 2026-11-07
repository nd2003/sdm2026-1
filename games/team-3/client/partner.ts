/**
 * Time Loop Escape partner panel: your partner's name, level and loop, their progress as 7 steps, and whether
 * they are already out. Ported from the team's plain-JS game (games/team-3/timeloop-escape/js/ui.js).
 */

/** What the panel shows about the partner. Everything comes from the server state. */
export interface PartnerView {
  name: string;
  stage: number;
  loop: number;
  step: number;
  escaped: boolean;
}

const STEPS = ["Note", "Key", "Cabinet", "PC", "Lv 2", "Casket", "Lv 3"];
const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Fills the panel (#opponent in room.css), or empties it while there is no partner. It flashes when they get further. */
export function updatePartner(panel: HTMLElement, partner: PartnerView | null): void {
  if (!partner) {
    panel.innerHTML = "";
    delete panel.dataset.step;
    return;
  }
  const name = esc(partner.name);
  panel.innerHTML = `<h2>${name} <small>Level ${partner.stage}/3 · Loop ${partner.loop}</small></h2>
    <ol class="steps" aria-label="${name}: step ${partner.step} of ${STEPS.length}">${STEPS.map(
      (s, i) => `<li${i < partner.step ? ' class="done"' : ""}>${s}</li>`,
    ).join("")}</ol>${partner.escaped ? '<p class="partner-out">Escaped, waiting for you</p>' : ""}`;
  if (partner.step > Number(panel.dataset.step ?? partner.step)) {
    panel.classList.remove("bump");
    void panel.offsetWidth; // restart the flash
    panel.classList.add("bump");
  }
  panel.dataset.step = String(partner.step);
}
