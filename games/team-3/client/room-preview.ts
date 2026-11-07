/**
 * Dev preview of the room view (room-preview.html): draws the room with a sample state, so the art can be
 * checked without the server. Buttons switch the level and the object states, and a click shows the object id.
 */
import "./room.css";
import { buildRoom, placeObjects, type RoomView, updateRoom } from "./room.ts";

const room = document.getElementById("room") as HTMLElement;
const log = document.getElementById("clicked") as HTMLElement;
const view: RoomView = { stage: 1, loop: 1, flags: {}, partnerName: "Partner" };

buildRoom(room, (id) => {
  log.textContent = `Clicked: ${id}`;
});

// A small seeded random, only for the preview layout (the real seed comes from the server).
let seed = 7;
const rand = (): number => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
placeObjects(room, rand, { color: "BLUE", casket: "left" });

const show = (): void => {
  updateRoom(room, view);
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-stage-btn]"))
    b.setAttribute("aria-pressed", String(Number(b.dataset.stageBtn) === view.stage));
};

for (const b of document.querySelectorAll<HTMLButtonElement>("[data-stage-btn]"))
  b.addEventListener("click", () => {
    view.stage = Number(b.dataset.stageBtn);
    show();
  });
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-flag]"))
  b.addEventListener("click", () => {
    const flag = b.dataset.flag ?? "";
    view.flags[flag] = !view.flags[flag];
    b.setAttribute("aria-pressed", String(Boolean(view.flags[flag])));
    show();
  });
(document.getElementById("next-loop") as HTMLElement).addEventListener("click", () => {
  view.loop += 1;
  show();
});

show();
