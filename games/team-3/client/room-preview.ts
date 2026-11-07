/**
 * Dev preview of the room view (room-preview.html): draws the room with a sample state, so the art can be
 * checked without the server. Buttons switch the level and the object states, and a click shows the object id.
 */
import "./room.css";
import { type ChatLine, mountChat, updateChat } from "./chat.ts";
import { type HudView, mountHud, updateHud } from "./hud.ts";
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
  updateHud(hudRoot, { ...hud, loop: view.loop, stage: view.stage });
  updateChat(hudRoot, chat);
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
  hud.items = [];
  hud.timeLeft = hud.loopSeconds;
  hud.message = "Time ran out. The loop reset: your items are gone, your journal stays.";
  show();
});

// The HUD with a sample state: the timer counts down, and buttons add an item or a clue.
const hudRoot = document.getElementById("hud-root") as HTMLElement;
const hud: HudView = {
  timeLeft: 60,
  loopSeconds: 60,
  loop: 1,
  stage: 1,
  items: [],
  clues: [],
  message: "",
  escaped: false,
};
mountHud(hudRoot);

// The chat with a sample partner line: a sent line shows up as yours, and the partner answers once.
const chat: ChatLine[] = [
  { from: "Partner", text: "My painting needs a colour. What's on your note?", mine: false },
];
mountChat(hudRoot, (text) => {
  chat.push({ from: "You", text, mine: true });
  if (chat.length === 2) chat.push({ from: "Partner", text: "Got it, trying that now.", mine: false });
  show();
});
const button = (id: string, run: () => void): void =>
  (document.getElementById(id) as HTMLElement).addEventListener("click", () => {
    run();
    show();
  });
button("add-item", () => {
  hud.items.push(hud.items.includes("key") ? "fuse" : "key");
  hud.message = "You found something.";
});
button("add-clue", () => {
  hud.clues.push(`BLUE - ${hud.clues.length + 4}`);
  hud.message = "You wrote it in your journal.";
});
setInterval(() => {
  hud.timeLeft = hud.timeLeft > 1 ? hud.timeLeft - 1 : hud.loopSeconds;
  show();
}, 1000);

show();
