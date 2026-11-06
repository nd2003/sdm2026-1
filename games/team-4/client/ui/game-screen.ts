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
  roomCode?: string;
  player1Name?: string;
  player2Name?: string;
  player1Ready?: boolean;
  player2Ready?: boolean;
  player2Room?: DifficultyLevel;
  player2LoopCount?: number;
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
  onReadyChange?: (ready: boolean) => void;
  onMatchStart?: () => void;
}

interface InternalGameScreenState {
  roomId: string;
  roomCode: string;
  player1Name: string;
  player2Name: string;
  player1Ready: boolean;
  player2Ready: boolean;
  player2Room: DifficultyLevel;
  player2LoopCount: number;
  matchStarted: boolean;
  countdownSeconds: number | null;
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
  bookRead: boolean;
  paintingClicks: number;
  keyRevealed: boolean;
  keyCollected: boolean;
  cabinetUnlocked: boolean;
  photoInspected: boolean;
  codeEntered: boolean;
  // Room 2 state
  r2GramophoneRead: boolean;
  r2WordInput: string[];
  r2TableSolved: boolean;
  r2BooksSequence: string[];
  r2BooksSolved: boolean;
  r2BooksError: string;
  r2DialValues: [number, number, number];
  r2VaultSolved: boolean;
  r2VaultError: string;
  // Room 3 state
  r3GridCells: boolean[];
  r3BreakerSolved: boolean;
  r3HoloInput: string[];
  r3HoloSolved: boolean;
  r3HoloError: string;
  r3MirrorAngles: [number, number, number];
  r3LaserSolved: boolean;
  r3LaserError: string;
  r3CoreUnlocked: boolean;
  // Shared progression
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
  medium: 60,
  hard: 60,
};

const ROOM_TITLES: Record<DifficultyLevel, string> = {
  basic: "Room 1",
  medium: "Room 2",
  hard: "Room 3",
};

