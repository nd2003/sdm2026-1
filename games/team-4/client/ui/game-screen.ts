export type DifficultyLevel = "basic" | "medium" | "hard";

export type RoomObjectId =
  | "window"
  | "book"
  | "lamp"
  | "painting"
  | "key"
  | "cabinet"
  | "photo"
  | "computer"
  | "door";

export type InventoryItemId = "Golden Key" | "UV Bulb" | "Power Fuse" | "Exit Keycard";

export interface GameScreenState {
  roomId?: string;
  difficulty?: DifficultyLevel;
  timeLeftSeconds?: number;
  loopDurationSeconds?: number;
  loopCount?: number;
  bestLoopScore?: number | null;
  partnerLoopScore?: number | null;
  connectedPlayers?: number;
  maxPlayers?: number;
  score?: number;
  statusText?: string;
  selectedObjectId?: RoomObjectId | null;
  activeItem?: InventoryItemId | null;
  lampOn?: boolean;
  uvLampInstalled?: boolean;
  paintingClicks?: number;
  keyRevealed?: boolean;
  keyCollected?: boolean;
  fuseCollected?: boolean;
  computerPowered?: boolean;
  cabinetUnlocked?: boolean;
  uvBulbCollected?: boolean;
  codeEntered?: boolean;
  keycardCollected?: boolean;
  doorUnlocked?: boolean;
  escaped?: boolean;
  timerRunning?: boolean;
  loopExpired?: boolean;
  clues?: string[];
  inventory?: InventoryItemId[];
  feedbackMessage?: string;
  onObjectInteract?: (
    objectId: RoomObjectId,
    action: "select" | "inspect" | "interact",
  ) => void;
  onLoopReset?: (newLoopCount: number) => void;
  onDifficultyChange?: (difficulty: DifficultyLevel) => void;
  onEscape?: (loopsTaken: number, difficulty: DifficultyLevel) => void;
}

interface InternalGameScreenState {
  roomId: string;
  difficulty: DifficultyLevel;
  timeLeftSeconds: number;
  loopDurationSeconds: number;
  loopCount: number;
  bestLoopScore: number | null;
  partnerLoopScore: number | null;
  connectedPlayers: number;
  maxPlayers: number;
  score: number;
  statusText: string;
  selectedObjectId: RoomObjectId | null;
  activeItem: InventoryItemId | null;
  lampOn: boolean;
  uvLampInstalled: boolean;
  paintingClicks: number;
  keyRevealed: boolean;
  keyCollected: boolean;
  fuseCollected: boolean;
  computerPowered: boolean;
  cabinetUnlocked: boolean;
  uvBulbCollected: boolean;
  codeEntered: boolean;
  keycardCollected: boolean;
  doorUnlocked: boolean;
  escaped: boolean;
  timerRunning: boolean;
  loopExpired: boolean;
  clues: string[];
  inventory: InventoryItemId[];
  feedbackMessage: string;
}

