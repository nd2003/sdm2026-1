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
  | "door"
  | "r2-gramophone"
  | "r2-coffee-table"
  | "r2-bookshelf"
  | "r2-vault"
  | "r2-door"
  | "r3-breaker"
  | "r3-holo-table"
  | "r3-laser-grid"
  | "r3-cryo-core"
  | "r3-door";

export type InventoryItemId =
  | "Golden Key"
  | "Winding Key"
  | "Ruby Lens"
  | "Parlor Emblem"
  | "Optic Mirror"
  | "Plasma Cell"
  | "Quantum Keycard";

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
  paintingClicks?: number;
  keyRevealed?: boolean;
  keyCollected?: boolean;
  cabinetUnlocked?: boolean;
  codeEntered?: boolean;
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
  // Room 1 state
  lampOn: boolean;
  paintingClicks: number;
  keyRevealed: boolean;
  keyCollected: boolean;
  cabinetUnlocked: boolean;
  codeEntered: boolean;
  // Room 2 (Crimson Parlor) state
  r2WordInput: string[];
  r2TableSolved: boolean;
  r2BooksSequence: string[];
  r2BooksSolved: boolean;
  r2DialValues: [number, number, number];
  r2VaultSolved: boolean;
  // Room 3 (Chrono-Core Lab) state
  r3GridCells: boolean[];
  r3BreakerSolved: boolean;
  r3HoloInput: string[];
  r3HoloSolved: boolean;
  r3MirrorAngles: [number, number, number];
  r3LaserSolved: boolean;
  r3CoreUnlocked: boolean;
  // Shared progression state
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
  medium: 55,
  hard: 50,
};

const ROOM_TITLES: Record<DifficultyLevel, string> = {
  basic: "Room 1 · The Midnight Study (Basic)",
  medium: "Room 2 · The Crimson Parlor (Medium)",
  hard: "Room 3 · Chrono-Core Cyber Lab (Hard)",
};

