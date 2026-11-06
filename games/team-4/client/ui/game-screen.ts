export type RoomObjectId =
  | "book"
  | "lamp"
  | "painting"
  | "key"
  | "cabinet"
  | "photo"
  | "computer"
  | "door";

export interface GameScreenState {
  roomId?: string;
  timeLeftSeconds?: number;
  loopDurationSeconds?: number;
  loopCount?: number;
  connectedPlayers?: number;
  maxPlayers?: number;
  score?: number;
  statusText?: string;
  selectedObjectId?: RoomObjectId | null;
  lampOn?: boolean;
  paintingClicks?: number;
  keyRevealed?: boolean;
  keyCollected?: boolean;
  cabinetUnlocked?: boolean;
  doorUnlocked?: boolean;
  escaped?: boolean;
  clues?: string[];
  inventory?: string[];
  feedbackMessage?: string;
  onObjectInteract?: (
    objectId: RoomObjectId,
    action: "select" | "inspect" | "interact",
  ) => void;
  onLoopReset?: (newLoopCount: number) => void;
}

interface InternalGameScreenState {
  roomId: string;
  timeLeftSeconds: number;
  loopDurationSeconds: number;
  loopCount: number;
  connectedPlayers: number;
  maxPlayers: number;
  score: number;
  statusText: string;
  selectedObjectId: RoomObjectId | null;
  lampOn: boolean;
  paintingClicks: number;
  keyRevealed: boolean;
  keyCollected: boolean;
  cabinetUnlocked: boolean;
  doorUnlocked: boolean;
  escaped: boolean;
  clues: string[];
  inventory: string[];
  feedbackMessage: string;
}

const VALID_PASSCODES = new Set(["1998", "1984"]);

