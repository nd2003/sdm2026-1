/** All DOM reads and writes. No game logic here. */
import type { Clue, PlayerId } from "./game.ts";

// ── helpers ──────────────────────────────────────────────────────────────────

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} not found`);
  return node as T;
}

function show(id: string): void {
  el(id).classList.remove("hidden");
}

function hide(id: string): void {
  el(id).classList.add("hidden");
}

function setClass(id: string, cls: string, on: boolean): void {
  el(id).classList.toggle(cls, on);
}

// ── screens ──────────────────────────────────────────────────────────────────

export function showStart(): void {
  show("screen-start");
  hide("screen-game");
  hide("screen-reset");
  hide("screen-win");
}

export function showGame(): void {
  hide("screen-start");
  show("screen-game");
  hide("screen-reset");
  hide("screen-win");
}

export function showReset(nextLoop: number): void {
  el("reset-loop-num").textContent = `Loop ${nextLoop}`;
  show("screen-reset");
}

export function hideReset(): void {
  hide("screen-reset");
}

export function showWin(loops: number, timeLeft: number, clueCount: number): void {
  hide("screen-game");
  show("screen-win");
  el("stat-loops").textContent = String(loops);
  el("stat-time").textContent = `${timeLeft}s`;
  el("stat-clues").textContent = String(clueCount);
  const msgs: Record<number, string> = {
    1: "First loop. Both operatives escaped before the reset. Impressive.",
    2: "Two loops — the cipher decoded, the USB secured. You're out.",
    3: "Three loops. Every clue collected, every puzzle solved. The cycle breaks.",
  };
  el("win-msg").textContent =
    msgs[loops] ?? `After ${loops} loops, the operatives finally break the cycle.`;
}

// ── HUD ──────────────────────────────────────────────────────────────────────

export function updateTimer(timeLeft: number, total: number): void {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  el("timer-display").textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const box = el("timer-box");
  box.classList.remove("timer-warn", "timer-danger");
  if (timeLeft <= 15) box.classList.add("timer-danger");
  else if (timeLeft <= 30) box.classList.add("timer-warn");

  const pct = (timeLeft / total) * 100;
  box.style.setProperty("--timer-pct", `${pct}%`);
}

export function updateLoop(loop: number): void {
  el("loop-num").textContent = String(loop);
}

export function setPlayerKey(player: PlayerId, has: boolean): void {
  const slotId = player === 1 ? "p1-slot" : "p2-slot";
  const keyId = player === 1 ? "p1-key" : "p2-key";
  setClass(keyId, "hidden", !has);
  setClass(slotId, "has-item", has);
}

export function setPlayerUsb(player: PlayerId, has: boolean): void {
  const usbId = player === 1 ? "p1-usb" : "p2-usb";
  setClass(usbId, "hidden", !has);
  if (has) {
    const slotId = player === 1 ? "p1-slot" : "p2-slot";
    el(slotId).classList.add("has-item");
  }
}

export function updateActivePlayer(player: PlayerId): void {
  el("apb-p1").classList.toggle("active", player === 1);
  el("apb-p2").classList.toggle("active", player === 2);
  el("player-1-card").classList.toggle("active", player === 1);
  el("player-2-card").classList.toggle("active", player === 2);
  el("p1-turn").textContent = player === 1 ? "Your turn" : "Waiting";
  el("p2-turn").textContent = player === 2 ? "Your turn" : "Waiting";
}

// ── clues ─────────────────────────────────────────────────────────────────────

export function renderClues(clues: Clue[]): void {
  const list = el<HTMLUListElement>("clue-list");
  if (clues.length === 0) {
    list.innerHTML = `<li class="clue-empty">No intel yet — explore the room.</li>`;
    return;
  }
  list.innerHTML = clues
    .map(
      (c) =>
        `<li class="clue-item">
          <span class="clue-icon">${c.icon}</span>
          <div class="clue-body">
            <span class="clue-text">${c.text}</span>
            <span class="clue-detail">${c.detail}</span>
          </div>
        </li>`,
    )
    .join("");
}

// ── room objects ──────────────────────────────────────────────────────────────

export function updatePaintCounter(clicks: number): void {
  el("paint-counter").textContent = clicks >= 4 ? "✓" : `${clicks} / 4`;
  if (clicks >= 4) {
    el("obj-painting").classList.add("ajar");
  }
}

export function showKey(): void {
  show("obj-key");
  el("obj-key").classList.add("key-drop");
}

export function hideKey(): void {
  hide("obj-key");
  el("obj-key").classList.remove("key-drop");
}

export function showSafe(): void {
  show("obj-safe");
  setTimeout(() => el("obj-safe").classList.add("safe-revealed"), 20);
}

export function hideSafe(): void {
  el("obj-safe").classList.remove("safe-revealed");
  setTimeout(() => hide("obj-safe"), 500);
}

export function openSafeBody(): void {
  el("obj-safe").classList.add("safe-open");
}

export function showUsb(): void {
  show("obj-usb");
  setTimeout(() => el("obj-usb").classList.add("usb-revealed"), 20);
}

export function hideUsb(): void {
  el("obj-usb").classList.remove("usb-revealed");
  setTimeout(() => hide("obj-usb"), 300);
}

export function openCabinet(): void {
  hide("cab-doors");
  show("cab-interior");
  el("cab-label").textContent = "Open wardrobe";
}

export function resetCabinet(): void {
  show("cab-doors");
  hide("cab-interior");
  el("cab-label").textContent = "Wardrobe";
  const lock = document.getElementById("cab-lock");
  if (lock) lock.className = "cab-lock-shape locked";
}

export function showPhoto(): void {
  show("obj-photo");
}

export function hidePhoto(): void {
  hide("obj-photo");
}

export function setLaptopDone(): void {
  hide("screen-locked");
  show("screen-open");
  el("obj-door").classList.add("door-unlocked");
}

export function resetLaptop(): void {
  show("screen-locked");
  hide("screen-open");
  el("obj-door").classList.remove("door-unlocked");
  el("obj-laptop").classList.remove("usb-inserted");
}

export function resetPaintCounter(): void {
  el("paint-counter").textContent = "0 / 4";
  el("obj-painting").classList.remove("ajar");
}

// ── laptop modal ──────────────────────────────────────────────────────────────

export function openLaptopModal(hint: string, usbReady: boolean): void {
  el("modal-hint").textContent = hint;
  el<HTMLInputElement>("code-input").value = "";
  el("modal-status").textContent = "";
  el("modal-status").className = "modal-status";
  const usbLine = document.getElementById("modal-usb-line");
  if (usbLine) {
    usbLine.textContent = usbReady ? "▶ USB drive detected ✓" : "▶ USB drive required — insert first.";
    usbLine.className = usbReady ? "modal-sys-line ok" : "modal-sys-line warn";
  }
  show("modal-laptop");
  if (usbReady) {
    setTimeout(() => el<HTMLInputElement>("code-input").focus(), 80);
  }
}

export function closeLaptopModal(): void {
  hide("modal-laptop");
}

export function setModalStatus(ok: boolean, text: string): void {
  const s = el("modal-status");
  s.textContent = text;
  s.className = `modal-status ${ok ? "ok" : "err"}`;
}

export function getCodeInput(): string {
  return el<HTMLInputElement>("code-input").value.trim();
}

// ── safe modal ────────────────────────────────────────────────────────────────

let safeDigits: string[] = [];

export function openSafeModal(): void {
  safeDigits = [];
  renderSafeDisplay();
  el("safe-status").textContent = "";
  el("safe-status").className = "modal-status";
  show("modal-safe");
}

export function closeSafeModal(): void {
  hide("modal-safe");
}

function renderSafeDisplay(): void {
  const display = el("safe-display");
  const slots = ["_", "_", "_", "_"];
  safeDigits.forEach((d, i) => { slots[i] = d; });
  display.textContent = slots.join("  ");
}

export function appendSafeDigit(digit: string): void {
  if (safeDigits.length >= 4) return;
  safeDigits.push(digit);
  renderSafeDisplay();
}

export function clearSafeDigit(): void {
  safeDigits.pop();
  renderSafeDisplay();
}

export function getSafeInput(): string {
  return safeDigits.join("");
}

export function setSafeStatus(ok: boolean, text: string): void {
  const s = el("safe-status");
  s.textContent = text;
  s.className = `modal-status ${ok ? "ok" : "err"}`;
}

export function resetSafeDigits(): void {
  safeDigits = [];
  renderSafeDisplay();
}

// ── toast ─────────────────────────────────────────────────────────────────────

type ToastKind = "info" | "warn" | "success";

export function toast(message: string, kind: ToastKind = "info"): void {
  const area = el("toast-area");
  const div = document.createElement("div");
  div.className = `toast toast-${kind}`;
  div.textContent = message;
  area.appendChild(div);
  setTimeout(() => div.remove(), 3400);
}

// ── rain canvas ───────────────────────────────────────────────────────────────

export function startRain(): void {
  const canvas = document.getElementById("rain-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cv: HTMLCanvasElement = canvas;
  const cx: CanvasRenderingContext2D = ctx;

  const resize = (): void => {
    cv.width = cv.offsetWidth;
    cv.height = cv.offsetHeight;
  };
  resize();
  new ResizeObserver(resize).observe(cv);

  interface Drop { x: number; y: number; len: number; speed: number; opacity: number }

  const drops: Drop[] = Array.from({ length: 70 }, () => ({
    x: Math.random() * (cv.width || 200),
    y: Math.random() * (cv.height || 400),
    len: Math.random() * 16 + 6,
    speed: Math.random() * 3.5 + 1.5,
    opacity: Math.random() * 0.45 + 0.1,
  }));

  function frame(): void {
    cx.clearRect(0, 0, cv.width, cv.height);
    for (const d of drops) {
      cx.globalAlpha = d.opacity;
      cx.strokeStyle = "rgba(140,190,230,1)";
      cx.lineWidth = 1;
      cx.beginPath();
      cx.moveTo(d.x, d.y);
      cx.lineTo(d.x - 1.5, d.y + d.len);
      cx.stroke();
      d.y += d.speed;
      if (d.y > cv.height) {
        d.y = -d.len;
        d.x = Math.random() * cv.width;
      }
    }
    cx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ── glitch + particle burst on loop reset ────────────────────────────────────

export function startParticles(): void {
  const canvas = document.getElementById("particle-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cv = canvas;
  const cx = ctx;
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;

  interface Particle {
    x: number; y: number; vx: number; vy: number; r: number; a: number; hue: number;
  }

  const particles: Particle[] = Array.from({ length: 160 }, () => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    r: Math.random() * 2.5 + 0.5,
    a: Math.random() * 0.7 + 0.2,
    hue: Math.random() < 0.6 ? 35 + Math.random() * 20 : 180 + Math.random() * 20,
  }));

  let tick = 0;
  function draw(): void {
    if (tick++ > 110) { cx.clearRect(0, 0, cv.width, cv.height); return; }
    cx.clearRect(0, 0, cv.width, cv.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.a -= 0.008;
      if (p.a <= 0) continue;
      cx.globalAlpha = p.a;
      cx.fillStyle = `hsl(${p.hue}, 70%, 60%)`;
      cx.beginPath();
      cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fill();
    }
    cx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ── lamp flicker ──────────────────────────────────────────────────────────────

export function startLampFlicker(): void {
  const glow = document.getElementById("lamp-glow");
  if (!glow) return;

  function flicker(): void {
    const intensity = 0.85 + Math.random() * 0.3;
    (glow as HTMLElement).style.opacity = String(Math.min(1, intensity));
    setTimeout(flicker, 80 + Math.random() * 400);
  }
  flicker();
}
