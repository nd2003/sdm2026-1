import { ParticleSystem } from "./effects.ts";
import { createScene, getHiddenObjects } from "./scene.ts";
import type { GameState, HiddenObject } from "./types.ts";

const GAME_DURATION = 300;
const HINT_COUNT = 3;
const SCORE_PER_FIND = 1000;
const SCORE_PENALTY = 50;
const TIME_BONUS_PER_SEC = 10;
const DRAG_THRESHOLD_PX = 4;

function byId(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el;
}

export class Game {
  private state: GameState;
  private effects: ParticleSystem;
  private timerInterval: number | null = null;
  private zoomLevel = 1;
  private minZoom = 0.5;
  private maxZoom = 2.5;
  private panX = 0;
  private panY = 0;
  private isDragging = false;
  private didDrag = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartPanX = 0;
  private dragStartPanY = 0;

  constructor() {
    this.state = {
      phase: "playing",
      timeLeft: GAME_DURATION,
      hintsLeft: HINT_COUNT,
      score: 0,
      wrongClicks: 0,
      objects: getHiddenObjects(),
    };

    const canvas = document.getElementById("effects-canvas") as HTMLCanvasElement;
    this.effects = new ParticleSystem(canvas);

    this.injectScene();
    // The scene can only be measured once its wrapper is on screen.
    this.showGame();
    this.fitScene();
    this.renderObjectsList();
    this.updateHUD();
    this.bindEvents();
    this.startTimer();
  }

  private injectScene(): void {
    byId("scene-container").innerHTML = createScene();
  }

  private fitScene(): void {
    const wrapper = byId("scene-wrapper");
    const ww = wrapper.clientWidth;
    const wh = wrapper.clientHeight;
    const scaleX = ww / 1600;
    const scaleY = wh / 900;
    this.zoomLevel = Math.min(scaleX, scaleY);
    this.panX = (ww - 1600 * this.zoomLevel) / 2;
    this.panY = (wh - 900 * this.zoomLevel) / 2;
    this.applyTransform();
  }

  private applyTransform(): void {
    const container = byId("scene-container");
    container.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
    this.effects.resize();
  }

  private showGame(): void {
    byId("loading-screen").classList.add("hidden");
    byId("game-wrapper").classList.remove("hidden");
    setTimeout(() => {
      byId("loading-screen").style.display = "none";
    }, 500);
  }

  private startTimer(): void {
    this.timerInterval = window.setInterval(() => {
      this.state.timeLeft--;
      this.updateHUD();
      if (this.state.timeLeft <= 0) {
        this.endGame(false);
      }
    }, 1000);
  }