const DEFAULT_PARTNER_LOOPS: Record<DifficultyLevel, number> = {
  basic: 3,
  medium: 5,
  hard: 7,
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
    onReadyChange: initialState?.onReadyChange,
    onMatchStart: initialState?.onMatchStart,
  };

  const initialDiff: DifficultyLevel = initialState?.difficulty ?? "basic";
  const defaultDuration = initialState?.loopDurationSeconds ?? DIFFICULTY_SECONDS[initialDiff];

  let bannerTimeoutId: number | null = null;
  let toastTimeoutId: number | null = null;
  let greenEventTimeoutId: number | null = null;
  let countdownIntervalId: number | null = null;

  let state: InternalGameScreenState = {
    roomId: initialState?.roomId ?? ROOM_TITLES[initialDiff],
    roomCode: initialState?.roomCode ?? "RM-04",
    player1Name: initialState?.player1Name ?? "You",
    player2Name: initialState?.player2Name ?? "Drek",
    player1Ready: initialState?.player1Ready ?? false,
    player2Ready: initialState?.player2Ready ?? true,
    player2Room: initialState?.player2Room ?? "basic",
    player2LoopCount: initialState?.player2LoopCount ?? 7,
    matchStarted: false,
    countdownSeconds: null,
    difficulty: initialDiff,
    timeLeftSeconds: initialState?.timeLeftSeconds ?? defaultDuration,
    loopDurationSeconds: defaultDuration,
    loopCount: initialState?.loopCount ?? 1,
    bestLoopScore: initialState?.bestLoopScore ?? null,
    partnerLoopScore: initialState?.partnerLoopScore ?? 7,
    connectedPlayers: initialState?.connectedPlayers ?? 2,
    maxPlayers: initialState?.maxPlayers ?? 2,
    score: initialState?.score ?? 1,
    statusText: initialState?.statusText ?? "Ready",
    selectedObjectId: initialState?.selectedObjectId ?? null,
    activeItem: initialState?.activeItem ?? null,
    lampOn: initialState?.lampOn ?? true,
    bookRead: false,
    paintingClicks: initialState?.paintingClicks ?? 0,
    keyRevealed: initialState?.keyRevealed ?? false,
    keyCollected: initialState?.keyCollected ?? false,
    cabinetUnlocked: initialState?.cabinetUnlocked ?? false,
    photoInspected: false,
    codeEntered: initialState?.codeEntered ?? false,
    r2GramophoneRead: false,
    r2WordInput: [],
    r2TableSolved: false,
    r2BooksSequence: [],
    r2BooksSolved: false,
    r2BooksError: "",
    r2DialValues: [10, 25, 40],
    r2VaultSolved: false,
    r2VaultError: "",
    r3GridCells: [false, true, false, false, false, false, false, true, false],
    r3BreakerSolved: false,
    r3HoloInput: [],
    r3HoloSolved: false,
    r3HoloError: "",
    r3MirrorAngles: [0, 0, 0],
    r3LaserSolved: false,
    r3LaserError: "",
    r3CoreUnlocked: false,
    doorUnlocked: initialState?.doorUnlocked ?? false,
    escaped: initialState?.escaped ?? false,
    timerRunning: initialState?.timerRunning ?? false,
    loopExpired: initialState?.loopExpired ?? false,
    clues: initialState?.clues ? [...initialState.clues] : [],
    inventory: initialState?.inventory ? [...initialState.inventory] : [],
    feedbackMessage: initialState?.feedbackMessage ?? "",
  };

  function formatTime(seconds: number): string {
    const clamped = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function isCurrentRoomAllSolved(): boolean {
    if (state.difficulty === "basic") {
      return (
        state.bookRead &&
        state.keyCollected &&
        state.cabinetUnlocked &&
        state.photoInspected &&
        state.codeEntered
      );
    }
    if (state.difficulty === "medium") {
      return state.r2TableSolved && state.r2BooksSolved && state.r2VaultSolved;
    }
    return (
      state.r3BreakerSolved &&
      state.r3HoloSolved &&
      state.r3LaserSolved &&
      state.r3CoreUnlocked
    );
  }

  container.innerHTML = `
    <div class="tle-root" id="tle-root" data-room-diff="${state.difficulty}">
      <!-- Top Header Bar -->
      <header class="tle-header">
        <div class="tle-header-left">
          <!-- Exit-style Corner Lobby Button -->
          <button
            type="button"
            class="tle-lobby-corner-btn"
            id="btn-open-lobby"
            title="Lobby"
          >
            🚪 Lobby
          </button>

          <!-- Corner Total Loop Counter for You -->
          <div class="tle-corner-loop-badge" id="hud-loop" title="Your total loops">
            LOOP 01
          </div>

          <!-- Aesthetic Player Name Badges (You & Drek) -->
          <div class="tle-players-bar">
            <button
              type="button"
              class="tle-player-tag tle-player-you"
              id="btn-pause-menu"
              title="Stats"
            >
              <span class="tle-p-dot tle-dot-you"></span>
              <span id="hud-p1-name">${state.player1Name}</span>
            </button>
            <button
              type="button"
              class="tle-player-tag tle-player-friend"
              id="btn-sim-friend-escape"
              title="${state.player2Name}"
            >
              <span class="tle-p-dot tle-dot-friend"></span>
              <span id="hud-p2-name">${state.player2Name}</span>
            </button>
          </div>

          <!-- Room Switcher Pills -->
          <div class="tle-diff-group" role="group" aria-label="Rooms">
            <button type="button" class="tle-diff-btn" data-diff="basic">R1</button>
            <button type="button" class="tle-diff-btn" data-diff="medium">R2</button>
            <button type="button" class="tle-diff-btn" data-diff="hard">R3</button>
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
          >
            ▶ Start
          </button>
          <button
            type="button"
            class="tle-ctrl-btn tle-ctrl-stop"
            id="btn-stop-loop"
          >
            ⏹ Stop
          </button>
          <button
            type="button"
            class="tle-ctrl-btn tle-ctrl-restart"
            id="btn-reset-loop"
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
            <!-- Auto-fading Room Banner (1.4s then disappears!) -->
            <div class="tle-room-banner tle-banner-hidden" id="hud-room">${state.roomId}</div>

            <!-- Live Green Escape Notification ("Drek escaped Room 1") -->
            <div class="tle-green-escape-pill tle-banner-hidden" id="green-escape-banner">
              ✨ Drek escaped Room 1
            </div>

            <!-- ===================================================================
                 ROOM 1: THE MIDNIGHT STUDY (60s)
                 =================================================================== -->
            <div class="tle-scene tle-scene-basic" id="scene-basic">
              <div class="tle-wall-back"></div>
              <div class="tle-wall-left">
                <button
                  type="button"
                  class="tle-window-frame"
                  id="obj-window"
                  data-object-id="window"
                  title="Window"
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
                    title="Golden Key"
                  >
                    <svg viewBox="0 0 64 64" class="tle-svg-key">
                      <circle cx="20" cy="20" r="10" fill="none" stroke="#fbbf24" stroke-width="5" />
                      <line x1="27" y1="27" x2="52" y2="52" stroke="#fbbf24" stroke-width="5" />
                      <line x1="42" y1="42" x2="36" y2="48" stroke="#f59e0b" stroke-width="4" />
                      <line x1="49" y1="49" x2="43" y2="55" stroke="#f59e0b" stroke-width="4" />
                    </svg>
                    <span class="tle-key-sparkle">✨ Key</span>
                  </button>
                </div>

                <button
                  type="button"
                  class="tle-painting-btn"
                  id="obj-painting"
                  data-object-id="painting"
                  title="Blue Painting"
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
                  title="Cabinet"
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
                    <span class="tle-interior-scroll">📜 Clue</span>
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
                title="Photograph"
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
                  title="Computer"
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

              <!-- 5. Visibly Opening 3D Doorway into Room 2 -->
              <div class="tle-door-zone" id="r1-door-zone">
                <button
                  type="button"
                  class="tle-door-portal-Light"
                  data-object-id="door"
                  title="Enter Room 2"
                >
                  <span class="tle-portal-sparkle">✨</span>
                  <span class="tle-portal-text">ROOM 2<br/>ENTER ➔</span>
                </button>
                <button
                  type="button"
                  class="tle-exit-door-btn"
                  id="obj-door"
                  data-object-id="door"
                  title="Door"
                >
                  <div class="tle-exit-panel"></div>
                  <div class="tle-exit-panel tle-exit-panel-mid"></div>
                  <div class="tle-exit-panel"></div>
                  <span class="tle-door-handle"></span>
                  <span class="tle-door-badge" id="state-door">🔒</span>
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
                    title="Lamp"
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
                    title="Journal"
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
                 ROOM 2: THE GOLDEN ALCHEMIST'S PARLOR (RADICALLY DIFFERENT AESTHETIC!)
                 =================================================================== -->
            <div class="tle-scene tle-scene-medium hidden" id="scene-medium">
              <div class="tle-r2-backdrop">
                <!-- Stained Glass Rose Window Arch in Center Ceiling -->
                <div class="tle-r2-rose-arch">
                  <svg viewBox="0 0 220 110" class="tle-rose-svg" aria-hidden="true">
                    <path
                      d="M10,110 A100,100 0 0,1 210,110 Z"
                      fill="#1e1035"
                      stroke="#fbbf24"
                      stroke-width="4"
                    />
                    <circle cx="110" cy="72" r="34" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
                    <line x1="110" y1="10" x2="110" y2="110" stroke="#fbbf24" stroke-width="2"/>
                    <line x1="40" y1="50" x2="180" y2="95" stroke="#c084fc" stroke-width="1.5"/>
                    <line x1="180" y1="50" x2="40" y2="95" stroke="#c084fc" stroke-width="1.5"/>
                  </svg>
                </div>
                <div class="tle-r2-pillars">
                  <span class="tle-r2-pillar"></span>
                  <span class="tle-r2-pillar"></span>
                </div>
              </div>
              <div class="tle-r2-marble-floor"></div>

              <!-- Left: Golden Phonograph & Chandelier Pedestal -->
              <button
                type="button"
                class="tle-r2-gramophone"
                data-object-id="r2-gramophone"
                title="Gramophone"
              >
                <svg viewBox="0 0 100 120" class="tle-gram-svg">
                  <path
                    d="M50,55 C65,18 95,12 92,45 C89,68 62,62 50,55 Z"
                    fill="#fbbf24"
                    stroke="#b45309"
                    stroke-width="3"
                  />
                  <ellipse cx="42" cy="76" rx="28" ry="8" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
                  <rect
                    x="18"
                    y="82"
                    width="52"
                    height="28"
                    rx="4"
                    fill="#78350f"
                    stroke="#f59e0b"
                    stroke-width="2.5"
                  />
                </svg>
                <span class="tle-obj-tag">Gramophone</span>
              </button>

              <!-- Center-Left Foreground: Ornate Round Coffee Table with Scrambled Letter Tiles -->
              <button
                type="button"
                class="tle-r2-coffee-table"
                id="r2-coffee-table-btn"
                data-object-id="r2-coffee-table"
                title="Coffee Table"
              >
                <div class="tle-table-top">
                  <span class="tle-teacup">☕</span>
                  <div class="tle-mini-tiles">
                    <span class="tle-mini-tile">M</span>
                    <span class="tle-mini-tile">E</span>
                    <span class="tle-mini-tile">T</span>
                    <span class="tle-mini-tile">I</span>
                  </div>
                  <span class="tle-table-badge" id="r2-table-badge">Coffee Table</span>
                </div>
                <div class="tle-table-legs">
                  <span></span>
                  <span></span>
                </div>
              </button>

              <!-- Center: Gothic Hearth & Astrolabe Rotary Vault -->
              <div class="tle-r2-fireplace-zone">
                <button
                  type="button"
                  class="tle-r2-vault-btn"
                  id="r2-vault-btn"
                  data-object-id="r2-vault"
                  title="Astrolabe Vault"
                >
                  <svg viewBox="0 0 90 90" class="tle-vault-svg">
                    <circle cx="45" cy="45" r="38" fill="#0f172a" stroke="#fbbf24" stroke-width="4"/>
                    <circle
                      cx="45"
                      cy="45"
                      r="24"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="2"
                      stroke-dasharray="6 4"
                    />
                    <line x1="45" y1="12" x2="45" y2="78" stroke="#fbbf24" stroke-width="3"/>
                    <line x1="12" y1="45" x2="78" y2="45" stroke="#fbbf24" stroke-width="3"/>
                    <circle cx="45" cy="45" r="9" fill="#fbbf24"/>
                  </svg>
                  <span class="tle-vault-status" id="r2-vault-status">🔒 Vault</span>
                </button>

                <div class="tle-r2-fireplace">
                  <div class="tle-mantle-shelf">
                    <span>🕯️</span>
                    <span>⚗️</span>
                    <span>🕯️</span>
                  </div>
                  <div class="tle-fire-hearth">
                    <div class="tle-fire-flames">🔥</div>
                  </div>
                </div>
              </div>

              <!-- Right-Center: Grand Arcane Bookshelf -->
              <button
                type="button"
                class="tle-r2-bookshelf"
                id="r2-bookshelf-btn"
                data-object-id="r2-bookshelf"
                title="Bookshelf"
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
                <span class="tle-bookshelf-badge" id="r2-books-badge">Bookshelf</span>
              </button>

              <!-- Far Right: Visibly Opening 3D Parlor Gate into Room 3 -->
              <div class="tle-door-zone">
                <button
                  type="button"
                  class="tle-door-portal-Light tle-portal-cyber"
                  data-object-id="r2-door"
                  title="Enter Room 3"
                >
                  <span class="tle-portal-sparkle">⚡</span>
                  <span class="tle-portal-text">ROOM 3<br/>ENTER ➔</span>
                </button>
                <button
                  type="button"
                  class="tle-exit-door-btn tle-r2-door-btn"
                  id="r2-door-btn"
                  data-object-id="r2-door"
                  title="Parlor Gate"
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
                 ROOM 3: NEON QUANTUM REACTOR LAB (FUTURISTIC CYBERPUNK CHAMBER!)
                 =================================================================== -->
            <div class="tle-scene tle-scene-hard hidden" id="scene-hard">
              <div class="tle-r3-wall">
                <div class="tle-r3-grid-lines"></div>
                <div class="tle-r3-neon-arch"></div>
              </div>
              <div class="tle-r3-floor"></div>

              <!-- Left: 3x3 Reactor Power Matrix -->
              <button
                type="button"
                class="tle-r3-breaker"
                id="r3-breaker-btn"
                data-object-id="r3-breaker"
                title="Power Grid"
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
                <span class="tle-r3-tag" id="r3-breaker-tag">Power Grid</span>
              </button>

              <!-- Center-Left Foreground: Floating 3D Hologram Table -->
              <button
                type="button"
                class="tle-r3-holo-table"
                id="r3-holo-btn"
                data-object-id="r3-holo-table"
                title="Holo-Table"
              >
                <div class="tle-holo-beam">
                  <span class="tle-holo-letters">O · P · L · O</span>
                </div>
                <div class="tle-holo-base">
                  <span class="tle-r3-tag" id="r3-holo-tag">Holo-Table</span>
                </div>
              </button>

              <!-- Center Back Wall: Live Laser & Mirror Optics Grid -->
              <button
                type="button"
                class="tle-r3-laser-panel"
                id="r3-laser-btn"
                data-object-id="r3-laser-grid"
                title="Laser Grid"
              >
                <svg viewBox="0 0 180 120" class="tle-laser-preview-svg">
                  <rect width="180" height="120" rx="8" fill="#050811" />
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
                <span class="tle-r3-tag" id="r3-laser-tag">Laser Grid</span>
              </button>

              <!-- Right-Center: Cryo-Core Reactor Console -->
              <button
                type="button"
                class="tle-r3-cryo"
                id="r3-cryo-btn"
                data-object-id="r3-cryo-core"
                title="Cryo-Core"
              >
                <div class="tle-cryo-tube">
                  <div class="tle-cryo-plasma">🧬</div>
                </div>
                <span class="tle-r3-tag" id="r3-cryo-tag">Cryo-Core</span>
              </button>

              <!-- Far Right: Visibly Opening 3D Quantum Airlock Door -->
              <div class="tle-door-zone">
                <button
                  type="button"
                  class="tle-door-portal-Light tle-portal-victory"
                  data-object-id="r3-door"
                  title="Escape"
                >
                  <span class="tle-portal-sparkle">🏆</span>
                  <span class="tle-portal-text">ESCAPE ➔</span>
                </button>
                <button
                  type="button"
                  class="tle-exit-door-btn tle-r3-door-btn"
                  id="r3-door-btn"
                  data-object-id="r3-door"
                  title="Airlock Door"
                >
                  <div class="tle-exit-panel"></div>
                  <div class="tle-exit-panel tle-exit-panel-mid"></div>
                  <div class="tle-exit-panel"></div>
                  <span class="tle-door-handle"></span>
                  <span class="tle-door-badge" id="r3-door-badge">🔒</span>
                </button>
              </div>
            </div>

            <!-- Bottom Floating Glass Inventory & Clues Bar -->
            <aside class="tle-bottom-dock" id="inventory-clues-dock">
              <div class="tle-inventory-panel">
                <div class="tle-dock-label-col">
                  <span class="tle-dock-label">INVENTORY:</span>
                </div>
                <div class="tle-inv-slots" id="inventory-list"></div>
              </div>

              <div class="tle-dock-divider"></div>

              <div class="tle-clues-panel">
                <div class="tle-dock-label-col">
                  <span class="tle-dock-label">CLUES:</span>
                </div>
                <ul class="tle-clues-list" id="clues-list"></ul>
              </div>
            </aside>
          </div>

          <!-- Top Floating Feedback Toast (z-index 95 so never behind modals) -->
          <div class="tle-feedback-toast tle-banner-hidden" id="action-feedback-text">
            ${state.feedbackMessage}
          </div>

          <!-- Interactive Mini-Puzzle / Inspector Overlay -->
          <div class="tle-overlay hidden" id="inspector-modal">
            <div class="tle-modal-card tle-puzzle-modal">
              <h3 id="inspector-title">Inspect</h3>
              <div class="tle-inspector-body" id="inspector-body"></div>

              <!-- 4-Digit Passcode Keypad -->
              <div class="tle-passcode-area hidden" id="terminal-code-group">
                <div id="passcode-modal-alert"></div>
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
                    aria-label="Passcode"
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

          <!-- MINIMAL, CLEAN 2-PLAYER LOBBY MODAL (Zero extra text!) -->
          <div class="tle-overlay tle-blur-backdrop hidden" id="ready-lobby-modal">
            <div class="tle-modal-card tle-center-popup tle-lobby-card">
              <div class="tle-lobby-header-pill" id="lobby-room-code">${state.roomCode}</div>
              <h2>Lobby</h2>

              <div class="tle-lobby-players-grid">
                <div class="tle-lobby-player-box" id="lobby-p1-box">
                  <div class="tle-lobby-pname" id="lobby-p1-name">${state.player1Name}</div>
                  <button type="button" class="tle-ready-toggle-btn" id="btn-toggle-p1-ready">
                    Not Ready
                  </button>
                </div>

                <div class="tle-lobby-player-box" id="lobby-p2-box">
                  <div class="tle-lobby-pname" id="lobby-p2-name">${state.player2Name}</div>
                  <button type="button" class="tle-ready-toggle-btn" id="btn-toggle-p2-ready">
                    Ready
                  </button>
                </div>
              </div>

              <p class="tle-whatsapp-hint" id="lobby-wait-hint">Player not ready</p>

              <div class="tle-modal-actions">
                <button type="button" class="tle-primary-btn tle-btn-lg" id="btn-host-start-match" disabled>
                  Start
                </button>
                <button type="button" class="tle-secondary-btn" id="btn-close-lobby">
                  Close
                </button>
              </div>
            </div>
          </div>

          <!-- SYNCHRONIZED 5 - 4 - 3 - 2 - 1 - GO! COUNTDOWN OVERLAY -->
          <div class="tle-overlay tle-blur-backdrop hidden" id="countdown-overlay">
            <div class="tle-countdown-box">
              <div class="tle-countdown-number" id="countdown-number">5</div>
            </div>
          </div>

          <!-- CENTER POPUP WHEN A LOOP ENDS (Blurs entire room behind it!) -->
          <div class="tle-overlay tle-blur-backdrop hidden" id="loop-end-modal">
            <div class="tle-modal-card tle-center-popup">
              <div class="tle-popup-icon">⏳</div>
              <h2 id="loop-end-title">Loop #1 Ended</h2>
              <div class="tle-modal-actions">
                <button type="button" class="tle-primary-btn tle-btn-lg" id="btn-popup-restart">
                  ↺ Restart
                </button>
                <button type="button" class="tle-secondary-btn tle-btn-lg" id="btn-popup-exit">
                  🚪 Exit
                </button>
              </div>
            </div>
          </div>

          <!-- AESTHETIC, BRIEF "GAME END" / STATS MODAL -->
          <div class="tle-overlay tle-blur-backdrop hidden" id="pause-modal">
            <div class="tle-modal-card tle-center-popup tle-game-end-card">
              <div class="tle-game-end-badge">GAME END</div>
              <h2 id="modal-title">${state.player1Name} escaped all rooms</h2>
              <div class="tle-scoreboard-box" id="scoreboard-box"></div>
              <div class="tle-modal-actions">
                <button type="button" class="tle-primary-btn" id="btn-try-again">
                  Play Again
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
  const greenEscapeBanner = container.querySelector<HTMLElement>("#green-escape-banner");
  const feedbackEl = container.querySelector<HTMLElement>("#action-feedback-text");

  const sceneBasic = container.querySelector<HTMLElement>("#scene-basic");
  const sceneMedium = container.querySelector<HTMLElement>("#scene-medium");
  const sceneHard = container.querySelector<HTMLElement>("#scene-hard");

  const readyLobbyModal = container.querySelector<HTMLElement>("#ready-lobby-modal");
  const lobbyP1Box = container.querySelector<HTMLElement>("#lobby-p1-box");
  const lobbyP2Box = container.querySelector<HTMLElement>("#lobby-p2-box");
  const lobbyWaitHint = container.querySelector<HTMLElement>("#lobby-wait-hint");
  const toggleP1ReadyBtn = container.querySelector<HTMLButtonElement>("#btn-toggle-p1-ready");
  const toggleP2ReadyBtn = container.querySelector<HTMLButtonElement>("#btn-toggle-p2-ready");
  const hostStartMatchBtn = container.querySelector<HTMLButtonElement>("#btn-host-start-match");

  const countdownOverlay = container.querySelector<HTMLElement>("#countdown-overlay");
  const countdownNumberEl = container.querySelector<HTMLElement>("#countdown-number");

  const loopEndModal = container.querySelector<HTMLElement>("#loop-end-modal");
  const loopEndTitle = container.querySelector<HTMLElement>("#loop-end-title");
  const popupRestartBtn = container.querySelector<HTMLButtonElement>("#btn-popup-restart");
  const popupExitBtn = container.querySelector<HTMLButtonElement>("#btn-popup-exit");

  const pauseModal = container.querySelector<HTMLElement>("#pause-modal");
  const modalTitle = container.querySelector<HTMLElement>("#modal-title");
  const scoreboardBox = container.querySelector<HTMLElement>("#scoreboard-box");

  const inspectorModal = container.querySelector<HTMLElement>("#inspector-modal");
  const inspectorTitle = container.querySelector<HTMLElement>("#inspector-title");
  const inspectorBody = container.querySelector<HTMLElement>("#inspector-body");
  const terminalGroup = container.querySelector<HTMLElement>("#terminal-code-group");
  const passcodeAlertEl = container.querySelector<HTMLElement>("#passcode-modal-alert");
  const codeInput = container.querySelector<HTMLInputElement>("#terminal-code-input");

  function flashRoomBanner(text: string): void {
    if (!roomBannerEl) return;
    roomBannerEl.textContent = text;
    roomBannerEl.classList.remove("tle-banner-hidden");
    if (bannerTimeoutId !== null) {
      window.clearTimeout(bannerTimeoutId);
    }
    bannerTimeoutId = window.setTimeout(() => {
      roomBannerEl.classList.add("tle-banner-hidden");
    }, 1400);
  }

  /** Shows a bright green notification at the top (e.g. "Drek escaped Room 1") for 2.2s. */
  function showGreenEscapeBanner(text: string): void {
    if (!greenEscapeBanner) return;
    greenEscapeBanner.textContent = text;
    greenEscapeBanner.classList.remove("tle-banner-hidden");
    if (greenEventTimeoutId !== null) {
      window.clearTimeout(greenEventTimeoutId);
    }
    greenEventTimeoutId = window.setTimeout(() => {
      greenEscapeBanner.classList.add("tle-banner-hidden");
    }, 2200);
  }

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
    }, 1800);
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
    if (passcodeAlertEl) passcodeAlertEl.innerHTML = "";
    inspectorModal?.classList.remove("hidden");
    if (showTerminal) {
      if (codeInput) codeInput.value = "";
      codeInput?.focus();
    }
  }

  /** 5 - 4 - 3 - 2 - 1 - GO! Countdown */
  function startFiveSecondCountdown(): void {
    readyLobbyModal?.classList.add("hidden");
    countdownOverlay?.classList.remove("hidden");
    let count = 5;
    state.countdownSeconds = count;
    if (countdownNumberEl) {
      countdownNumberEl.textContent = String(count);
    }
    renderState();

    if (countdownIntervalId !== null) {
      window.clearInterval(countdownIntervalId);
    }
    countdownIntervalId = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        if (countdownNumberEl) {
          countdownNumberEl.textContent = String(count);
        }
      } else if (count === 0) {
        if (countdownNumberEl) {
          countdownNumberEl.textContent = "GO";
        }
      } else {
        if (countdownIntervalId !== null) {
          window.clearInterval(countdownIntervalId);
          countdownIntervalId = null;
        }
        countdownOverlay?.classList.add("hidden");
        state.countdownSeconds = null;
        state.matchStarted = true;
        state.timeLeftSeconds = 60;
        state.timerRunning = true;
        callbacks.onMatchStart?.();
        renderState();
      }
    }, 850);
  }

  /** Room 2 Puzzle: Coffee Table Letter Tile Unscrambler ("TIME") */
  function openCoffeeTableLetterPuzzle(): void {
    const tiles = ["M", "E", "T", "I", "S", "R"];

    const renderModalContent = (): void => {
      const currentWord = state.r2WordInput.join("");
      const wordDisplay = [0, 1, 2, 3]
        .map((idx) => {
          const ch = state.r2WordInput[idx] ?? "_";
          const cls = ch !== "_" ? "tle-word-slot-filled" : "";
          return `<span class="tle-word-slot ${cls}">${ch}</span>`;
        })
        .join("");

      const tileBtns = tiles
        .map(
          (letter, idx) =>
            `<button type="button" class="tle-letter-tile" ` +
            `data-r2-letter="${letter}" data-r2-idx="${idx}">${letter}</button>`,
        )
        .join("");

      const feedbackBanner = state.r2TableSolved
        ? `<div class="tle-modal-alert tle-modal-alert-success">` +
          `✅ Unlocked! Clue: <strong>RED → GOLD → GREEN</strong></div>`
        : currentWord.length === 4 && currentWord !== "TIME"
          ? `<div class="tle-modal-alert tle-modal-alert-error">` +
            `❌ Wrong word (${currentWord})</div>`
          : "";

      openInspector(
        "☕ Coffee Table",
        `<div class="tle-zoom-card">` +
          feedbackBanner +
          `<div class="tle-word-slots-row">${wordDisplay}</div>` +
          `<div class="tle-letter-tiles-grid">${tileBtns}</div>` +
          `<div class="tle-mini-actions">` +
          `<button type="button" class="tle-secondary-btn" id="r2-clear-word">Clear</button>` +
          `</div>` +
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
              addClue("Books: RED → GOLD → GREEN");
              if (isCurrentRoomAllSolved()) {
                state.doorUnlocked = true;
              }
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

  /** Room 2 Puzzle: Bookshelf (Error pops up directly inside the bookshelf modal!) */
  function openBookshelfPuzzle(): void {
    const books = [
      { id: "BLUE", label: "📘 Azure", color: "#2563eb" },
      { id: "RED", label: "📕 Crimson", color: "#dc2626" },
      { id: "GOLD", label: "📙 Aurum", color: "#d97706" },
      { id: "GREEN", label: "📗 Emerald", color: "#16a34a" },
      { id: "PURPLE", label: "📓 Violet", color: "#7c3aed" },
    ];

    const renderBooksModal = (): void => {
      const errorAlert = state.r2BooksError
        ? `<div class="tle-modal-alert tle-modal-alert-error">${state.r2BooksError}</div>`
        : "";

      const successAlert = state.r2BooksSolved
        ? `<div class="tle-modal-alert tle-modal-alert-success">` +
          `✅ Unlocked! Vault Code: <strong>30 - 70 - 15</strong></div>`
        : "";

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
        "📚 Bookshelf",
        `<div class="tle-zoom-card">` +
          errorAlert +
          successAlert +
          `<div class="tle-book-pull-list">${bookButtons}</div>` +
          `<div class="tle-mini-actions">` +
          `<button type="button" class="tle-secondary-btn" id="r2-reset-books">Reset</button>` +
          `</div>` +
          `</div>`,
      );

      const bBtns = inspectorBody?.querySelectorAll<HTMLButtonElement>("[data-book-color]");
      if (bBtns) {
        for (const btn of bBtns) {
          btn.addEventListener("click", () => {
            if (state.r2BooksSolved) return;
            const col = btn.dataset.bookColor;
            if (!col || state.r2BooksSequence.includes(col)) return;
            state.r2BooksError = "";
            state.r2BooksSequence = [...state.r2BooksSequence, col];

            if (state.r2BooksSequence.length === 3) {
              if (state.r2BooksSequence.join("-") === "RED-GOLD-GREEN") {
                state.r2BooksSolved = true;
                state.r2BooksError = "";
                addInventoryItem("Ruby Lens");
                addClue("Vault: 30 - 70 - 15");
                if (isCurrentRoomAllSolved()) {
                  state.doorUnlocked = true;
                }
                renderState();
              } else {
                state.r2BooksSequence = [];
                state.r2BooksError = "❌ Wrong book order!";
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
          state.r2BooksError = "";
          renderBooksModal();
        });
    };

    renderBooksModal();
  }

  /** Room 2 Puzzle: Rotary Dial Vault */
  function openRotaryVaultPuzzle(): void {
    const renderVaultModal = (): void => {
      const [d0, d1, d2] = state.r2DialValues;

      const errorAlert = state.r2VaultError
        ? `<div class="tle-modal-alert tle-modal-alert-error">${state.r2VaultError}</div>`
        : "";

      const successAlert = state.r2VaultSolved
        ? `<div class="tle-modal-alert tle-modal-alert-success">🔓 Vault Open!</div>`
        : "";

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
        "⚙️ Astrolabe Vault",
        `<div class="tle-zoom-card">` +
          errorAlert +
          successAlert +
          `<div class="tle-dials-row">${dialsHtml}</div>` +
          `<div class="tle-mini-actions">` +
          `<button type="button" class="tle-primary-btn" id="r2-unlock-vault">Unlock</button>` +
          `</div>` +
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
            state.r2VaultError = "";
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
            state.r2VaultError = "";
            addInventoryItem("Parlor Emblem");
            if (isCurrentRoomAllSolved()) {
              state.doorUnlocked = true;
              inspectorModal?.classList.add("hidden");
              flashFeedbackToast("🔓 All puzzles solved — the Parlor Gate swung open!");
            } else {
              state.r2VaultError = "🔒 Solve all puzzles in the room to unseal the gate!";
            }
            renderState();
            renderVaultModal();
          } else {
            state.r2VaultError = "❌ Wrong combination!";
            renderVaultModal();
          }
        });
    };

    renderVaultModal();
  }

  /** Room 3 Puzzle: 3x3 Power Grid */
  function openCircuitBreakerPuzzle(): void {
    const renderBreakerModal = (): void => {
      const cellsHtml = state.r3GridCells
        .map(
          (isOn, idx) =>
            `<button type="button" class="tle-circuit-cell ${isOn ? "tle-circuit-on" : ""}" ` +
            `data-cell-idx="${idx}">` +
            `${isOn ? "⚡" : "○"}` +
            `</button>`,
        )
        .join("");

      const statusAlert = state.r3BreakerSolved
        ? `<div class="tle-modal-alert tle-modal-alert-success">` +
          `✅ Power Online! Clue: <strong>O-P-L-O</strong></div>`
        : "";

      openInspector(
        "⚡ Power Grid",
        `<div class="tle-zoom-card">` +
          statusAlert +
          `<div class="tle-circuit-grid">${cellsHtml}</div>` +
          `</div>`,
      );

      const cellBtns = inspectorBody?.querySelectorAll<HTMLButtonElement>("[data-cell-idx]");
      if (cellBtns) {
        for (const btn of cellBtns) {
          btn.addEventListener("click", () => {
            const idx = Number(btn.dataset.cellIdx ?? "0");
            state.r3GridCells[idx] = !state.r3GridCells[idx];
            const target = [true, false, true, false, false, false, true, false, true];
            const solved = state.r3GridCells.every((v, i) => v === target[i]);
            if (solved && !state.r3BreakerSolved) {
              state.r3BreakerSolved = true;
              addInventoryItem("Optic Mirror");
              addClue("Holo: LOOP");
              if (isCurrentRoomAllSolved()) {
                state.doorUnlocked = true;
              }
              renderState();
            }
            renderBreakerModal();
          });
        }
      }
    };

    renderBreakerModal();
  }

  /** Room 3 Puzzle: Holo-Table ("LOOP") */
  function openHoloTablePuzzle(): void {
    const letters = ["O", "P", "L", "O", "X", "Z"];

    const renderHoloModal = (): void => {
      const currentWord = state.r3HoloInput.join("");

      const errorAlert =
        currentWord.length === 4 && currentWord !== "LOOP"
          ? `<div class="tle-modal-alert tle-modal-alert-error">❌ Wrong sequence</div>`
          : "";

      const successAlert = state.r3HoloSolved
        ? `<div class="tle-modal-alert tle-modal-alert-success">` +
          `✅ Unlocked! Mirrors: <strong>[＼] [＼] [／]</strong></div>`
        : "";

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
        "🌐 Holo-Table",
        `<div class="tle-zoom-card">` +
          errorAlert +
          successAlert +
          `<div class="tle-word-slots-row">${slots}</div>` +
          `<div class="tle-letter-tiles-grid">${btns}</div>` +
          `<div class="tle-mini-actions">` +
          `<button type="button" class="tle-secondary-btn" id="r3-clear-holo">Reset</button>` +
          `</div>` +
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
              addClue("Mirrors: [\\] [\\] [/]");
              if (isCurrentRoomAllSolved()) {
                state.doorUnlocked = true;
              }
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

  /** Room 3 Puzzle: Live Laser & Rotatable Mirror Grid */
  function openLaserMirrorPuzzle(): void {
    const renderLaserModal = (): void => {
      const [m0, m1, m2] = state.r3MirrorAngles;
      const hit1 = m0 === 1;
      const hit2 = hit1 && m1 === 1;
      const hitTarget = hit2 && m2 === 0;

      const successAlert = state.r3LaserSolved
        ? `<div class="tle-modal-alert tle-modal-alert-success">🎯 Code: <strong>2026</strong></div>`
        : "";

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
        "🔴 Laser Grid",
        `<div class="tle-zoom-card">` +
          successAlert +
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
          `<button type="button" class="tle-mirror-btn" data-mirror-idx="0">M1 [${mirrorChar(m0)}]</button>` +
          `<button type="button" class="tle-mirror-btn" data-mirror-idx="1">M2 [${mirrorChar(m1)}]</button>` +
          `<button type="button" class="tle-mirror-btn" data-mirror-idx="2">M3 [${mirrorChar(m2)}]</button>` +
          `</div>` +
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
              addClue("Cryo-Core: 2026");
              if (isCurrentRoomAllSolved()) {
                state.doorUnlocked = true;
              }
              renderState();
            }
            renderLaserModal();
          });
        }
      }
    };

    renderLaserModal();
  }

  /** Transitions to a room while keeping total loop count across the whole game! */
  function transitionToRoom(diff: DifficultyLevel, resetTotalLoops = false): void {
    state = {
      ...state,
      roomId: ROOM_TITLES[diff],
      difficulty: diff,
      timeLeftSeconds: 60,
      loopDurationSeconds: 60,
      loopCount: resetTotalLoops ? 1 : state.loopCount,
      timerRunning: true,
      loopExpired: false,
      escaped: false,
      activeItem: null,
      lampOn: true,
      bookRead: false,
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      cabinetUnlocked: false,
      photoInspected: false,
      codeEntered: false,
      r2GramophoneRead: false,
      r2WordInput: [],
      r2TableSolved: false,
      r2BooksSequence: [],
      r2BooksSolved: false,
      r2BooksError: "",
      r2DialValues: [10, 25, 40],
      r2VaultSolved: false,
      r2VaultError: "",
      r3GridCells: [false, true, false, false, false, false, false, true, false],
      r3BreakerSolved: false,
      r3HoloInput: [],
      r3HoloSolved: false,
      r3HoloError: "",
      r3MirrorAngles: [0, 0, 0],
      r3LaserSolved: false,
      r3LaserError: "",
      r3CoreUnlocked: false,
      doorUnlocked: false,
      clues: [],
      inventory: [],
    };
    loopEndModal?.classList.add("hidden");
    pauseModal?.classList.add("hidden");
    inspectorModal?.classList.add("hidden");
    callbacks.onDifficultyChange?.(diff);
    flashRoomBanner(ROOM_TITLES[diff]);
    renderState();
  }

  /** When clicking an unlocked, visibly open door -> steps directly into the next room! */
  function stepThroughOpenDoor(): void {
    const finishedRoomNum =
      state.difficulty === "basic" ? 1 : state.difficulty === "medium" ? 2 : 3;
    showGreenEscapeBanner(`✨ ${state.player1Name} escaped Room ${finishedRoomNum}`);
    callbacks.onEscape?.(state.loopCount, state.difficulty);

    if (state.difficulty === "basic") {
      transitionToRoom("medium", false);
    } else if (state.difficulty === "medium") {
      transitionToRoom("hard", false);
    } else {
      state.escaped = true;
      state.timerRunning = false;
      showScoreboardModal(true);
    }
  }

  function handleObjectClick(objectId: RoomObjectId): void {
    if (!state.timerRunning && !state.escaped) {
      state.timerRunning = true;
    }
    state.selectedObjectId = objectId;

    switch (objectId) {
      // ==================== ROOM 1 ====================
      case "window":
        flashFeedbackToast("Rain streaks down the glass.");
        break;

      case "lamp":
        state.lampOn = !state.lampOn;
        break;

      case "book":
        state.bookRead = true;
        addClue("BLUE - 4");
        if (isCurrentRoomAllSolved()) state.doorUnlocked = true;
        openInspector(
          "📖 Journal",
          `<div class="tle-zoom-card">` +
            `<p class="tle-zoom-handwriting"><strong>BLUE - 4</strong></p>` +
            `</div>`,
        );
        break;

      case "painting":
        if (!state.keyRevealed) {
          state.paintingClicks += 1;
          if (state.paintingClicks >= 4) {
            state.keyRevealed = true;
          }
        }
        break;

      case "key":
        if (state.keyRevealed && !state.keyCollected) {
          state.keyCollected = true;
          addInventoryItem("Golden Key");
          if (isCurrentRoomAllSolved()) state.doorUnlocked = true;
        }
        break;

      case "cabinet":
        if (state.keyCollected) {
          state.cabinetUnlocked = true;
          addClue("Find the year on the photograph");
          if (isCurrentRoomAllSolved()) state.doorUnlocked = true;
          openInspector(
            "🔓 Cabinet",
            `<div class="tle-zoom-card">` +
              `<p class="tle-zoom-handwriting">"Find the year on the photograph"</p>` +
              `</div>`,
          );
        } else {
          flashFeedbackToast("🔒 Locked");
        }
        break;

      case "photo":
        state.photoInspected = true;
        if (isCurrentRoomAllSolved()) state.doorUnlocked = true;
        openInspector(
          "📷 Photograph",
          `<div class="tle-zoom-card">` +
            `<div class="tle-zoom-photo-year">🏛️ <span>1998</span></div>` +
            `</div>`,
        );
        break;

      case "computer":
        if (!state.codeEntered) {
          openInspector("💻 Terminal", "", true);
        }
        break;

      case "door":
        if (isCurrentRoomAllSolved()) {
          stepThroughOpenDoor();
        } else {
          flashFeedbackToast("🔒 Locked — Solve all puzzles to escape");
        }
        break;

      // ==================== ROOM 2 ====================
      case "r2-gramophone":
        state.r2GramophoneRead = true;
        addClue("Coffee Table: TIME");
        openInspector(
          "🎺 Gramophone",
          `<div class="tle-zoom-card">` +
            `<p class="tle-zoom-handwriting">"M - E - T - I"</p>` +
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
        if (isCurrentRoomAllSolved()) {
          stepThroughOpenDoor();
        } else {
          flashFeedbackToast("🔒 Locked — Solve all puzzles to escape");
        }
        break;

      // ==================== ROOM 3 ====================
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
        if (!state.r3CoreUnlocked) {
          openInspector("🧬 Cryo-Core", "", true);
        }
        break;

      case "r3-door":
        if (isCurrentRoomAllSolved()) {
          stepThroughOpenDoor();
        } else {
          flashFeedbackToast("🔒 Locked — Solve all puzzles to escape");
        }
        break;
    }

    callbacks.onObjectInteract?.(objectId, "interact");
    renderState();
  }

  function submitPasscode(): void {
    const entered = codeInput?.value.trim() ?? "";

    if (state.difficulty === "basic") {
      if (entered === "1998") {
        state.codeEntered = true;
        if (isCurrentRoomAllSolved()) {
          state.doorUnlocked = true;
          inspectorModal?.classList.add("hidden");
          flashFeedbackToast("🔓 Door opened!");
        } else if (passcodeAlertEl) {
          passcodeAlertEl.innerHTML =
            `<div class="tle-modal-alert tle-modal-alert-error">` +
            `🔒 Solve all puzzles in the room to unseal the door!</div>`;
        }
      } else if (passcodeAlertEl) {
        passcodeAlertEl.innerHTML =
          `<div class="tle-modal-alert tle-modal-alert-error">❌ Wrong code</div>`;
      }
    } else if (state.difficulty === "hard") {
      if (entered === "2026") {
        state.r3CoreUnlocked = true;
        if (isCurrentRoomAllSolved()) {
          state.doorUnlocked = true;
          inspectorModal?.classList.add("hidden");
          flashFeedbackToast("🔓 Airlock opened!");
        } else if (passcodeAlertEl) {
          passcodeAlertEl.innerHTML =
            `<div class="tle-modal-alert tle-modal-alert-error">` +
            `🔒 Solve all puzzles in the room to unseal the airlock!</div>`;
        }
      } else if (passcodeAlertEl) {
        passcodeAlertEl.innerHTML =
          `<div class="tle-modal-alert tle-modal-alert-error">❌ Wrong code</div>`;
      }
    }
    renderState();
  }

  /** Brief, aesthetic "Game End" modal showing final loop stats. */
  function showScoreboardModal(escapedNow: boolean): void {
    if (!modalTitle || !pauseModal) return;
    const myLoops = Math.max(1, state.loopCount);
    const friendLoops = state.partnerLoopScore ?? DEFAULT_PARTNER_LOOPS[state.difficulty];
    const winnerName =
      myLoops <= friendLoops ? state.player1Name : state.player2Name;

    modalTitle.textContent = escapedNow
      ? `${winnerName} escaped all rooms`
      : "Match Stats";

    if (scoreboardBox) {
      scoreboardBox.innerHTML =
        `<div class="tle-stat-grid">` +
        `<div class="tle-stat-card ${myLoops <= friendLoops ? "tle-stat-winner" : ""}">` +
        `<span class="tle-stat-name">${state.player1Name}</span>` +
        `<strong class="tle-stat-loops">${myLoops} Loops</strong>` +
        `</div>` +
        `<div class="tle-stat-card ${friendLoops < myLoops ? "tle-stat-winner" : ""}">` +
        `<span class="tle-stat-name">${state.player2Name}</span>` +
        `<strong class="tle-stat-loops">${friendLoops} Loops</strong>` +
        `</div>` +
        `</div>`;
    }

    pauseModal.classList.remove("hidden");
    renderState();
  }

  function expireLoop(): void {
    const endedLoop = Math.max(1, state.loopCount);
    state = {
      ...state,
      timeLeftSeconds: 0,
      timerRunning: false,
      loopExpired: true,
      activeItem: null,
      bookRead: false,
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      cabinetUnlocked: false,
      photoInspected: false,
      codeEntered: false,
      r2GramophoneRead: false,
      r2WordInput: [],
      r2TableSolved: false,
      r2BooksSequence: [],
      r2BooksSolved: false,
      r2BooksError: "",
      r2DialValues: [10, 25, 40],
      r2VaultSolved: false,
      r2VaultError: "",
      r3GridCells: [false, true, false, false, false, false, false, true, false],
      r3BreakerSolved: false,
      r3HoloInput: [],
      r3HoloSolved: false,
      r3HoloError: "",
      r3MirrorAngles: [0, 0, 0],
      r3LaserSolved: false,
      r3LaserError: "",
      r3CoreUnlocked: false,
      doorUnlocked: false,
      inventory: [],
    };
    if (codeInput) codeInput.value = "";
    inspectorModal?.classList.add("hidden");

    if (loopEndTitle) {
      loopEndTitle.textContent = `Loop #${endedLoop} Ended`;
    }
    loopEndModal?.classList.remove("hidden");
    renderState();
  }

  function resetLoop(): void {
    const nextLoop = state.loopCount + 1;
    state = {
      ...state,
      timeLeftSeconds: 60,
      loopCount: nextLoop,
      score: nextLoop,
      timerRunning: true,
      loopExpired: false,
      activeItem: null,
      bookRead: false,
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      cabinetUnlocked: false,
      photoInspected: false,
      codeEntered: false,
      r2GramophoneRead: false,
      r2WordInput: [],
      r2TableSolved: false,
      r2BooksSequence: [],
      r2BooksSolved: false,
      r2BooksError: "",
      r2DialValues: [10, 25, 40],
      r2VaultSolved: false,
      r2VaultError: "",
      r3GridCells: [false, true, false, false, false, false, false, true, false],
      r3BreakerSolved: false,
      r3HoloInput: [],
      r3HoloSolved: false,
      r3HoloError: "",
      r3MirrorAngles: [0, 0, 0],
      r3LaserSolved: false,
      r3LaserError: "",
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
    renderState();
  }

  const sceneObjects = container.querySelectorAll<HTMLElement>("[data-object-id]");
  for (const btn of sceneObjects) {
    btn.addEventListener("click", () => {
      const id = btn.dataset.objectId as RoomObjectId | undefined;
      if (id) handleObjectClick(id);
    });
  }

  const diffButtons = container.querySelectorAll<HTMLButtonElement>(".tle-diff-btn");
  for (const dBtn of diffButtons) {
    dBtn.addEventListener("click", () => {
      const diff = dBtn.dataset.diff as DifficultyLevel | undefined;
      if (diff) transitionToRoom(diff, false);
    });
  }

  // Clicking friend's badge simulates friend escaping a room to preview the green top notification
  container.querySelector("#btn-sim-friend-escape")?.addEventListener("click", () => {
    const rNum =
      state.player2Room === "basic" ? 1 : state.player2Room === "medium" ? 2 : 3;
    showGreenEscapeBanner(`✨ ${state.player2Name} escaped Room ${rNum}`);
    if (state.player2Room === "basic") {
      state.player2Room = "medium";
    } else if (state.player2Room === "medium") {
      state.player2Room = "hard";
    } else {
      state.escaped = true;
      state.timerRunning = false;
      if (modalTitle) {
        modalTitle.textContent = `${state.player2Name} escaped all rooms`;
      }
      showScoreboardModal(false);
    }
    renderState();
  });

  container.querySelector("#btn-open-lobby")?.addEventListener("click", () => {
    readyLobbyModal?.classList.remove("hidden");
    renderState();
  });

  container.querySelector("#btn-close-lobby")?.addEventListener("click", () => {
    readyLobbyModal?.classList.add("hidden");
    renderState();
  });

  toggleP1ReadyBtn?.addEventListener("click", () => {
    state.player1Ready = !state.player1Ready;
    callbacks.onReadyChange?.(state.player1Ready);
    renderState();
  });

  toggleP2ReadyBtn?.addEventListener("click", () => {
    state.player2Ready = !state.player2Ready;
    renderState();
  });

  hostStartMatchBtn?.addEventListener("click", () => {
    if (state.player1Ready && state.player2Ready) {
      startFiveSecondCountdown();
    }
  });

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
    if (passcodeAlertEl) passcodeAlertEl.innerHTML = "";
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

  container.querySelector("#btn-start-restart")?.addEventListener("click", () => {
    if (state.loopExpired || state.timeLeftSeconds <= 0) {
      resetLoop();
    } else if (!state.timerRunning) {
      state.timerRunning = true;
      renderState();
    }
  });

  container.querySelector("#btn-stop-loop")?.addEventListener("click", () => {
    if (state.timerRunning) {
      state.timerRunning = false;
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
    transitionToRoom("basic", true);
  });

  container.querySelector("#btn-try-again")?.addEventListener("click", () => {
    transitionToRoom("basic", true);
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
        return `<span class="tle-slot-emoji">🗝️</span>`;
      case "Ruby Lens":
        return `<span class="tle-slot-emoji">📕</span>`;
      case "Parlor Emblem":
        return `<span class="tle-slot-emoji">💎</span>`;
      case "Optic Mirror":
        return `<span class="tle-slot-emoji">🪞</span>`;
      case "Plasma Cell":
        return `<span class="tle-slot-emoji">🧪</span>`;
      case "Quantum Keycard":
        return `<span class="tle-slot-emoji">💳</span>`;
    }
  }

  function renderState(): void {
    const timerPill = container.querySelector<HTMLElement>("#hud-timer");
    const timerVal = container.querySelector<HTMLElement>("#hud-timer-val");
    const loopVal = container.querySelector<HTMLElement>("#hud-loop");
    const p1NameEl = container.querySelector<HTMLElement>("#hud-p1-name");
    const p2NameEl = container.querySelector<HTMLElement>("#hud-p2-name");
    const startRestartBtn = container.querySelector<HTMLButtonElement>("#btn-start-restart");
    const stopBtn = container.querySelector<HTMLButtonElement>("#btn-stop-loop");

    const isUrgent = state.timeLeftSeconds <= 15 && state.timerRunning;
    const isPopupOpen =
      !loopEndModal?.classList.contains("hidden") ||
      !pauseModal?.classList.contains("hidden") ||
      !readyLobbyModal?.classList.contains("hidden") ||
      !countdownOverlay?.classList.contains("hidden");

    rootEl?.setAttribute("data-room-diff", state.difficulty);
    rootEl?.classList.toggle("tle-lamp-off", !state.lampOn);
    blurTarget?.classList.toggle("tle-room-blurred", Boolean(isPopupOpen));
    timerPill?.classList.toggle("tle-timer-urgent", isUrgent);

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
      loopVal.textContent = `LOOP ${String(state.loopCount).padStart(2, "0")}`;
    }
    if (p1NameEl) {
      p1NameEl.textContent = state.player1Name;
    }
    if (p2NameEl) {
      p2NameEl.textContent = state.player2Name;
    }

    // Minimal Lobby Ready / Not Ready state
    lobbyP1Box?.classList.toggle("tle-lobby-box-ready", state.player1Ready);
    lobbyP2Box?.classList.toggle("tle-lobby-box-ready", state.player2Ready);
    if (toggleP1ReadyBtn) {
      toggleP1ReadyBtn.textContent = state.player1Ready ? "Ready" : "Not Ready";
      toggleP1ReadyBtn.classList.toggle("tle-ready-active", state.player1Ready);
    }
    if (toggleP2ReadyBtn) {
      toggleP2ReadyBtn.textContent = state.player2Ready ? "Ready" : "Not Ready";
      toggleP2ReadyBtn.classList.toggle("tle-ready-active", state.player2Ready);
    }
    const bothReady = state.player1Ready && state.player2Ready;
    if (hostStartMatchBtn) {
      hostStartMatchBtn.disabled = !bothReady;
    }
    if (lobbyWaitHint) {
      lobbyWaitHint.textContent = bothReady ? "" : "Player not ready";
    }

    if (startRestartBtn) {
      if (state.loopExpired || state.timeLeftSeconds <= 0) {
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

    const allSolved = isCurrentRoomAllSolved();
    if (allSolved) {
      state.doorUnlocked = true;
    }

    // Room 1 visual states
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
    const r1Open = state.difficulty === "basic" && allSolved;
    doorBtn?.classList.toggle("tle-door-swung-open", r1Open);

    // Room 2 visual states
    const r2DoorBtn = container.querySelector<HTMLElement>("#r2-door-btn");
    const r2Open = state.difficulty === "medium" && allSolved;
    r2DoorBtn?.classList.toggle("tle-door-swung-open", r2Open);

    // Room 3 visual states
    const r3DoorBtn = container.querySelector<HTMLElement>("#r3-door-btn");
    const r3Open = state.difficulty === "hard" && allSolved;
    r3DoorBtn?.classList.toggle("tle-door-swung-open", r3Open);

    // Inventory Slots
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
            }" data-inv-item="${item}" title="${item}">` +
              renderSlotItemSvg(item) +
              `</button>`,
          );
        } else {
          slotsHtml.push(`<div class="tle-inv-slot"></div>`);
        }
      }
      invContainer.innerHTML = slotsHtml.join("");
    }

    // Persistent Clues
    const cluesList = container.querySelector<HTMLElement>("#clues-list");
    if (cluesList) {
      if (state.clues.length === 0) {
        cluesList.innerHTML = `<li class="tle-clue-empty">Explore the room to find clues...</li>`;
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