export function renderGameScreen(
  container: HTMLElement,
  initialState?: GameScreenState,
): {
  update: (state: Partial<GameScreenState>) => void;
  resetLoop: () => void;
  getState: () => Readonly<InternalGameScreenState>;
  viewportElement: HTMLElement;
  dockElement: HTMLElement;
} {
  const callbacks = {
    onObjectInteract: initialState?.onObjectInteract,
    onLoopReset: initialState?.onLoopReset,
  };

  let state: InternalGameScreenState = {
    roomId: initialState?.roomId ?? "ROOM-04",
    timeLeftSeconds: initialState?.timeLeftSeconds ?? 60,
    loopDurationSeconds: initialState?.loopDurationSeconds ?? 60,
    loopCount: initialState?.loopCount ?? 1,
    connectedPlayers: initialState?.connectedPlayers ?? 2,
    maxPlayers: initialState?.maxPlayers ?? 2,
    score: initialState?.score ?? 0,
    statusText: initialState?.statusText ?? "Loop Active",
    selectedObjectId: initialState?.selectedObjectId ?? null,
    lampOn: initialState?.lampOn ?? true,
    paintingClicks: initialState?.paintingClicks ?? 0,
    keyRevealed: initialState?.keyRevealed ?? false,
    keyCollected: initialState?.keyCollected ?? false,
    cabinetUnlocked: initialState?.cabinetUnlocked ?? false,
    doorUnlocked: initialState?.doorUnlocked ?? false,
    escaped: initialState?.escaped ?? false,
    clues: initialState?.clues ? [...initialState.clues] : [],
    inventory: initialState?.inventory ? [...initialState.inventory] : [],
    feedbackMessage:
      initialState?.feedbackMessage ??
      "Explore the room: inspect the open book on the desk to find your first clue.",
  };

  container.innerHTML = `
    <div class="tle-root" id="tle-root">
      <!-- Top Header Bar -->
      <header class="tle-header">
        <div class="tle-header-left">
          <button type="button" class="tle-icon-btn" id="btn-pause-menu" title="Pause Game">
            <span>⏸</span>
          </button>
          <button type="button" class="tle-icon-btn" id="btn-hint" title="Show Hint">
            <span>💡</span>
          </button>
          <button type="button" class="tle-icon-btn" id="btn-reset-loop" title="Rewind Time Loop">
            <span>↺</span>
          </button>
          <span class="tle-loop-pill" id="hud-loop">LOOP #${state.loopCount}</span>
        </div>

        <div class="tle-header-center">
          <span class="tle-title-line"></span>
          <div class="tle-title-wrap">
            <svg class="tle-loop-emblem" viewBox="0 0 64 64" aria-hidden="true">
              <path
                d="M32 10 A22 22 0 1 1 12 23"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <polyline
                points="7,22 13,24 14,17"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
            <h1 class="tle-title">TIME LOOP ESCAPE</h1>
          </div>
          <span class="tle-title-line"></span>
        </div>

        <div class="tle-header-right">
          <div class="tle-timer-pill" id="hud-timer">
            <span class="tle-hourglass">⏳</span>
            <span id="hud-timer-val">${formatTime(state.timeLeftSeconds)}</span>
          </div>
        </div>
      </header>

      <!-- Main Illustrated Escape Room Stage -->
      <main class="tle-stage-wrapper">
        <div class="tle-room-stage" id="game-viewport">
          <!-- Loop Reset Flash Banner -->
          <div class="tle-toast tle-toast-reset hidden" id="loop-reset-banner">
            ⏳ TIME LOOP RESET — Inventory items vanished, but your discovered CLUES remain!
          </div>

          <!-- Feedback Subtitle Toast -->
          <div class="tle-feedback-toast" id="action-feedback-text">
            ${state.feedbackMessage}
          </div>

          <!-- Room Architecture: Left Wall, Back Wall, Floor, Window & Rain -->
          <div class="tle-wall-back"></div>
          <div class="tle-wall-left">
            <!-- Rainy Night Window with Venetian Blinds -->
            <div class="tle-window-frame">
              <div class="tle-window-sky">
                <div class="tle-rain-layer"></div>
                <div class="tle-window-trees"></div>
              </div>
              <div class="tle-window-blinds"></div>
            </div>
            <!-- Hanging Ivy Left -->
            <div class="tle-ivy-left" aria-hidden="true">🌿</div>
          </div>
          <div class="tle-floor"></div>

          <!-- Warm Lamp Light Cone Overlay -->
          <div class="tle-lamp-cone" id="lamp-cone"></div>

          <!-- 1. BLUE MOUNTAIN PAINTING + HIDDEN WALL SAFE (Left-Center Wall) -->
          <div class="tle-painting-zone">
            <!-- Wall Safe Behind Painting -->
            <div class="tle-wall-safe" id="wall-safe">
              <button
                type="button"
                class="tle-safe-key-btn hidden"
                id="obj-key"
                data-object-id="key"
                title="Collect Cabinet Key"
              >
                <svg viewBox="0 0 64 64" class="tle-svg-key">
                  <circle cx="20" cy="20" r="10" fill="none" stroke="#fbbf24" stroke-width="5" />
                  <line x1="27" y1="27" x2="52" y2="52" stroke="#fbbf24" stroke-width="5" />
                  <line x1="42" y1="42" x2="36" y2="48" stroke="#f59e0b" stroke-width="4" />
                  <line x1="49" y1="49" x2="43" y2="55" stroke="#f59e0b" stroke-width="4" />
                </svg>
                <span class="tle-key-sparkle">✨ Take Key</span>
              </button>
            </div>

            <!-- Framed Blue Mountain Landscape Painting -->
            <button
              type="button"
              class="tle-painting-btn"
              id="obj-painting"
              data-object-id="painting"
              title="Blue Mountain Painting"
            >
              <svg viewBox="0 0 160 200" class="tle-painting-svg" aria-hidden="true">
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1e3a8a" />
                    <stop offset="55%" stop-color="#3b82f6" />
                    <stop offset="100%" stop-color="#1d4ed8" />
                  </linearGradient>
                </defs>
                <rect width="160" height="200" fill="url(#skyGrad)" />
                <polygon points="0,130 45,65 95,130" fill="#1e40af" />
                <polygon points="55,135 115,55 160,135" fill="#1d4ed8" />
                <polygon points="0,165 65,95 160,155 160,200 0,200" fill="#172554" />
                <path
                  d="M 75 135 Q 90 165 55 200 L 95 200 Q 115 165 88 135 Z"
                  fill="#60a5fa"
                  opacity="0.65"
                />
              </svg>
              <span class="tle-painting-badge" id="state-painting">0/4</span>
              <span class="tle-cursor-hint" aria-hidden="true">👆</span>
            </button>
          </div>

          <!-- 2. WOODEN DOUBLE-DOOR WARDROBE / CABINET (Center Wall) -->
          <div class="tle-cabinet-zone">
            <div class="tle-cabinet-ivy" aria-hidden="true">🌿🌱🌿</div>
            <button
              type="button"
              class="tle-cabinet-btn"
              id="obj-cabinet"
              data-object-id="cabinet"
              title="Locked Wooden Cabinet"
            >
              <div class="tle-cabinet-top-trim"></div>
              <div class="tle-cabinet-doors" id="cabinet-doors">
                <div class="tle-cabinet-door tle-door-left">
                  <div class="tle-door-panel"></div>
                  <div class="tle-door-panel"></div>
                  <span class="tle-handle"></span>
                </div>
                <div class="tle-cabinet-door tle-door-right">
                  <div class="tle-door-panel"></div>
                  <div class="tle-door-panel"></div>
                  <span class="tle-handle"></span>
                </div>
              </div>
              <div class="tle-cabinet-interior" id="cabinet-interior">
                <span class="tle-interior-scroll">📜 Clue Found!</span>
              </div>
              <span class="tle-glow-badge" id="state-cabinet">🔒</span>
            </button>
          </div>

          <!-- 3. CORK BULLETIN BOARD WITH 1998 PHOTOGRAPH (Right-Center Wall) -->
          <button
            type="button"
            class="tle-corkboard-btn"
            id="obj-photo"
            data-object-id="photo"
            title="Inspect Corkboard & Photograph"
          >
            <div class="tle-polaroid">
              <div class="tle-pin"></div>
              <div class="tle-polaroid-art">
                <svg viewBox="0 0 100 65" class="tle-building-svg" aria-hidden="true">
                  <rect width="100" height="65" fill="#cbd5e1" />
                  <polygon points="15,26 50,8 85,26" fill="#475569" />
                  <rect x="20" y="26" width="60" height="32" fill="#64748b" />
                  <rect x="28" y="32" width="8" height="26" fill="#334155" />
                  <rect x="46" y="32" width="8" height="26" fill="#334155" />
                  <rect x="64" y="32" width="8" height="26" fill="#334155" />
                </svg>
              </div>
              <div class="tle-polaroid-caption">1998</div>
            </div>
            <div class="tle-sticky tle-sticky-1"></div>
            <div class="tle-sticky tle-sticky-2"></div>
            <div class="tle-sticky tle-sticky-3"></div>
          </button>

          <!-- 4. COMPUTER DESK & LOCKED MONITOR (Below Corkboard) -->
          <div class="tle-computer-desk-zone">
            <button
              type="button"
              class="tle-monitor-btn"
              id="obj-computer"
              data-object-id="computer"
              title="Computer Terminal"
            >
              <div class="tle-monitor-screen" id="monitor-screen">
                <span class="tle-monitor-lock" id="state-computer">🔒</span>
                <div class="tle-monitor-passbox" id="monitor-passbox">* * * *</div>
              </div>
              <div class="tle-monitor-stand"></div>
            </button>
            <div class="tle-pencil-cup" aria-hidden="true">✏️</div>
            <div class="tle-right-desk">
              <div class="tle-desk-leg tle-leg-l"></div>
              <div class="tle-desk-leg tle-leg-r"></div>
            </div>
            <div class="tle-office-chair" aria-hidden="true"></div>
          </div>

          <!-- 5. PANELED EXIT DOOR (Far Right Wall) -->
          <div class="tle-door-zone">
            <button
              type="button"
              class="tle-exit-door-btn"
              id="obj-door"
              data-object-id="door"
              title="Exit Door"
            >
              <div class="tle-exit-panel"></div>
              <div class="tle-exit-panel tle-exit-panel-mid"></div>
              <div class="tle-exit-panel"></div>
              <span class="tle-door-handle"></span>
              <span class="tle-door-badge" id="state-door">⇥</span>
            </button>
          </div>

          <!-- 6. FOREGROUND LEFT STUDY DESK, LAMP & OPEN BOOK -->
          <div class="tle-left-desk-zone">
            <div class="tle-left-desk-surface">
              <!-- Articulated Brass Desk Lamp -->
              <button
                type="button"
                class="tle-lamp-btn"
                id="obj-lamp"
                data-object-id="lamp"
                title="Toggle Desk Lamp"
              >
                <span class="tle-lamp-shade"></span>
                <span class="tle-lamp-bulb" id="lamp-bulb"></span>
                <span class="tle-lamp-arm"></span>
                <span class="tle-lamp-base"></span>
              </button>

              <!-- Stack of Vintage Books -->
              <div class="tle-book-stack" aria-hidden="true">
                <div class="tle-stacked-book tle-book-top"></div>
                <div class="tle-stacked-book tle-book-bot"></div>
              </div>

              <!-- Open Clue Book with Magnifying Glass -->
              <button
                type="button"
                class="tle-open-book-btn"
                id="obj-book"
                data-object-id="book"
                title="Inspect Open Journal"
              >
                <div class="tle-book-pages">
                  <div class="tle-page-left"></div>
                  <div class="tle-page-right"></div>
                </div>
                <span class="tle-magnifier-badge">🔍</span>
              </button>
            </div>
            <div class="tle-fg-chair" aria-hidden="true"></div>
          </div>

          <!-- Bottom Floating Glass Inventory & Clues Bar -->
          <aside class="tle-bottom-dock" id="inventory-clues-dock">
            <div class="tle-inventory-panel">
              <span class="tle-dock-label">INVENTORY:</span>
              <div class="tle-inv-slots" id="inventory-list"></div>
            </div>

            <div class="tle-dock-divider"></div>

            <div class="tle-clues-panel">
              <span class="tle-dock-label">CLUES:</span>
              <ul class="tle-clues-list" id="clues-list"></ul>
            </div>
          </aside>

          <!-- Close-Up Inspector / Computer Passcode Overlay -->
          <div class="tle-overlay hidden" id="inspector-modal">
            <div class="tle-modal-card">
              <h3 id="inspector-title">Inspect</h3>
              <div class="tle-inspector-body" id="inspector-body"></div>

              <!-- Computer Passcode Entry Box -->
              <div class="tle-passcode-area hidden" id="terminal-code-group">
                <div class="tle-keypad-row">
                  <button type="button" class="tle-kp-btn" data-digit="1">1</button>
                  <button type="button" class="tle-kp-btn" data-digit="9">9</button>
                  <button type="button" class="tle-kp-btn" data-digit="8">8</button>
                  <button type="button" class="tle-kp-btn" data-digit="4">4</button>
                  <button type="button" class="tle-kp-btn" id="btn-clear-code">CLR</button>
                </div>
                <div class="tle-code-input-row">
                  <input
                    type="text"
                    maxlength="4"
                    placeholder="1998"
                    class="tle-code-input"
                    id="terminal-code-input"
                    aria-label="Enter 4-digit computer password"
                  />
                  <button type="button" class="tle-primary-btn" id="btn-submit-code">
                    Unlock Door
                  </button>
                </div>
              </div>

              <div class="tle-modal-actions">
                <button type="button" class="tle-secondary-btn" id="btn-close-inspector">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Pause / Escape Victory Overlay -->
      <div class="tle-overlay hidden" id="pause-modal">
        <div class="tle-modal-card">
          <h3 id="modal-title">Game Paused</h3>
          <p id="modal-desc">
            You have 60 seconds to escape the room. When the timer reaches 00:00, the room and
            inventory items reset—but your discovered CLUES stay with you across every loop!
          </p>
          <div class="tle-modal-actions">
            <button type="button" class="tle-secondary-btn" id="btn-modal-reset">
              ↺ Restart Loop
            </button>
            <button type="button" class="tle-primary-btn" id="btn-resume">Resume</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const rootEl = container.querySelector<HTMLElement>("#tle-root");
  const pauseModal = container.querySelector<HTMLElement>("#pause-modal");
  const modalTitle = container.querySelector<HTMLElement>("#modal-title");
  const modalDesc = container.querySelector<HTMLElement>("#modal-desc");
  const inspectorModal = container.querySelector<HTMLElement>("#inspector-modal");
  const inspectorTitle = container.querySelector<HTMLElement>("#inspector-title");
  const inspectorBody = container.querySelector<HTMLElement>("#inspector-body");
  const terminalGroup = container.querySelector<HTMLElement>("#terminal-code-group");
  const codeInput = container.querySelector<HTMLInputElement>("#terminal-code-input");
  const resetBanner = container.querySelector<HTMLElement>("#loop-reset-banner");

  function addClue(clue: string): void {
    if (!state.clues.includes(clue)) {
      state.clues = [...state.clues, clue];
    }
  }

  function addInventoryItem(item: string): void {
    if (!state.inventory.includes(item)) {
      state.inventory = [...state.inventory, item];
    }
  }

  function openInspector(title: string, html: string, showTerminal = false): void {
    if (inspectorTitle) inspectorTitle.textContent = title;
    if (inspectorBody) inspectorBody.innerHTML = html;
    terminalGroup?.classList.toggle("hidden", !showTerminal);
    inspectorModal?.classList.remove("hidden");
    if (showTerminal) {
      codeInput?.focus();
    }
  }

  function handleObjectClick(objectId: RoomObjectId): void {
    state.selectedObjectId = objectId;

    switch (objectId) {
      case "lamp":
        state.lampOn = !state.lampOn;
        state.feedbackMessage = state.lampOn
          ? "Switched on the brass desk lamp — warm light illuminates the journal."
          : "Turned off the desk lamp — the room glows in moonlight.";
        break;

      case "book":
        addClue("BLUE - 4");
        state.feedbackMessage = 'Discovered clue in open journal: "BLUE - 4"!';
        openInspector(
          "📖 Open Journal on Desk",
          `<div class="tle-zoom-card">` +
            `<p class="tle-zoom-handwriting">"To whoever wakes here:<br/>` +
            `<strong>BLUE - 4</strong>"</p>` +
            `<p class="tle-zoom-sub">Find the blue object and interact with it 4 times.</p>` +
            `</div>`,
        );
        break;

      case "painting":
        if (!state.keyRevealed) {
          state.paintingClicks += 1;
          if (state.paintingClicks >= 4) {
            state.keyRevealed = true;
            state.score += 25;
            state.feedbackMessage =
              "Clicked the Blue Painting 4 times! It slides aside and reveals a hidden Golden Key!";
          } else {
            state.feedbackMessage =
              `Clicked the Blue Painting (${state.paintingClicks}/4) — the frame shifts slightly...`;
          }
        } else {
          state.feedbackMessage =
            "The Blue Painting has moved aside, exposing the hidden wall recess.";
        }
        break;

      case "key":
        if (state.keyRevealed && !state.keyCollected) {
          state.keyCollected = true;
          addInventoryItem("Golden Key");
          state.score += 25;
          state.feedbackMessage =
            "Collected the Golden Key! Click the locked wooden cabinet to unlock it.";
        }
        break;

      case "cabinet":
        if (state.cabinetUnlocked) {
          addClue("Find the year on the photograph");
          state.feedbackMessage = 'Cabinet clue: "Find the year on the photograph".';
          openInspector(
            "🗄️ Unlocked Wooden Cabinet",
            `<div class="tle-zoom-card">` +
              `<p class="tle-zoom-handwriting">"Find the year on the photograph"</p>` +
              `<p class="tle-zoom-sub">Check the photograph on the corkboard.</p>` +
              `</div>`,
          );
        } else if (state.keyCollected || state.inventory.includes("Golden Key")) {
          state.cabinetUnlocked = true;
          state.score += 50;
          addClue("Find the year on the photograph");
          addInventoryItem("Cabinet Note");
          state.feedbackMessage =
            'Unlocked the wooden cabinet with the Golden Key! Clue added: "Find the year on the photograph".';
          openInspector(
            "🔓 Cabinet Unlocked!",
            `<div class="tle-zoom-card">` +
              `<p class="tle-zoom-handwriting">"Find the year on the photograph"</p>` +
              `<p class="tle-zoom-sub">Clue permanently saved across all time loops!</p>` +
              `</div>`,
          );
        } else {
          state.feedbackMessage =
            "The wooden cabinet is locked with a brass padlock. You need a key.";
        }
        break;

      case "photo":
        addClue("Photograph Year: 1998");
        state.feedbackMessage =
          'Examined the corkboard photograph: the handwritten year at the bottom is "1998".';
        openInspector(
          "📷 Corkboard Photograph",
          `<div class="tle-zoom-card">` +
            `<div class="tle-zoom-photo-year">🏛️ <span>1998</span></div>` +
            `<p class="tle-zoom-sub">The photograph has <strong>1998</strong> written ` +
            `under the building. Use it as the computer password!</p>` +
            `</div>`,
        );
        break;

      case "computer":
        if (state.doorUnlocked) {
          state.feedbackMessage = "The computer is unlocked and the Exit Door is open!";
        } else {
          state.feedbackMessage =
            "Enter the 4-digit year from the photograph to unlock the Exit Door.";
          openInspector(
            "💻 Locked Computer Terminal",
            `<p class="tle-zoom-sub">Enter the 4-digit year from the photograph ` +
              `(<strong>1998</strong>):</p>`,
            true,
          );
        }
        break;

      case "door":
        if (state.doorUnlocked) {
          state.escaped = true;
          state.statusText = "Escaped!";
          state.score += 100;
          state.feedbackMessage = `🎉 You escaped the Time Loop on Loop #${state.loopCount}!`;
          const timeLeft = state.timeLeftSeconds;
          if (modalTitle && modalDesc && pauseModal) {
            modalTitle.textContent = "🎉 You Escaped the Time Loop!";
            modalDesc.textContent =
              `You unlocked the exit door and escaped on Loop #${state.loopCount} ` +
              `with ${timeLeft} seconds remaining!`;
            pauseModal.classList.remove("hidden");
          }
        } else {
          state.feedbackMessage =
            "The Exit Door is electronically locked. Unlock it from the computer first!";
        }
        break;
    }

    callbacks.onObjectInteract?.(objectId, "interact");
    renderState();
  }

  function submitPasscode(): void {
    const entered = codeInput?.value.trim() ?? "";
    if (VALID_PASSCODES.has(entered)) {
      state.doorUnlocked = true;
      state.score += 75;
      state.statusText = "Door Unlocked";
      state.feedbackMessage =
        "🔓 Password accepted! The computer unlocked the Exit Door — click the door to escape!";
      inspectorModal?.classList.add("hidden");
    } else {
      state.feedbackMessage =
        `Incorrect password ("${entered || "----"}"). Check the year written on the photograph (1998).`;
    }
    renderState();
  }

  function resetLoop(): void {
    const nextLoop = state.loopCount + 1;
    const clueCount = state.clues.length;
    state = {
      ...state,
      timeLeftSeconds: state.loopDurationSeconds,
      loopCount: nextLoop,
      statusText: "Loop Reset",
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      cabinetUnlocked: false,
      doorUnlocked: false,
      escaped: false,
      inventory: [],
      feedbackMessage:
        `⏳ Loop #${nextLoop}: The room reset and items disappeared, ` +
        `but your ${clueCount} discovered clue(s) remain!`,
    };
    if (codeInput) codeInput.value = "";
    inspectorModal?.classList.add("hidden");
    if (resetBanner) {
      resetBanner.classList.remove("hidden");
      setTimeout(() => {
        resetBanner.classList.add("hidden");
      }, 3200);
    }
    callbacks.onLoopReset?.(state.loopCount);
    renderState();
  }

  // Wire up interactive scene objects
  const sceneObjects = container.querySelectorAll<HTMLButtonElement>("[data-object-id]");
  for (const btn of sceneObjects) {
    btn.addEventListener("click", () => {
      const id = btn.dataset.objectId as RoomObjectId | undefined;
      if (id) handleObjectClick(id);
    });
  }

  // Keypad buttons inside computer modal
  const kpButtons = container.querySelectorAll<HTMLButtonElement>(".tle-kp-btn[data-digit]");
  for (const kp of kpButtons) {
    kp.addEventListener("click", () => {
      if (!codeInput) return;
      const d = kp.dataset.digit ?? "";
      if (codeInput.value.length < 4) {
        codeInput.value += d;
      }
      if (codeInput.value.length === 4) {
        submitPasscode();
      }
    });
  }

  container.querySelector("#btn-clear-code")?.addEventListener("click", () => {
    if (codeInput) codeInput.value = "";
  });

  container.querySelector("#btn-submit-code")?.addEventListener("click", () => {
    submitPasscode();
  });

  codeInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitPasscode();
  });

  container.querySelector("#btn-close-inspector")?.addEventListener("click", () => {
    inspectorModal?.classList.add("hidden");
  });

  container.querySelector("#btn-hint")?.addEventListener("click", () => {
    if (!state.clues.includes("BLUE - 4")) {
      state.feedbackMessage = "💡 Hint: Click the open book on the left desk to find the first clue.";
    } else if (!state.keyRevealed) {
      state.feedbackMessage = "💡 Hint: Clue says BLUE - 4. Click the Blue Painting 4 times!";
    } else if (!state.keyCollected) {
      state.feedbackMessage = "💡 Hint: Take the Golden Key revealed behind the Blue Painting!";
    } else if (!state.cabinetUnlocked) {
      state.feedbackMessage = "💡 Hint: Click the locked wooden cabinet in the center to open it.";
    } else if (!state.doorUnlocked) {
      state.feedbackMessage =
        "💡 Hint: Check the year on the corkboard photo (1998) and enter it on the computer!";
    } else {
      state.feedbackMessage = "💡 Hint: The Exit Door on the right is unlocked — click it to escape!";
    }
    renderState();
  });

  container.querySelector("#btn-reset-loop")?.addEventListener("click", () => {
    resetLoop();
  });

  container.querySelector("#btn-modal-reset")?.addEventListener("click", () => {
    pauseModal?.classList.add("hidden");
    resetLoop();
  });

  container.querySelector("#btn-pause-menu")?.addEventListener("click", () => {
    if (modalTitle && modalDesc) {
      modalTitle.textContent = "Game Paused";
      modalDesc.textContent =
        "Explore the room, collect items, and unlock the exit door within 60 seconds. " +
        "When the timer hits 00:00, items reset—but your discovered CLUES stay!";
    }
    pauseModal?.classList.remove("hidden");
  });

  container.querySelector("#btn-resume")?.addEventListener("click", () => {
    pauseModal?.classList.add("hidden");
  });

  function formatTime(seconds: number): string {
    const clamped = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function renderState(): void {
    const timerPill = container.querySelector<HTMLElement>("#hud-timer");
    const timerVal = container.querySelector<HTMLElement>("#hud-timer-val");
    const loopVal = container.querySelector<HTMLElement>("#hud-loop");
    const feedbackEl = container.querySelector<HTMLElement>("#action-feedback-text");

    const isUrgent = state.timeLeftSeconds <= 15;
    rootEl?.classList.toggle("tle-lamp-off", !state.lampOn);
    timerPill?.classList.toggle("tle-timer-urgent", isUrgent);

    if (timerVal) {
      timerVal.textContent = formatTime(state.timeLeftSeconds);
    }
    if (loopVal) {
      loopVal.textContent = `LOOP #${state.loopCount}`;
    }
    if (feedbackEl) {
      feedbackEl.textContent = state.feedbackMessage;
    }

    // Painting & Hidden Key state
    const paintingBtn = container.querySelector<HTMLElement>("#obj-painting");
    const paintingBadge = container.querySelector<HTMLElement>("#state-painting");
    const keyBtn = container.querySelector<HTMLElement>("#obj-key");
    paintingBtn?.classList.toggle("tle-painting-open", state.keyRevealed);
    if (paintingBadge) {
      paintingBadge.textContent = state.keyRevealed ? "OPEN" : `${state.paintingClicks}/4`;
    }
    keyBtn?.classList.toggle("hidden", !state.keyRevealed || state.keyCollected);

    // Cabinet state
    const cabinetBtn = container.querySelector<HTMLElement>("#obj-cabinet");
    const cabinetBadge = container.querySelector<HTMLElement>("#state-cabinet");
    cabinetBtn?.classList.toggle("tle-cabinet-open", state.cabinetUnlocked);
    if (cabinetBadge) {
      cabinetBadge.textContent = state.cabinetUnlocked ? "🔓" : "🔒";
    }

    // Computer Monitor state
    const monitorScreen = container.querySelector<HTMLElement>("#monitor-screen");
    const monitorLock = container.querySelector<HTMLElement>("#state-computer");
    const monitorPassbox = container.querySelector<HTMLElement>("#monitor-passbox");
    monitorScreen?.classList.toggle("tle-monitor-unlocked", state.doorUnlocked);
    if (monitorLock) {
      monitorLock.textContent = state.doorUnlocked ? "🔓" : "🔒";
    }
    if (monitorPassbox) {
      monitorPassbox.textContent = state.doorUnlocked ? "OPEN" : "* * * *";
    }

    // Exit Door state
    const doorBtn = container.querySelector<HTMLElement>("#obj-door");
    const doorBadge = container.querySelector<HTMLElement>("#state-door");
    doorBtn?.classList.toggle("tle-door-unlocked", state.doorUnlocked);
    if (doorBadge) {
      doorBadge.textContent = state.doorUnlocked ? "🔓" : "⇥";
    }

    // Render 4 Fixed Inventory Slots (matching the screenshot layout)
    const invContainer = container.querySelector<HTMLElement>("#inventory-list");
    if (invContainer) {
      const slotsHtml: string[] = [];
      for (let i = 0; i < 4; i++) {
        const item = state.inventory[i];
        if (item === "Golden Key") {
          slotsHtml.push(
            `<div class="tle-inv-slot tle-inv-slot-filled" title="Golden Key (resets on loop)">` +
              `<svg viewBox="0 0 64 64" class="tle-slot-key-svg">` +
              `<circle cx="22" cy="22" r="11" fill="none" stroke="#fbbf24" stroke-width="5"/>` +
              `<line x1="30" y1="30" x2="52" y2="52" stroke="#fbbf24" stroke-width="5"/>` +
              `<line x1="42" y1="42" x2="36" y2="48" stroke="#f59e0b" stroke-width="4"/>` +
              `<line x1="49" y1="49" x2="43" y2="55" stroke="#f59e0b" stroke-width="4"/>` +
              `</svg></div>`,
          );
        } else if (item) {
          slotsHtml.push(
            `<div class="tle-inv-slot tle-inv-slot-filled" title="${item}">📜</div>`,
          );
        } else {
          slotsHtml.push(`<div class="tle-inv-slot"></div>`);
        }
      }
      invContainer.innerHTML = slotsHtml.join("");
    }

    // Render Persistent Clues List (matching the screenshot layout)
    const cluesList = container.querySelector<HTMLElement>("#clues-list");
    if (cluesList) {
      if (state.clues.length === 0) {
        cluesList.innerHTML =
          '<li class="tle-clue-empty">Click the open book on the desk to discover your first clue...</li>';
      } else {
        cluesList.innerHTML = state.clues
          .map((clue) => `<li class="tle-clue-item">${clue}</li>`)
          .join("");
      }
    }
  }

  function update(partialState: Partial<GameScreenState>): void {
    const prevTime = state.timeLeftSeconds;
    state = {
      ...state,
      ...partialState,
      clues: partialState.clues ? [...partialState.clues] : state.clues,
      inventory: partialState.inventory ? [...partialState.inventory] : state.inventory,
    };

    if (
      partialState.timeLeftSeconds !== undefined &&
      partialState.timeLeftSeconds <= 0 &&
      prevTime > 0 &&
      !state.escaped
    ) {
      resetLoop();
      return;
    }

    renderState();
  }

  renderState();

  const viewportElement = container.querySelector<HTMLElement>("#game-viewport") ?? container;
  const dockElement = container.querySelector<HTMLElement>("#inventory-clues-dock") ?? container;

  return {
    update,
    resetLoop,
    getState: () => ({ ...state }),
    viewportElement,
    dockElement,
  };
}