const DIFFICULTY_SECONDS: Record<DifficultyLevel, number> = {
  basic: 60,
  medium: 50,
  hard: 40,
};

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
    onDifficultyChange: initialState?.onDifficultyChange,
    onEscape: initialState?.onEscape,
  };

  const initialDiff: DifficultyLevel = initialState?.difficulty ?? "basic";
  const defaultDuration = initialState?.loopDurationSeconds ?? DIFFICULTY_SECONDS[initialDiff];

  let state: InternalGameScreenState = {
    roomId: initialState?.roomId ?? "ROOM-04",
    difficulty: initialDiff,
    timeLeftSeconds: initialState?.timeLeftSeconds ?? defaultDuration,
    loopDurationSeconds: defaultDuration,
    loopCount: initialState?.loopCount ?? 1,
    bestLoopScore: initialState?.bestLoopScore ?? null,
    partnerLoopScore: initialState?.partnerLoopScore ?? null,
    connectedPlayers: initialState?.connectedPlayers ?? 2,
    maxPlayers: initialState?.maxPlayers ?? 2,
    score: initialState?.score ?? 1,
    statusText: initialState?.statusText ?? "Ready",
    selectedObjectId: initialState?.selectedObjectId ?? null,
    activeItem: initialState?.activeItem ?? null,
    lampOn: initialState?.lampOn ?? true,
    uvLampInstalled: initialState?.uvLampInstalled ?? false,
    paintingClicks: initialState?.paintingClicks ?? 0,
    keyRevealed: initialState?.keyRevealed ?? false,
    keyCollected: initialState?.keyCollected ?? false,
    fuseCollected: initialState?.fuseCollected ?? false,
    computerPowered: initialState?.computerPowered ?? initialDiff === "basic",
    cabinetUnlocked: initialState?.cabinetUnlocked ?? false,
    uvBulbCollected: initialState?.uvBulbCollected ?? false,
    codeEntered: initialState?.codeEntered ?? false,
    keycardCollected: initialState?.keycardCollected ?? false,
    doorUnlocked: initialState?.doorUnlocked ?? false,
    escaped: initialState?.escaped ?? false,
    timerRunning: initialState?.timerRunning ?? false,
    loopExpired: initialState?.loopExpired ?? false,
    clues: initialState?.clues ? [...initialState.clues] : [],
    inventory: initialState?.inventory ? [...initialState.inventory] : [],
    feedbackMessage:
      initialState?.feedbackMessage ??
      "Select a difficulty (Basic / Medium / Hard) and press ▶ Start to begin Loop #1!",
  };

  container.innerHTML = `
    <div class="tle-root" id="tle-root">
      <!-- Top Header Bar -->
      <header class="tle-header">
        <div class="tle-header-left">
          <button type="button" class="tle-icon-btn" id="btn-pause-menu" title="Pause & Scoreboard">
            <span>⏸</span>
          </button>
          <button type="button" class="tle-icon-btn" id="btn-hint" title="Show Hint">
            <span>💡</span>
          </button>

          <!-- Difficulty Level Selector: Basic / Medium / Hard -->
          <div class="tle-diff-group" role="group" aria-label="Difficulty Level">
            <button type="button" class="tle-diff-btn" data-diff="basic">Basic</button>
            <button type="button" class="tle-diff-btn" data-diff="medium">Medium</button>
            <button type="button" class="tle-diff-btn" data-diff="hard">Hard</button>
          </div>

          <!-- Loop Counter = Player Score -->
          <div class="tle-score-cluster">
            <span class="tle-loop-pill" id="hud-loop">LOOP #${state.loopCount}</span>
            <span class="tle-best-pill" id="hud-score-val" title="Fewer loops to escape = better score!">
              🏆 Score: --
            </span>
          </div>
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
          <button
            type="button"
            class="tle-ctrl-btn tle-ctrl-start"
            id="btn-start-restart"
            title="Start or Restart the Time Loop"
          >
            ▶ Start
          </button>
          <button
            type="button"
            class="tle-ctrl-btn tle-ctrl-stop"
            id="btn-stop-loop"
            title="Stop the Timer"
          >
            ⏹ Stop
          </button>
          <button
            type="button"
            class="tle-ctrl-btn tle-ctrl-restart"
            id="btn-reset-loop"
            title="Restart the Loop (increments Loop Score counter)"
          >
            ↺ Restart
          </button>
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
            ⏰ TIME'S UP — Inventory items vanished, but your CLUES remain! Press ↺ Restart for next loop.
          </div>

          <!-- Feedback Subtitle Toast -->
          <div class="tle-feedback-toast" id="action-feedback-text">
            ${state.feedbackMessage}
          </div>

          <!-- Room Architecture: Left Wall, Back Wall, Floor, Window & Rain -->
          <div class="tle-wall-back">
            <!-- Hidden UV Wall Clue (visible when UV Bulb is installed in Lamp) -->
            <div class="tle-uv-wall-secret" id="uv-wall-secret">
              UV INK REVEALED: "PHOTO YEAR = 1998"
            </div>
          </div>

          <div class="tle-wall-left">
            <!-- Rainy Night Window with Venetian Blinds (Clickable for Power Fuse in Medium/Hard) -->
            <button
              type="button"
              class="tle-window-frame"
              id="obj-window"
              data-object-id="window"
              title="Inspect Window Blinds"
            >
              <span class="tle-window-sky">
                <span class="tle-rain-layer"></span>
              </span>
              <span class="tle-window-blinds"></span>
              <span class="tle-fuse-spark hidden" id="window-fuse-badge">🔋</span>
            </button>
            <div class="tle-ivy-left" aria-hidden="true">🌿</div>
          </div>
          <div class="tle-floor"></div>

          <!-- Warm or UV Lamp Light Cone Overlay -->
          <div class="tle-lamp-cone" id="lamp-cone"></div>

          <!-- 1. BLUE MOUNTAIN PAINTING + HIDDEN WALL SAFE (Left-Center Wall) -->
          <div class="tle-painting-zone">
            <div class="tle-wall-safe" id="wall-safe">
              <button
                type="button"
                class="tle-safe-key-btn hidden"
                id="obj-key"
                data-object-id="key"
                title="Collect Golden Key"
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
                </div>
                <div class="tle-cabinet-door tle-door-right">
                  <div class="tle-door-panel"></div>
                  <div class="tle-door-panel"></div>
                </div>
              </div>
              <div class="tle-cabinet-interior" id="cabinet-interior">
                <span class="tle-interior-scroll" id="cabinet-interior-label">📜 Clue Inside</span>
              </div>
              <span class="tle-glow-badge" id="state-cabinet">🔒</span>
            </button>
          </div>

          <!-- 3. CORK BULLETIN BOARD WITH PHOTOGRAPH (Right-Center Wall) -->
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
              <div class="tle-polaroid-caption" id="polaroid-caption">••••</div>
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
              <button
                type="button"
                class="tle-lamp-btn"
                id="obj-lamp"
                data-object-id="lamp"
                title="Desk Lamp (Fit UV Bulb in Medium/Hard)"
              >
                <span class="tle-lamp-shade"></span>
                <span class="tle-lamp-bulb" id="lamp-bulb"></span>
                <span class="tle-lamp-arm"></span>
                <span class="tle-lamp-base"></span>
              </button>

              <div class="tle-book-stack" aria-hidden="true">
                <div class="tle-stacked-book tle-book-top"></div>
                <div class="tle-stacked-book tle-book-bot"></div>
              </div>

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
          </div>

          <!-- Bottom Floating Glass Inventory (4 Creative Slots) & Clues Bar -->
          <aside class="tle-bottom-dock" id="inventory-clues-dock">
            <div class="tle-inventory-panel">
              <div class="tle-dock-label-col">
                <span class="tle-dock-label">INVENTORY:</span>
                <span class="tle-dock-sub" id="inv-active-label">Click slot to equip</span>
              </div>
              <div class="tle-inv-slots" id="inventory-list"></div>
            </div>

            <div class="tle-dock-divider"></div>

            <div class="tle-clues-panel">
              <div class="tle-dock-label-col">
                <span class="tle-dock-label">CLUES:</span>
                <span class="tle-dock-sub">Kept across loops</span>
              </div>
              <ul class="tle-clues-list" id="clues-list"></ul>
            </div>
          </aside>

          <!-- Close-Up Inspector / Computer Passcode Overlay -->
          <div class="tle-overlay hidden" id="inspector-modal">
            <div class="tle-modal-card">
              <h3 id="inspector-title">Inspect</h3>
              <div class="tle-inspector-body" id="inspector-body"></div>

              <!-- Computer Passcode Entry Box (Full 0-9 Keypad, no spoilers) -->
              <div class="tle-passcode-area hidden" id="terminal-code-group">
                <div class="tle-keypad-grid">
                  <button type="button" class="tle-kp-btn" data-digit="1">1</button>
                  <button type="button" class="tle-kp-btn" data-digit="2">2</button>
                  <button type="button" class="tle-kp-btn" data-digit="3">3</button>
                  <button type="button" class="tle-kp-btn" data-digit="4">4</button>
                  <button type="button" class="tle-kp-btn" data-digit="5">5</button>
                  <button type="button" class="tle-kp-btn" data-digit="6">6</button>
                  <button type="button" class="tle-kp-btn" data-digit="7">7</button>
                  <button type="button" class="tle-kp-btn" data-digit="8">8</button>
                  <button type="button" class="tle-kp-btn" data-digit="9">9</button>
                  <button type="button" class="tle-kp-btn" id="btn-clear-code">CLR</button>
                  <button type="button" class="tle-kp-btn" data-digit="0">0</button>
                  <button type="button" class="tle-kp-btn tle-kp-enter" id="btn-kp-enter">
                    OK
                  </button>
                </div>
                <div class="tle-code-input-row">
                  <input
                    type="password"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="****"
                    class="tle-code-input"
                    id="terminal-code-input"
                    aria-label="Enter 4-digit computer password"
                  />
                  <button type="button" class="tle-primary-btn" id="btn-submit-code">
                    Enter
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

      <!-- Pause / Multiplayer Loop Scoreboard Overlay -->
      <div class="tle-overlay hidden" id="pause-modal">
        <div class="tle-modal-card">
          <h3 id="modal-title">Time Loop Scoreboard</h3>
          <p id="modal-desc">
            Your score is the number of loops it takes you to escape (lower is better!).
          </p>
          <div class="tle-scoreboard-box" id="scoreboard-box"></div>
          <div class="tle-modal-actions">
            <button type="button" class="tle-secondary-btn" id="btn-modal-reset">
              ↺ Next Loop (+1)
            </button>
            <button type="button" class="tle-primary-btn" id="btn-resume">Continue</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const rootEl = container.querySelector<HTMLElement>("#tle-root");
  const pauseModal = container.querySelector<HTMLElement>("#pause-modal");
  const modalTitle = container.querySelector<HTMLElement>("#modal-title");
  const modalDesc = container.querySelector<HTMLElement>("#modal-desc");
  const scoreboardBox = container.querySelector<HTMLElement>("#scoreboard-box");
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

  function addInventoryItem(item: InventoryItemId): void {
    if (!state.inventory.includes(item)) {
      state.inventory = [...state.inventory, item];
      state.activeItem = item;
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

  function switchDifficulty(diff: DifficultyLevel): void {
    const duration = DIFFICULTY_SECONDS[diff];
    state = {
      ...state,
      difficulty: diff,
      timeLeftSeconds: duration,
      loopDurationSeconds: duration,
      loopCount: 1,
      score: 1,
      timerRunning: false,
      loopExpired: false,
      escaped: false,
      activeItem: null,
      lampOn: true,
      uvLampInstalled: false,
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      fuseCollected: false,
      computerPowered: diff === "basic",
      cabinetUnlocked: false,
      uvBulbCollected: false,
      codeEntered: false,
      keycardCollected: false,
      doorUnlocked: false,
      clues: [],
      inventory: [],
      feedbackMessage:
        `Switched to ${diff.toUpperCase()} mode (${duration}s per loop). ` +
        `Press ▶ Start to begin Loop #1!`,
    };
    resetBanner?.classList.add("hidden");
    inspectorModal?.classList.add("hidden");
    callbacks.onDifficultyChange?.(diff);
    renderState();
  }

  function handleObjectClick(objectId: RoomObjectId): void {
    state.selectedObjectId = objectId;

    switch (objectId) {
      case "window":
        if (state.difficulty === "basic") {
          state.feedbackMessage =
            "Rain lashes against the window blinds outside. Nothing hidden here on Basic mode.";
        } else if (!state.fuseCollected) {
          state.fuseCollected = true;
          addInventoryItem("Power Fuse");
          state.feedbackMessage =
            "🔋 Found a Power Fuse hidden inside the window blind casing! Use it on the Computer.";
        } else {
          state.feedbackMessage = "You already took the Power Fuse from the window blinds.";
        }
        break;

      case "lamp":
        if (
          state.difficulty !== "basic" &&
          state.uvBulbCollected &&
          !state.uvLampInstalled
        ) {
          state.uvLampInstalled = true;
          state.lampOn = true;
          state.feedbackMessage =
            "🔦 Installed the UV Bulb into the Desk Lamp! Purple UV light reveals hidden ink!";
          addClue("UV Light Active: Inspect Corkboard Photo");
        } else {
          state.lampOn = !state.lampOn;
          state.feedbackMessage = state.lampOn
            ? state.uvLampInstalled
              ? "UV Blacklight Lamp switched ON."
              : "Brass desk lamp switched ON."
            : "Desk lamp switched OFF.";
        }
        break;

      case "book": {
        addClue("BLUE - 4");
        const extraHint =
          state.difficulty === "basic"
            ? ""
            : "<br/><em>Margin note: Check the window blinds for a spare power fuse.</em>";
        if (state.difficulty !== "basic") {
          addClue("Window blinds hide a Power Fuse");
        }
        state.feedbackMessage = 'Discovered clue in open journal: "BLUE - 4"!';
        openInspector(
          "📖 Open Journal on Desk",
          `<div class="tle-zoom-card">` +
            `<p class="tle-zoom-handwriting">"To whoever wakes here:<br/>` +
            `<strong>BLUE - 4</strong>"</p>` +
            `<p class="tle-zoom-sub">Interact with the blue object 4 times.${extraHint}</p>` +
            `</div>`,
        );
        break;
      }

      case "painting":
        if (!state.keyRevealed) {
          state.paintingClicks += 1;
          if (state.paintingClicks >= 4) {
            state.keyRevealed = true;
            state.feedbackMessage =
              "The Blue Painting slides aside and reveals a hidden Golden Key!";
          } else {
            state.feedbackMessage =
              "You touch the Blue Painting — the frame shifts slightly...";
          }
        } else {
          state.feedbackMessage =
            "The Blue Painting has moved aside, exposing the wall safe.";
        }
        break;

      case "key":
        if (state.keyRevealed && !state.keyCollected) {
          state.keyCollected = true;
          addInventoryItem("Golden Key");
          state.feedbackMessage =
            "🗝️ Collected Golden Key (Slot 1)! Click the locked wooden cabinet.";
        }
        break;

      case "cabinet":
        if (state.cabinetUnlocked) {
          state.feedbackMessage = 'Cabinet clue: "Find the year on the photograph".';
        } else if (state.keyCollected || state.inventory.includes("Golden Key")) {
          state.cabinetUnlocked = true;
          addClue("Find the year on the photograph");
          if (state.difficulty !== "basic" && !state.uvBulbCollected) {
            state.uvBulbCollected = true;
            addInventoryItem("UV Bulb");
            addClue("Install UV Bulb into Desk Lamp to read invisible ink");
            state.feedbackMessage =
              "🔓 Unlocked cabinet! Found a clue AND a 🔦 UV Bulb (Slot 2) — click the Desk Lamp!";
            openInspector(
              "🔓 Cabinet Unlocked!",
              `<div class="tle-zoom-card">` +
                `<p class="tle-zoom-handwriting">"Find the year on the photograph"</p>` +
                `<p class="tle-zoom-sub">You also found a <strong>🔦 UV Bulb</strong>! ` +
                `Click the Desk Lamp to install it and reveal hidden UV ink.</p>` +
                `</div>`,
            );
          } else {
            state.feedbackMessage =
              '🔓 Unlocked wooden cabinet! Clue added: "Find the year on the photograph".';
            openInspector(
              "🔓 Cabinet Unlocked!",
              `<div class="tle-zoom-card">` +
                `<p class="tle-zoom-handwriting">"Find the year on the photograph"</p>` +
                `<p class="tle-zoom-sub">Clue permanently saved across all time loops!</p>` +
                `</div>`,
            );
          }
        } else {
          state.feedbackMessage =
            "The wooden cabinet is locked with a brass padlock. You need the Golden Key.";
        }
        break;

      case "photo":
        if (state.difficulty !== "basic" && (!state.uvLampInstalled || !state.lampOn)) {
          state.feedbackMessage =
            "The date on the photograph is faded/invisible! You need UV light on the Desk Lamp.";
          openInspector(
            "📷 Corkboard Photograph (Faded)",
            `<div class="tle-zoom-card">` +
              `<div class="tle-zoom-photo-year">🏛️ <span>????</span></div>` +
              `<p class="tle-zoom-sub">The caption is written in invisible UV ink! ` +
              `Install the <strong>🔦 UV Bulb</strong> from the cabinet into the Desk Lamp.</p>` +
              `</div>`,
          );
        } else {
          state.feedbackMessage =
            "You inspect the photograph pinned to the corkboard closely.";
          openInspector(
            "📷 Corkboard Photograph",
            `<div class="tle-zoom-card">` +
              `<div class="tle-zoom-photo-year">🏛️ <span>1998</span></div>` +
              `<p class="tle-zoom-sub">Under the light, the handwritten year ` +
              `along the bottom border is clearly visible.</p>` +
              `</div>`,
          );
        }
        break;

      case "computer":
        if (!state.computerPowered) {
          if (state.fuseCollected || state.inventory.includes("Power Fuse")) {
            state.computerPowered = true;
            state.feedbackMessage =
              "🔋 Inserted Power Fuse! The Computer Terminal boots up — click it to enter passcode.";
          } else {
            state.feedbackMessage =
              "⚡ The Computer Terminal has no power! Find the Power Fuse hidden in the room.";
          }
          break;
        }
        if (state.codeEntered) {
          state.feedbackMessage =
            state.difficulty === "hard" && !state.doorUnlocked
              ? "Use the 💳 Exit Keycard from your inventory on the Exit Door!"
              : "The computer unlocked the Exit Door!";
        } else {
          state.feedbackMessage = "The computer terminal requires a 4-digit passcode.";
          openInspector(
            "💻 Locked Computer Terminal",
            `<p class="tle-zoom-sub">Enter the 4-digit security passcode:</p>`,
            true,
          );
        }
        break;

      case "door":
        if (state.difficulty === "hard" && state.codeEntered && !state.doorUnlocked) {
          if (state.keycardCollected || state.inventory.includes("Exit Keycard")) {
            state.doorUnlocked = true;
            state.feedbackMessage =
              "💳 Swiped Exit Keycard! The Exit Door is unlocked — click again to escape!";
            break;
          }
        }
        if (state.doorUnlocked) {
          state.escaped = true;
          state.timerRunning = false;
          state.score = state.loopCount;
          if (
            state.bestLoopScore === null ||
            state.loopCount < state.bestLoopScore
          ) {
            state.bestLoopScore = state.loopCount;
          }
          state.statusText = `Escaped in ${state.loopCount} Loop(s)!`;
          state.feedbackMessage =
            `🎉 Escaped on ${state.difficulty.toUpperCase()} in ${state.loopCount} loop(s)! ` +
            `(Your Score = ${state.loopCount})`;
          callbacks.onEscape?.(state.loopCount, state.difficulty);
          showScoreboardModal(true);
        } else {
          state.feedbackMessage =
            state.difficulty === "hard" && state.codeEntered
              ? "Swipe the 💳 Exit Keycard on the door reader to unseal it!"
              : "The Exit Door is electronically locked. Unlock it from the computer first!";
        }
        break;
    }

    callbacks.onObjectInteract?.(objectId, "interact");
    renderState();
  }

  function submitPasscode(): void {
    const entered = codeInput?.value.trim() ?? "";
    if (VALID_PASSCODES.has(entered)) {
      state.codeEntered = true;
      inspectorModal?.classList.add("hidden");
      if (state.difficulty === "hard") {
        state.keycardCollected = true;
        addInventoryItem("Exit Keycard");
        state.feedbackMessage =
          "💳 Passcode accepted! Terminal ejected the Exit Keycard (Slot 4) — click the Exit Door!";
      } else {
        state.doorUnlocked = true;
        state.statusText = "Door Unlocked";
        state.feedbackMessage =
          "🔓 Passcode accepted! The Exit Door is unlocked — click the door to escape!";
      }
    } else {
      state.feedbackMessage =
        "Incorrect passcode. Search the room for clues to find the 4-digit code.";
    }
    renderState();
  }

  function showScoreboardModal(escapedNow: boolean): void {
    if (!modalTitle || !modalDesc || !pauseModal) return;
    if (escapedNow) {
      modalTitle.textContent = `🎉 Escaped in ${state.loopCount} Loop${state.loopCount === 1 ? "" : "s"}!`;
      modalDesc.textContent =
        `Difficulty: ${state.difficulty.toUpperCase()} · ` +
        `In Time Loop Escape, your score is the total loops needed to escape (lower is better!).`;
    } else {
      modalTitle.textContent = "Time Loop Scoreboard & Pause";
      modalDesc.textContent =
        "Items reset every loop, but your discovered CLUES stay! Fewer loops = better score.";
    }
    if (scoreboardBox) {
      const myBest =
        state.bestLoopScore !== null ? `${state.bestLoopScore} Loop(s)` : `${state.loopCount} (In Progress)`;
      const p2Score =
        state.partnerLoopScore !== null ? `${state.partnerLoopScore} Loop(s)` : "Waiting for P2...";
      scoreboardBox.innerHTML =
        `<div class="tle-score-row"><span>👤 You (Player 1) — Current Loop:</span>` +
        `<strong>Loop #${state.loopCount}</strong></div>` +
        `<div class="tle-score-row"><span>🏆 Your Best Escape Score:</span>` +
        `<strong>${myBest}</strong></div>` +
        `<div class="tle-score-row"><span>🖥️ Teammate (Player 2):</span>` +
        `<strong>${p2Score}</strong></div>`;
    }
    pauseModal.classList.remove("hidden");
  }

  function expireLoop(): void {
    const clueCount = state.clues.length;
    state = {
      ...state,
      timeLeftSeconds: 0,
      timerRunning: false,
      loopExpired: true,
      statusText: "Loop Expired",
      activeItem: null,
      uvLampInstalled: false,
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      fuseCollected: false,
      computerPowered: state.difficulty === "basic",
      cabinetUnlocked: false,
      uvBulbCollected: false,
      codeEntered: false,
      keycardCollected: false,
      doorUnlocked: false,
      inventory: [],
      feedbackMessage:
        `⏰ Time's up! All inventory items vanished, but ${clueCount} clue(s) remain. ` +
        `Press ↺ Restart for Loop #${state.loopCount + 1}!`,
    };
    if (codeInput) codeInput.value = "";
    inspectorModal?.classList.add("hidden");
    resetBanner?.classList.remove("hidden");
    renderState();
  }

  function resetLoop(): void {
    const nextLoop = state.loopCount + 1;
    const clueCount = state.clues.length;
    state = {
      ...state,
      timeLeftSeconds: state.loopDurationSeconds,
      loopCount: nextLoop,
      score: nextLoop,
      timerRunning: true,
      loopExpired: false,
      statusText: "Loop Active",
      activeItem: null,
      uvLampInstalled: false,
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      fuseCollected: false,
      computerPowered: state.difficulty === "basic",
      cabinetUnlocked: false,
      uvBulbCollected: false,
      codeEntered: false,
      keycardCollected: false,
      doorUnlocked: false,
      escaped: false,
      inventory: [],
      feedbackMessage:
        `⏳ Loop #${nextLoop} started! Room & items reset, ` +
        `but your ${clueCount} discovered clue(s) remain!`,
    };
    if (codeInput) codeInput.value = "";
    inspectorModal?.classList.add("hidden");
    resetBanner?.classList.add("hidden");
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

  // Wire up difficulty buttons
  const diffButtons = container.querySelectorAll<HTMLButtonElement>(".tle-diff-btn");
  for (const dBtn of diffButtons) {
    dBtn.addEventListener("click", () => {
      const diff = dBtn.dataset.diff as DifficultyLevel | undefined;
      if (diff) switchDifficulty(diff);
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

  container.querySelector("#btn-kp-enter")?.addEventListener("click", () => {
    submitPasscode();
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
      state.feedbackMessage =
        "💡 Hint: Inspect the open journal on the study desk to find your first clue.";
    } else if (!state.keyRevealed) {
      state.feedbackMessage =
        "💡 Hint: Follow the first clue you discovered in the journal.";
    } else if (!state.keyCollected) {
      state.feedbackMessage = "💡 Hint: Take the Golden Key from the wall recess!";
    } else if (!state.cabinetUnlocked) {
      state.feedbackMessage = "💡 Hint: Use the Golden Key on the locked wooden cabinet.";
    } else if (state.difficulty !== "basic" && !state.uvLampInstalled) {
      state.feedbackMessage =
        "💡 Hint: Click the Desk Lamp to install the UV Bulb from the cabinet!";
    } else if (state.difficulty !== "basic" && !state.computerPowered) {
      state.feedbackMessage =
        "💡 Hint: Check the rainy window blinds on the left to find the Power Fuse!";
    } else if (!state.codeEntered) {
      state.feedbackMessage =
        "💡 Hint: Inspect the corkboard photograph and enter its year on the computer.";
    } else {
      state.feedbackMessage =
        "💡 Hint: Click the Exit Door on the right to escape the time loop!";
    }
    renderState();
  });

  container.querySelector("#btn-start-restart")?.addEventListener("click", () => {
    if (state.loopExpired || state.timeLeftSeconds <= 0 || state.escaped) {
      resetLoop();
    } else if (!state.timerRunning) {
      state.timerRunning = true;
      state.statusText = "Loop Active";
      state.feedbackMessage =
        `▶ Loop #${state.loopCount} (${state.difficulty.toUpperCase()}) started! ` +
        `Escape in as few loops as possible.`;
      renderState();
    }
  });

  container.querySelector("#btn-stop-loop")?.addEventListener("click", () => {
    if (state.timerRunning) {
      state.timerRunning = false;
      state.statusText = "Stopped";
      state.feedbackMessage =
        "⏹ Timer stopped. Press ▶ Start to resume or ↺ Restart to start the next loop.";
      renderState();
    }
  });

  container.querySelector("#btn-reset-loop")?.addEventListener("click", () => {
    resetLoop();
  });

  container.querySelector("#btn-modal-reset")?.addEventListener("click", () => {
    pauseModal?.classList.add("hidden");
    resetLoop();
  });

  container.querySelector("#btn-pause-menu")?.addEventListener("click", () => {
    showScoreboardModal(false);
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

  function renderSlotItemSvg(item: InventoryItemId): string {
    switch (item) {
      case "Golden Key":
        return (
          `<svg viewBox="0 0 64 64" class="tle-slot-key-svg">` +
          `<circle cx="22" cy="22" r="11" fill="none" stroke="#fbbf24" stroke-width="5"/>` +
          `<line x1="30" y1="30" x2="52" y2="52" stroke="#fbbf24" stroke-width="5"/>` +
          `<line x1="42" y1="42" x2="36" y2="48" stroke="#f59e0b" stroke-width="4"/>` +
          `<line x1="49" y1="49" x2="43" y2="55" stroke="#f59e0b" stroke-width="4"/>` +
          `</svg><span class="tle-slot-tag">Key</span>`
        );
      case "UV Bulb":
        return `<span class="tle-slot-emoji">🔦</span><span class="tle-slot-tag">UV Bulb</span>`;
      case "Power Fuse":
        return `<span class="tle-slot-emoji">🔋</span><span class="tle-slot-tag">Fuse</span>`;
      case "Exit Keycard":
        return `<span class="tle-slot-emoji">💳</span><span class="tle-slot-tag">Keycard</span>`;
    }
  }

  function renderState(): void {
    const timerPill = container.querySelector<HTMLElement>("#hud-timer");
    const timerVal = container.querySelector<HTMLElement>("#hud-timer-val");
    const loopVal = container.querySelector<HTMLElement>("#hud-loop");
    const scoreVal = container.querySelector<HTMLElement>("#hud-score-val");
    const feedbackEl = container.querySelector<HTMLElement>("#action-feedback-text");
    const startRestartBtn = container.querySelector<HTMLButtonElement>("#btn-start-restart");
    const stopBtn = container.querySelector<HTMLButtonElement>("#btn-stop-loop");
    const activeLabel = container.querySelector<HTMLElement>("#inv-active-label");
    const fuseBadge = container.querySelector<HTMLElement>("#window-fuse-badge");

    const isUrgent = state.timeLeftSeconds <= 15;
    rootEl?.classList.toggle("tle-lamp-off", !state.lampOn);
    rootEl?.classList.toggle("tle-uv-room", state.lampOn && state.uvLampInstalled);
    timerPill?.classList.toggle("tle-timer-urgent", isUrgent);

    for (const dBtn of diffButtons) {
      dBtn.classList.toggle("tle-diff-active", dBtn.dataset.diff === state.difficulty);
    }

    if (timerVal) {
      timerVal.textContent = formatTime(state.timeLeftSeconds);
    }
    if (loopVal) {
      loopVal.textContent = `LOOP #${state.loopCount}`;
    }
    if (scoreVal) {
      scoreVal.textContent =
        state.bestLoopScore !== null
          ? `🏆 Best: ${state.bestLoopScore} Loop${state.bestLoopScore === 1 ? "" : "s"}`
          : `🎯 Score: ${state.loopCount} Loop${state.loopCount === 1 ? "" : "s"}`;
    }
    if (feedbackEl) {
      feedbackEl.textContent = state.feedbackMessage;
    }
    if (activeLabel) {
      activeLabel.textContent = state.activeItem
        ? `Equipped: ${state.activeItem}`
        : "Resets every loop";
    }
    if (fuseBadge) {
      fuseBadge.classList.toggle(
        "hidden",
        state.difficulty === "basic" || state.fuseCollected,
      );
    }

    if (startRestartBtn) {
      if (state.loopExpired || state.timeLeftSeconds <= 0 || state.escaped) {
        startRestartBtn.textContent = "↺ Restart";
        startRestartBtn.classList.add("tle-ctrl-restart-mode");
        startRestartBtn.disabled = false;
      } else if (state.timerRunning) {
        startRestartBtn.textContent = "▶ Running";
        startRestartBtn.classList.remove("tle-ctrl-restart-mode");
        startRestartBtn.disabled = true;
      } else {
        startRestartBtn.textContent = "▶ Start";
        startRestartBtn.classList.remove("tle-ctrl-restart-mode");
        startRestartBtn.disabled = false;
      }
    }
    if (stopBtn) {
      stopBtn.disabled = !state.timerRunning;
    }

    // Painting & Hidden Key state
    const paintingBtn = container.querySelector<HTMLElement>("#obj-painting");
    const keyBtn = container.querySelector<HTMLElement>("#obj-key");
    paintingBtn?.classList.toggle("tle-painting-open", state.keyRevealed);
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
    monitorScreen?.classList.toggle("tle-monitor-unlocked", state.codeEntered);
    monitorScreen?.classList.toggle("tle-monitor-unpowered", !state.computerPowered);
    if (monitorLock) {
      monitorLock.textContent = !state.computerPowered
        ? "⚡"
        : state.codeEntered
          ? "🔓"
          : "🔒";
    }
    if (monitorPassbox) {
      monitorPassbox.textContent = !state.computerPowered
        ? "NO PWR"
        : state.codeEntered
          ? "OPEN"
          : "* * * *";
    }

    // Exit Door state
    const doorBtn = container.querySelector<HTMLElement>("#obj-door");
    const doorBadge = container.querySelector<HTMLElement>("#state-door");
    doorBtn?.classList.toggle("tle-door-unlocked", state.doorUnlocked);
    if (doorBadge) {
      doorBadge.textContent = state.doorUnlocked
        ? "🔓"
        : state.difficulty === "hard" && state.codeEntered
          ? "💳"
          : "⇥";
    }

    // Render 4 Interactive Inventory Slots (Key, UV Bulb, Power Fuse, Exit Keycard)
    const invContainer = container.querySelector<HTMLElement>("#inventory-list");
    if (invContainer) {
      const slotsHtml: string[] = [];
      for (let i = 0; i < 4; i++) {
        const item = state.inventory[i];
        if (item) {
          const isEquipped = state.activeItem === item;
          slotsHtml.push(
            `<button type="button" class="tle-inv-slot tle-inv-slot-filled ${
              isEquipped ? "tle-inv-slot-active" : ""
            }" data-inv-item="${item}" title="${item} (Click to equip)">` +
              renderSlotItemSvg(item) +
              `</button>`,
          );
        } else {
          slotsHtml.push(`<div class="tle-inv-slot"></div>`);
        }
      }
      invContainer.innerHTML = slotsHtml.join("");

      const slotBtns = invContainer.querySelectorAll<HTMLButtonElement>("[data-inv-item]");
      for (const sBtn of slotBtns) {
        sBtn.addEventListener("click", () => {
          const item = sBtn.dataset.invItem as InventoryItemId | undefined;
          if (!item) return;
          state.activeItem = item;
          state.feedbackMessage = `Equipped [${item}] — click the matching object in the room to use it!`;
          renderState();
        });
      }
    }

    // Render Persistent Clues List
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
      expireLoop();
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