const DEFAULT_PARTNER_LOOPS: Record<DifficultyLevel, number> = {
  basic: 4,
  medium: 5,
  hard: 6,
};

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

  let bannerTimeoutId: number | null = null;
  let toastTimeoutId: number | null = null;

  let state: InternalGameScreenState = {
    roomId: initialState?.roomId ?? ROOM_TITLES[initialDiff],
    difficulty: initialDiff,
    timeLeftSeconds: initialState?.timeLeftSeconds ?? defaultDuration,
    loopDurationSeconds: defaultDuration,
    loopCount: initialState?.loopCount ?? 1,
    bestLoopScore: initialState?.bestLoopScore ?? null,
    partnerLoopScore: initialState?.partnerLoopScore ?? DEFAULT_PARTNER_LOOPS[initialDiff],
    connectedPlayers: initialState?.connectedPlayers ?? 2,
    maxPlayers: initialState?.maxPlayers ?? 2,
    score: initialState?.score ?? 0,
    statusText: initialState?.statusText ?? "Ready",
    selectedObjectId: initialState?.selectedObjectId ?? null,
    activeItem: initialState?.activeItem ?? null,
    lampOn: initialState?.lampOn ?? true,
    paintingClicks: initialState?.paintingClicks ?? 0,
    keyRevealed: initialState?.keyRevealed ?? false,
    keyCollected: initialState?.keyCollected ?? false,
    cabinetUnlocked: initialState?.cabinetUnlocked ?? false,
    codeEntered: initialState?.codeEntered ?? false,
    r2WordInput: [],
    r2TableSolved: false,
    r2BooksSequence: [],
    r2BooksSolved: false,
    r2DialValues: [10, 25, 40],
    r2VaultSolved: false,
    r3GridCells: [false, true, false, false, false, false, false, true, false],
    r3BreakerSolved: false,
    r3HoloInput: [],
    r3HoloSolved: false,
    r3MirrorAngles: [0, 0, 0],
    r3LaserSolved: false,
    r3CoreUnlocked: false,
    doorUnlocked: initialState?.doorUnlocked ?? false,
    escaped: initialState?.escaped ?? false,
    timerRunning: initialState?.timerRunning ?? false,
    loopExpired: initialState?.loopExpired ?? false,
    clues: initialState?.clues ? [...initialState.clues] : [],
    inventory: initialState?.inventory ? [...initialState.inventory] : [],
    feedbackMessage:
      initialState?.feedbackMessage ??
      "Press ▶ Start or click any object to begin Loop #1!",
  };

  function formatTime(seconds: number): string {
    const clamped = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  container.innerHTML = `
    <div class="tle-root" id="tle-root" data-room-diff="${state.difficulty}">
      <!-- Top Header Bar -->
      <header class="tle-header">
        <div class="tle-header-left">
          <button type="button" class="tle-icon-btn" id="btn-pause-menu" title="Pause & Scoreboard">
            <span>⏸</span>
          </button>
          <button type="button" class="tle-icon-btn" id="btn-hint" title="Show Hint">
            <span>💡</span>
          </button>

          <!-- 3 Unique Escape Rooms Selector -->
          <div class="tle-diff-group" role="group" aria-label="Select Escape Room">
            <button type="button" class="tle-diff-btn" data-diff="basic">Room 1: Study</button>
            <button type="button" class="tle-diff-btn" data-diff="medium">Room 2: Parlor</button>
            <button type="button" class="tle-diff-btn" data-diff="hard">Room 3: Cyber Lab</button>
          </div>

          <!-- Player 1 Loop Counter vs Player 2 -->
          <div class="tle-score-cluster">
            <span class="tle-loop-pill" id="hud-loop">P1 LOOP #${state.loopCount}</span>
            <span class="tle-best-pill" id="hud-score-val" title="Fewer loops to escape = you win!">
              VS P2: ${state.partnerLoopScore ?? "--"} Loops
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
            title="Next Loop (+1 Loop)"
          >
            ↺ Restart
          </button>
          <div class="tle-timer-pill" id="hud-timer">
            <span class="tle-hourglass">⏳</span>
            <span id="hud-timer-val">${formatTime(state.timeLeftSeconds)}</span>
          </div>
        </div>
      </header>

      <!-- Main Escape Room Stage -->
      <main class="tle-stage-wrapper">
        <div class="tle-room-stage" id="game-viewport">
          <!-- Blurrable Room Content Container -->
          <div class="tle-room-blur-target" id="room-blur-target">
            <!-- Auto-fading Room Banner (shows for 1.8s then disappears!) -->
            <div class="tle-room-banner" id="hud-room">${state.roomId}</div>

            <!-- Auto-fading Feedback Toast (shows for 2.2s then disappears!) -->
            <div class="tle-feedback-toast" id="action-feedback-text">
              ${state.feedbackMessage}
            </div>

            <!-- ===================================================================
                 ROOM 1: THE MIDNIGHT STUDY (BASIC)
                 =================================================================== -->
            <div class="tle-scene tle-scene-basic" id="scene-basic">
              <div class="tle-wall-back"></div>
              <div class="tle-wall-left">
                <button
                  type="button"
                  class="tle-window-frame"
                  id="obj-window"
                  data-object-id="window"
                  title="Rainy Night Window"
                >
                  <span class="tle-window-sky">
                    <span class="tle-rain-layer"></span>
                  </span>
                  <span class="tle-window-blinds"></span>
                </button>
                <div class="tle-ivy-left" aria-hidden="true">🌿</div>
              </div>
              <div class="tle-floor"></div>
              <div class="tle-lamp-cone" id="lamp-cone"></div>

              <!-- 1. Blue Mountain Painting + Hidden Wall Safe -->
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

              <!-- 2. Wooden Double-Door Cabinet -->
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
                    <span class="tle-interior-scroll">📜 Clue Inside</span>
                  </div>
                  <span class="tle-glow-badge" id="state-cabinet">🔒</span>
                </button>
              </div>

              <!-- 3. Cork Bulletin Board with 1998 Photograph -->
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
                  <div class="tle-polaroid-caption">••••</div>
                </div>
                <div class="tle-sticky tle-sticky-1"></div>
                <div class="tle-sticky tle-sticky-2"></div>
                <div class="tle-sticky tle-sticky-3"></div>
              </button>

              <!-- 4. Computer Desk & Locked Monitor -->
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

              <!-- 5. Paneled Exit Door -->
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

              <!-- 6. Foreground Left Study Desk, Lamp & Open Book -->
              <div class="tle-left-desk-zone">
                <div class="tle-left-desk-surface">
                  <button
                    type="button"
                    class="tle-lamp-btn"
                    id="obj-lamp"
                    data-object-id="lamp"
                    title="Desk Lamp"
                  >
                    <span class="tle-lamp-shade"></span>
                    <span class="tle-lamp-bulb"></span>
                    <span class="tle-lamp-arm"></span>
                    <span class="tle-lamp-base"></span>
                  </button>
                  <div class="tle-book-stack" aria-hidden="true">
                    <div class="tle-stacked-book"></div>
                    <div class="tle-stacked-book"></div>
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
            </div>

            <!-- ===================================================================
                 ROOM 2: THE CRIMSON PARLOR & CIPHER LOUNGE (MEDIUM — UNIQUE SCENE!)
                 =================================================================== -->
            <div class="tle-scene tle-scene-medium hidden" id="scene-medium">
              <div class="tle-r2-wallpaper">
                <div class="tle-r2-wainscot"></div>
              </div>
              <div class="tle-r2-floor">
                <div class="tle-r2-rug"></div>
              </div>

              <!-- 1. Left: Vintage Brass Gramophone on Pedestal -->
              <button
                type="button"
                class="tle-r2-gramophone"
                data-object-id="r2-gramophone"
                title="Inspect Brass Gramophone (Plays Musical Riddle)"
              >
                <div class="tle-gram-horn">🎺</div>
                <div class="tle-gram-disc">💿</div>
                <div class="tle-gram-box">
                  <span class="tle-obj-tag">🎵 Gramophone</span>
                </div>
              </button>

              <!-- 2. Center-Left Foreground: Coffee Table with Scrambled Letter Tiles -->
              <button
                type="button"
                class="tle-r2-coffee-table"
                id="r2-coffee-table-btn"
                data-object-id="r2-coffee-table"
                title="Coffee Table — Click to Solve the Scrambled Letter Tiles Puzzle!"
              >
                <div class="tle-table-top">
                  <span class="tle-teacup">☕</span>
                  <div class="tle-mini-tiles">
                    <span class="tle-mini-tile">M</span>
                    <span class="tle-mini-tile">E</span>
                    <span class="tle-mini-tile">T</span>
                    <span class="tle-mini-tile">I</span>
                  </div>
                  <span class="tle-table-badge" id="r2-table-badge">🔤 Letter Puzzle</span>
                </div>
                <div class="tle-table-legs">
                  <span></span>
                  <span></span>
                </div>
              </button>

              <!-- 3. Center Wall: Brick Fireplace + Rotary Combination Vault Above Mantle -->
              <div class="tle-r2-fireplace-zone">
                <button
                  type="button"
                  class="tle-r2-vault-btn"
                  id="r2-vault-btn"
                  data-object-id="r2-vault"
                  title="Rotary Combination Wall Vault"
                >
                  <div class="tle-vault-wheel" id="r2-vault-wheel">⚙️</div>
                  <span class="tle-vault-status" id="r2-vault-status">🔒 Rotary Safe</span>
                </button>

                <div class="tle-r2-fireplace">
                  <div class="tle-mantle-shelf">
                    <span>🕯️</span>
                    <span>🏺</span>
                    <span>🕯️</span>
                  </div>
                  <div class="tle-fire-hearth">
                    <div class="tle-fire-flames">🔥</div>
                  </div>
                </div>
              </div>

              <!-- 4. Right-Center: Secret Color-Spine Library Bookshelf -->
              <button
                type="button"
                class="tle-r2-bookshelf"
                id="r2-bookshelf-btn"
                data-object-id="r2-bookshelf"
                title="Secret Library Bookshelf — Pull the Colored Spines in Order!"
              >
                <div class="tle-shelf-row">
                  <span class="tle-spine tle-spine-blue"></span>
                  <span class="tle-spine tle-spine-red"></span>
                  <span class="tle-spine tle-spine-gold"></span>
                  <span class="tle-spine tle-spine-green"></span>
                </div>
                <div class="tle-shelf-row">
                  <span class="tle-spine tle-spine-purple"></span>
                  <span class="tle-spine tle-spine-gold"></span>
                  <span class="tle-spine tle-spine-red"></span>
                </div>
                <span class="tle-bookshelf-badge" id="r2-books-badge">📚 Secret Books</span>
              </button>

              <!-- 5. Far Right: Ornate Parlor Velvet Exit Door -->
              <div class="tle-door-zone">
                <button
                  type="button"
                  class="tle-exit-door-btn tle-r2-door-btn"
                  id="r2-door-btn"
                  data-object-id="r2-door"
                  title="Parlor Velvet Exit Door"
                >
                  <div class="tle-exit-panel"></div>
                  <div class="tle-exit-panel tle-exit-panel-mid"></div>
                  <div class="tle-exit-panel"></div>
                  <span class="tle-door-handle"></span>
                  <span class="tle-door-badge" id="r2-door-badge">🔒</span>
                </button>
              </div>
            </div>

            <!-- ===================================================================
                 ROOM 3: CHRONO-CORE CYBER LAB (HARD — UNIQUE SCI-FI SCENE!)
                 =================================================================== -->
            <div class="tle-scene tle-scene-hard hidden" id="scene-hard">
              <div class="tle-r3-wall">
                <div class="tle-r3-grid-lines"></div>
              </div>
              <div class="tle-r3-floor"></div>

              <!-- 1. Left Wall: 3x3 High-Voltage Circuit Breaker Matrix -->
              <button
                type="button"
                class="tle-r3-breaker"
                id="r3-breaker-btn"
                data-object-id="r3-breaker"
                title="3x3 Reactor Circuit Breaker Grid"
              >
                <div class="tle-breaker-mini-grid">
                  <span class="tle-bm-dot tle-bm-on"></span>
                  <span class="tle-bm-dot"></span>
                  <span class="tle-bm-dot tle-bm-on"></span>
                  <span class="tle-bm-dot"></span>
                  <span class="tle-bm-dot"></span>
                  <span class="tle-bm-dot"></span>
                  <span class="tle-bm-dot tle-bm-on"></span>
                  <span class="tle-bm-dot"></span>
                  <span class="tle-bm-dot tle-bm-on"></span>
                </div>
                <span class="tle-r3-tag" id="r3-breaker-tag">⚡ 3x3 Power Grid</span>
              </button>

              <!-- 2. Center-Left Foreground: Holographic Anagram Projection Table -->
              <button
                type="button"
                class="tle-r3-holo-table"
                id="r3-holo-btn"
                data-object-id="r3-holo-table"
                title="Holographic Cipher Table — Unscramble the Quantum Codeword"
              >
                <div class="tle-holo-beam">
                  <span class="tle-holo-letters">O · P · L · O</span>
                </div>
                <div class="tle-holo-base">
                  <span class="tle-r3-tag" id="r3-holo-tag">🌐 Holo-Cipher Table</span>
                </div>
              </button>

              <!-- 3. Center Back Wall: Laser & Mirror Refraction Optics Grid -->
              <button
                type="button"
                class="tle-r3-laser-panel"
                id="r3-laser-btn"
                data-object-id="r3-laser-grid"
                title="Laser & Mirror Refraction Security Grid — Click to Aim Mirrors!"
              >
                <svg viewBox="0 0 180 120" class="tle-laser-preview-svg">
                  <rect width="180" height="120" rx="8" fill="#090d16" />
                  <line
                    x1="16"
                    y1="28"
                    x2="75"
                    y2="28"
                    stroke="#ef4444"
                    stroke-width="3"
                    stroke-dasharray="4 2"
                  />
                  <line
                    x1="75"
                    y1="28"
                    x2="75"
                    y2="92"
                    stroke="#ef4444"
                    stroke-width="3"
                    stroke-dasharray="4 2"
                  />
                  <line
                    x1="75"
                    y1="92"
                    x2="155"
                    y2="92"
                    stroke="#22d3ee"
                    stroke-width="3"
                  />
                  <circle cx="16" cy="28" r="6" fill="#ef4444" />
                  <circle cx="155" cy="92" r="7" fill="#22d3ee" />
                </svg>
                <span class="tle-r3-tag" id="r3-laser-tag">🔴 Laser Mirror Grid</span>
              </button>

              <!-- 4. Right-Center: Cryo-Core Containment Console -->
              <button
                type="button"
                class="tle-r3-cryo"
                id="r3-cryo-btn"
                data-object-id="r3-cryo-core"
                title="Cryo-Core Passcode Console"
              >
                <div class="tle-cryo-tube">
                  <div class="tle-cryo-plasma">🧬</div>
                </div>
                <span class="tle-r3-tag" id="r3-cryo-tag">🔒 Cryo-Core Console</span>
              </button>

              <!-- 5. Far Right: Titanium Quantum Airlock Door -->
              <div class="tle-door-zone">
                <button
                  type="button"
                  class="tle-exit-door-btn tle-r3-door-btn"
                  id="r3-door-btn"
                  data-object-id="r3-door"
                  title="Quantum Airlock Door"
                >
                  <div class="tle-exit-panel"></div>
                  <div class="tle-exit-panel tle-exit-panel-mid"></div>
                  <div class="tle-exit-panel"></div>
                  <span class="tle-door-handle"></span>
                  <span class="tle-door-badge" id="r3-door-badge">🚨</span>
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
          </div>

          <!-- Interactive Mini-Puzzle / Inspector Overlay -->
          <div class="tle-overlay hidden" id="inspector-modal">
            <div class="tle-modal-card tle-puzzle-modal">
              <h3 id="inspector-title">Inspect</h3>
              <div class="tle-inspector-body" id="inspector-body"></div>

              <!-- 4-Digit Passcode Keypad (Used by Room 1 Computer & Room 3 Cryo-Core) -->
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
                    aria-label="Enter 4-digit passcode"
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

          <!-- CENTER POPUP WHEN A LOOP ENDS (Blurs entire room behind it!) -->
          <div class="tle-overlay tle-blur-backdrop hidden" id="loop-end-modal">
            <div class="tle-modal-card tle-center-popup">
              <div class="tle-popup-icon">⏳</div>
              <h2 id="loop-end-title">Time Loop #1 Ended!</h2>
              <p class="tle-popup-desc" id="loop-end-desc">
                Your time ran out! All physical items in the room disappeared,
                but your discovered <strong>CLUES</strong> stay with you.
              </p>
              <div class="tle-modal-actions">
                <button type="button" class="tle-primary-btn tle-btn-lg" id="btn-popup-restart">
                  ↺ Restart (Start Loop #2)
                </button>
                <button type="button" class="tle-secondary-btn tle-btn-lg" id="btn-popup-exit">
                  🚪 Exit Room
                </button>
              </div>
            </div>
          </div>

          <!-- CENTER POPUP FOR ROOM WINNER / PAUSE SCOREBOARD (Blurs room behind it!) -->
          <div class="tle-overlay tle-blur-backdrop hidden" id="pause-modal">
            <div class="tle-modal-card tle-center-popup">
              <h2 id="modal-title">Room Scoreboard</h2>
              <p class="tle-popup-desc" id="modal-desc">
                Fewer loops to escape wins the room!
              </p>
              <div class="tle-scoreboard-box" id="scoreboard-box"></div>
              <div class="tle-modal-actions">
                <button type="button" class="tle-primary-btn" id="btn-try-again">
                  🔄 Try Room Again (Reset to 0)
                </button>
                <button type="button" class="tle-primary-btn hidden" id="btn-next-room">
                  ➡ Next Room
                </button>
                <button type="button" class="tle-secondary-btn" id="btn-resume">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  const rootEl = container.querySelector<HTMLElement>("#tle-root");
  const blurTarget = container.querySelector<HTMLElement>("#room-blur-target");
  const roomBannerEl = container.querySelector<HTMLElement>("#hud-room");
  const feedbackEl = container.querySelector<HTMLElement>("#action-feedback-text");

  const sceneBasic = container.querySelector<HTMLElement>("#scene-basic");
  const sceneMedium = container.querySelector<HTMLElement>("#scene-medium");
  const sceneHard = container.querySelector<HTMLElement>("#scene-hard");

  const loopEndModal = container.querySelector<HTMLElement>("#loop-end-modal");
  const loopEndTitle = container.querySelector<HTMLElement>("#loop-end-title");
  const loopEndDesc = container.querySelector<HTMLElement>("#loop-end-desc");
  const popupRestartBtn = container.querySelector<HTMLButtonElement>("#btn-popup-restart");
  const popupExitBtn = container.querySelector<HTMLButtonElement>("#btn-popup-exit");

  const pauseModal = container.querySelector<HTMLElement>("#pause-modal");
  const modalTitle = container.querySelector<HTMLElement>("#modal-title");
  const modalDesc = container.querySelector<HTMLElement>("#modal-desc");
  const scoreboardBox = container.querySelector<HTMLElement>("#scoreboard-box");
  const nextRoomBtn = container.querySelector<HTMLButtonElement>("#btn-next-room");

  const inspectorModal = container.querySelector<HTMLElement>("#inspector-modal");
  const inspectorTitle = container.querySelector<HTMLElement>("#inspector-title");
  const inspectorBody = container.querySelector<HTMLElement>("#inspector-body");
  const terminalGroup = container.querySelector<HTMLElement>("#terminal-code-group");
  const codeInput = container.querySelector<HTMLInputElement>("#terminal-code-input");

  /** Shows the top Room Banner for 1.8 seconds and then fades it out completely. */
  function flashRoomBanner(text: string): void {
    if (!roomBannerEl) return;
    roomBannerEl.textContent = text;
    roomBannerEl.classList.remove("tle-banner-hidden");
    if (bannerTimeoutId !== null) {
      window.clearTimeout(bannerTimeoutId);
    }
    bannerTimeoutId = window.setTimeout(() => {
      roomBannerEl.classList.add("tle-banner-hidden");
    }, 1800);
  }

  /** Shows the top Feedback Toast for 2.2 seconds and then fades it out so it never blocks clues. */
  function flashFeedbackToast(text: string): void {
    state.feedbackMessage = text;
    if (!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.classList.remove("tle-banner-hidden");
    if (toastTimeoutId !== null) {
      window.clearTimeout(toastTimeoutId);
    }
    toastTimeoutId = window.setTimeout(() => {
      feedbackEl.classList.add("tle-banner-hidden");
    }, 2200);
  }

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
      if (codeInput) codeInput.value = "";
      codeInput?.focus();
    }
  }

  /** Interactive Mini-Game 1 (Room 2): Coffee Table Scrambled Letter Tiles ("TIME") */
  function openCoffeeTableLetterPuzzle(): void {
    const tiles = ["M", "E", "T", "I", "S", "R"];
    const currentWord = state.r2WordInput.join("");

    const renderModalContent = (): void => {
      const wordDisplay = [0, 1, 2, 3]
        .map((idx) => {
          const ch = state.r2WordInput[idx] ?? "_";
          return `<span class="tle-word-slot ${ch !== "_" ? "tle-word-slot-filled" : ""}">${ch}</span>`;
        })
        .join("");

      const tileBtns = tiles
        .map(
          (letter, idx) =>
            `<button type="button" class="tle-letter-tile" data-r2-letter="${letter}" data-r2-idx="${idx}">` +
            `${letter}</button>`,
        )
        .join("");

      openInspector(
        "☕ Parlor Coffee Table — Letter Tile Scramble",
        `<div class="tle-zoom-card">` +
          `<p class="tle-zoom-sub">Arrange 4 brass letter tiles on the coffee table ` +
          `to answer the Gramophone's riddle (<em>"What ticks away in every loop?"</em>):</p>` +
          `<div class="tle-word-slots-row">${wordDisplay}</div>` +
          `<div class="tle-letter-tiles-grid">${tileBtns}</div>` +
          `<div class="tle-mini-actions">` +
          `<button type="button" class="tle-secondary-btn" id="r2-clear-word">Clear Letters</button>` +
          `</div>` +
          (state.r2TableSolved
            ? `<p class="tle-puzzle-success">✅ Solved ("TIME")! Secret drawer unlocked!</p>`
            : currentWord.length === 4 && currentWord !== "TIME"
              ? `<p class="tle-puzzle-error">❌ "${currentWord}" is not the word. Try "TIME"!</p>`
              : "") +
          `</div>`,
      );

      const letterEls = inspectorBody?.querySelectorAll<HTMLButtonElement>("[data-r2-letter]");
      if (letterEls) {
        for (const btn of letterEls) {
          btn.addEventListener("click", () => {
            if (state.r2TableSolved) return;
            const ch = btn.dataset.r2Letter;
            if (!ch || state.r2WordInput.length >= 4) return;
            state.r2WordInput = [...state.r2WordInput, ch];
            if (state.r2WordInput.join("") === "TIME") {
              state.r2TableSolved = true;
              addInventoryItem("Winding Key");
              addClue("Bookshelf Spines: Pull RED → GOLD → GREEN");
              flashFeedbackToast(
                "🗝️ Coffee Table drawer opened! Found Brass Winding Key + Bookshelf Clue!",
              );
              renderState();
            }
            renderModalContent();
          });
        }
      }

      inspectorBody
        ?.querySelector("#r2-clear-word")
        ?.addEventListener("click", () => {
          state.r2WordInput = [];
          renderModalContent();
        });
    };

    renderModalContent();
  }

  /** Interactive Mini-Game 2 (Room 2): Secret Color-Spine Library Bookshelf */
  function openBookshelfPuzzle(): void {
    const books = [
      { id: "BLUE", label: "📘 Azure Vol. I", color: "#2563eb" },
      { id: "RED", label: "📕 Crimson Vol. II", color: "#dc2626" },
      { id: "GOLD", label: "📙 Aurum Vol. III", color: "#d97706" },
      { id: "GREEN", label: "📗 Emerald Vol. IV", color: "#16a34a" },
      { id: "PURPLE", label: "📓 Violet Vol. V", color: "#7c3aed" },
    ];

    const renderBooksModal = (): void => {
      const pulledText =
        state.r2BooksSequence.length > 0
          ? state.r2BooksSequence.join(" → ")
          : "None pulled yet";

      const bookButtons = books
        .map((b) => {
          const isPulled = state.r2BooksSequence.includes(b.id);
          return (
            `<button type="button" class="tle-book-pull-btn ${isPulled ? "tle-book-pulled" : ""}" ` +
            `style="border-color:${b.color}" data-book-color="${b.id}">` +
            `<span>${b.label}</span>` +
            `</button>`
          );
        })
        .join("");

      openInspector(
        "📚 Secret Parlor Library Bookshelf",
        `<div class="tle-zoom-card">` +
          `<p class="tle-zoom-sub">Pull 3 book spines in the exact color sequence ` +
          `hidden inside the Coffee Table:</p>` +
          `<div class="tle-book-pull-list">${bookButtons}</div>` +
          `<p class="tle-zoom-sub" style="margin-top:8px">Pulled: <strong>${pulledText}</strong></p>` +
          `<div class="tle-mini-actions">` +
          `<button type="button" class="tle-secondary-btn" id="r2-reset-books">Reset Books</button>` +
          `</div>` +
          (state.r2BooksSolved
            ? `<p class="tle-puzzle-success">✅ Secret compartment opened! ` +
              `Vault Dial Code: <strong>30 - 70 - 15</strong></p>`
            : "") +
          `</div>`,
      );

      const bBtns = inspectorBody?.querySelectorAll<HTMLButtonElement>("[data-book-color]");
      if (bBtns) {
        for (const btn of bBtns) {
          btn.addEventListener("click", () => {
            if (state.r2BooksSolved) return;
            const col = btn.dataset.bookColor;
            if (!col || state.r2BooksSequence.includes(col)) return;
            state.r2BooksSequence = [...state.r2BooksSequence, col];

            if (state.r2BooksSequence.length === 3) {
              if (state.r2BooksSequence.join("-") === "RED-GOLD-GREEN") {
                state.r2BooksSolved = true;
                addInventoryItem("Ruby Lens");
                addClue("Rotary Safe Combination: 30 - 70 - 15");
                flashFeedbackToast(
                  "📚 Bookshelf slid open! Revealed Vault Combination: 30 - 70 - 15!",
                );
                renderState();
              } else {
                state.r2BooksSequence = [];
                flashFeedbackToast(
                  "❌ Wrong book order! The mechanism clicks back. (Hint: RED → GOLD → GREEN)",
                );
              }
            }
            renderBooksModal();
          });
        }
      }

      inspectorBody
        ?.querySelector("#r2-reset-books")
        ?.addEventListener("click", () => {
          state.r2BooksSequence = [];
          renderBooksModal();
        });
    };

    renderBooksModal();
  }

  /** Interactive Mini-Game 3 (Room 2): 3-Wheel Rotary Dial Safe above Fireplace */
  function openRotaryVaultPuzzle(): void {
    const renderVaultModal = (): void => {
      const [d0, d1, d2] = state.r2DialValues;
      const dialsHtml = [d0, d1, d2]
        .map(
          (val, idx) =>
            `<div class="tle-dial-col">` +
            `<button type="button" class="tle-dial-step" ` +
            `data-dial-idx="${idx}" data-dial-delta="5">▲</button>` +
            `<div class="tle-dial-wheel">${val}</div>` +
            `<button type="button" class="tle-dial-step" ` +
            `data-dial-idx="${idx}" data-dial-delta="-5">▼</button>` +
            `</div>`,
        )
        .join("");

      openInspector(
        "⚙️ Fireplace Rotary Combination Safe",
        `<div class="tle-zoom-card">` +
          `<p class="tle-zoom-sub">Spin the 3 brass tumbler wheels to the combination ` +
          `hidden behind the bookshelf (requires <strong>Winding Key</strong> or known code):</p>` +
          `<div class="tle-dials-row">${dialsHtml}</div>` +
          `<div class="tle-mini-actions">` +
          `<button type="button" class="tle-primary-btn" id="r2-unlock-vault">Unlock Safe</button>` +
          `</div>` +
          (state.r2VaultSolved
            ? `<p class="tle-puzzle-success">🔓 Safe Unlocked! Parlor Door is now open!</p>`
            : "") +
          `</div>`,
      );

      const stepBtns = inspectorBody?.querySelectorAll<HTMLButtonElement>("[data-dial-idx]");
      if (stepBtns) {
        for (const btn of stepBtns) {
          btn.addEventListener("click", () => {
            const idx = Number(btn.dataset.dialIdx ?? "0");
            const delta = Number(btn.dataset.dialDelta ?? "5");
            const nextVals: [number, number, number] = [...state.r2DialValues];
            nextVals[idx] = (nextVals[idx] + delta + 100) % 100;
            state.r2DialValues = nextVals;
            renderVaultModal();
          });
        }
      }

      inspectorBody
        ?.querySelector("#r2-unlock-vault")
        ?.addEventListener("click", () => {
          const [v0, v1, v2] = state.r2DialValues;
          if (v0 === 30 && v1 === 70 && v2 === 15) {
            state.r2VaultSolved = true;
            state.doorUnlocked = true;
            addInventoryItem("Parlor Emblem");
            flashFeedbackToast(
              "💎 Rotary Safe unlocked! Collected Parlor Emblem & unsealed the Parlor Exit Door!",
            );
            renderState();
            renderVaultModal();
          } else {
            flashFeedbackToast(
              `❌ Dial ${v0}-${v1}-${v2} is incorrect! Discover the 3 numbers in the Bookshelf.`,
            );
          }
        });
    };

    renderVaultModal();
  }

  /** Interactive Mini-Game 4 (Room 3): 3x3 High-Voltage Circuit Breaker Matrix */
  function openCircuitBreakerPuzzle(): void {
    const renderBreakerModal = (): void => {
      const cellsHtml = state.r3GridCells
        .map(
          (isOn, idx) =>
            `<button type="button" class="tle-circuit-cell ${isOn ? "tle-circuit-on" : ""}" ` +
            `data-cell-idx="${idx}">` +
            `${isOn ? "⚡ ON" : "OFF"}` +
            `</button>`,
        )
        .join("");

      openInspector(
        "⚡ 3x3 Reactor Circuit Breaker Matrix",
        `<div class="tle-zoom-card">` +
          `<p class="tle-zoom-sub">Activate <strong>ONLY the 4 Corner Nodes</strong> ` +
          `(Top-Left, Top-Right, Bottom-Left, Bottom-Right) and turn all middle nodes OFF:</p>` +
          `<div class="tle-circuit-grid">${cellsHtml}</div>` +
          (state.r3BreakerSolved
            ? `<p class="tle-puzzle-success">✅ Reactor Stabilized! Collected 🪞 Optic Mirror + Holo Clue!</p>`
            : "") +
          `</div>`,
      );

      const cellBtns = inspectorBody?.querySelectorAll<HTMLButtonElement>("[data-cell-idx]");
      if (cellBtns) {
        for (const btn of cellBtns) {
          btn.addEventListener("click", () => {
            const idx = Number(btn.dataset.cellIdx ?? "0");
            state.r3GridCells[idx] = !state.r3GridCells[idx];
            // Target: corners 0, 2, 6, 8 ON; all others (1, 3, 4, 5, 7) OFF
            const target = [true, false, true, false, false, false, true, false, true];
            const solved = state.r3GridCells.every((v, i) => v === target[i]);
            if (solved && !state.r3BreakerSolved) {
              state.r3BreakerSolved = true;
              addInventoryItem("Optic Mirror");
              addClue("Holo-Table Codeword: Unscramble O-P-L-O → LOOP");
              flashFeedbackToast(
                "⚡ Reactor Grid online! Collected 🪞 Optic Mirror & unlocked Holo-Table clue!",
              );
              renderState();
            }
            renderBreakerModal();
          });
        }
      }
    };

    renderBreakerModal();
  }

  /** Interactive Mini-Game 5 (Room 3): Holographic Table Letter Scramble ("LOOP") */
  function openHoloTablePuzzle(): void {
    const letters = ["O", "P", "L", "O", "X", "Z"];

    const renderHoloModal = (): void => {
      const slots = [0, 1, 2, 3]
        .map((i) => {
          const ch = state.r3HoloInput[i] ?? "_";
          const cls = ch !== "_" ? "tle-word-slot-filled" : "";
          return `<span class="tle-word-slot tle-holo-slot ${cls}">${ch}</span>`;
        })
        .join("");

      const btns = letters
        .map(
          (ch, idx) =>
            `<button type="button" class="tle-letter-tile tle-holo-tile" ` +
            `data-r3-ch="${ch}" data-r3-i="${idx}">${ch}</button>`,
        )
        .join("");

      openInspector(
        "🌐 Holographic Anagram Projection Table",
        `<div class="tle-zoom-card">` +
          `<p class="tle-zoom-sub">Tap the floating neon glyphs to spell the 4-letter phenomenon ` +
          `trapping both players (<strong>O - P - L - O</strong>):</p>` +
          `<div class="tle-word-slots-row">${slots}</div>` +
          `<div class="tle-letter-tiles-grid">${btns}</div>` +
          `<div class="tle-mini-actions">` +
          `<button type="button" class="tle-secondary-btn" id="r3-clear-holo">Reset Glyphs</button>` +
          `</div>` +
          (state.r3HoloSolved
            ? `<p class="tle-puzzle-success">✅ Hologram Decrypted ("LOOP")! Collected 🧪 Plasma Cell!</p>`
            : "") +
          `</div>`,
      );

      const chBtns = inspectorBody?.querySelectorAll<HTMLButtonElement>("[data-r3-ch]");
      if (chBtns) {
        for (const btn of chBtns) {
          btn.addEventListener("click", () => {
            if (state.r3HoloSolved) return;
            const ch = btn.dataset.r3Ch;
            if (!ch || state.r3HoloInput.length >= 4) return;
            state.r3HoloInput = [...state.r3HoloInput, ch];
            if (state.r3HoloInput.join("") === "LOOP") {
              state.r3HoloSolved = true;
              addInventoryItem("Plasma Cell");
              addClue("Laser Mirrors: Aim M1 [\\], M2 [\\], M3 [/] to hit target");
              flashFeedbackToast(
                "🌐 Holo-Table solved! Collected 🧪 Plasma Cell + Laser Mirror Clue!",
              );
              renderState();
            }
            renderHoloModal();
          });
        }
      }

      inspectorBody
        ?.querySelector("#r3-clear-holo")
        ?.addEventListener("click", () => {
          state.r3HoloInput = [];
          renderHoloModal();
        });
    };

    renderHoloModal();
  }

  /** Interactive Mini-Game 6 (Room 3): Live Laser & Rotatable Mirror Optics Grid */
  function openLaserMirrorPuzzle(): void {
    // Target mirror states: m0 = 1 (\), m1 = 1 (\), m2 = 0 (/)
    const renderLaserModal = (): void => {
      const [m0, m1, m2] = state.r3MirrorAngles;
      const hit1 = m0 === 1;
      const hit2 = hit1 && m1 === 1;
      const hitTarget = hit2 && m2 === 0;

      const beamColor = hitTarget ? "#22d3ee" : "#ef4444";
      const dash = 'stroke="#ef4444" stroke-width="3" stroke-dasharray="4 3"';
      const seg1 = `<line x1="25" y1="35" x2="110" y2="35" stroke="${beamColor}" stroke-width="4" />`;
      const seg2 = hit1
        ? `<line x1="110" y1="35" x2="110" y2="115" stroke="${beamColor}" stroke-width="4" />`
        : `<line x1="110" y1="35" x2="195" y2="35" ${dash} />`;
      const seg3 = hit2
        ? `<line x1="110" y1="115" x2="210" y2="115" stroke="${beamColor}" stroke-width="4" />`
        : hit1
          ? `<line x1="110" y1="115" x2="30" y2="115" ${dash} />`
          : "";
      const seg4 = hitTarget
        ? `<line x1="210" y1="115" x2="210" y2="35" stroke="#22d3ee" stroke-width="4" />`
        : hit2
          ? `<line x1="210" y1="115" x2="210" y2="155" ${dash} />`
          : "";

      const mirrorChar = (v: number): string => (v === 1 ? "＼" : "／");
      const targetFill = hitTarget ? "#22d3ee" : "#334155";

      openInspector(
        "🔴 Quantum Laser & Mirror Refraction Grid",
        `<div class="tle-zoom-card">` +
          `<p class="tle-zoom-sub">Click the 3 rotatable mirrors (<strong>M1, M2, M3</strong>) ` +
          `to bounce the red laser beam into the cyan Quantum Receiver (<strong>🎯</strong>):</p>` +
          `<svg viewBox="0 0 260 160" class="tle-laser-interactive-svg">` +
          `<rect width="260" height="160" rx="10" fill="#070b14" stroke="#334155" />` +
          seg1 +
          seg2 +
          seg3 +
          seg4 +
          `<circle cx="25" cy="35" r="8" fill="#ef4444" />` +
          `<circle cx="210" cy="35" r="10" fill="${targetFill}" stroke="#22d3ee" stroke-width="2" />` +
          `<text x="102" y="24" fill="#94a3b8" font-size="10">M1</text>` +
          `<text x="82" y="120" fill="#94a3b8" font-size="10">M2</text>` +
          `<text x="224" y="120" fill="#94a3b8" font-size="10">M3</text>` +
          `<text x="203" y="39" fill="#0f172a" font-size="11" font-weight="bold">🎯</text>` +
          `</svg>` +
          `<div class="tle-mirror-controls">` +
          `<button type="button" class="tle-mirror-btn" data-mirror-idx="0">` +
          `Rotate M1 [${mirrorChar(m0)}]</button>` +
          `<button type="button" class="tle-mirror-btn" data-mirror-idx="1">` +
          `Rotate M2 [${mirrorChar(m1)}]</button>` +
          `<button type="button" class="tle-mirror-btn" data-mirror-idx="2">` +
          `Rotate M3 [${mirrorChar(m2)}]</button>` +
          `</div>` +
          (state.r3LaserSolved
            ? `<p class="tle-puzzle-success">🎯 Laser Target Locked! ` +
              `Cryo-Core Passcode: <strong>2026</strong></p>`
            : "") +
          `</div>`,
      );

      const mBtns = inspectorBody?.querySelectorAll<HTMLButtonElement>("[data-mirror-idx]");
      if (mBtns) {
        for (const btn of mBtns) {
          btn.addEventListener("click", () => {
            const idx = Number(btn.dataset.mirrorIdx ?? "0");
            const nextAngles: [number, number, number] = [...state.r3MirrorAngles];
            nextAngles[idx] = nextAngles[idx] === 0 ? 1 : 0;
            state.r3MirrorAngles = nextAngles;

            if (
              nextAngles[0] === 1 &&
              nextAngles[1] === 1 &&
              nextAngles[2] === 0 &&
              !state.r3LaserSolved
            ) {
              state.r3LaserSolved = true;
              addInventoryItem("Quantum Keycard");
              addClue("Cryo-Core Override Code: 2026");
              flashFeedbackToast(
                "🎯 Laser beam hit the receiver! Revealed Cryo-Core Code: 2026!",
              );
              renderState();
            }
            renderLaserModal();
          });
        }
      }
    };

    renderLaserModal();
  }

  /** Resets the selected room back to Loop 0/1 (for Try Again, Exit, or switching rooms). */
  function resetRoomToZero(diff: DifficultyLevel, autoStart = false): void {
    const duration = DIFFICULTY_SECONDS[diff];
    state = {
      ...state,
      roomId: ROOM_TITLES[diff],
      difficulty: diff,
      timeLeftSeconds: duration,
      loopDurationSeconds: duration,
      loopCount: autoStart ? 1 : 0,
      score: 0,
      partnerLoopScore: DEFAULT_PARTNER_LOOPS[diff],
      timerRunning: autoStart,
      loopExpired: false,
      escaped: false,
      activeItem: null,
      lampOn: true,
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      cabinetUnlocked: false,
      codeEntered: false,
      r2WordInput: [],
      r2TableSolved: false,
      r2BooksSequence: [],
      r2BooksSolved: false,
      r2DialValues: [10, 25, 40],
      r2VaultSolved: false,
      r3GridCells: [false, true, false, false, false, false, false, true, false],
      r3BreakerSolved: false,
      r3HoloInput: [],
      r3HoloSolved: false,
      r3MirrorAngles: [0, 0, 0],
      r3LaserSolved: false,
      r3CoreUnlocked: false,
      doorUnlocked: false,
      clues: [],
      inventory: [],
      feedbackMessage: `${ROOM_TITLES[diff]}`,
    };
    loopEndModal?.classList.add("hidden");
    pauseModal?.classList.add("hidden");
    inspectorModal?.classList.add("hidden");
    callbacks.onDifficultyChange?.(diff);
    flashRoomBanner(ROOM_TITLES[diff]);
    flashFeedbackToast(
      autoStart
        ? `▶ ${ROOM_TITLES[diff]} — Loop #1 started!`
        : `${ROOM_TITLES[diff]} ready! Click any object or ▶ Start to play.`,
    );
    renderState();
  }

  function completeCurrentRoomEscape(): void {
    const finalLoops = Math.max(1, state.loopCount);
    state.loopCount = finalLoops;
    state.escaped = true;
    state.timerRunning = false;
    state.score = finalLoops;
    if (state.bestLoopScore === null || finalLoops < state.bestLoopScore) {
      state.bestLoopScore = finalLoops;
    }
    state.statusText = `Escaped in ${finalLoops} Loop(s)!`;
    flashFeedbackToast(
      `🎉 You escaped ${ROOM_TITLES[state.difficulty]} in ${finalLoops} loop(s)!`,
    );
    callbacks.onEscape?.(finalLoops, state.difficulty);
    showScoreboardModal(true);
  }

  function handleObjectClick(objectId: RoomObjectId): void {
    if (!state.timerRunning && !state.escaped && state.loopCount === 0) {
      state.loopCount = 1;
      state.timerRunning = true;
    }
    state.selectedObjectId = objectId;

    switch (objectId) {
      // ==================== ROOM 1: THE MIDNIGHT STUDY ====================
      case "window":
        flashFeedbackToast("Rain lashes against the midnight study window outside.");
        break;

      case "lamp":
        state.lampOn = !state.lampOn;
        flashFeedbackToast(
          state.lampOn ? "Brass desk lamp switched ON." : "Desk lamp switched OFF.",
        );
        break;

      case "book":
        addClue("BLUE - 4");
        flashFeedbackToast('Discovered clue in open journal: "BLUE - 4"!');
        openInspector(
          "📖 Open Journal on Desk",
          `<div class="tle-zoom-card">` +
            `<p class="tle-zoom-handwriting">"To whoever wakes here:<br/>` +
            `<strong>BLUE - 4</strong>"</p>` +
            `<p class="tle-zoom-sub">Interact with the blue object 4 times.</p>` +
            `</div>`,
        );
        break;

      case "painting":
        if (!state.keyRevealed) {
          state.paintingClicks += 1;
          if (state.paintingClicks >= 4) {
            state.keyRevealed = true;
            flashFeedbackToast(
              "The Blue Painting slides aside and reveals a hidden Golden Key!",
            );
          } else {
            flashFeedbackToast("You tap the Blue Painting — the frame shifts slightly...");
          }
        } else {
          flashFeedbackToast("The Blue Painting has moved aside, exposing the wall safe.");
        }
        break;

      case "key":
        if (state.keyRevealed && !state.keyCollected) {
          state.keyCollected = true;
          addInventoryItem("Golden Key");
          flashFeedbackToast("🗝️ Collected Golden Key! Click the locked wooden cabinet.");
        }
        break;

      case "cabinet":
        if (state.cabinetUnlocked) {
          flashFeedbackToast('Cabinet clue: "Find the year on the photograph".');
        } else if (state.keyCollected || state.inventory.includes("Golden Key")) {
          state.cabinetUnlocked = true;
          addClue("Find the year on the photograph");
          flashFeedbackToast(
            '🔓 Unlocked wooden cabinet! Clue added: "Find the year on the photograph".',
          );
          openInspector(
            "🔓 Cabinet Unlocked!",
            `<div class="tle-zoom-card">` +
              `<p class="tle-zoom-handwriting">"Find the year on the photograph"</p>` +
              `<p class="tle-zoom-sub">Clue permanently saved across all time loops!</p>` +
              `</div>`,
          );
        } else {
          flashFeedbackToast("The wooden cabinet is locked. You need the Golden Key.");
        }
        break;

      case "photo":
        flashFeedbackToast("You inspect the photograph pinned to the corkboard.");
        openInspector(
          "📷 Corkboard Photograph",
          `<div class="tle-zoom-card">` +
            `<div class="tle-zoom-photo-year">🏛️ <span>1998</span></div>` +
            `<p class="tle-zoom-sub">A handwritten year is inscribed along the bottom border.</p>` +
            `</div>`,
        );
        break;

      case "computer":
        if (state.codeEntered) {
          flashFeedbackToast("The computer unlocked the Exit Door!");
        } else {
          openInspector(
            "💻 Study Computer Terminal",
            `<p class="tle-zoom-sub">Enter the 4-digit security passcode from the photograph:</p>`,
            true,
          );
        }
        break;

      case "door":
        if (state.doorUnlocked) {
          completeCurrentRoomEscape();
        } else {
          flashFeedbackToast(
            "The Study Exit Door is locked. Unlock it from the computer first!",
          );
        }
        break;

      // ==================== ROOM 2: THE CRIMSON PARLOR ====================
      case "r2-gramophone":
        addClue("Coffee Table Letter Scramble: Spell TIME");
        flashFeedbackToast('🎵 Gramophone riddle: "Spell what ticks away on the Coffee Table!"');
        openInspector(
          "🎺 Brass Parlor Gramophone",
          `<div class="tle-zoom-card">` +
            `<p class="tle-zoom-handwriting">"I have no voice, yet I count every loop.<br/>` +
            `Unscramble the 4 letters on the <strong>Coffee Table</strong>: ` +
            `<strong>M - E - T - I</strong>"</p>` +
            `<p class="tle-zoom-sub">Click the Coffee Table in the parlor to arrange the tiles!</p>` +
            `</div>`,
        );
        break;

      case "r2-coffee-table":
        openCoffeeTableLetterPuzzle();
        break;

      case "r2-bookshelf":
        openBookshelfPuzzle();
        break;

      case "r2-vault":
        openRotaryVaultPuzzle();
        break;

      case "r2-door":
        if (state.doorUnlocked) {
          completeCurrentRoomEscape();
        } else {
          flashFeedbackToast(
            "The Crimson Parlor door is sealed! Unlock the Rotary Safe above the fireplace first.",
          );
        }
        break;

      // ==================== ROOM 3: CHRONO-CORE CYBER LAB ====================
      case "r3-breaker":
        openCircuitBreakerPuzzle();
        break;

      case "r3-holo-table":
        openHoloTablePuzzle();
        break;

      case "r3-laser-grid":
        openLaserMirrorPuzzle();
        break;

      case "r3-cryo-core":
        if (state.r3CoreUnlocked) {
          flashFeedbackToast("Cryo-Core unlocked! Click the Quantum Airlock Door to escape!");
        } else {
          openInspector(
            "🧬 Cryo-Core Override Console",
            `<p class="tle-zoom-sub">Enter the 4-digit override code revealed by the Laser Mirror Grid:</p>`,
            true,
          );
        }
        break;

      case "r3-door":
        if (state.doorUnlocked) {
          completeCurrentRoomEscape();
        } else {
          flashFeedbackToast(
            "🚨 Quantum Airlock sealed! Solve the Laser Grid and enter the code at the Cryo-Core.",
          );
        }
        break;
    }

    callbacks.onObjectInteract?.(objectId, "interact");
    renderState();
  }

  function submitPasscode(): void {
    const entered = codeInput?.value.trim() ?? "";
    const validForRoom =
      state.difficulty === "hard"
        ? entered === "2026"
        : entered === "1998" || entered === "1984";

    if (validForRoom) {
      state.codeEntered = true;
      state.r3CoreUnlocked = true;
      state.doorUnlocked = true;
      inspectorModal?.classList.add("hidden");
      state.statusText = "Door Unlocked";
      flashFeedbackToast(
        "🔓 Passcode accepted! The Exit Door is now UNLOCKED — click the door on the right!",
      );
    } else {
      flashFeedbackToast(
        state.difficulty === "hard"
          ? "❌ Incorrect code! Aim the Laser Mirror Grid to reveal the 4-digit Cryo-Core code."
          : "❌ Incorrect passcode! Check the year on the corkboard photograph.",
      );
    }
    renderState();
  }

  function showScoreboardModal(escapedNow: boolean): void {
    if (!modalTitle || !modalDesc || !pauseModal) return;
    const myLoops = Math.max(1, state.loopCount);
    const friendLoops = state.partnerLoopScore ?? DEFAULT_PARTNER_LOOPS[state.difficulty];

    if (escapedNow) {
      const iWon = myLoops < friendLoops;
      const isTie = myLoops === friendLoops;
      modalTitle.textContent = iWon
        ? `🏆 You Win ${ROOM_TITLES[state.difficulty]}!`
        : isTie
          ? `🤝 Tie in ${ROOM_TITLES[state.difficulty]}!`
          : `🏁 Escaped ${ROOM_TITLES[state.difficulty]}!`;
      modalDesc.textContent = iWon
        ? `You escaped in ${myLoops} loop(s) while Player 2 took ${friendLoops} loops!`
        : `You took ${myLoops} loop(s) (Player 2: ${friendLoops}). Try again to beat them!`;
    } else {
      modalTitle.textContent = `${ROOM_TITLES[state.difficulty]}`;
      modalDesc.textContent =
        "Whoever escapes the room in fewer loops wins! Try again resets your loop counter to 0.";
    }

    if (scoreboardBox) {
      scoreboardBox.innerHTML =
        `<div class="tle-score-row"><span>👤 You (Player 1):</span>` +
        `<strong>${escapedNow ? `${myLoops} Loops` : `Loop #${state.loopCount}`}</strong></div>` +
        `<div class="tle-score-row"><span>🖥️ Friend (Player 2):</span>` +
        `<strong>${friendLoops} Loops</strong></div>` +
        `<div class="tle-score-row"><span>🏅 Room Status:</span>` +
        `<strong>${
          escapedNow
            ? myLoops <= friendLoops
              ? "🎉 YOU WIN!"
              : "P2 Leads"
            : "In Progress"
        }</strong></div>`;
    }

    if (nextRoomBtn) {
      const hasNext = state.difficulty !== "hard";
      nextRoomBtn.classList.toggle("hidden", !escapedNow || !hasNext);
      if (state.difficulty === "basic") {
        nextRoomBtn.textContent = "➡ Next: Room 2 (Crimson Parlor)";
      } else if (state.difficulty === "medium") {
        nextRoomBtn.textContent = "➡ Next: Room 3 (Cyber Lab)";
      }
    }

    pauseModal.classList.remove("hidden");
    renderState();
  }

  /** Called when timer hits 00:00 — blurs the room and pops up Restart / Exit in the center. */
  function expireLoop(): void {
    const clueCount = state.clues.length;
    const endedLoop = Math.max(1, state.loopCount);
    state = {
      ...state,
      timeLeftSeconds: 0,
      timerRunning: false,
      loopExpired: true,
      statusText: "Loop Ended",
      activeItem: null,
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      cabinetUnlocked: false,
      codeEntered: false,
      r2WordInput: [],
      r2TableSolved: false,
      r2BooksSequence: [],
      r2BooksSolved: false,
      r2DialValues: [10, 25, 40],
      r2VaultSolved: false,
      r3GridCells: [false, true, false, false, false, false, false, true, false],
      r3BreakerSolved: false,
      r3HoloInput: [],
      r3HoloSolved: false,
      r3MirrorAngles: [0, 0, 0],
      r3LaserSolved: false,
      r3CoreUnlocked: false,
      doorUnlocked: false,
      inventory: [],
    };
    if (codeInput) codeInput.value = "";
    inspectorModal?.classList.add("hidden");

    if (loopEndTitle) {
      loopEndTitle.textContent = `⏰ Time Loop #${endedLoop} Ended!`;
    }
    if (loopEndDesc) {
      loopEndDesc.innerHTML =
        `Your time ran out! All physical items vanished, ` +
        `but your <strong>${clueCount} discovered clue(s)</strong> stay with you.<br/>` +
        `Ready for <strong>Loop #${endedLoop + 1}</strong>?`;
    }
    if (popupRestartBtn) {
      popupRestartBtn.textContent = `↺ Restart (Start Loop #${endedLoop + 1})`;
    }
    loopEndModal?.classList.remove("hidden");
    renderState();
  }

  /** Starts the next loop (Loop N -> Loop N+1), keeping clues and unblurring the room. */
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
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      cabinetUnlocked: false,
      codeEntered: false,
      r2WordInput: [],
      r2TableSolved: false,
      r2BooksSequence: [],
      r2BooksSolved: false,
      r2DialValues: [10, 25, 40],
      r2VaultSolved: false,
      r3GridCells: [false, true, false, false, false, false, false, true, false],
      r3BreakerSolved: false,
      r3HoloInput: [],
      r3HoloSolved: false,
      r3MirrorAngles: [0, 0, 0],
      r3LaserSolved: false,
      r3CoreUnlocked: false,
      doorUnlocked: false,
      escaped: false,
      inventory: [],
    };
    if (codeInput) codeInput.value = "";
    inspectorModal?.classList.add("hidden");
    loopEndModal?.classList.add("hidden");
    pauseModal?.classList.add("hidden");
    callbacks.onLoopReset?.(state.loopCount);
    flashFeedbackToast(
      `⏳ Loop #${nextLoop} started! Items reset, ${clueCount} clue(s) kept.`,
    );
    renderState();
  }

  // Wire up interactive scene objects across all 3 rooms
  const sceneObjects = container.querySelectorAll<HTMLElement>("[data-object-id]");
  for (const btn of sceneObjects) {
    btn.addEventListener("click", () => {
      const id = btn.dataset.objectId as RoomObjectId | undefined;
      if (id) handleObjectClick(id);
    });
  }

  // Wire up difficulty / room selector buttons
  const diffButtons = container.querySelectorAll<HTMLButtonElement>(".tle-diff-btn");
  for (const dBtn of diffButtons) {
    dBtn.addEventListener("click", () => {
      const diff = dBtn.dataset.diff as DifficultyLevel | undefined;
      if (diff) resetRoomToZero(diff, false);
    });
  }

  // Keypad buttons inside computer / cryo-core modal
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
    if (state.difficulty === "basic") {
      if (!state.clues.includes("BLUE - 4")) {
        flashFeedbackToast("💡 Hint: Click the open book on the left desk first!");
      } else if (!state.keyRevealed) {
        flashFeedbackToast("💡 Hint: Click the Blue Mountain Painting 4 times.");
      } else if (!state.cabinetUnlocked) {
        flashFeedbackToast("💡 Hint: Take the Golden Key and unlock the wooden cabinet.");
      } else {
        flashFeedbackToast("💡 Hint: Check the photo year (1998) and enter it on the computer.");
      }
    } else if (state.difficulty === "medium") {
      if (!state.r2TableSolved) {
        flashFeedbackToast(
          "💡 Hint: Click the Coffee Table and spell TIME with the letter tiles!",
        );
      } else if (!state.r2BooksSolved) {
        flashFeedbackToast(
          "💡 Hint: Click the Bookshelf and pull RED → GOLD → GREEN spines!",
        );
      } else {
        flashFeedbackToast(
          "💡 Hint: Click the Rotary Safe above the fireplace and dial 30 - 70 - 15!",
        );
      }
    } else {
      if (!state.r3BreakerSolved) {
        flashFeedbackToast(
          "💡 Hint: Click the 3x3 Power Grid on the left and turn ON only the 4 corners!",
        );
      } else if (!state.r3HoloSolved) {
        flashFeedbackToast("💡 Hint: Click the Holo-Table and spell LOOP!");
      } else if (!state.r3LaserSolved) {
        flashFeedbackToast(
          "💡 Hint: Click the Laser Mirror Grid and set mirrors to [\\], [\\], [/]!",
        );
      } else {
        flashFeedbackToast("💡 Hint: Click the Cryo-Core Console and enter 2026!");
      }
    }
  });

  container.querySelector("#btn-start-restart")?.addEventListener("click", () => {
    if (state.loopExpired || state.timeLeftSeconds <= 0) {
      resetLoop();
    } else if (state.escaped) {
      resetRoomToZero(state.difficulty, true);
    } else if (!state.timerRunning) {
      if (state.loopCount === 0) {
        state.loopCount = 1;
      }
      state.timerRunning = true;
      state.statusText = "Loop Active";
      flashFeedbackToast(`▶ Loop #${state.loopCount} started!`);
      renderState();
    }
  });

  container.querySelector("#btn-stop-loop")?.addEventListener("click", () => {
    if (state.timerRunning) {
      state.timerRunning = false;
      state.statusText = "Stopped";
      flashFeedbackToast("⏹ Timer paused. Press ▶ Start to continue.");
      renderState();
    }
  });

  container.querySelector("#btn-reset-loop")?.addEventListener("click", () => {
    resetLoop();
  });

  popupRestartBtn?.addEventListener("click", () => {
    resetLoop();
  });

  popupExitBtn?.addEventListener("click", () => {
    resetRoomToZero(state.difficulty, false);
  });

  container.querySelector("#btn-try-again")?.addEventListener("click", () => {
    resetRoomToZero(state.difficulty, true);
  });

  nextRoomBtn?.addEventListener("click", () => {
    const nextDiff: DifficultyLevel =
      state.difficulty === "basic" ? "medium" : "hard";
    resetRoomToZero(nextDiff, true);
  });

  container.querySelector("#btn-pause-menu")?.addEventListener("click", () => {
    showScoreboardModal(false);
  });

  container.querySelector("#btn-resume")?.addEventListener("click", () => {
    pauseModal?.classList.add("hidden");
    renderState();
  });

  function renderSlotItemSvg(item: InventoryItemId): string {
    switch (item) {
      case "Golden Key":
      case "Winding Key":
        return (
          `<span class="tle-slot-emoji">🗝️</span>` +
          `<span class="tle-slot-tag">${item === "Golden Key" ? "Gold Key" : "Wind Key"}</span>`
        );
      case "Ruby Lens":
        return `<span class="tle-slot-emoji">📕</span><span class="tle-slot-tag">Code Note</span>`;
      case "Parlor Emblem":
        return `<span class="tle-slot-emoji">💎</span><span class="tle-slot-tag">Emblem</span>`;
      case "Optic Mirror":
        return `<span class="tle-slot-emoji">🪞</span><span class="tle-slot-tag">Mirror</span>`;
      case "Plasma Cell":
        return `<span class="tle-slot-emoji">🧪</span><span class="tle-slot-tag">Plasma</span>`;
      case "Quantum Keycard":
        return `<span class="tle-slot-emoji">💳</span><span class="tle-slot-tag">Keycard</span>`;
    }
  }

  function renderState(): void {
    const timerPill = container.querySelector<HTMLElement>("#hud-timer");
    const timerVal = container.querySelector<HTMLElement>("#hud-timer-val");
    const loopVal = container.querySelector<HTMLElement>("#hud-loop");
    const scoreVal = container.querySelector<HTMLElement>("#hud-score-val");
    const startRestartBtn = container.querySelector<HTMLButtonElement>("#btn-start-restart");
    const stopBtn = container.querySelector<HTMLButtonElement>("#btn-stop-loop");
    const activeLabel = container.querySelector<HTMLElement>("#inv-active-label");

    const isUrgent = state.timeLeftSeconds <= 15 && state.timerRunning;
    const isPopupOpen =
      !loopEndModal?.classList.contains("hidden") ||
      !pauseModal?.classList.contains("hidden");

    rootEl?.setAttribute("data-room-diff", state.difficulty);
    rootEl?.classList.toggle("tle-lamp-off", !state.lampOn);
    blurTarget?.classList.toggle("tle-room-blurred", Boolean(isPopupOpen));
    timerPill?.classList.toggle("tle-timer-urgent", isUrgent);

    // Toggle which of the 3 unique room scenes is displayed
    sceneBasic?.classList.toggle("hidden", state.difficulty !== "basic");
    sceneMedium?.classList.toggle("hidden", state.difficulty !== "medium");
    sceneHard?.classList.toggle("hidden", state.difficulty !== "hard");

    for (const dBtn of diffButtons) {
      dBtn.classList.toggle("tle-diff-active", dBtn.dataset.diff === state.difficulty);
    }

    if (timerVal) {
      timerVal.textContent = formatTime(state.timeLeftSeconds);
    }
    if (loopVal) {
      loopVal.textContent = `P1 LOOP #${state.loopCount}`;
    }
    if (scoreVal) {
      const p2 = state.partnerLoopScore ?? DEFAULT_PARTNER_LOOPS[state.difficulty];
      scoreVal.textContent = `VS P2: ${p2} Loops`;
    }
    if (activeLabel) {
      activeLabel.textContent = state.activeItem
        ? `Equipped: ${state.activeItem}`
        : "Resets every loop";
    }

    if (startRestartBtn) {
      if (state.loopExpired || state.timeLeftSeconds <= 0) {
        startRestartBtn.textContent = "↺ Restart";
        startRestartBtn.classList.add("tle-ctrl-restart-mode");
        startRestartBtn.disabled = false;
      } else if (state.escaped) {
        startRestartBtn.textContent = "🔄 Try Again";
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

    // Room 1 object visual states
    const paintingBtn = container.querySelector<HTMLElement>("#obj-painting");
    const keyBtn = container.querySelector<HTMLElement>("#obj-key");
    paintingBtn?.classList.toggle("tle-painting-open", state.keyRevealed);
    keyBtn?.classList.toggle("hidden", !state.keyRevealed || state.keyCollected);

    const cabinetBtn = container.querySelector<HTMLElement>("#obj-cabinet");
    const cabinetBadge = container.querySelector<HTMLElement>("#state-cabinet");
    cabinetBtn?.classList.toggle("tle-cabinet-open", state.cabinetUnlocked);
    if (cabinetBadge) {
      cabinetBadge.textContent = state.cabinetUnlocked ? "🔓" : "🔒";
    }

    const monitorScreen = container.querySelector<HTMLElement>("#monitor-screen");
    const monitorLock = container.querySelector<HTMLElement>("#state-computer");
    const monitorPassbox = container.querySelector<HTMLElement>("#monitor-passbox");
    monitorScreen?.classList.toggle("tle-monitor-unlocked", state.codeEntered);
    if (monitorLock) {
      monitorLock.textContent = state.codeEntered ? "🔓" : "🔒";
    }
    if (monitorPassbox) {
      monitorPassbox.textContent = state.codeEntered ? "OPEN" : "* * * *";
    }

    const doorBtn = container.querySelector<HTMLElement>("#obj-door");
    const doorBadge = container.querySelector<HTMLElement>("#state-door");
    doorBtn?.classList.toggle("tle-door-unlocked", state.doorUnlocked);
    if (doorBadge) {
      doorBadge.textContent = state.doorUnlocked ? "🔓" : "⇥";
    }

    // Room 2 object visual states
    const r2TableBadge = container.querySelector<HTMLElement>("#r2-table-badge");
    const r2BooksBadge = container.querySelector<HTMLElement>("#r2-books-badge");
    const r2VaultStatus = container.querySelector<HTMLElement>("#r2-vault-status");
    const r2DoorBtn = container.querySelector<HTMLElement>("#r2-door-btn");
    const r2DoorBadge = container.querySelector<HTMLElement>("#r2-door-badge");
    if (r2TableBadge) {
      r2TableBadge.textContent = state.r2TableSolved ? "✅ TIME Solved" : "🔤 Letter Puzzle";
    }
    if (r2BooksBadge) {
      r2BooksBadge.textContent = state.r2BooksSolved ? "✅ 30-70-15" : "📚 Secret Books";
    }
    if (r2VaultStatus) {
      r2VaultStatus.textContent = state.r2VaultSolved ? "🔓 Safe Open" : "🔒 Rotary Safe";
    }
    r2DoorBtn?.classList.toggle("tle-door-unlocked", state.doorUnlocked);
    if (r2DoorBadge) {
      r2DoorBadge.textContent = state.doorUnlocked ? "🔓" : "🔒";
    }

    // Room 3 object visual states
    const r3BreakerTag = container.querySelector<HTMLElement>("#r3-breaker-tag");
    const r3HoloTag = container.querySelector<HTMLElement>("#r3-holo-tag");
    const r3LaserTag = container.querySelector<HTMLElement>("#r3-laser-tag");
    const r3CryoTag = container.querySelector<HTMLElement>("#r3-cryo-tag");
    const r3DoorBtn = container.querySelector<HTMLElement>("#r3-door-btn");
    const r3DoorBadge = container.querySelector<HTMLElement>("#r3-door-badge");
    if (r3BreakerTag) {
      r3BreakerTag.textContent = state.r3BreakerSolved ? "✅ Grid Online" : "⚡ 3x3 Power Grid";
    }
    if (r3HoloTag) {
      r3HoloTag.textContent = state.r3HoloSolved ? "✅ LOOP Solved" : "🌐 Holo-Cipher Table";
    }
    if (r3LaserTag) {
      r3LaserTag.textContent = state.r3LaserSolved ? "🎯 Code: 2026" : "🔴 Laser Mirror Grid";
    }
    if (r3CryoTag) {
      r3CryoTag.textContent = state.r3CoreUnlocked ? "🔓 Core Open" : "🔒 Cryo-Core Console";
    }
    r3DoorBtn?.classList.toggle("tle-door-unlocked", state.doorUnlocked);
    if (r3DoorBadge) {
      r3DoorBadge.textContent = state.doorUnlocked ? "🔓" : "🚨";
    }

    // Render 4 Interactive Inventory Slots
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
          flashFeedbackToast(`Equipped [${item}]!`);
          renderState();
        });
      }
    }

    // Render Persistent Clues List
    const cluesList = container.querySelector<HTMLElement>("#clues-list");
    if (cluesList) {
      if (state.clues.length === 0) {
        const startHint =
          state.difficulty === "basic"
            ? "Click the open book on the desk to discover your first clue..."
            : state.difficulty === "medium"
              ? "Click the Gramophone or Coffee Table to start solving the Crimson Parlor..."
              : "Click the 3x3 Power Grid, Holo-Table, or Laser Grid to hack the Cyber Lab...";
        cluesList.innerHTML = `<li class="tle-clue-empty">${startHint}</li>`;
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

  // Flash banner + toast briefly for 1.8 seconds on initial load, then auto-hide!
  flashRoomBanner(state.roomId);
  flashFeedbackToast(state.feedbackMessage);
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