  private bindEvents(): void {
    const scene = byId("game-scene");
    const wrapper = byId("scene-wrapper");

    scene.addEventListener("click", (e) => this.handleClick(e as MouseEvent));

    wrapper.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom(delta, e.clientX, e.clientY);
      },
      { passive: false },
    );

    wrapper.addEventListener("mousedown", (e: MouseEvent) => {
      this.didDrag = false;
      if ((e.target as Element).closest("[data-object-id]")) return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.dragStartPanX = this.panX;
      this.dragStartPanY = this.panY;
      wrapper.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e: MouseEvent) => {
      if (!this.isDragging) return;
      if (Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY) > DRAG_THRESHOLD_PX) {
        this.didDrag = true;
      }
      this.panX = this.dragStartPanX + (e.clientX - this.dragStartX);
      this.panY = this.dragStartPanY + (e.clientY - this.dragStartY);
      this.applyTransform();
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      const wrapper2 = document.getElementById("scene-wrapper");
      if (wrapper2) wrapper2.style.cursor = "crosshair";
    });

    byId("hint-btn").addEventListener("click", () => this.useHint());
    byId("zoom-in-btn").addEventListener("click", () => this.zoom(1.3));
    byId("zoom-out-btn").addEventListener("click", () => this.zoom(0.77));
    byId("zoom-reset-btn").addEventListener("click", () => this.fitScene());
    byId("play-again-btn").addEventListener("click", () => this.restart());

    window.addEventListener("resize", () => this.fitScene());
  }

  private zoom(factor: number, pivotX?: number, pivotY?: number): void {
    const wrapper = byId("scene-wrapper");
    const cx = pivotX ?? wrapper.clientWidth / 2;
    const cy = pivotY ?? wrapper.clientHeight / 2;

    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel * factor));
    const scale = newZoom / this.zoomLevel;
    this.panX = cx - scale * (cx - this.panX);
    this.panY = cy - scale * (cy - this.panY);
    this.zoomLevel = newZoom;
    this.applyTransform();
  }

  private handleClick(e: MouseEvent): void {
    if (this.state.phase !== "playing") return;
    // The click that ends a pan is not a guess.
    if (this.didDrag) {
      this.didDrag = false;
      return;
    }
    const target = e.target as Element;
    const group = target.closest("[data-object-id]");

    if (group) {
      const id = group.getAttribute("data-object-id");
      const obj = this.state.objects.find((o) => o.id === id);
      if (obj && !obj.found) {
        this.foundObject(obj, e.clientX, e.clientY);
      }
    } else {
      this.wrongClick(e.clientX, e.clientY);
    }
  }

  private foundObject(obj: HiddenObject, sx: number, sy: number): void {
    obj.found = true;
    this.state.score += SCORE_PER_FIND;

    const el = document.getElementById(`obj-${obj.id}`);
    el?.classList.add("obj-found");

    this.effects.burst(sx, sy, "#FFD700", 32);
    this.updateHUD();
    this.updateObjectsList();

    if (this.state.objects.every((o) => o.found)) {
      setTimeout(() => this.endGame(true), 900);
    }
  }

  private wrongClick(sx: number, sy: number): void {
    this.state.wrongClicks++;
    this.state.score = Math.max(0, this.state.score - SCORE_PENALTY);
    this.effects.burst(sx, sy, "#FF4444", 16);
    this.updateHUD();

    const flash = byId("wrong-flash");
    flash.classList.remove("hidden");
    flash.classList.add("flashing");
    setTimeout(() => {
      flash.classList.add("hidden");
      flash.classList.remove("flashing");
    }, 420);
  }

  private useHint(): void {
    if (this.state.hintsLeft <= 0 || this.state.phase !== "playing") return;
    const unfound = this.state.objects.filter((o) => !o.found);
    if (unfound.length === 0) return;

    const target = unfound[Math.floor(Math.random() * unfound.length)];
    if (!target) return;
    const el = document.getElementById(`obj-${target.id}`);
    if (el) {
      el.classList.add("obj-hint");
      setTimeout(() => el.classList.remove("obj-hint"), 2800);
    }

    this.state.hintsLeft--;
    this.updateHUD();
    if (this.state.hintsLeft === 0) {
      byId("hint-btn").setAttribute("disabled", "true");
    }
  }

  private endGame(won: boolean): void {
    if (this.state.phase !== "playing") return;
    if (this.timerInterval !== null) clearInterval(this.timerInterval);
    this.state.phase = won ? "victory" : "gameover";

    const foundCount = this.state.objects.filter((o) => o.found).length;
    const timeBonus = won ? this.state.timeLeft * TIME_BONUS_PER_SEC : 0;
    const baseScore = foundCount * SCORE_PER_FIND;
    const penalty = this.state.wrongClicks * SCORE_PENALTY;
    const finalScore = Math.max(0, baseScore + timeBonus - penalty);

    const endScreen = byId("end-screen");
    byId("end-title").textContent = won ? "🎉 You Found Them All!" : "⏰ Time's Up!";
    byId("end-subtitle").textContent = won
      ? "Clare's secrets are revealed."
      : `You found ${foundCount} of 15 objects.`;
    byId("end-score").textContent = finalScore.toLocaleString();
    byId("end-breakdown").innerHTML =
      `<span>Objects found: ${foundCount} × ${SCORE_PER_FIND} = ${(foundCount * SCORE_PER_FIND).toLocaleString()}</span>` +
      (won
        ? `<span>Time bonus: ${this.state.timeLeft}s × ${TIME_BONUS_PER_SEC} = ${timeBonus.toLocaleString()}</span>`
        : "") +
      (this.state.wrongClicks > 0
        ? `<span>Penalty: −${penalty.toLocaleString()} (${this.state.wrongClicks} wrong ${this.state.wrongClicks === 1 ? "click" : "clicks"})</span>`
        : "");

    endScreen.classList.remove("hidden");
  }

  private restart(): void {
    window.location.reload();
  }

  private updateHUD(): void {
    const mins = Math.floor(this.state.timeLeft / 60);
    const secs = this.state.timeLeft % 60;
    byId("timer-val").textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    byId("score-val").textContent = this.state.score.toLocaleString();
    const found = this.state.objects.filter((o) => o.found).length;
    byId("found-val").textContent = `${found}/15`;
    byId("hints-left").textContent = String(this.state.hintsLeft);

    const timerEl = byId("timer-val");
    timerEl.classList.toggle("timer-warning", this.state.timeLeft <= 60);
    timerEl.classList.toggle("timer-critical", this.state.timeLeft <= 20);
  }

  private renderObjectsList(): void {
    const grid = byId("objects-grid");
    grid.innerHTML = this.state.objects
      .map(
        (obj) => `
      <div class="obj-item ${obj.found ? "obj-item-found" : ""}" data-id="${obj.id}">
        <div class="obj-icon">${obj.iconSvg}</div>
        <div class="obj-name">${obj.name}</div>
        ${obj.found ? '<div class="obj-check">✓</div>' : ""}
      </div>`,
      )
      .join("");
  }

  private updateObjectsList(): void {
    for (const obj of this.state.objects) {
      const el = document.querySelector(`.obj-item[data-id="${obj.id}"]`);
      if (!el) continue;
      if (obj.found) {
        el.classList.add("obj-item-found");
        if (!el.querySelector(".obj-check")) {
          const check = document.createElement("div");
          check.className = "obj-check";
          check.textContent = "✓";
          el.appendChild(check);
        }
      }
    }
  }
}
