export type DifficultyLevel = "basic" | "medium" | "hard";

export type ActiveStageView = "lobby" | "basic" | "corridor-1" | "medium" | "corridor-2" | "hard";

export type RoomObjectId =
  | "r1-glovebox"
  | "r1-crate"
  | "r1-chem"
  | "r1-map"
  | "r1-console"
  | "r1-door"
  | "corridor-wheel"
  | "corridor-door"
  | "r2-chalk"
  | "r2-taps"
  | "r2-wine"
  | "r2-board"
  | "r2-door"
  | "r3-map"
  | "r3-hnocs"
  | "r3-graffiti"
  | "r3-labcoat"
  | "r3-oscillo"
  | "r3-exitdoor";

export type InventoryItemId =
  | "Console Key"
  | "Brass Corkscrew"
  | "Bar Token"
  | "Oscilloscope Key"
  | "Silver Door Key";

export type LocalPlayerRole = "host" | "guest";

export type RematchSender = "p1" | "p2" | null;

export interface LobbyChatMessage {
  sender: "p1" | "p2";
  text: string;
}

export interface GameScreenState {
  roomId?: string;
  selectedInventoryItem?: InventoryItemId | null;
  roomCode?: string;
  player1Name?: string;
  player2Name?: string;
  localRole?: LocalPlayerRole;
  showTestRoleSwitcher?: boolean;
  micMuted?: boolean;
  rematchInvitedBy?: RematchSender;
  opponentEscapedRoom?: number | null;
  lobbyMessages?: LobbyChatMessage[];
  difficulty?: DifficultyLevel;
  stageView?: ActiveStageView;
  timeLeftSeconds?: number;
  loopDurationSeconds?: number;
  loopCount?: number;
  friendLoopCount?: number;
  p1RoomLoops?: [number, number, number];
  p2RoomLoops?: [number, number, number];
  p1TimeSpentSeconds?: number;
  p2TimeSpentSeconds?: number;
  p1RoomsCleared?: number;
  p2RoomsCleared?: number;
  friendEscapedRoom1?: boolean;
  connectedPlayers?: number;
  maxPlayers?: number;
  score?: number;
  statusText?: string;
  timerRunning?: boolean;
  player1Ready?: boolean;
  player2Ready?: boolean;
  r1GloveSolved?: boolean;
  r1ChemSolved?: boolean;
  r1ConsoleSolved?: boolean;
  corridorEqualized?: boolean;
  r2ChalkSolved?: boolean;
  r2TapsSolved?: boolean;
  r2BoardSolved?: boolean;
  r3CoatSolved?: boolean;
  r3OscilloSolved?: boolean;
  r3HnocsSolved?: boolean;
  escaped?: boolean;
  clues?: string[];
  inventory?: InventoryItemId[];
  feedbackMessage?: string;
}

export interface GameScreenController {
  update(state: Partial<GameScreenState>): void;
  resetLoop(): void;
  getState(): Required<GameScreenState>;
  readonly viewportElement: HTMLElement;
  readonly dockElement: HTMLElement;
}

const ROOM_TITLES: Record<DifficultyLevel, string> = {
  basic: "ROOM 01 // OUTBREAK BIO-BUNKER",
  medium: "ROOM 02 // ROSSO'S SPEAKEASY",
  hard: "ROOM 03 // QUARANTINE COMMAND LAB",
};

export function renderGameScreen(
  container: HTMLElement,
  initialState?: GameScreenState,
): GameScreenController {
  let state: Required<GameScreenState> = {
    roomId: initialState?.roomId ?? ROOM_TITLES.basic,
    roomCode: initialState?.roomCode ?? "TL-04",
    player1Name: initialState?.player1Name ?? "Saif",
    player2Name: initialState?.player2Name ?? "Drek",
    localRole: initialState?.localRole ?? "host",
    showTestRoleSwitcher: initialState?.showTestRoleSwitcher ?? true,
    micMuted: initialState?.micMuted ?? true,
    rematchInvitedBy: initialState?.rematchInvitedBy ?? null,
    opponentEscapedRoom: initialState?.opponentEscapedRoom ?? null,
    lobbyMessages: initialState?.lobbyMessages
      ? [...initialState.lobbyMessages]
      : [{ sender: "p2", text: "Hey Saif! Ready up so we can escape all 3 rooms together 🤝" }],
    difficulty: initialState?.difficulty ?? "basic",
    stageView: initialState?.stageView ?? "lobby",
    timeLeftSeconds: initialState?.timeLeftSeconds ?? 60,
    loopDurationSeconds: initialState?.loopDurationSeconds ?? 60,
    loopCount: initialState?.loopCount ?? 1,
    friendLoopCount: initialState?.friendLoopCount ?? 4,
    p1RoomLoops: initialState?.p1RoomLoops ? [...initialState.p1RoomLoops] : [1, 0, 0],
    p2RoomLoops: initialState?.p2RoomLoops ? [...initialState.p2RoomLoops] : [1, 0, 0],
    p1TimeSpentSeconds: initialState?.p1TimeSpentSeconds ?? 0,
    p2TimeSpentSeconds: initialState?.p2TimeSpentSeconds ?? 0,
    p1RoomsCleared: initialState?.p1RoomsCleared ?? 0,
    p2RoomsCleared: initialState?.p2RoomsCleared ?? 0,
    friendEscapedRoom1: initialState?.friendEscapedRoom1 ?? false,
    connectedPlayers: initialState?.connectedPlayers ?? 2,
    maxPlayers: initialState?.maxPlayers ?? 2,
    score: initialState?.score ?? 0,
    statusText: initialState?.statusText ?? "In Lobby",
    timerRunning: initialState?.timerRunning ?? false,
    player1Ready: initialState?.player1Ready ?? false,
    player2Ready: initialState?.player2Ready ?? false,
    r1GloveSolved: initialState?.r1GloveSolved ?? false,
    r1ChemSolved: initialState?.r1ChemSolved ?? false,
    r1ConsoleSolved: initialState?.r1ConsoleSolved ?? false,
    corridorEqualized: initialState?.corridorEqualized ?? false,
    r2ChalkSolved: initialState?.r2ChalkSolved ?? false,
    r2TapsSolved: initialState?.r2TapsSolved ?? false,
    r2BoardSolved: initialState?.r2BoardSolved ?? false,
    r3CoatSolved: initialState?.r3CoatSolved ?? false,
    r3OscilloSolved: initialState?.r3OscilloSolved ?? false,
    r3HnocsSolved: initialState?.r3HnocsSolved ?? false,
    selectedInventoryItem: initialState?.selectedInventoryItem ?? null,
    escaped: initialState?.escaped ?? false,
    clues: initialState?.clues ? [...initialState.clues] : [],
    inventory: initialState?.inventory ? [...initialState.inventory] : [],
    feedbackMessage: initialState?.feedbackMessage ?? "",
  };

  // Independent per-player room progress (Saif vs Drek progress separately!)
  function makeInitialRun() {
    return {
      difficulty: "basic" as DifficultyLevel,
      stageView: "lobby" as ActiveStageView,
      maxUnlockedRoom: 1,
      timeLeftSeconds: 60,
      timerRunning: false,
      loopCount: 1,
      corridorEqualized: false,
      escaped: false,
      clues: [] as string[],
      inventory: [] as InventoryItemId[],
      r1GloveSolved: false,
      r1ChemSolved: false,
      r1ConsoleSolved: false,
      r2ChalkSolved: false,
      r2TapsSolved: false,
      r2BoardSolved: false,
      r3CoatSolved: false,
      r3OscilloSolved: false,
      r3HnocsSolved: false,
      selectedInventoryItem: null as InventoryItemId | null,
      pendingEscapePopup: "",
    };
  }

  let p1Prog = makeInitialRun();
  let p2Prog = makeInitialRun();
  let p2ControlledManually = false;
  let autoChatReplied = false;
  let matchElapsedTicks = 0;

  // Shuffled puzzle arrays (Guaranteed NEVER in left-to-right hint order!)
  function shuffleItems(items: string[]): string[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const vi = arr[i];
      const vj = arr[j];
      if (vi !== undefined && vj !== undefined) {
        arr[i] = vj;
        arr[j] = vi;
      }
    }
    return arr;
  }

  function shuffleNonSequential(items: string[], answerSeq: string[]): string[] {
    const a0 = answerSeq[0] ?? "";
    const a1 = answerSeq[1] ?? "";
    const a2 = answerSeq[2] ?? "";
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const cand = shuffleItems(items);
      const i0 = cand.indexOf(a0);
      const i1 = cand.indexOf(a1);
      const i2 = cand.indexOf(a2);
      const inOrder = i0 >= 0 && i1 >= 0 && i2 >= 0 && i0 < i1 && i1 < i2;
      const sameAsOriginal = cand.every((v, idx) => v === items[idx]);
      if (!inOrder && !sameAsOriginal) {
        return cand;
      }
    }
    const fallback = [...items].reverse();
    return fallback;
  }

  let r1ConsoleOrder: string[] = shuffleNonSequential(
    ["GREEN", "BLUE", "RED", "AMBER"],
    ["GREEN", "BLUE", "RED"],
  );
  let r2TapOrder: string[] = shuffleNonSequential(["WINE", "ALE", "GIN", "RYE"], ["WINE", "ALE", "GIN"]);
  let r2SuspectOrder: string[] = shuffleItems(["caterina", "marco", "sanchez", "luca"]);
  let r3OscilloOrder: string[] = shuffleNonSequential(["4", "6", "8", "12"], ["4", "8", "12"]);
  let r3HnocsOrder: string[] = shuffleNonSequential(["H", "N", "O", "C", "S"], ["C", "O", "N"]);

  function reseedShuffles(): void {
    r1ConsoleOrder = shuffleNonSequential(["GREEN", "BLUE", "RED", "AMBER"], ["GREEN", "BLUE", "RED"]);
    r2TapOrder = shuffleNonSequential(["WINE", "ALE", "GIN", "RYE"], ["WINE", "ALE", "GIN"]);
    r2SuspectOrder = shuffleItems(["caterina", "marco", "sanchez", "luca"]);
    r3OscilloOrder = shuffleNonSequential(["4", "6", "8", "12"], ["4", "8", "12"]);
    r3HnocsOrder = shuffleNonSequential(["H", "N", "O", "C", "S"], ["C", "O", "N"]);
  }

  let isZooming = false;
  let toastTimer: number | undefined;
  let escapePopupTimer: number | undefined;
  let countdownTimer: number | undefined;
  let activeMicStream: MediaStream | null = null;
  let endModalOpen = false;

  function activeProg() {
    return state.localRole === "host" ? p1Prog : p2Prog;
  }

  function saveActiveProgress(): void {
    const cur = activeProg();
    cur.difficulty = state.difficulty;
    cur.stageView = state.stageView;
    cur.timeLeftSeconds = state.timeLeftSeconds;
    cur.timerRunning = state.timerRunning;
    cur.loopCount = state.loopCount;
    cur.corridorEqualized = state.corridorEqualized;
    cur.escaped = state.escaped;
    cur.clues = [...state.clues];
    cur.inventory = [...state.inventory];
    cur.r1GloveSolved = state.r1GloveSolved;
    cur.r1ChemSolved = state.r1ChemSolved;
    cur.r1ConsoleSolved = state.r1ConsoleSolved;
    cur.r2ChalkSolved = state.r2ChalkSolved;
    cur.r2TapsSolved = state.r2TapsSolved;
    cur.r2BoardSolved = state.r2BoardSolved;
    cur.r3CoatSolved = state.r3CoatSolved;
    cur.r3OscilloSolved = state.r3OscilloSolved;
    cur.r3HnocsSolved = state.r3HnocsSolved;
    cur.selectedInventoryItem = state.selectedInventoryItem;
  }

  function loadActiveProgress(): void {
    const cur = activeProg();
    state.difficulty = cur.difficulty;
    state.stageView = cur.stageView;
    state.roomId = ROOM_TITLES[cur.difficulty];
    state.timeLeftSeconds = cur.timeLeftSeconds;
    state.timerRunning = cur.timerRunning;
    state.loopCount = cur.loopCount;
    state.corridorEqualized = cur.corridorEqualized;
    state.escaped = cur.escaped;
    state.clues = [...cur.clues];
    state.inventory = [...cur.inventory];
    state.r1GloveSolved = cur.r1GloveSolved;
    state.r1ChemSolved = cur.r1ChemSolved;
    state.r1ConsoleSolved = cur.r1ConsoleSolved;
    state.r2ChalkSolved = cur.r2ChalkSolved;
    state.r2TapsSolved = cur.r2TapsSolved;
    state.r2BoardSolved = cur.r2BoardSolved;
    state.r3CoatSolved = cur.r3CoatSolved;
    state.r3OscilloSolved = cur.r3OscilloSolved;
    state.r3HnocsSolved = cur.r3HnocsSolved;
    state.selectedInventoryItem = cur.selectedInventoryItem;
  }

  function formatTime(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function isCurrentRoomAllSolved(): boolean {
    if (state.difficulty === "basic") {
      return state.r1GloveSolved && state.r1ChemSolved && state.r1ConsoleSolved;
    }
    if (state.difficulty === "medium") {
      return state.r2ChalkSolved && state.r2TapsSolved && state.r2BoardSolved;
    }
    return state.r3CoatSolved && state.r3OscilloSolved && state.r3HnocsSolved;
  }

  function totalRoomTasks(): number {
    return 3;
  }

  function countRoomSolved(): number {
    if (state.difficulty === "basic") {
      return Number(state.r1GloveSolved) + Number(state.r1ChemSolved) + Number(state.r1ConsoleSolved);
    }
    if (state.difficulty === "medium") {
      return Number(state.r2ChalkSolved) + Number(state.r2TapsSolved) + Number(state.r2BoardSolved);
    }
    return Number(state.r3CoatSolved) + Number(state.r3OscilloSolved) + Number(state.r3HnocsSolved);
  }

  container.innerHTML = `
    <div class="tle-root" id="tle-root">
      <!-- PREVIEW TEST SWITCHER (Only for local 1-PC testing; Robot names stay fixed!) -->
      <div
        class="tle-perspective-bar"
        id="perspective-bar"
        role="group"
        aria-label="Preview Test Screen"
        title="Local test helper to preview Saif vs Drek screens on 1 PC"
      >
        <span class="tle-persp-label">🧪 Preview:</span>
        <button type="button" class="tle-role-pill tle-role-active" data-role="host">
          👤 ${state.player1Name}
        </button>
        <button type="button" class="tle-role-pill" data-role="guest">
          👤 ${state.player2Name}
        </button>
      </div>

      <!-- SMALL GREEN POPUP WHEN OPPONENT ESCAPES A ROOM -->
      <div
        class="tle-escape-green-popup tle-escape-popup-hidden"
        id="opponent-escape-popup"
        role="status"
        aria-live="polite"
      >
        <span>✅</span>
        <span id="opponent-escape-text"></span>
      </div>

      <!-- =================================================================
           1. FULL-SCREEN LOBBY SCENE (IMAGE 1: NEON CHRONO-LAB + 2 ROBOTS)
           ================================================================= -->
      <section class="tle-lobby-scene" id="lobby-scene-view">
        <svg
          class="tle-lobby-svg"
          viewBox="0 0 1200 680"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lobBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#2a1659" />
              <stop offset="50%" stop-color="#1d1842" />
              <stop offset="100%" stop-color="#0f1f3d" />
            </linearGradient>
            <linearGradient id="lobFloor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#352a68" />
              <stop offset="100%" stop-color="#191336" />
            </linearGradient>
          </defs>
          <rect width="1200" height="680" fill="url(#lobBg)" />
          <!-- Left Angled Cyberpunk Neon Window -->
          <polygon points="0,0 280,0 190,340 0,340" fill="#3a1c71" stroke="#c084fc" stroke-width="4" />
          <polygon points="20,20 140,20 90,280 20,280" fill="#f472b6" opacity="0.45" />
          <polygon points="165,20 250,20 185,290 115,290" fill="#38bdf8" opacity="0.45" />

          <!-- Right Chevron Wall + Overhead Emitter -->
          <rect x="830" y="70" width="210" height="290" fill="#0d1b2a" />
          <g stroke="#2dd4bf" stroke-width="10" opacity="0.35" fill="none">
            <polyline points="835,120 935,145 1035,120" />
            <polyline points="835,175 935,200 1035,175" />
            <polyline points="835,230 935,255 1035,230" />
            <polyline points="835,285 935,310 1035,285" />
          </g>
          <ellipse cx="935" cy="52" rx="95" ry="22" fill="#312e81" stroke="#818cf8" stroke-width="3" />
          <circle cx="935" cy="72" r="18" fill="#22d3ee" />

          <!-- Center Wide Monitor + Neon Magenta Lab Desk -->
          <rect x="530" y="58" width="210" height="130" rx="6" fill="#131629" stroke="#facc15"
            stroke-width="4" />
          <rect x="415" y="100" width="102" height="72" rx="5" fill="#1e293b" stroke="#38bdf8"
            stroke-width="2" />
          <rect x="435" y="345" width="380" height="14" rx="7" fill="#e879f9" />
          <rect x="455" y="359" width="340" height="115" fill="#1e1b4b" />

          <!-- Right Glowing Cyan Holo-Vat -->
          <ellipse cx="940" cy="465" rx="108" ry="24" fill="#312e81" />
          <rect x="850" y="355" width="180" height="110" fill="#3b2678" />
          <ellipse cx="940" cy="355" rx="112" ry="22" fill="#083344" stroke="#67e8f9" stroke-width="4" />
          <ellipse cx="940" cy="355" rx="82" ry="13" fill="#22d3ee" />

          <!-- Tiled Lab Floor + Tangled Neon Cables -->
          <polygon points="0,680 220,470 980,470 1200,680" fill="url(#lobFloor)" />
          <path d="M360,565 Q480,520 590,575 T840,560" fill="none" stroke="#4ade80" stroke-width="3.5" />
          <path d="M420,595 Q560,625 740,580 T1020,610" fill="none" stroke="#fb923c" stroke-width="3.5" />

          <!-- Left Foreground Bronze Clockwork Time-Sphere + Tilted Blueprint Stand -->
          <g transform="translate(55,275)">
            <circle cx="115" cy="145" r="95" fill="#7c4dff" opacity="0.22" />
            <ellipse cx="115" cy="150" rx="92" ry="82" fill="#78472a" stroke="#d97706" stroke-width="3" />
            <circle cx="140" cy="140" r="52" fill="#e2d9c8" stroke="#92400e" stroke-width="5" />
            <circle cx="140" cy="140" r="20" fill="#1e1b24" />
            <rect x="75" y="210" width="155" height="32" rx="5" fill="#5b2814" stroke="#f59e0b"
              stroke-width="2" />
          </g>
          <polygon points="270,315 385,295 435,405 320,430" fill="#e2e8f0" stroke="#475569" stroke-width="4"
            />
        </svg>

        <div class="tle-lobby-title-pill">⏳ TIME LOOP ESCAPE // CHRONO-LAB LOBBY</div>

        <!-- TWO ROBOTS IN THE MIDDLE OF THE LOBBY (Saif on Left Bot, Drek on Right Bot) -->
        <div class="tle-robots-stage">
          <!-- Robot 1: Saif (Host) -->
          <div class="tle-robot-actor" id="bot-saif">
            <div class="tle-robot-nameplate" id="lobby-box-p1">
              <span id="lobby-bot-p1-name">${state.player1Name}</span>
              <span class="tle-you-chip" id="you-chip-p1">YOU</span>
              <span class="tle-name-ready-tick hidden" id="saif-ready-tick" aria-label="Ready">
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <polyline
                    points="2.5,8.5 6.5,12.5 13.5,3.5"
                    fill="none"
                    stroke="#22c55e"
                    stroke-width="2.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
            <svg class="tle-robot-svg" viewBox="0 0 130 190">
              <ellipse cx="65" cy="178" rx="38" ry="8" fill="rgba(34,211,238,0.35)" />
              <line x1="65" y1="8" x2="65" y2="24" stroke="#4ef4ff" stroke-width="4" />
              <circle cx="65" cy="8" r="6" fill="#4ef4ff" />
              <!-- Head -->
              <rect x="32" y="24" width="66" height="48" rx="16" fill="#e2e8f0" stroke="#38bdf8"
                stroke-width="3" />
              <rect x="40" y="35" width="50" height="24" rx="8" fill="#091526" />
              <circle cx="53" cy="47" r="6" fill="#4ef4ff" />
              <circle cx="77" cy="47" r="6" fill="#4ef4ff" />
              <!-- Torso -->
              <rect x="28" y="78" width="74" height="58" rx="14" fill="#cbd5e1" stroke="#38bdf8"
                stroke-width="3" />
              <circle cx="65" cy="106" r="13" fill="#0ea5e9" stroke="#bae6fd" stroke-width="3" />
              <!-- Arms -->
              <rect x="10" y="82" width="14" height="44" rx="7" fill="#94a3b8" />
              <rect x="106" y="82" width="14" height="44" rx="7" fill="#94a3b8" />
              <!-- Legs -->
              <rect x="42" y="138" width="16" height="34" rx="6" fill="#64748b" />
              <rect x="72" y="138" width="16" height="34" rx="6" fill="#64748b" />
            </svg>
          </div>

          <!-- Robot 2: Drek (Opponent) -->
          <div class="tle-robot-actor tle-bot-drek" id="bot-drek">
            <div class="tle-robot-nameplate" id="lobby-box-p2">
              <span id="lobby-bot-p2-name">${state.player2Name}</span>
              <span class="tle-you-chip hidden" id="you-chip-p2">YOU</span>
              <span class="tle-name-ready-tick hidden" id="drek-ready-tick" aria-label="Ready">
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <polyline
                    points="2.5,8.5 6.5,12.5 13.5,3.5"
                    fill="none"
                    stroke="#22c55e"
                    stroke-width="2.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
            <svg class="tle-robot-svg" viewBox="0 0 130 190">
              <ellipse cx="65" cy="178" rx="38" ry="8" fill="rgba(244,114,182,0.35)" />
              <line x1="65" y1="8" x2="65" y2="24" stroke="#f472b6" stroke-width="4" />
              <circle cx="65" cy="8" r="6" fill="#f472b6" />
              <!-- Head -->
              <rect x="32" y="24" width="66" height="48" rx="16" fill="#f1f5f9" stroke="#f472b6"
                stroke-width="3" />
              <rect x="40" y="35" width="50" height="24" rx="8" fill="#1a0b26" />
              <circle cx="53" cy="47" r="6" fill="#f472b6" />
              <circle cx="77" cy="47" r="6" fill="#f472b6" />
              <!-- Torso -->
              <rect x="28" y="78" width="74" height="58" rx="14" fill="#e2e8f0" stroke="#f472b6"
                stroke-width="3" />
              <polygon points="65,92 79,116 51,116" fill="#ec4899" />
              <!-- Arms -->
              <rect x="10" y="82" width="14" height="44" rx="7" fill="#94a3b8" />
              <rect x="106" y="82" width="14" height="44" rx="7" fill="#94a3b8" />
              <!-- Legs -->
              <rect x="42" y="138" width="16" height="34" rx="6" fill="#64748b" />
              <rect x="72" y="138" width="16" height="34" rx="6" fill="#64748b" />
            </svg>
          </div>
        </div>

        <!-- BOTTOM-LEFT READY / WAITING FOR OTHERS / START BUTTON -->
        <div class="tle-lobby-action-row">
          <button type="button" class="tle-lobby-start-btn tle-lobby-btn-gray" id="btn-lobby-start">
            READY
          </button>
          <button
            type="button"
            class="tle-lobby-cancel-ready hidden"
            id="btn-host-cancel-ready"
            title="Mark Not Ready"
          >
            ✕ Cancel Ready
          </button>
        </div>

        <!-- BOTTOM-RIGHT IN-LOBBY CHATBOX + OPTIONAL MICROPHONE -->
        <div class="tle-lobby-comms" id="lobby-comms-panel">
          <div class="tle-lobby-comms-head">
            <span class="tle-lobby-comms-title">💬 LOBBY CHAT</span>
            <button
              type="button"
              class="tle-lobby-mic-btn"
              id="btn-lobby-mic"
              aria-label="Toggle Lobby Microphone"
              title="Toggle Voice Microphone (Optional)"
            >
              <svg
                id="lobby-mic-muted"
                viewBox="0 0 24 24"
                width="17"
                height="17"
                aria-hidden="true"
              >
                <rect
                  x="9"
                  y="2"
                  width="6"
                  height="11"
                  rx="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M5 10a7 7 0 0 0 14 0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="12"
                  y1="17"
                  x2="12"
                  y2="21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="3"
                  y1="3"
                  x2="21"
                  y2="21"
                  stroke="#ef4444"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />
              </svg>
              <svg
                id="lobby-mic-live"
                class="hidden"
                viewBox="0 0 24 24"
                width="17"
                height="17"
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
                <path
                  d="M5 10a7 7 0 0 0 14 0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="12"
                  y1="17"
                  x2="12"
                  y2="21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <div class="tle-lobby-chat-log" id="lobby-chat-log"></div>
          <form class="tle-lobby-chat-form" id="lobby-chat-form">
            <input
              type="text"
              class="tle-lobby-chat-input"
              id="lobby-chat-input"
              placeholder="Message lobby..."
              maxlength="140"
              autocomplete="off"
            />
            <button type="submit" class="tle-lobby-chat-send" id="btn-lobby-chat-send">
              Send
            </button>
          </form>
        </div>
      </section>

      <!-- =================================================================
           2. TOP GAMEPLAY HEADER BAR (FRACTURED TIMELINE LAYOUT)
           Top left:   Pause / Help (+ Lobby)
           Top center: TIME LOOP ESCAPE + Near title: LOOP 03, MEMORY 2/4
           Top right:  timer such as 00:43
           ================================================================= -->
      <header class="tle-header hidden" id="gameplay-header">
        <div class="tle-header-left">
          <button type="button" class="tle-btn-header" id="btn-pause-loop" title="Pause / Resume">
            ⏸ Pause
          </button>
          <button type="button" class="tle-btn-header hidden" id="btn-start-loop" title="Start / Resume">
            ▶ Resume
          </button>
          <button type="button" class="tle-btn-header tle-btn-help" id="btn-hint" title="Help / Hints">
            💡 Help
          </button>
          <button type="button" class="tle-btn-header" id="btn-open-lobby" title="Return to Lobby">
            🚪 Lobby
          </button>
          <div class="tle-diff-group" role="group" aria-label="Room Progression">
            <button type="button" class="tle-diff-btn" id="btn-diff-basic" data-diff="basic">
              Room 1
            </button>
            <button type="button" class="tle-diff-btn" id="btn-diff-medium" data-diff="medium">
              🔒 Room 2
            </button>
            <button type="button" class="tle-diff-btn" id="btn-diff-hard" data-diff="hard">
              🔒 Room 3
            </button>
          </div>
        </div>

        <div class="tle-header-center">
          <div class="tle-title-block">
            <h1 class="tle-main-title">TIME LOOP ESCAPE</h1>
            <div class="tle-meta-badges">
              <span class="tle-loop-chip" id="hud-loop">LOOP 01</span>
              <span class="tle-memory-chip" id="hud-memory">MEMORY 1/4</span>
            </div>
          </div>
        </div>

        <div class="tle-header-right">
          <div class="tle-timer-box" title="Time Remaining">
            <span class="tle-top-timer-display" id="hud-timer-val">
              ${formatTime(state.timeLeftSeconds)}
            </span>
            <div class="tle-timer-progress-bar-wrap">
              <div class="tle-prog-fill" id="hud-timer-progress" style="width: 100%"></div>
            </div>
          </div>
          <button type="button" class="tle-coop-pill" id="btn-scoreboard" title="Co-Op Summary">
            <span class="tle-p-dot"></span>
            <span id="header-coop-names">🤝 ${state.player1Name} &amp; ${state.player2Name}</span>
          </button>
          <button type="button" class="tle-btn-header" id="btn-reset-loop" title="Rewind Time Loop">
            ↺
          </button>
        </div>
      </header>

      <!-- =================================================================
           3. MAIN 2-COLUMN GAMEPLAY CONSOLE
           ================================================================= -->
      <main class="tle-stage-wrapper hidden" id="gameplay-main">
        <div class="tle-room-stage game-viewport" id="game-viewport">
          <!-- PUBG-STYLE IN-ROOM VOICE MICROPHONE (SYMBOL ONLY — NO TEXT!) -->
          <button
            type="button"
            class="tle-pubg-mic-btn"
            id="btn-pubg-mic"
            aria-label="Toggle Voice Microphone"
            title="Toggle Voice Microphone"
          >
            <svg id="mic-svg-muted" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <rect
                x="9"
                y="2"
                width="6"
                height="11"
                rx="3"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M5 10a7 7 0 0 0 14 0"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="12"
                y1="17"
                x2="12"
                y2="21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="8"
                y1="21"
                x2="16"
                y2="21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="3"
                y1="3"
                x2="21"
                y2="21"
                stroke="#ef4444"
                stroke-width="2.4"
                stroke-linecap="round"
              />
            </svg>
            <svg
              id="mic-svg-live"
              class="hidden"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-hidden="true"
            >
              <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
              <path
                d="M5 10a7 7 0 0 0 14 0"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="12"
                y1="17"
                x2="12"
                y2="21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="8"
                y1="21"
                x2="16"
                y2="21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div class="tle-vhs-rewind-layer hidden" id="vhs-rewind-layer">
            <span class="tle-vhs-text">⏪ 00:00 TIME LOOP REWIND — CLUES KEPT!</span>
          </div>

          <div class="tle-room-blur-target" id="room-blur-target">
            <!-- =========================================================
                 ROOM 1 (IMAGE 3): OUTBREAK BIO-BUNKER (Fun & Intuitive!)
                 ========================================================= -->
            <div class="tle-scene" id="scene-basic">
              <svg class="tle-scene-svg" viewBox="0 0 1000 575" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bunkL" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#9a7230" />
                    <stop offset="60%" stop-color="#b58d47" />
                    <stop offset="100%" stop-color="#6b5126" />
                  </linearGradient>
                  <linearGradient id="bunkR" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#b89352" />
                    <stop offset="100%" stop-color="#745a2c" />
                  </linearGradient>
                </defs>
                <!-- Grungy Ochre Bunker Left & Right Walls + Terracotta Tiled Floor -->
                <polygon points="0,0 520,55 520,355 0,545" fill="url(#bunkL)" />
                <polygon points="1000,0 520,55 520,355 1000,520" fill="url(#bunkR)" />
                <polygon points="0,575 0,545 520,355 1000,520 1000,575" fill="#5c2818" />
                <!-- Red-Brown Floor Tiles -->
                <g stroke="#3d170c" stroke-width="2" opacity="0.65">
                  <line x1="520" y1="355" x2="180" y2="575" />
                  <line x1="520" y1="355" x2="460" y2="575" />
                  <line x1="520" y1="355" x2="760" y2="575" />
                  <line x1="210" y1="470" x2="855" y2="470" />
                  <line x1="90" y1="525" x2="960" y2="525" />
                </g>
                <!-- Weathered Wall Ledge on Left + Grunge Soot Streaks on Right -->
                <polygon points="0,465 520,305 520,340 0,515" fill="#3a2c20" />
                <rect x="440" y="165" width="58" height="105" rx="3" fill="#57493f" stroke="#2d241e"
                  stroke-width="2" />
                <path d="M785,95 L795,220 M830,85 L840,235" stroke="#1f1a14" stroke-width="14" opacity="0.45"
                  />
              </svg>

              <!-- 1A. Upper-Left Wooden Chemistry Tube Display -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 5%; top: 8%; width: 25%; height: 36%"
                id="obj-r1-chem"
                data-object-id="r1-chem"
              >
                <svg viewBox="0 0 240 190" width="100%" height="100%">
                  <rect x="8" y="8" width="224" height="174" fill="#593a1e" stroke="#2b1a0c" stroke-width="6"
                    />
                  <rect x="18" y="18" width="204" height="154" fill="#d6c59a" />
                  <!-- Glowing Green Flask + Blue Spiral Condenser -->
                  <path d="M35,35 Q65,95 95,130" stroke="#22c55e" stroke-width="7" fill="none" />
                  <circle cx="95" cy="135" r="22" fill="#84cc16" stroke="#15803d" stroke-width="3" />
                  <path
                    d="M140,40 L140,145 Q140,160 160,160 L185,160 L185,55"
                    fill="none"
                    stroke="#1d4ed8"
                    stroke-width="6"
                  />
                  <path
                    d="M160,65 C175,70 150,80 175,85 C150,95 175,105 160,115"
                    fill="none"
                    stroke="#2563eb"
                    stroke-width="4"
                  />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r1-chem" style="left: 9%; top: 44%">
                🧪 CHEMISTRY RACK
              </span>

              <!-- 1B. Lit Glass Glovebox Case on Left Ledge -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 13%; top: 48%; width: 22%; height: 24%"
                id="obj-r1-glovebox"
                data-object-id="r1-glovebox"
              >
                <svg viewBox="0 0 210 130" width="100%" height="100%">
                  <rect
                    x="10"
                    y="12"
                    width="190"
                    height="106"
                    fill="rgba(254,249,195,0.28)"
                    stroke="#fef08a"
                    stroke-width="3"
                  />
                  <line x1="12" y1="15" x2="198" y2="15" stroke="#fde047" stroke-width="5" />
                  <circle cx="68" cy="72" r="20" fill="#475569" stroke="#cbd5e1" stroke-width="4" />
                  <circle cx="148" cy="72" r="20" fill="#475569" stroke="#cbd5e1" stroke-width="4" />
                  <rect x="96" y="84" width="22" height="10" rx="3" fill="#fbbf24" />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r1-glove" style="left: 15%; top: 72%">
                🧤 GLASS GLOVEBOX
              </span>

              <!-- 1C. Wooden Supply Crate on Floor -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 29%; top: 75%; width: 14%; height: 18%"
                id="obj-r1-crate"
                data-object-id="r1-crate"
              >
                <svg viewBox="0 0 140 100" width="100%" height="100%">
                  <polygon points="10,25 115,10 132,75 25,92" fill="#6b4226" stroke="#2c180c" stroke-width="3"
                    />
                  <rect x="64" y="38" width="14" height="18" rx="3" fill="#fbbf24" />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r1-crate" style="left: 29.5%; top: 92%">
                📦 SUPPLY CRATE
              </span>

              <!-- 1D. Glowing World Outbreak Map Screen -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 58%; top: 26%; width: 22%; height: 21%"
                id="obj-r1-map"
                data-object-id="r1-map"
              >
                <svg viewBox="0 0 220 120" width="100%" height="100%">
                  <rect x="4" y="4" width="212" height="112" rx="4" fill="#141418" stroke="#334155"
                    stroke-width="4" />
                  <!-- Simplified Continents + Red Outbreak Dots (3, 5, 2) -->
                  <path d="M22,28 L65,26 L58,62 L46,96 L34,72 Z" fill="#cbd5e1" opacity="0.82" />
                  <path d="M92,24 L138,22 L134,58 L104,88 L94,55 Z" fill="#cbd5e1" opacity="0.82" />
                  <path d="M146,28 L198,30 L190,76 L154,68 Z" fill="#cbd5e1" opacity="0.82" />
                  <!-- 3 Dots in Americas -->
                  <circle cx="38" cy="40" r="4" fill="#ef4444" />
                  <circle cx="50" cy="52" r="4" fill="#ef4444" />
                  <circle cx="44" cy="78" r="4" fill="#ef4444" />
                  <!-- 5 Dots in Europe/Africa -->
                  <circle cx="104" cy="34" r="4" fill="#ef4444" />
                  <circle cx="118" cy="32" r="4" fill="#ef4444" />
                  <circle cx="112" cy="46" r="4" fill="#ef4444" />
                  <circle cx="126" cy="44" r="4" fill="#ef4444" />
                  <circle cx="114" cy="68" r="4" fill="#ef4444" />
                  <!-- 2 Dots in Asia -->
                  <circle cx="168" cy="46" r="4" fill="#ef4444" />
                  <circle cx="182" cy="58" r="4" fill="#ef4444" />
                </svg>
              </button>
              <span class="tle-obj-tag" style="left: 61%; top: 47.5%">🗺️ WORLD MAP</span>

              <!-- 1E. Slanted Steel Console Below World Map -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 57%; top: 51%; width: 17%; height: 34%"
                id="obj-r1-console"
                data-object-id="r1-console"
              >
                <svg viewBox="0 0 160 190" width="100%" height="100%">
                  <polygon points="25,10 145,22 135,180 12,162" fill="#2c2f33" stroke="#111315"
                    stroke-width="4" />
                  <rect x="34" y="24" width="24" height="22" fill="#dcfce7" />
                  <rect x="66" y="27" width="24" height="22" fill="#dbeafe" />
                  <rect x="98" y="30" width="24" height="22" fill="#fee2e2" />
                  <text x="46" y="40" text-anchor="middle" fill="#15803d" font-size="13"
                    font-weight="bold">?</text>
                  <text x="78" y="43" text-anchor="middle" fill="#1d4ed8" font-size="13"
                    font-weight="bold">?</text>
                  <text x="110" y="46" text-anchor="middle" fill="#b91c1c" font-size="13"
                    font-weight="bold">?</text>
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r1-console" style="left: 57.5%; top: 85%">
                🎛️ STEEL CONSOLE
              </span>

              <!-- 1F. Bunker Steel Exit Door (Swings Open + Real-Time Walk-Through Zoom!) -->
              <div
                class="tle-door-3d-wrap"
                id="r1-door-wrap"
                style="left: 82%; top: 18%; width: 15%; height: 64%"
              >
                <button
                  type="button"
                  class="tle-hotspot"
                  style="inset: 0; width: 100%; height: 100%"
                  id="obj-r1-door"
                  data-object-id="r1-door"
                >
                  <svg viewBox="0 0 150 340" width="100%" height="100%">
                    <!-- Corridor Glow Behind Open Door -->
                    <rect x="8" y="8" width="134" height="324" fill="#0f2932" stroke="#2c251d"
                      stroke-width="8" />
                    <circle cx="75" cy="170" r="36" fill="#2dd4bf" opacity="0.45" />
                    <text x="75" y="175" text-anchor="middle" fill="#ccfbf1" font-size="13"
                      font-weight="bold">
                      ENTER ➔
                    </text>
                  </svg>
                  <div class="tle-door-leaf-3d tle-r1-door-leaf">
                    <span class="tle-r1-door-sign">BUNKER EXIT</span>
                    <span class="tle-r1-door-handle"></span>
                  </div>
                </button>
              </div>
              <span class="tle-obj-tag" id="tag-r1-door" style="left: 82%; top: 83%">
                🚪 BUNKER EXIT
              </span>
            </div>

            <!-- =========================================================
                 CORRIDOR (IMAGE 4): VAULTED INDUSTRIAL PASSAGEWAY
                 ========================================================= -->
            <div class="tle-scene hidden" id="scene-corridor">
              <svg class="tle-scene-svg" viewBox="0 0 1000 575" preserveAspectRatio="none">
                <rect width="1000" height="575" fill="#181712" />
                <!-- Perspective Corridor Walls & Floor -->
                <polygon points="0,0 385,165 385,495 0,575" fill="#2c2b22" />
                <polygon points="1000,0 615,165 615,495 1000,575" fill="#322f25" />
                <polygon points="0,575 385,495 615,495 1000,575" fill="#232420" />
                <!-- Vaulted Arches & Warm Caged Bulkhead Lights -->
                <path d="M180,0 Q500,-40 820,0" fill="none" stroke="#463828" stroke-width="26" />
                <ellipse cx="265" cy="58" rx="18" ry="30" fill="#fef3c7" />
                <ellipse cx="735" cy="58" rx="18" ry="30" fill="#fef3c7" />
                <ellipse cx="355" cy="122" rx="11" ry="20" fill="#fef3c7" />
                <ellipse cx="645" cy="122" rx="11" ry="20" fill="#fef3c7" />
                <!-- Overhead Steampunk Clock-Core -->
                <polygon points="435,120 565,120 590,175 540,215 460,215 410,175" fill="#2a241d"
                  stroke="#fbbf24" stroke-width="3" />
                <circle cx="500" cy="182" r="22" fill="#1c1917" stroke="#fde68a" stroke-width="4" />
                <!-- 4 Vertical Status Columns Above Far Bulkhead -->
                <g id="corridor-led-cols">
                  <rect x="415" y="240" width="28" height="105" rx="4" fill="#27272a" stroke="#52525b"
                    stroke-width="2" />
                  <rect x="462" y="240" width="28" height="105" rx="4" fill="#27272a" stroke="#52525b"
                    stroke-width="2" />
                  <rect x="510" y="240" width="28" height="105" rx="4" fill="#27272a" stroke="#52525b"
                    stroke-width="2" />
                  <rect x="557" y="240" width="28" height="105" rx="4" fill="#27272a" stroke="#52525b"
                    stroke-width="2" />
                </g>
              </svg>

              <!-- Right-Wall Valve-Wheel Station -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 72%; top: 43%; width: 22%; height: 50%"
                id="obj-corridor-wheel"
                data-object-id="corridor-wheel"
              >
                <svg viewBox="0 0 210 270" width="100%" height="100%">
                  <polygon points="15,40 190,15 190,260 15,240" fill="#27272f" stroke="#475569"
                    stroke-width="4" />
                  <circle cx="85" cy="68" r="10" fill="#22c55e" />
                  <rect x="42" y="102" width="105" height="115" rx="8" fill="#e2e8f0" />
                  <circle cx="95" cy="160" r="36" fill="none" stroke="#1e293b" stroke-width="8" />
                  <line x1="95" y1="124" x2="95" y2="196" stroke="#1e293b" stroke-width="6" />
                  <line x1="59" y1="160" x2="131" y2="160" stroke="#1e293b" stroke-width="6" />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-corridor-wheel" style="left: 73%; top: 38%">
                ⚙️ TURN PRESSURE WHEEL
              </span>

              <!-- Far-End Cyan Turbine Bulkhead Hatch -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 41%; top: 61%; width: 18%; height: 26%"
                id="obj-corridor-door"
                data-object-id="corridor-door"
              >
                <svg viewBox="0 0 180 150" width="100%" height="100%">
                  <rect x="8" y="6" width="164" height="138" fill="#3f4a49" stroke="#94a3b8" stroke-width="4"
                    />
                  <circle cx="90" cy="78" r="46" fill="#083344" stroke="#2dd4bf" stroke-width="4" />
                  <g class="tle-turbine-fast" stroke="#5eead4" stroke-width="5">
                    <line x1="90" y1="36" x2="90" y2="120" />
                    <line x1="48" y1="78" x2="132" y2="78" />
                    <line x1="60" y1="48" x2="120" y2="108" />
                  </g>
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-corridor-door" style="left: 41.5%; top: 88%">
                🚪 PROCEED FORWARD ➔
              </span>
            </div>

            <!-- =========================================================
                 ROOM 2 (IMAGE 2): ROSSO'S CRIMSON SPEAKEASY PARLOR
                 ========================================================= -->
            <div class="tle-scene hidden" id="scene-medium">
              <svg class="tle-scene-svg" viewBox="0 0 1000 575" preserveAspectRatio="none">
                <!-- Rich Crimson Walls + Dark Ceiling + Warm Hardwood Floor -->
                <polygon points="0,0 440,155 595,155 1000,0" fill="#231412" />
                <polygon points="0,0 440,155 440,390 0,555" fill="#7f1315" />
                <polygon points="1000,0 595,155 595,390 1000,450" fill="#8b181b" />
                <rect x="440" y="155" width="155" height="235" fill="#6d1416" />
                <polygon points="0,575 0,555 440,390 595,390 1000,520 1000,575" fill="#5b371c" />
                <!-- Overhead Hanging Ivy Foliage & Warm Chandelier -->
                <g fill="#2f5e26">
                  <circle cx="420" cy="30" r="38" />
                  <circle cx="500" cy="24" r="44" />
                  <circle cx="590" cy="32" r="40" />
                  <circle cx="710" cy="36" r="36" />
                </g>
                <ellipse cx="555" cy="122" rx="24" ry="16" fill="#fef9c3" />
                <!-- Right Mahogany Bar Counter -->
                <polygon points="605,365 1000,378 1000,575 605,575" fill="#2c140e" stroke="#f59e0b"
                  stroke-width="2" />
              </svg>

              <!-- 2A. Giant Left Suspect Investigation Board (8 Portraits) -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 3%; top: 20%; width: 32%; height: 50%"
                id="obj-r2-board"
                data-object-id="r2-board"
              >
                <svg viewBox="0 0 320 270" width="100%" height="100%">
                  <polygon points="8,10 312,48 312,235 8,262" fill="#0f172a" stroke="#eab308" stroke-width="5"
                    />
                  <!-- 2x4 Suspect Grid matching Image 2 -->
                  <rect x="26" y="46" width="58" height="68" fill="#fda4af" />
                  <rect x="94" y="52" width="58" height="66" fill="#bae6fd" />
                  <rect x="162" y="58" width="58" height="64" fill="#cbd5e1" />
                  <rect x="230" y="64" width="58" height="62" fill="#e2e8f0" />
                  <rect x="26" y="132" width="58" height="68" fill="#cbd5e1" />
                  <rect x="94" y="134" width="58" height="66" fill="#bae6fd" />
                  <rect x="162" y="136" width="58" height="64" fill="#fef08a" />
                  <rect x="230" y="138" width="58" height="62" fill="#cbd5e1" />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r2-board" style="left: 8%; top: 71%">
                🕵️ SUSPECT BOARD
              </span>

              <!-- 2B. Floor Chalk Body Outline & Evidence Crate -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 41%; top: 72%; width: 19%; height: 25%"
                id="obj-r2-chalk"
                data-object-id="r2-chalk"
              >
                <svg viewBox="0 0 190 140" width="100%" height="100%">
                  <path
                    d="M85,18 C100,18 104,35 92,42 L135,65 L125,80 L92,66 L108,125 L88,128 L75,82 L42,102
                      L32,88 L68,58 Z"
                    fill="none"
                    stroke="#f8fafc"
                    stroke-width="4"
                  />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r2-chalk" style="left: 42%; top: 92%">
                🔍 CHALK OUTLINE
              </span>

              <!-- 2C. Right Bar: 6-Tap Chrome Draft Dispenser -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 74%; top: 47%; width: 20%; height: 18%"
                id="obj-r2-taps"
                data-object-id="r2-taps"
              >
                <svg viewBox="0 0 200 105" width="100%" height="100%">
                  <rect x="12" y="16" width="176" height="78" rx="5" fill="#94a3b8" stroke="#475569"
                    stroke-width="3" />
                  <g stroke="#1e293b" stroke-width="5">
                    <line x1="38" y1="24" x2="38" y2="54" />
                    <line x1="64" y1="24" x2="64" y2="54" />
                    <line x1="90" y1="24" x2="90" y2="54" />
                    <line x1="116" y1="24" x2="116" y2="54" />
                    <line x1="142" y1="24" x2="142" y2="54" />
                    <line x1="168" y1="24" x2="168" y2="54" />
                  </g>
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r2-taps" style="left: 76%; top: 42%">
                🍺 6-TAP DISPENSER
              </span>

              <!-- 2D. Under-Bar Diamond Wine Rack -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 72%; top: 73%; width: 16%; height: 23%"
                id="obj-r2-wine"
                data-object-id="r2-wine"
              >
                <svg viewBox="0 0 150 120" width="100%" height="100%">
                  <rect x="8" y="8" width="134" height="104" fill="#1e0d08" stroke="#b45309" stroke-width="4"
                    />
                  <line x1="8" y1="8" x2="142" y2="112" stroke="#78350f" stroke-width="4" />
                  <line x1="142" y1="8" x2="8" y2="112" stroke="#78350f" stroke-width="4" />
                  <circle cx="75" cy="36" r="10" fill="#fbbf24" />
                  <circle cx="44" cy="62" r="9" fill="#991b1b" />
                  <circle cx="106" cy="62" r="9" fill="#166534" />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r2-wine" style="left: 73%; top: 68%">
                🍷 WINE RACK
              </span>

              <!-- 2E. Center Back Mahogany ROSSO'S Exit Door -->
              <div
                class="tle-door-3d-wrap"
                id="r2-door-wrap"
                style="left: 46%; top: 35%; width: 11%; height: 33%"
              >
                <button
                  type="button"
                  class="tle-hotspot"
                  style="inset: 0; width: 100%; height: 100%"
                  id="obj-r2-door"
                  data-object-id="r2-door"
                >
                  <div class="tle-r2-door-frame"></div>
                  <div class="tle-door-leaf-3d tle-r2-door-leaf">
                    <div class="tle-r2-door-sign">ROSSO'S</div>
                  </div>
                </button>
              </div>
              <span class="tle-obj-tag" id="tag-r2-door" style="left: 45.5%; top: 69%">
                🚪 ROSSO'S DOOR
              </span>
            </div>

            <!-- =========================================================
                 ROOM 3: QUARANTINE COMMAND LAB (MATCHES UPLOADED PHOTO)
                 ========================================================= -->
            <div class="tle-scene hidden" id="scene-hard">
              <svg class="tle-scene-svg" viewBox="0 0 1000 575" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="r3LeftWall" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#9e762a" />
                    <stop offset="48%" stop-color="#c39e4e" />
                    <stop offset="82%" stop-color="#b59d72" />
                    <stop offset="100%" stop-color="#7c6848" />
                  </linearGradient>
                  <linearGradient id="r3RightWall" x1="0" y1="0" x2="1" y2="0.4">
                    <stop offset="0%" stop-color="#a87e22" />
                    <stop offset="55%" stop-color="#bd9126" />
                    <stop offset="85%" stop-color="#8a6818" />
                    <stop offset="100%" stop-color="#4e3d14" />
                  </linearGradient>
                  <linearGradient id="r3FloorGrad" x1="0" y1="0" x2="0.8" y2="1">
                    <stop offset="0%" stop-color="#6b2717" />
                    <stop offset="55%" stop-color="#581e11" />
                    <stop offset="100%" stop-color="#3c130a" />
                  </linearGradient>
                  <linearGradient id="r3Concrete" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#7b7975" />
                    <stop offset="55%" stop-color="#575552" />
                    <stop offset="100%" stop-color="#383735" />
                  </linearGradient>
                </defs>

                <!-- Pale Bunker Ceiling Triangle -->
                <polygon points="0,0 620,0 445,56" fill="#d9d2c0" />
                <line x1="0" y1="0" x2="445" y2="56" stroke="#85785a" stroke-width="3" />
                <line x1="620" y1="0" x2="445" y2="56" stroke="#786b4d" stroke-width="3" />

                <!-- Grungy Ochre-Mustard Left Wall & Right Wall -->
                <polygon points="0,0 445,56 445,436 55,575 0,575" fill="url(#r3LeftWall)" />
                <polygon points="445,56 620,0 1000,0 1000,535 445,436" fill="url(#r3RightWall)" />
                <line x1="445" y1="56" x2="445" y2="436" stroke="#594318" stroke-width="3" />

                <!-- Heavy Black Vertical Soot & Grime Streaks (Matching Photo) -->
                <ellipse cx="145" cy="115" rx="34" ry="75" fill="rgba(18,16,12,0.42)" />
                <ellipse cx="344" cy="128" rx="14" ry="38" fill="rgba(15,14,12,0.68)" />
                <ellipse cx="404" cy="138" rx="18" ry="62" fill="rgba(15,14,12,0.58)" />
                <ellipse cx="516" cy="195" rx="14" ry="125" fill="rgba(15,14,12,0.72)" />
                <ellipse cx="578" cy="210" rx="22" ry="130" fill="rgba(25,20,12,0.28)" />
                <rect x="708" y="0" width="68" height="450" fill="rgba(16,15,11,0.56)" />
                <polygon points="95,380 245,350 245,495 95,555" fill="rgba(226,222,212,0.28)" />

                <!-- Terracotta Red-Brown Tiled Bunker Floor -->
                <polygon points="55,575 445,436 740,515 740,575" fill="url(#r3FloorGrad)" />
                <!-- Floor Baseboard Skirting -->
                <line x1="65" y1="572" x2="445" y2="436" stroke="#7d3b24" stroke-width="5" />
                <g stroke="rgba(185,110,82,0.34)" stroke-width="1.6">
                  <line x1="445" y1="436" x2="120" y2="575" />
                  <line x1="445" y1="436" x2="255" y2="575" />
                  <line x1="445" y1="436" x2="395" y2="575" />
                  <line x1="445" y1="436" x2="535" y2="575" />
                  <line x1="365" y1="465" x2="640" y2="555" />
                  <line x1="275" y1="497" x2="565" y2="575" />
                  <line x1="180" y1="531" x2="360" y2="575" />
                </g>

                <!-- Far-Left Protruding Rusted Wall Box & Sooty Lower Ledge -->
                <polygon points="0,100 54,114 54,308 0,318" fill="#5b3c2c" stroke="#2c1b12"
                  stroke-width="3" />
                <polygon points="0,338 92,318 92,356 48,575 0,575" fill="#18120e" stroke="#3b2b20"
                  stroke-width="2" />

                <!-- Top White Junction Box, Outlet & Curved Black Power Cable to Map -->
                <rect x="238" y="26" width="40" height="34" rx="2" fill="#e5e5e0" stroke="#8c887d"
                  stroke-width="2" />
                <circle cx="244" cy="40" r="2.8" fill="#ef4444" />
                <rect x="312" y="28" width="16" height="20" rx="2" fill="#d6d3cb" stroke="#6b6860" />
                <line x1="278" y1="44" x2="445" y2="90" stroke="#9ca3af" stroke-width="5" />
                <line x1="445" y1="90" x2="598" y2="54" stroke="#78716c" stroke-width="5" />
                <path d="M286,52 C318,62 314,112 288,154" fill="none" stroke="#141414"
                  stroke-width="5" />

                <!-- Left Cast-Iron Electrical Box, Lower Relay & Black Conduit Pipes -->
                <rect x="68" y="158" width="84" height="86" rx="4" fill="#27272a" stroke="#09090b"
                  stroke-width="3" />
                <rect x="74" y="166" width="72" height="22" fill="#3f3f46" />
                <circle cx="102" cy="212" r="4" fill="#71717a" />
                <circle cx="132" cy="212" r="6" fill="#18181b" stroke="#52525b" stroke-width="2" />
                <rect x="92" y="294" width="66" height="30" rx="4" fill="#27272a" stroke="#09090b"
                  stroke-width="3" />
                <!-- Conduit Pipes into World Map & HNOCS Console -->
                <g fill="none" stroke="#18181b" stroke-width="3.5">
                  <path d="M152,184 L182,184 L188,176 L204,176" />
                  <path d="M152,202 L204,202" />
                  <path d="M152,220 L204,220" />
                  <path d="M106,244 L106,294" />
                  <path d="M124,244 L124,294" />
                  <path d="M126,324 L126,336 L252,318" />
                  <path d="M302,248 C336,256 338,274 336,302" />
                  <path d="M380,174 L416,174 L416,192" />
                  <path d="M380,204 L402,204" />
                  <path d="M412,268 L412,312 L374,318" />
                  <path d="M430,268 L430,304 L374,310" />
                </g>

                <!-- Right Black Rotary Switch Box (Between Map & Corner) -->
                <rect x="396" y="190" width="54" height="80" rx="4" fill="#262629" stroke="#09090b"
                  stroke-width="3" />
                <circle cx="432" cy="236" r="9" fill="#18181b" stroke="#71717a" stroke-width="2" />
                <line x1="432" y1="236" x2="438" y2="230" stroke="#cbd5e1" stroke-width="2" />

                <!-- Wooden Scientist Desk in Corner (Under Radio & Lab Coat) -->
                <polygon points="445,336 620,358 594,404 445,368" fill="#8b6f43" stroke="#3e2d16"
                  stroke-width="3" />
                <polygon points="445,368 594,404 594,414 445,376" fill="#4a371c" />
                <line x1="504" y1="384" x2="504" y2="462" stroke="#1c1917" stroke-width="5" />
                <line x1="588" y1="408" x2="588" y2="518" stroke="#1c1917" stroke-width="6" />

                <!-- Tall Weathered Grey Concrete Block Pedestal (Under CRT Oscilloscope) -->
                <polygon points="590,378 666,404 666,558 590,518" fill="url(#r3Concrete)"
                  stroke="#292524" stroke-width="2.5" />
                <polygon points="666,404 732,374 732,518 666,558" fill="#3f3e3c" stroke="#292524"
                  stroke-width="2.5" />
                <polygon points="590,378 656,356 732,374 666,404" fill="#8c8984" stroke="#44403c"
                  stroke-width="2" />

                <!-- Two Weathered Concrete Steps on Far Right Leading Up to Olive Exit Door -->
                <!-- Upper Step Riser & Tread -->
                <polygon points="724,446 986,518 986,555 724,492" fill="#7c7365" stroke="#3f3a32"
                  stroke-width="2.5" />
                <polygon points="724,446 772,432 1000,486 986,518" fill="#9c9385" stroke="#4b453c"
                  stroke-width="2" />
                <!-- Lower Step Riser & Tread -->
                <polygon points="684,504 948,575 684,575" fill="#685f52" stroke="#353029"
                  stroke-width="2.5" />
                <polygon points="684,504 724,492 986,555 948,575" fill="#8d8374" stroke="#464037"
                  stroke-width="2" />
              </svg>

              <!-- 3A. World Outbreak Map Display ( glowing red infection LEDs ) -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 19.8%; top: 25%; width: 18.8%; height: 18.5%"
                id="obj-r3-map"
                data-object-id="r3-map"
                title="Inspect Global Outbreak Monitor"
              >
                <svg viewBox="0 0 210 115" width="100%" height="100%">
                  <rect x="3" y="3" width="204" height="109" rx="3" fill="#141418" stroke="#09090b"
                    stroke-width="4" />
                  <!-- Pale Grey Continents -->
                  <path d="M18,22 L62,18 L54,48 L36,54 Z" fill="#cbd5e1" opacity="0.86" />
                  <path d="M46,58 L66,62 L56,98 L44,88 Z" fill="#cbd5e1" opacity="0.86" />
                  <path d="M88,20 L122,18 L126,44 L92,46 Z" fill="#cbd5e1" opacity="0.86" />
                  <path d="M94,48 L126,50 L116,88 L98,76 Z" fill="#cbd5e1" opacity="0.86" />
                  <path d="M124,20 L186,22 L176,62 L130,56 Z" fill="#cbd5e1" opacity="0.86" />
                  <path d="M162,74 L188,74 L184,94 L160,92 Z" fill="#cbd5e1" opacity="0.86" />
                  <!-- Glowing Red Outbreak Dots -->
                  <g fill="#ef4444">
                    <circle cx="34" cy="36" r="2.8" />
                    <circle cx="46" cy="42" r="2.8" />
                    <circle cx="54" cy="72" r="2.8" />
                    <circle cx="52" cy="86" r="2.8" />
                    <circle cx="98" cy="32" r="2.8" />
                    <circle cx="108" cy="28" r="2.8" />
                    <circle cx="114" cy="38" r="2.8" />
                    <circle cx="106" cy="62" r="2.8" />
                    <circle cx="112" cy="78" r="2.8" />
                    <circle cx="142" cy="38" r="2.8" />
                    <circle cx="158" cy="46" r="2.8" />
                    <circle cx="170" cy="54" r="2.8" />
                    <circle cx="174" cy="84" r="2.8" />
                  </g>
                </svg>
              </button>
              <span class="tle-obj-tag" style="left: 20.5%; top: 20.5%">🗺️ OUTBREAK MAP</span>

              <!-- 3B. Slanted Brushed-Steel H · N · O · C · S Cipher Console -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 24.2%; top: 47.5%; width: 15.2%; height: 42.5%"
                id="obj-r3-hnocs"
                data-object-id="r3-hnocs"
                title="Operate H-N-O-C-S Stabilizer Console"
              >
                <svg viewBox="0 0 155 245" width="100%" height="100%">
                  <!-- Slanted Upper Control Deck -->
                  <polygon points="8,24 128,16 146,82 14,94" fill="#3f3f46" stroke="#18181b"
                    stroke-width="3" />
                  <!-- Brown Keybox Mounted on Upper Right of Console -->
                  <rect x="108" y="4" width="36" height="48" rx="3" fill="#451a03" stroke="#78350f"
                    stroke-width="2" />
                  <!-- 5 Glowing Cream/Amber Letter Tiles: H · N · O · C · S -->
                  <g font-size="11" font-weight="bold" text-anchor="middle" fill="#1c1917">
                    <rect x="15" y="25" width="16" height="16" rx="2" fill="#fef3c7" stroke="#d97706" />
                    <text x="23" y="37">H</text>
                    <rect x="34" y="24" width="16" height="16" rx="2" fill="#fef3c7" stroke="#d97706" />
                    <text x="42" y="36">N</text>
                    <rect x="53" y="23" width="16" height="16" rx="2" fill="#fef3c7" stroke="#d97706" />
                    <text x="61" y="35">O</text>
                    <rect x="72" y="22" width="16" height="16" rx="2" fill="#fef3c7" stroke="#d97706" />
                    <text x="80" y="34">C</text>
                    <rect x="91" y="21" width="16" height="16" rx="2" fill="#fef3c7" stroke="#d97706" />
                    <text x="99" y="33">S</text>
                  </g>
                  <!-- Vertical Slider Slots & Red Indicator Buttons -->
                  <line x1="60" y1="48" x2="64" y2="80" stroke="#09090b" stroke-width="4" />
                  <line x1="78" y1="47" x2="82" y2="79" stroke="#09090b" stroke-width="4" />
                  <circle cx="106" cy="64" r="4" fill="#dc2626" />
                  <!-- Brushed Steel Front Body + Square Hatch + Dark Lower Base -->
                  <polygon points="14,94 146,82 146,192 18,208" fill="#71717a" stroke="#18181b"
                    stroke-width="3" />
                  <rect x="68" y="132" width="38" height="42" fill="#a1a1aa" stroke="#27272a"
                    stroke-width="2" />
                  <circle cx="87" cy="153" r="4" fill="#27272a" />
                  <polygon points="18,208 146,192 146,236 20,242" fill="#09090b" />
                  <rect x="86" y="204" width="44" height="24" rx="2" fill="#71717a" />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r3-hnocs" style="left: 24.2%; top: 90.5%">
                🎛️ H·N·O·C·S CONSOLE
              </span>

              <!-- 3C. Hand-Scrawled Chemical / Molecular Formula Wall Graffiti -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 47.5%; top: 25.5%; width: 27.5%; height: 27.5%"
                id="obj-r3-graffiti"
                data-object-id="r3-graffiti"
                title="Examine Hand-Scrawled Chemical Wall Formulas"
              >
                <svg viewBox="0 0 280 160" width="100%" height="100%">
                  <g fill="none" stroke="#1c1308" stroke-width="2.4" stroke-linecap="round">
                    <!-- Benzene / Molecular Hexagon Rings & Bond Lines -->
                    <polygon points="48,62 66,52 84,62 84,82 66,92 48,82" />
                    <line x1="84" y1="62" x2="112" y2="48" />
                    <line x1="112" y1="48" x2="148" y2="56" />
                    <polygon points="122,88 140,78 158,88 158,108 140,118 122,108" />
                    <line x1="158" y1="88" x2="196" y2="78" />
                    <!-- Prominent Circled (8) Harmonic Marker on Right -->
                    <circle cx="214" cy="76" r="15" stroke-width="3" />
                    <line x1="229" y1="76" x2="258" y2="62" />
                    <line x1="226" y1="86" x2="256" y2="104" />
                    <!-- Crossed-out Scribbles matching photo -->
                    <line x1="132" y1="30" x2="164" y2="52" stroke-width="3.5" />
                    <line x1="162" y1="28" x2="134" y2="54" stroke-width="3.5" />
                    <line x1="222" y1="106" x2="262" y2="128" stroke-width="3.5" />
                    <line x1="258" y1="104" x2="224" y2="130" stroke-width="3.5" />
                  </g>
                  <text x="214" y="82" text-anchor="middle" fill="#1c1308" font-size="17"
                    font-weight="bold">8</text>
                  <text x="66" y="77" text-anchor="middle" fill="#1c1308" font-size="12"
                    font-weight="bold">RING</text>
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r3-graffiti" style="left: 53%; top: 21%">
                🧪 WALL FORMULAS
              </span>

              <!-- 3D. Scientist Desk: Draped White Lab Coat & Military Field Radio -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 43.2%; top: 47.5%; width: 16%; height: 44%"
                id="obj-r3-labcoat"
                data-object-id="r3-labcoat"
                title="Search Draped White Lab Coat & Field Radio"
              >
                <svg viewBox="0 0 165 255" width="100%" height="100%">
                  <!-- Military Olive Field Radio & Headphones on Desk -->
                  <rect x="44" y="6" width="54" height="58" rx="4" fill="#363928" stroke="#18181b"
                    stroke-width="3" />
                  <circle cx="62" cy="26" r="5" fill="#94a3b8" />
                  <circle cx="62" cy="44" r="4" fill="#475569" />
                  <ellipse cx="114" cy="58" rx="16" ry="8" fill="#18181b" />
                  <!-- White Chair Seat & Legs -->
                  <polygon points="48,136 116,132 122,146 52,150" fill="#d6d3cb" stroke="#78716c"
                    stroke-width="2" />
                  <line x1="116" y1="146" x2="122" y2="208" stroke="#d6d3cb" stroke-width="6" />
                  <!-- Realistic Draped White Lab Coat Hanging to Floor -->
                  <path
                    d="M28,62 Q46,54 56,82 L76,158 L98,236 L58,246 L38,228 L16,174 L18,98 Z"
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    stroke-width="2.5"
                  />
                  <path d="M36,78 L48,195 M52,96 L68,224" stroke="#94a3b8" stroke-width="2" />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r3-coat" style="left: 42.5%; top: 91.5%">
                🥼 LAB COAT &amp; RADIO
              </span>

              <!-- 3E. Vintage CRT Oscilloscope on Grey Concrete Block -->
              <button
                type="button"
                class="tle-hotspot"
                style="left: 59.5%; top: 55.5%; width: 13.5%; height: 16.5%"
                id="obj-r3-oscillo"
                data-object-id="r3-oscillo"
                title="Tune Vintage CRT Oscilloscope"
              >
                <svg viewBox="0 0 140 96" width="100%" height="100%">
                  <!-- Top & Side Casing -->
                  <polygon points="8,22 58,8 132,18 84,34" fill="#57534e" stroke="#1c1917"
                    stroke-width="2.5" />
                  <polygon points="84,34 132,18 132,72 84,88" fill="#292524" stroke="#0c0a09"
                    stroke-width="2.5" />
                  <!-- Front Instrument Faceplate -->
                  <polygon points="8,22 84,34 84,88 8,72" fill="#a8a29e" stroke="#292524"
                    stroke-width="2.5" />
                  <!-- Round Pale CRT Screen + Knobs -->
                  <circle cx="28" cy="48" r="13" fill="#e2e8f0" stroke="#1e293b" stroke-width="3" />
                  <path d="M18,48 Q23,38 28,48 T38,48" fill="none" stroke="#16a34a" stroke-width="2" />
                  <circle cx="56" cy="46" r="4.5" fill="#292524" />
                  <circle cx="71" cy="49" r="4.5" fill="#292524" />
                  <circle cx="56" cy="66" r="4.5" fill="#292524" />
                  <circle cx="71" cy="69" r="4.5" fill="#dc2626" />
                </svg>
              </button>
              <span class="tle-obj-tag" id="tag-r3-oscillo" style="left: 58.5%; top: 73%">
                📺 CRT OSCILLOSCOPE
              </span>

              <!-- 3F. Tall Distressed Olive-Ochre Paneled Exit Door Above Concrete Steps (3D Swing) -->
              <div
                class="tle-door-3d-wrap"
                id="r3-door-wrap"
                style="left: 77.5%; top: 0.5%; width: 21.5%; height: 83%"
              >
                <button
                  type="button"
                  class="tle-hotspot"
                  style="inset: 0; width: 100%; height: 100%"
                  id="obj-r3-exitdoor"
                  data-object-id="r3-exitdoor"
                  title="Final Quarantine Bunker Exit Door"
                >
                  <div class="tle-r3-door-frame"></div>
                  <div class="tle-door-leaf tle-r3-door-leaf">
                    <div class="tle-r3-door-panel-top"></div>
                    <div class="tle-r3-door-panel-bot"></div>
                    <div class="tle-r3-door-handle"></div>
                  </div>
                </button>
              </div>
              <span class="tle-obj-tag" id="tag-r3-door" style="left: 79.5%; top: 84.5%">
                🚪 QUARANTINE EXIT
              </span>
            </div>
          </div>

          <!-- HIGH-CONTRAST TOAST & READABLE HINT CARD -->
          <div class="tle-feedback-toast tle-banner-hidden" id="action-feedback-text"></div>
          <div class="tle-hint-card hidden" id="hint-card" role="dialog" aria-label="Puzzle Hint">
            <div class="tle-hint-top">
              <span class="tle-hint-badge" id="hint-card-badge">💡 HINT</span>
              <button type="button" class="tle-hint-gotit" id="btn-close-hint">Got it ✕</button>
            </div>
            <p class="tle-hint-target" id="hint-card-target"></p>
            <p class="tle-hint-body" id="hint-card-body"></p>
          </div>
        </div>

        <!-- BOTTOM DOCK: INVENTORY (BOTTOM LEFT) & CLUES (BOTTOM RIGHT) -->
        <div class="tle-bottom-dock" id="inventory-clues-dock">
          <!-- Bottom Left: INVENTORY -->
          <section class="tle-panel-matte tle-inventory-panel" id="panel-inventory">
            <div class="tle-panel-head">
              <span class="tle-panel-title">INVENTORY</span>
              <span class="tle-panel-tag">TEMPORARY</span>
            </div>
            <div class="tle-inv-slots" id="inventory-list"></div>
          </section>

          <!-- Bottom Center: Room Objectives Checklist -->
          <section class="tle-panel-matte tle-tasks-dock" id="panel-tasks">
            <div class="tle-panel-head">
              <span class="tle-panel-title">OBJECTIVES</span>
              <span class="tle-panel-tag" id="hud-tasks-ratio">0 / 3</span>
            </div>
            <div class="tle-tasks-box" id="tasks-checklist"></div>
          </section>

          <!-- Bottom Right: CLUES -->
          <section class="tle-panel-matte tle-clues-panel" id="panel-clues">
            <div class="tle-panel-head">
              <span class="tle-panel-title">CLUES</span>
              <span class="tle-panel-tag tle-tag-saved">PERMANENT</span>
            </div>
            <ul class="tle-clues-list" id="clues-list"></ul>
          </section>
        </div>
      </main>

      <!-- =================================================================
           4. GLOBAL MODALS (Ready Window, Countdown, Puzzles, End Screen)
           ================================================================= -->
      <div class="tle-modal-backdrop hidden" id="inspector-modal">
        <div class="tle-modal-card">
          <div class="tle-modal-head">
            <h2 class="tle-modal-title" id="inspector-title">INSPECT</h2>
            <button type="button" class="tle-close-btn" id="btn-close-inspector">✕ Close</button>
          </div>
          <div id="inspector-body"></div>
        </div>
      </div>

      <!-- 5-4-3-2-1 COUNTDOWN OVERLAY -->
      <div class="tle-modal-backdrop hidden" id="countdown-overlay">
        <div class="tle-countdown-num" id="countdown-number">5</div>
      </div>

      <!-- END-OF-GAME CO-OP MODAL (Saif & Partner Drek Co-Op Stats + Rematch / Exit) -->
      <div class="tle-modal-backdrop hidden" id="scoreboard-modal">
        <div class="tle-modal-card tle-score-card-wide" style="text-align: center">
          <div class="tle-modal-head">
            <h2 class="tle-modal-title" id="score-modal-title" style="font-size: 1.15rem">
              🤝 CO-OP ESCAPE COMPLETE — TEAM VICTORY!
            </h2>
            <button type="button" class="tle-close-btn" id="btn-close-score">✕</button>
          </div>
          <div class="tle-winner-banner" id="stats-winner-banner"></div>
          <div class="tle-stats-grid">
            <div class="tle-stat-card" id="stats-col-me"></div>
            <div class="tle-stat-card tle-stat-opp" id="stats-col-opp"></div>
          </div>
          <p
            id="rematch-sender-hint"
            class="hidden"
            style="font-size: 0.88rem; color: #fde68a; margin: 8px 0"
          ></p>
          <div class="tle-end-actions">
            <button type="button" class="tle-btn-rematch" id="btn-invite-rematch">
              🤝 Invite ${state.player2Name} for Co-Op Rematch
            </button>
            <button type="button" class="tle-btn-exit-lobby" id="btn-exit-lobby">
              🚪 Exit to Lobby
            </button>
          </div>
        </div>
      </div>

      <!-- PUBG-STYLE SLIDE-IN CO-OP REMATCH INVITE DRAWER (Shown to Invited Partner!) -->
      <aside class="tle-pubg-drawer tle-side-hidden" id="pubg-side-drawer">
        <div style="font-weight: 900; color: #fcd34d; font-size: 0.95rem">
          🤝 CO-OP REMATCH INVITE
        </div>
        <p
          id="pubg-invite-text"
          style="margin: 8px 0 12px; font-size: 0.95rem; font-weight: 700; color: #f8fafc"
        >
          ${state.player1Name} invited you for a rematch
        </p>
        <div style="display: flex; gap: 8px">
          <button type="button" class="tle-puz-btn" id="btn-pubg-accept">✓ Accept</button>
          <button type="button" class="tle-close-btn" id="btn-pubg-reject">✕ Decline</button>
        </div>
      </aside>
    </div>
  `;

  const lobbySceneEl = container.querySelector<HTMLElement>("#lobby-scene-view");
  const headerEl = container.querySelector<HTMLElement>("#gameplay-header");
  const mainEl = container.querySelector<HTMLElement>("#gameplay-main");
  const blurTarget = container.querySelector<HTMLElement>("#room-blur-target");

  const sceneBasic = container.querySelector<HTMLElement>("#scene-basic");
  const sceneCorridor = container.querySelector<HTMLElement>("#scene-corridor");
  const sceneMedium = container.querySelector<HTMLElement>("#scene-medium");
  const sceneHard = container.querySelector<HTMLElement>("#scene-hard");

  const inspectorModal = container.querySelector<HTMLElement>("#inspector-modal");
  const inspectorTitle = container.querySelector<HTMLElement>("#inspector-title");
  const inspectorBody = container.querySelector<HTMLElement>("#inspector-body");
  const scoreModal = container.querySelector<HTMLElement>("#scoreboard-modal");
  const hintCard = container.querySelector<HTMLElement>("#hint-card");
  const countdownOverlay = container.querySelector<HTMLElement>("#countdown-overlay");
  const countdownNum = container.querySelector<HTMLElement>("#countdown-number");
  const vhsLayer = container.querySelector<HTMLElement>("#vhs-rewind-layer");

  function flashToast(msg: string): void {
    state.feedbackMessage = msg;
    const el = container.querySelector<HTMLElement>("#action-feedback-text");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("tle-banner-hidden");
    if (toastTimer !== undefined) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      el.classList.add("tle-banner-hidden");
    }, 4000);
  }

  function showEscapeGreenPopup(msg: string): void {
    const box = container.querySelector<HTMLElement>("#opponent-escape-popup");
    const txt = container.querySelector<HTMLElement>("#opponent-escape-text");
    if (!box || !txt || !msg) return;
    txt.textContent = msg;
    box.classList.remove("tle-escape-popup-hidden");
    if (escapePopupTimer !== undefined) window.clearTimeout(escapePopupTimer);
    escapePopupTimer = window.setTimeout(() => {
      box.classList.add("tle-escape-popup-hidden");
    }, 4800);
  }

  function notifyOtherPlayerEscape(finisher: "p1" | "p2", roomNum: number): void {
    const finisherName = finisher === "p1" ? state.player1Name : state.player2Name;
    const msg = `🤝 Partner ${finisherName} escaped Room ${roomNum}`;
    const viewerKey = state.localRole === "host" ? "p1" : "p2";
    if (viewerKey !== finisher) {
      showEscapeGreenPopup(msg);
    } else {
      const otherProg = finisher === "p1" ? p2Prog : p1Prog;
      otherProg.pendingEscapePopup = msg;
    }
  }

  function addClue(clue: string): void {
    if (!state.clues.includes(clue)) {
      state.clues.push(clue);
    }
    saveActiveProgress();
  }

  function addItem(item: InventoryItemId): void {
    if (!state.inventory.includes(item)) {
      state.inventory.push(item);
    }
    saveActiveProgress();
  }

  function openModal(title: string, renderFn: (host: HTMLElement) => void): void {
    if (!inspectorModal || !inspectorTitle || !inspectorBody) return;
    hintCard?.classList.add("hidden");
    inspectorTitle.textContent = title;
    inspectorBody.innerHTML = "";
    renderFn(inspectorBody);
    inspectorModal.classList.remove("hidden");
    renderState();
  }

  function closeModals(): void {
    endModalOpen = false;
    inspectorModal?.classList.add("hidden");
    scoreModal?.classList.add("hidden");
    hintCard?.classList.add("hidden");
    renderState();
  }

  function toggleMicrophone(): void {
    state.micMuted = !state.micMuted;
    if (!state.micMuted) {
      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            if (state.micMuted) {
              stream.getTracks().forEach((t) => {
                t.stop();
              });
              return;
            }
            activeMicStream = stream;
          })
          .catch(() => {
            // Graceful fallback when iframe/browser blocks mic hardware prompt
          });
      }
    } else if (activeMicStream) {
      activeMicStream.getTracks().forEach((t) => {
        t.stop();
      });
      activeMicStream = null;
    }
    renderState();
  }

  // Real-Time First-Person Camera Zoom Into Open Doorway
  function zoomThroughDoorway(originX: number, originY: number, onArrive: () => void): void {
    if (isZooming || !blurTarget) {
      onArrive();
      return;
    }
    isZooming = true;
    hintCard?.classList.add("hidden");
    blurTarget.style.transformOrigin = `${originX}% ${originY}%`;
    blurTarget.classList.add("tle-zoom-walkthrough");

    window.setTimeout(() => {
      blurTarget.classList.remove("tle-zoom-walkthrough");
      blurTarget.style.transformOrigin = "50% 50%";
      isZooming = false;
      onArrive();
      renderState();
    }, 820);
  }

  function startMatchForBothPlayers(): void {
    p1Prog = makeInitialRun();
    p2Prog = makeInitialRun();
    p1Prog.stageView = "basic";
    p1Prog.difficulty = "basic";
    p1Prog.maxUnlockedRoom = 1;
    p1Prog.timeLeftSeconds = 60;
    p1Prog.timerRunning = true;

    p2Prog.stageView = "basic";
    p2Prog.difficulty = "basic";
    p2Prog.maxUnlockedRoom = 1;
    p2Prog.timeLeftSeconds = 60;
    p2Prog.timerRunning = true;

    p2ControlledManually = false;
    matchElapsedTicks = 0;

    state.rematchInvitedBy = null;
    state.p1RoomLoops = [1, 0, 0];
    state.p2RoomLoops = [1, 0, 0];
    state.p1TimeSpentSeconds = 0;
    state.p2TimeSpentSeconds = 0;
    state.p1RoomsCleared = 0;
    state.p2RoomsCleared = 0;
    state.loopDurationSeconds = 60;

    reseedShuffles();
    loadActiveProgress();
    closeModals();
    flashToast("🚪 Room 1 started — 60s on the clock! Escape Room 1 to unlock Room 2.");
    renderState();
  }

  function startFiveSecondLaunchCountdown(): void {
    closeModals();
    if (!countdownOverlay || !countdownNum) return;
    let count = 5;
    countdownNum.textContent = "5";
    countdownOverlay.classList.remove("hidden");
    if (countdownTimer !== undefined) window.clearInterval(countdownTimer);
    countdownTimer = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        countdownNum.textContent = String(count);
      } else if (count === 0) {
        countdownNum.textContent = "GO!";
      } else {
        window.clearInterval(countdownTimer);
        countdownOverlay.classList.add("hidden");
        startMatchForBothPlayers();
      }
    }, 680);
  }

  // =========================================================================
  // ROOM 1 PUZZLES (BASIC — HIDDEN CLUE IN CRATE/RACK, SHUFFLED & FUN IN 60s!)
  // =========================================================================

  function openR1Glovebox(): void {
    state.r1GloveSolved = true;
    addItem("Console Key");
    saveActiveProgress();
    openModal("🧤 GLASS GLOVEBOX — CONSOLE KEY FOUND", (host) => {
      host.innerHTML = `
        <div class="tle-puz-box">
          <p class="tle-puz-desc">
            🔑 <strong>Console Key collected!</strong> A brass tag attached to the key ring
            reads:
          </p>
          <div class="tle-status-readout" style="font-size:0.95rem">
            <em>"The 3-color antidote override isn't stored in the glovebox — we hid the reagent
            vials inside the <strong>📦 Supply Crate</strong> on the floor and the
            <strong>🧪 Chemistry Rack</strong> above!"</em>
          </div>
          <p class="tle-puz-desc" style="margin:10px 0 0;color:#fde68a">
            ${
              state.r1ChemSolved
                ? "✓ You already uncovered the hidden reagent clue! Click the 🎛️ Steel Console!"
                : "👉 Search the 📦 Supply Crate (or 🧪 Chemistry Rack) to find the hidden color order!"
            }
          </p>
        </div>
      `;
    });
  }

  function revealRoom1HiddenClue(title: string, locationNote: string): void {
    state.r1ChemSolved = true;
    addClue("Hidden Reagent Vials: Emerald (GREEN) ➔ Cobalt (BLUE) ➔ Crimson (RED)");
    saveActiveProgress();
    openModal(title, (host) => {
      host.innerHTML = `
        <div class="tle-puz-box">
          <p class="tle-puz-desc">
            🔍 <strong>Hidden Clue Uncovered!</strong> ${locationNote}
          </p>
          <div class="tle-status-readout" style="text-align:left;font-size:0.96rem">
            🧪 <strong>1st Vial (Top Valve):</strong> 🟢 Emerald Moss (<strong>GREEN</strong>)<br />
            🧪 <strong>2nd Vial (Middle Coil):</strong> 🔵 Cobalt Condenser (<strong>BLUE</strong>)<br />
            🧪 <strong>3rd Vial (Bottom Burner):</strong> 🔴 Crimson Flare (<strong>RED</strong>)
          </div>
          <p class="tle-puz-desc" style="margin:10px 0 0;color:#fde68a">
            ${
              state.r1GloveSolved
                ? "🔑 Key & Hidden Clue ready! Click the 🎛️ Steel Console and tap the 3 colors in order!"
                : "🔑 Now grab the Console Key from the lit 🧤 Glass Glovebox on the left ledge!"
            }
          </p>
        </div>
      `;
    });
  }

  function openR1Chem(): void {
    revealRoom1HiddenClue(
      "🧪 CHEMISTRY RACK — HIDDEN REAGENT LABELS",
      "Tucked behind the glassware coils are 3 numbered reagent tags:",
    );
  }

  function openR1Crate(): void {
    revealRoom1HiddenClue(
      "📦 WOODEN SUPPLY CRATE — HIDDEN COMPARTMENT",
      "Under the false wooden lid sit 3 numbered antidote vials:",
    );
  }

  function openR1Map(): void {
    openModal("🗺️ BUNKER OUTBREAK MONITOR", (host) => {
      host.innerHTML = `
        <div class="tle-puz-box">
          <p class="tle-puz-desc">
            Bunker security checklist for the <strong>🎛️ Steel Console</strong> underneath:
          </p>
          <div class="tle-status-readout" style="text-align:left">
            1️⃣ <strong>Console Key:</strong> ${
              state.r1GloveSolved
                ? "✅ Found in Glass Glovebox"
                : "🔒 Hidden inside the lit 🧤 Glass Glovebox"
            }<br />
            2️⃣ <strong>Hidden Color Clue:</strong> ${
              state.r1ChemSolved
                ? "✅ Found in Supply Crate / Chemistry Rack"
                : "🔍 Hidden inside the 📦 Supply Crate or 🧪 Chemistry Rack"
            }
          </div>
        </div>
      `;
    });
  }

  function openR1Console(): void {
    let seq: string[] = [];
    const colorLabels: Record<string, string> = {
      GREEN: "🟢 GREEN",
      BLUE: "🔵 BLUE",
      RED: "🔴 RED",
      AMBER: "🟡 AMBER",
    };

    openModal("🎛️ SLANTED STEEL BUNKER CONSOLE (SHUFFLED)", (host) => {
      if ((!state.r1GloveSolved || !state.r1ChemSolved) && !state.r1ConsoleSolved) {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              🔒 Before unlocking the console, collect the key and uncover the hidden clue:
            </p>
            <div class="tle-status-readout" style="text-align:left">
              ${
                state.r1GloveSolved
                  ? "✅ 1. Console Key collected from Glass Glovebox"
                  : "⬜ 1. Grab the Console Key from the lit 🧤 Glass Glovebox"
              }<br />
              ${
                state.r1ChemSolved
                  ? "✅ 2. Hidden Color Clue found in Supply Crate / Chemistry Rack"
                  : "⬜ 2. Search the 📦 Supply Crate or 🧪 Chemistry Rack for the hidden color clue"
              }
            </div>
          </div>
        `;
        return;
      }

      const target = ["GREEN", "BLUE", "RED"];
      const renderConsole = (errMsg = ""): void => {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              Tap the 3 antidote colors from your discovered clue (buttons below are
              <strong>shuffled</strong>!):
            </p>
            <div class="tle-lobby-grid">
              ${r1ConsoleOrder
                .map(
                  (c) => `
                <button
                  type="button"
                  class="tle-puz-btn ${seq.includes(c) ? "tle-active" : ""}"
                  data-r1c="${c}"
                  style="font-size:1rem;padding:13px 10px"
                >
                  ${colorLabels[c] ?? c}
                </button>`,
                )
                .join("")}
            </div>
            <div class="tle-status-readout">
              ${
                errMsg
                  ? `<span style="color:#fca5a5">${errMsg}</span>`
                  : `ENTERED: <strong>${seq.length ? seq.join(" ➔ ") : "—"}</strong>`
              }
            </div>
          </div>
        `;
        host.querySelectorAll<HTMLElement>("[data-r1c]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const pick = btn.dataset.r1c ?? "";
            const expected = target[seq.length];
            if (pick !== expected) {
              seq = [];
              renderConsole("✕ Wrong color order! Check your Permanent Clues & tap again.");
              return;
            }
            seq.push(pick);
            if (seq.length === target.length) {
              state.r1ConsoleSolved = true;
              saveActiveProgress();
              closeModals();
              flashToast("🔓 Bunker Exit Door swung OPEN! Click the door on the right!");
              return;
            }
            renderConsole();
          });
        });
      };
      renderConsole();
    });
  }

  // =========================================================================
  // ROOM 2 PUZZLES (MEDIUM — CLUES HIDDEN IN WINE RACK BOTTLE, SHUFFLED!)
  // =========================================================================

  function openR2Chalk(): void {
    addItem("Brass Corkscrew");
    saveActiveProgress();
    openModal("🔍 CHALK OUTLINE — BRASS CORKSCREW FOUND", (host) => {
      host.innerHTML = `
        <div class="tle-puz-box">
          <p class="tle-puz-desc">
            🍾 <strong>Brass Corkscrew collected!</strong> Beside the chalk outline is a matchbook
            from the bartender:
          </p>
          <div class="tle-status-readout" style="font-size:0.95rem">
            <em>"I rolled the secret tap order &amp; culprit sketch inside a hollow Gold-Reserve
            bottle in the <strong>🍷 Wine Rack</strong> under the right bar counter!"</em>
          </div>
          <p class="tle-puz-desc" style="margin:10px 0 0;color:#fde68a">
            ${
              state.r2ChalkSolved
                ? "✓ You already uncorked the Wine Rack bottle! Check the 🍺 Bar Dispenser & 🕵️ Suspect Board!"
                : "👉 Click the 🍷 Wine Rack under the right bar counter to uncork the hidden bottle!"
            }
          </p>
        </div>
      `;
    });
  }

  function openR2Wine(): void {
    state.r2ChalkSolved = true;
    addItem("Bar Token");
    addClue("Hidden Bottle Scroll: Vintage Red (WINE) ➔ Golden Hops (ALE) ➔ Juniper (GIN)");
    addClue("Hidden Eyewitness Sketch: Suspect wore cracked 👓 Glasses");
    saveActiveProgress();
    openModal("🍷 UNDER-BAR WINE RACK — HOLLOW BOTTLE UNCORKED!", (host) => {
      host.innerHTML = `
        <div class="tle-puz-box">
          <p class="tle-puz-desc">
            🔍 <strong>Hidden Scroll Uncovered!</strong> Inside the hollow Gold-Reserve bottle you
            find a <strong>Bar Token</strong> and two rolled-up notes:
          </p>
          <div class="tle-status-readout" style="text-align:left;font-size:0.95rem">
            📜 <strong>Cellar Pour Note:</strong> 1st <em>Vintage Red</em> (🍷 <strong>WINE</strong>)
            ➔ 2nd <em>Golden Hops</em> (🍺 <strong>ALE</strong>) ➔ 3rd <em>Juniper</em>
            (🍸 <strong>GIN</strong>)<br />
            🕵️ <strong>Eyewitness Sketch:</strong> A pair of cracked <strong>👓 Glasses</strong>
            dropped by the culprit at the scene!
          </div>
          <p class="tle-puz-desc" style="margin:10px 0 0;color:#fde68a">
            Now unlock the <strong>🍺 6-Tap Dispenser</strong> and identify the culprit on the
            <strong>🕵️ Suspect Board</strong>!
          </p>
        </div>
      `;
    });
  }

  function openR2Taps(): void {
    let seq: string[] = [];
    const drinkLabels: Record<string, string> = {
      WINE: "🍷 WINE",
      ALE: "🍺 ALE",
      GIN: "🍸 GIN",
      RYE: "🥃 RYE",
    };

    openModal("🍺 SPEAKEASY BAR DISPENSER (SHUFFLED)", (host) => {
      if (!state.r2ChalkSolved && !state.r2TapsSolved) {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              🔒 You don't know the secret pour order yet! Check the <strong>🔍 Chalk Outline</strong>
              and search the <strong>🍷 Wine Rack</strong> under the right bar counter first!
            </p>
          </div>
        `;
        return;
      }

      const target = ["WINE", "ALE", "GIN"];
      const renderTaps = (errMsg = ""): void => {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              Pull the 3 secret drinks from the hidden bottle scroll (levers below are
              <strong>shuffled</strong>!):
            </p>
            <div class="tle-lobby-grid">
              ${r2TapOrder
                .map(
                  (d) => `
                <button
                  type="button"
                  class="tle-puz-btn ${seq.includes(d) ? "tle-active" : ""}"
                  data-tapd="${d}"
                  style="font-size:1rem;padding:13px 10px"
                >
                  ${drinkLabels[d] ?? d}
                </button>`,
                )
                .join("")}
            </div>
            <div class="tle-status-readout">
              ${
                errMsg
                  ? `<span style="color:#fca5a5">${errMsg}</span>`
                  : `POURED: <strong>${seq.length ? seq.join(" ➔ ") : "—"}</strong>`
              }
            </div>
          </div>
        `;
        host.querySelectorAll<HTMLElement>("[data-tapd]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const pick = btn.dataset.tapd ?? "";
            const expected = target[seq.length];
            if (pick !== expected) {
              seq = [];
              renderTaps("✕ Wrong drink order! Check your Permanent Clues & tap again.");
              return;
            }
            seq.push(pick);
            if (seq.length === target.length) {
              state.r2TapsSolved = true;
              saveActiveProgress();
              closeModals();
              flashToast("✓ Bar lock open! Now click the Suspect Board on the left wall!");
              return;
            }
            renderTaps();
          });
        });
      };
      renderTaps();
    });
  }

  function openR2Board(): void {
    const suspectMeta: Record<string, { name: string; tag: string }> = {
      caterina: { name: "Caterina", tag: "Singer · No Glasses" },
      marco: { name: "Marco", tag: "Pianist · Hat" },
      sanchez: { name: "Dr. Sanchez", tag: "Suspect · 👓 Glasses" },
      luca: { name: "Chef Luca", tag: "Kitchen · Apron" },
    };

    openModal("🕵️ INVESTIGATION SUSPECT BOARD (SHUFFLED)", (host) => {
      if (!state.r2TapsSolved && !state.r2BoardSolved) {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              🔒 Uncork the hidden bottle in the <strong>🍷 Wine Rack</strong> and unlock the
              <strong>🍺 Bar Dispenser</strong> on the right counter first!
            </p>
          </div>
        `;
        return;
      }

      const renderSuspects = (errMsg = ""): void => {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              Click the culprit matching your hidden bottle sketch (cards are
              <strong>shuffled</strong>!):
            </p>
            <div class="tle-lobby-grid">
              ${r2SuspectOrder
                .map((id) => {
                  const s = suspectMeta[id] ?? { name: id, tag: "" };
                  return `
                    <button
                      type="button"
                      class="tle-suspect-card"
                      data-sus="${id}"
                      style="padding:12px 10px"
                    >
                      <strong style="display:block;font-size:0.95rem">${s.name}</strong>
                      <span style="font-size:0.78rem;color:#cbd5e1">${s.tag}</span>
                    </button>`;
                })
                .join("")}
            </div>
            ${errMsg ? `<div class="tle-status-readout" style="color:#fca5a5">${errMsg}</div>` : ""}
          </div>
        `;
        host.querySelectorAll<HTMLElement>("[data-sus]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = btn.dataset.sus ?? "";
            if (id === "sanchez") {
              state.r2BoardSolved = true;
              saveActiveProgress();
              closeModals();
              flashToast("🔓 ROSSO'S Door swung OPEN! Click the center door to walk through!");
            } else {
              renderSuspects("✕ Wrong suspect — check your clue for who wears 👓 Glasses!");
            }
          });
        });
      };
      renderSuspects();
    });
  }

  // =========================================================================
  // ROOM 3 PUZZLES: QUARANTINE COMMAND LAB (CLUES HIDDEN IN WALL & MAP!)
  // =========================================================================

  function openR3LabCoat(): void {
    addItem("Oscilloscope Key");
    saveActiveProgress();
    openModal("🥼 LAB COAT & MILITARY RADIO — OSCILLOSCOPE KEY FOUND", (host) => {
      host.innerHTML = `
        <div class="tle-puz-box">
          <p class="tle-puz-desc">
            🔌 <strong>Oscilloscope Key collected!</strong> Inside the coat pocket is a torn
            notebook page:
          </p>
          <div class="tle-status-readout" style="font-size:0.95rem">
            <em>"I didn't write the frequency or atom sequence in my coat — look closely at the
            <strong>🧪 Wall Formulas</strong> scrawled on the right mustard wall (or check the
            <strong>🗺️ Outbreak Map</strong>)!"</em>
          </div>
          <p class="tle-puz-desc" style="margin:10px 0 0;color:#fde68a">
            ${
              state.r3CoatSolved
                ? "✓ Wall cipher already decoded! Tune the 📺 CRT Oscilloscope & 🎛️ HNOCS Console!"
                : "👉 Click the 🧪 Wall Formulas on the right wall to uncover the hidden frequency & atom clue!"
            }
          </p>
        </div>
      `;
    });
  }

  function revealRoom3HiddenClues(title: string): void {
    state.r3CoatSolved = true;
    addItem("Oscilloscope Key");
    addClue("Hidden Wall Ring: Circled (8) inside benzene ring = 8 Hz");
    addClue("Hidden Wall Formula: H & S crossed out ➔ Active atoms C · O · N");
    saveActiveProgress();
    openModal(title, (host) => {
      host.innerHTML = `
        <div class="tle-puz-box">
          <p class="tle-puz-desc">
            🔍 <strong>Hidden Wall Cipher Decoded!</strong> Tracing the scrawled chemical rings on
            the mustard wall reveals two secret overrides:
          </p>
          <div class="tle-status-readout" style="text-align:left;font-size:0.95rem">
            1️⃣ <strong>Circled Ring Number:</strong> A bold <strong>(8)</strong> is circled on the
            right bond ➔ Lock <strong>8 Hz</strong> on the <strong>📺 CRT Oscilloscope</strong><br />
            2️⃣ <strong>Crossed-Out Elements:</strong> Decoy atoms <strong>H</strong> &amp;
            <strong>S</strong> are scratched out, leaving the ring core <strong>C ➔ O ➔ N</strong>
            for the <strong>🎛️ H·N·O·C·S Console</strong>!
          </div>
        </div>
      `;
    });
  }

  function openR3Graffiti(): void {
    revealRoom3HiddenClues("🧪 CHEMICAL WALL FORMULAS — HIDDEN CIPHER UNCOVERED");
  }

  function openR3Map(): void {
    revealRoom3HiddenClues("🗺️ GLOBAL OUTBREAK MONITOR — TELEMETRY CIPHER");
  }

  function openR3Oscillo(): void {
    openModal("📺 VINTAGE CRT OSCILLOSCOPE (SHUFFLED)", (host) => {
      if (!state.r3CoatSolved && !state.r3OscilloSolved) {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              🔒 You haven't uncovered the hidden harmonic frequency yet! Check the
              <strong>🥼 Lab Coat</strong> and inspect the <strong>🧪 Wall Formulas</strong>
              scrawled on the right wall first!
            </p>
          </div>
        `;
        return;
      }

      const renderOsc = (errMsg = ""): void => {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              Select the circled wall harmonic frequency to power the console (frequencies are
              <strong>shuffled</strong>!):
            </p>
            <div class="tle-lobby-grid">
              ${r3OscilloOrder
                .map(
                  (hz) => `
                <button
                  type="button"
                  class="tle-puz-btn"
                  data-hz="${hz}"
                  style="font-size:1.05rem;padding:13px 10px"
                >
                  ⚡ ${hz} Hz
                </button>`,
                )
                .join("")}
            </div>
            ${errMsg ? `<div class="tle-status-readout" style="color:#fca5a5">${errMsg}</div>` : ""}
          </div>
        `;
        host.querySelectorAll<HTMLElement>("[data-hz]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const hz = btn.dataset.hz ?? "";
            if (hz === "8") {
              state.r3OscilloSolved = true;
              saveActiveProgress();
              closeModals();
              flashToast("⚡ Carrier frequency locked! Now unlock the steel H·N·O·C·S Console!");
            } else {
              renderOsc("✕ Carrier mismatch! Pick the circled number from the mustard wall.");
            }
          });
        });
      };
      renderOsc();
    });
  }

  function openR3Hnocs(): void {
    let seq: string[] = [];
    openModal("🎛️ STEEL H · N · O · C · S CONSOLE (SHUFFLED)", (host) => {
      if (!state.r3OscilloSolved && !state.r3HnocsSolved) {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              🔒 Console unpowered! Inspect the <strong>🧪 Wall Formulas</strong> and lock the
              carrier frequency on the <strong>📺 CRT Oscilloscope</strong> first!
            </p>
          </div>
        `;
        return;
      }

      const target = ["C", "O", "N"];
      const renderHnocs = (errMsg = ""): void => {
        host.innerHTML = `
          <div class="tle-puz-box">
            <p class="tle-puz-desc">
              Tap the 3 active antidote atoms from the wall formula (letter tiles below are
              <strong>shuffled</strong>!):
            </p>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:10px 0">
              ${r3HnocsOrder
                .map(
                  (ltr) => `
                <button
                  type="button"
                  class="tle-puz-btn ${seq.includes(ltr) ? "tle-active" : ""}"
                  data-hnocs="${ltr}"
                  style="font-size:1.15rem;padding:13px 4px"
                >
                  ${ltr}
                </button>`,
                )
                .join("")}
            </div>
            <div class="tle-status-readout">
              ${
                errMsg
                  ? `<span style="color:#fca5a5">${errMsg}</span>`
                  : `SEQUENCE: <strong>${seq.length ? seq.join(" ➔ ") : "—"}</strong>`
              }
            </div>
          </div>
        `;
        host.querySelectorAll<HTMLElement>("[data-hnocs]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const ltr = btn.dataset.hnocs ?? "";
            const expected = target[seq.length];
            if (ltr !== expected) {
              seq = [];
              renderHnocs("✕ Wrong atom order! Check Permanent Clues & tap the 3 active atoms.");
              return;
            }
            seq.push(ltr);
            if (seq.length === target.length) {
              state.r3HnocsSolved = true;
              addItem("Silver Door Key");
              saveActiveProgress();
              closeModals();
              flashToast("🚪 Quarantine Exit Door OPEN! Climb the right steps & click the door!");
              return;
            }
            renderHnocs();
          });
        });
      };
      renderHnocs();
    });
  }

  // =========================================================================
  // NAVIGATION, FRESH 60s ROOM TIMERS, LOOP REWIND & SMART HINTS
  // =========================================================================

  function roomIndex(diff: DifficultyLevel): number {
    if (diff === "basic") return 0;
    if (diff === "medium") return 1;
    return 2;
  }

  function enterRoom(diff: DifficultyLevel, fullReset = false): void {
    if (fullReset) {
      startMatchForBothPlayers();
      return;
    }

    const cur = activeProg();
    const idx = roomIndex(diff);
    const loopsArr = state.localRole === "host" ? state.p1RoomLoops : state.p2RoomLoops;
    const curRoomLoop = loopsArr[idx] ?? 0;
    if (curRoomLoop === 0) {
      loopsArr[idx] = 1;
    }

    // Fresh 60-second timer start for the newly entered room!
    state.difficulty = diff;
    state.stageView = diff;
    state.roomId = ROOM_TITLES[diff];
    state.timeLeftSeconds = 60;
    state.loopDurationSeconds = 60;
    state.timerRunning = true;
    state.escaped = false;
    state.corridorEqualized = false;
    state.inventory = [];
    state.loopCount = loopsArr[idx] ?? 1;
    cur.maxUnlockedRoom = Math.max(cur.maxUnlockedRoom, idx + 1);

    reseedShuffles();
    saveActiveProgress();
    closeModals();
    flashToast(`⏱️ Fresh 60s timer started — ${ROOM_TITLES[diff]}!`);
    renderState();
  }

  function resetLoop(): void {
    if (state.stageView === "lobby") return;
    if (state.stageView === "corridor-1" || state.stageView === "corridor-2") return;

    vhsLayer?.classList.remove("hidden");
    window.setTimeout(() => vhsLayer?.classList.add("hidden"), 850);

    closeModals();
    state.inventory = [];

    if (state.difficulty === "basic") {
      state.stageView = "basic";
      state.r1GloveSolved = false;
      state.r1ChemSolved = false;
      state.r1ConsoleSolved = false;
    } else if (state.difficulty === "medium") {
      state.stageView = "medium";
      state.r2ChalkSolved = false;
      state.r2TapsSolved = false;
      state.r2BoardSolved = false;
    } else {
      state.stageView = "hard";
      state.r3CoatSolved = false;
      state.r3OscilloSolved = false;
      state.r3HnocsSolved = false;
    }

    const idx = roomIndex(state.difficulty);
    const loopsArr = state.localRole === "host" ? state.p1RoomLoops : state.p2RoomLoops;
    const curLoopVal = loopsArr[idx] ?? 0;
    loopsArr[idx] = Math.max(1, curLoopVal) + 1;
    state.loopCount = loopsArr[idx] ?? 1;
    state.timeLeftSeconds = 60;
    state.loopDurationSeconds = 60;
    state.timerRunning = true;

    reseedShuffles();
    saveActiveProgress();
    flashToast(`⏪ LOOP #0${state.loopCount} (60s) — Buttons reshuffled, Permanent Clues kept!`);
    renderState();
  }

  function handleObjectClick(id: RoomObjectId): void {
    if (state.localRole === "guest") {
      p2ControlledManually = true;
    }
    const inCorridor = state.stageView === "corridor-1" || state.stageView === "corridor-2";
    if (!state.timerRunning && !state.escaped && state.stageView !== "lobby" && !inCorridor) {
      state.timerRunning = true;
    }

    const meKey = state.localRole === "host" ? "p1" : "p2";

    switch (id) {
      case "r1-glovebox":
        openR1Glovebox();
        break;
      case "r1-crate":
        openR1Crate();
        break;
      case "r1-chem":
        openR1Chem();
        break;
      case "r1-map":
        openR1Map();
        break;
      case "r1-console":
        openR1Console();
        break;
      case "r1-door":
        if (isCurrentRoomAllSolved()) {
          state.timerRunning = false;
          if (meKey === "p1") {
            if (state.p1RoomLoops[0] === 0) state.p1RoomLoops[0] = 1;
            state.p1RoomsCleared = Math.max(state.p1RoomsCleared, 1);
          } else {
            if (state.p2RoomLoops[0] === 0) state.p2RoomLoops[0] = 1;
            state.p2RoomsCleared = Math.max(state.p2RoomsCleared, 1);
          }
          notifyOtherPlayerEscape(meKey, 1);
          zoomThroughDoorway(88, 48, () => {
            state.stageView = "corridor-1";
            state.corridorEqualized = false;
            state.timeLeftSeconds = 60;
            state.timerRunning = false;
            saveActiveProgress();
            flashToast("🚶 Escaped Room 1! Spin the Corridor Wheel to enter Room 2.");
          });
        } else {
          flashToast("🔒 Locked — grab Key in Glovebox, find Clue in Crate/Rack, then unlock Console!");
        }
        break;

      case "corridor-wheel":
        state.corridorEqualized = true;
        saveActiveProgress();
        flashToast("⚙️ Airlock equalized! Click the center Bulkhead Hatch for a fresh 60s room!");
        renderState();
        break;

      case "corridor-door":
        if (!state.corridorEqualized) {
          flashToast("⚙️ Click the white Pressure Wheel on the right wall first!");
          return;
        }
        zoomThroughDoorway(50, 68, () => {
          const nextDiff: DifficultyLevel = state.stageView === "corridor-1" ? "medium" : "hard";
          enterRoom(nextDiff, false);
        });
        break;

      case "r2-chalk":
        openR2Chalk();
        break;
      case "r2-wine":
        openR2Wine();
        break;
      case "r2-taps":
        openR2Taps();
        break;
      case "r2-board":
        openR2Board();
        break;
      case "r2-door":
        if (isCurrentRoomAllSolved()) {
          state.timerRunning = false;
          if (meKey === "p1") {
            if (state.p1RoomLoops[1] === 0) state.p1RoomLoops[1] = 1;
            state.p1RoomsCleared = Math.max(state.p1RoomsCleared, 2);
          } else {
            if (state.p2RoomLoops[1] === 0) state.p2RoomLoops[1] = 1;
            state.p2RoomsCleared = Math.max(state.p2RoomsCleared, 2);
          }
          notifyOtherPlayerEscape(meKey, 2);
          zoomThroughDoorway(51, 48, () => {
            state.stageView = "corridor-2";
            state.corridorEqualized = false;
            state.timeLeftSeconds = 60;
            state.timerRunning = false;
            saveActiveProgress();
            flashToast("🚶 Escaped Room 2! Spin the Corridor Wheel to enter Room 3.");
          });
        } else {
          flashToast("🔒 Locked — uncork hollow bottle in Wine Rack ➔ Bar Dispenser ➔ Suspect Board!");
        }
        break;

      case "r3-map":
        openR3Map();
        break;
      case "r3-graffiti":
        openR3Graffiti();
        break;
      case "r3-labcoat":
        openR3LabCoat();
        break;
      case "r3-oscillo":
        openR3Oscillo();
        break;
      case "r3-hnocs":
        openR3Hnocs();
        break;
      case "r3-exitdoor":
        if (isCurrentRoomAllSolved()) {
          state.timerRunning = false;
          if (meKey === "p1") {
            if (state.p1RoomLoops[2] === 0) state.p1RoomLoops[2] = 1;
            state.p1RoomsCleared = 3;
          } else {
            if (state.p2RoomLoops[2] === 0) state.p2RoomLoops[2] = 1;
            state.p2RoomsCleared = 3;
          }
          notifyOtherPlayerEscape(meKey, 3);
          zoomThroughDoorway(88, 44, () => {
            state.escaped = true;
            state.timerRunning = false;
            state.score += 1;
            saveActiveProgress();
            showEndModal();
          });
        } else {
          flashToast("🔒 Locked — inspect Wall Formulas ➔ CRT Oscilloscope ➔ HNOCS Console!");
        }
        break;
    }
  }

  function showEndModal(): void {
    endModalOpen = true;
    renderState();
  }

  function showReadableHint(badge: string, target: string, body: string): void {
    const bEl = container.querySelector<HTMLElement>("#hint-card-badge");
    const tEl = container.querySelector<HTMLElement>("#hint-card-target");
    const dEl = container.querySelector<HTMLElement>("#hint-card-body");
    if (bEl) bEl.textContent = `💡 ${badge}`;
    if (tEl) tEl.textContent = `📍 Click: ${target}`;
    if (dEl) dEl.textContent = body;
    hintCard?.classList.remove("hidden");
  }

  function giveSmartHint(): void {
    if (state.stageView === "corridor-1" || state.stageView === "corridor-2") {
      showReadableHint(
        "CORRIDOR PASSAGEWAY",
        state.corridorEqualized
          ? "PROCEED FORWARD HATCH (center turbine door)"
          : "PRESSURE WHEEL (white wheel on the right wall)",
        state.corridorEqualized
          ? "Click the center Bulkhead Hatch to enter the next room with a fresh 60s timer!"
          : "Click the white Valve Wheel on the right wall, then click the center Bulkhead Hatch.",
      );
      return;
    }

    if (state.difficulty === "basic") {
      if (!state.r1GloveSolved) {
        showReadableHint(
          "ROOM 1 — STEP 1 OF 3",
          "🧤 GLASS GLOVEBOX (lit glass case on the left ledge)",
          "Click the Glass Glovebox to collect the Console Key!",
        );
      } else if (!state.r1ChemSolved) {
        showReadableHint(
          "ROOM 1 — STEP 2 OF 3",
          "📦 SUPPLY CRATE (floor) or 🧪 CHEMISTRY RACK (upper-left wall)",
          "Search the Supply Crate on the floor (or Chemistry Rack) to uncover the 3-color order!",
        );
      } else if (!state.r1ConsoleSolved) {
        showReadableHint(
          "ROOM 1 — STEP 3 OF 3",
          "🎛️ STEEL CONSOLE (below the World Map)",
          "Enter the 3-color order from your Permanent Clues on the shuffled console buttons!",
        );
      } else {
        showReadableHint(
          "ROOM 1 — DOOR OPEN!",
          "🚪 BUNKER EXIT DOOR (far right)",
          "Click the open Bunker Exit Door on the right to step into the Corridor!",
        );
      }
      return;
    }

    if (state.difficulty === "medium") {
      if (!state.r2ChalkSolved) {
        showReadableHint(
          "ROOM 2 — STEP 1 OF 3",
          "🍷 WINE RACK (under the right bar counter)",
          "Check Chalk Outline for corkscrew, then click Wine Rack under bar to uncork hidden bottle!",
        );
      } else if (!state.r2TapsSolved) {
        showReadableHint(
          "ROOM 2 — STEP 2 OF 3",
          "🍺 6-TAP DISPENSER (right bar counter)",
          "Pull the 3 drinks from the hidden bottle scroll on the shuffled tap buttons!",
        );
      } else if (!state.r2BoardSolved) {
        showReadableHint(
          "ROOM 2 — STEP 3 OF 3",
          "🕵️ SUSPECT BOARD (left crimson wall)",
          "Click the suspect matching the eyewitness sketch from the hidden bottle!",
        );
      } else {
        showReadableHint(
          "ROOM 2 — DOOR OPEN!",
          "🚪 ROSSO'S DOOR (center back)",
          "Click the open mahogany ROSSO'S Door in the back to step through!",
        );
      }
      return;
    }

    if (!state.r3CoatSolved) {
      showReadableHint(
        "ROOM 3 — STEP 1 OF 3",
        "🧪 WALL FORMULAS (scrawled on the right mustard wall)",
        "Grab key from Lab Coat, then click Wall Formulas on right wall to decode hidden ring & atoms!",
      );
    } else if (!state.r3OscilloSolved) {
      showReadableHint(
        "ROOM 3 — STEP 2 OF 3",
        "📺 CRT OSCILLOSCOPE (on the grey concrete block)",
        "Select the circled wall ring frequency among the shuffled frequencies to power the console!",
      );
    } else if (!state.r3HnocsSolved) {
      showReadableHint(
        "ROOM 3 — STEP 3 OF 3",
        "🎛️ H·N·O·C·S CONSOLE (below the Outbreak Map)",
        "Tap the 3 uncrossed atoms from the wall formula on the shuffled console tiles!",
      );
    } else {
      showReadableHint(
        "ROOM 3 — EXIT OPEN!",
        "🚪 QUARANTINE EXIT DOOR (above the right steps)",
        "Click the open olive Quarantine Exit Door above the concrete steps to win!",
      );
    }
  }

  // =========================================================================
  // EVENT LISTENERS
  // =========================================================================

  function escapeChatHtml(raw: string): string {
    return raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Preview Switcher: View as Saif (Host) or Drek (Opponent) with independent room progress
  container.querySelectorAll<HTMLElement>("[data-role]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const role = btn.dataset.role as LocalPlayerRole | undefined;
      if (!role || role === state.localRole) return;
      saveActiveProgress();
      state.localRole = role;
      loadActiveProgress();
      inspectorModal?.classList.add("hidden");
      hintCard?.classList.add("hidden");
      endModalOpen = state.escaped;
      const cur = activeProg();
      if (cur.pendingEscapePopup) {
        showEscapeGreenPopup(cur.pendingEscapePopup);
        cur.pendingEscapePopup = "";
      }
      renderState();
    });
  });

  // Voice Microphones (In-Room PUBG Mic + Optional Lobby Mic — Symbol Only)
  container.querySelector("#btn-pubg-mic")?.addEventListener("click", toggleMicrophone);
  container.querySelector("#btn-lobby-mic")?.addEventListener("click", toggleMicrophone);

  // In-Lobby Chatbox Form
  container.querySelector("#lobby-chat-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = container.querySelector<HTMLInputElement>("#lobby-chat-input");
    const txt = input?.value.trim() ?? "";
    if (!txt) return;
    const sender: "p1" | "p2" = state.localRole === "host" ? "p1" : "p2";
    if (sender === "p2") {
      p2ControlledManually = true;
    }
    state.lobbyMessages.push({ sender, text: txt });
    if (input) input.value = "";
    renderState();

    if (sender === "p1" && !p2ControlledManually && !autoChatReplied) {
      autoChatReplied = true;
      window.setTimeout(() => {
        state.lobbyMessages.push({
          sender: "p2",
          text: `Copy that ${state.player1Name}! Let's escape together, partner 🤝`,
        });
        renderState();
      }, 750);
    }
  });

  // Lobby Bottom-Left Button: Role-Aware Ready / Waiting for Others / Start!
  container.querySelector("#btn-lobby-start")?.addEventListener("click", () => {
    if (state.localRole === "guest") {
      state.player2Ready = !state.player2Ready;
      renderState();
      return;
    }

    if (!state.player1Ready) {
      state.player1Ready = true;
      renderState();
      return;
    }

    if (state.player2Ready) {
      startFiveSecondLaunchCountdown();
    } else {
      state.player1Ready = false;
      renderState();
    }
  });

  container.querySelector("#btn-host-cancel-ready")?.addEventListener("click", () => {
    state.player1Ready = false;
    renderState();
  });

  container.querySelectorAll<HTMLElement>("[data-object-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.objectId as RoomObjectId | undefined;
      if (id) handleObjectClick(id);
    });
  });

  // Top Room Progression Tabs: Locked until previous rooms are escaped in order!
  container.querySelectorAll<HTMLElement>("[data-diff]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const diff = btn.dataset.diff as DifficultyLevel | undefined;
      if (!diff) return;

      if (state.stageView === "corridor-1" || state.stageView === "corridor-2") {
        flashToast("⚙️ Spin the Corridor Wheel & enter the Bulkhead Hatch ahead!");
        return;
      }

      const targetRoom = diff === "basic" ? 1 : diff === "medium" ? 2 : 3;
      const unlocked = activeProg().maxUnlockedRoom;

      if (targetRoom > unlocked) {
        if (targetRoom === 2) {
          flashToast("🔒 Locked! Escape Room 1 first before entering Room 2!");
        } else {
          flashToast(
            unlocked < 2
              ? "🔒 Locked! Escape Room 1 and Room 2 in order before entering Room 3!"
              : "🔒 Locked! Escape Room 2 first before entering Room 3!",
          );
        }
        return;
      }

      if (targetRoom < unlocked) {
        flashToast(`✓ Room ${targetRoom} already escaped — finish Room ${unlocked}!`);
        return;
      }
    });
  });

  container.querySelector("#btn-hint")?.addEventListener("click", giveSmartHint);
  container.querySelector("#btn-close-hint")?.addEventListener("click", () => {
    hintCard?.classList.add("hidden");
  });

  container.querySelector("#btn-start-loop")?.addEventListener("click", () => {
    state.timerRunning = true;
    saveActiveProgress();
    renderState();
  });
  container.querySelector("#btn-pause-loop")?.addEventListener("click", () => {
    state.timerRunning = false;
    saveActiveProgress();
    renderState();
  });
  container.querySelector("#btn-reset-loop")?.addEventListener("click", resetLoop);

  container.querySelector("#btn-close-inspector")?.addEventListener("click", closeModals);
  container.querySelector("#btn-close-score")?.addEventListener("click", closeModals);

  container.querySelector("#btn-open-lobby")?.addEventListener("click", () => {
    closeModals();
    state.timerRunning = false;
    state.rematchInvitedBy = null;
    state.stageView = "lobby";
    p1Prog.stageView = "lobby";
    p1Prog.timerRunning = false;
    p2Prog.stageView = "lobby";
    p2Prog.timerRunning = false;
    renderState();
  });

  container.querySelector("#btn-scoreboard")?.addEventListener("click", () => {
    showEndModal();
  });

  // End-of-Game Actions: Perspective-Aware Rematch Invite + Exit to Lobby!
  container.querySelector("#btn-invite-rematch")?.addEventListener("click", () => {
    const myKey: RematchSender = state.localRole === "host" ? "p1" : "p2";
    state.rematchInvitedBy = state.rematchInvitedBy === myKey ? null : myKey;
    renderState();
  });
  container.querySelector("#btn-pubg-accept")?.addEventListener("click", () => {
    state.rematchInvitedBy = null;
    endModalOpen = false;
    startFiveSecondLaunchCountdown();
  });
  container.querySelector("#btn-pubg-reject")?.addEventListener("click", () => {
    state.rematchInvitedBy = null;
    endModalOpen = false;
    state.player1Ready = false;
    state.player2Ready = false;
    state.stageView = "lobby";
    p1Prog.stageView = "lobby";
    p1Prog.timerRunning = false;
    p2Prog.stageView = "lobby";
    p2Prog.timerRunning = false;
    renderState();
  });

  container.querySelector("#btn-exit-lobby")?.addEventListener("click", () => {
    state.rematchInvitedBy = null;
    closeModals();
    state.timerRunning = false;
    state.escaped = false;
    state.player1Ready = false;
    state.player2Ready = false;
    state.stageView = "lobby";
    p1Prog.stageView = "lobby";
    p1Prog.timerRunning = false;
    p2Prog.stageView = "lobby";
    p2Prog.timerRunning = false;
    renderState();
  });

  // =========================================================================
  // RENDER STATE
  // =========================================================================

  function renderItemIcon(item: InventoryItemId): string {
    if (item === "Console Key") return "🔑";
    if (item === "Brass Corkscrew") return "🍾";
    if (item === "Bar Token") return "🪙";
    if (item === "Oscilloscope Key") return "🔌";
    if (item === "Silver Door Key") return "🗝️";
    return "📦";
  }

  function renderState(): void {
    const inLobby = state.stageView === "lobby";
    lobbySceneEl?.classList.toggle("hidden", !inLobby);
    headerEl?.classList.toggle("hidden", inLobby);
    mainEl?.classList.toggle("hidden", inLobby);

    const inCorridor = state.stageView === "corridor-1" || state.stageView === "corridor-2";
    sceneBasic?.classList.toggle("hidden", state.stageView !== "basic");
    sceneCorridor?.classList.toggle("hidden", !inCorridor);
    sceneMedium?.classList.toggle("hidden", state.stageView !== "medium");
    sceneHard?.classList.toggle("hidden", state.stageView !== "hard");

    const modalOpen = !inspectorModal?.classList.contains("hidden");
    blurTarget?.classList.toggle("tle-room-blurred", Boolean(modalOpen));

    const loopEl = container.querySelector<HTMLElement>("#hud-loop");
    if (loopEl) loopEl.textContent = `LOOP ${String(state.loopCount).padStart(2, "0")}`;

    const memEl = container.querySelector<HTMLElement>("#hud-memory");
    if (memEl) {
      const memoryCount = Math.min(4, Math.max(1, state.clues.length + 1));
      memEl.textContent = `MEMORY ${memoryCount}/4`;
    }

    const timerEl = container.querySelector<HTMLElement>("#hud-timer-val");
    if (timerEl) timerEl.textContent = formatTime(state.timeLeftSeconds);

    const progEl = container.querySelector<HTMLElement>("#hud-timer-progress");
    if (progEl) {
      const pct = Math.max(
        0,
        Math.min(100, (state.timeLeftSeconds / Math.max(1, state.loopDurationSeconds)) * 100),
      );
      progEl.style.width = `${pct}%`;
    }

    // Sequential Top-Bar Room Unlocking (Room 1 -> 🔒 Room 2 -> 🔒 Room 3)
    const unlocked = activeProg().maxUnlockedRoom;
    const myCleared = state.localRole === "host" ? state.p1RoomsCleared : state.p2RoomsCleared;
    const btnBasic = container.querySelector<HTMLElement>("#btn-diff-basic");
    const btnMed = container.querySelector<HTMLElement>("#btn-diff-medium");
    const btnHard = container.querySelector<HTMLElement>("#btn-diff-hard");

    if (btnBasic) {
      btnBasic.textContent = myCleared >= 1 ? "✓ Room 1" : "Room 1";
      btnBasic.classList.toggle("tle-diff-active", state.difficulty === "basic" && !inCorridor);
      btnBasic.classList.remove("tle-diff-locked");
    }
    if (btnMed) {
      btnMed.textContent = myCleared >= 2 ? "✓ Room 2" : unlocked >= 2 ? "Room 2" : "🔒 Room 2";
      btnMed.classList.toggle("tle-diff-active", state.difficulty === "medium" && !inCorridor);
      btnMed.classList.toggle("tle-diff-locked", unlocked < 2);
    }
    if (btnHard) {
      btnHard.textContent = myCleared >= 3 ? "✓ Room 3" : unlocked >= 3 ? "Room 3" : "🔒 Room 3";
      btnHard.classList.toggle("tle-diff-active", state.difficulty === "hard" && !inCorridor);
      btnHard.classList.toggle("tle-diff-locked", unlocked < 3);
    }

    const startBtn = container.querySelector<HTMLButtonElement>("#btn-start-loop");
    const pauseBtn = container.querySelector<HTMLButtonElement>("#btn-pause-loop");
    if (pauseBtn) {
      pauseBtn.textContent = state.timerRunning ? "⏸ Pause" : "▶ Resume";
    }
    if (startBtn) {
      startBtn.disabled = state.timerRunning;
    }

    // 3D Door Swing States & Solved Badges
    const r1Open = state.difficulty === "basic" && isCurrentRoomAllSolved();
    const r2Open = state.difficulty === "medium" && isCurrentRoomAllSolved();
    const r3Open = state.difficulty === "hard" && isCurrentRoomAllSolved();
    container.querySelector("#r1-door-wrap")?.classList.toggle("tle-door-open", r1Open);
    container.querySelector("#r2-door-wrap")?.classList.toggle("tle-door-open", r2Open);
    container.querySelector("#r3-door-wrap")?.classList.toggle("tle-door-open", r3Open);

    const r1DoorTag = container.querySelector<HTMLElement>("#tag-r1-door");
    if (r1DoorTag) {
      r1DoorTag.textContent = r1Open ? "🚪 ENTER DOOR ➔" : "🚪 BUNKER EXIT";
      r1DoorTag.classList.toggle("tle-tag-solved", r1Open);
    }
    const r2DoorTag = container.querySelector<HTMLElement>("#tag-r2-door");
    if (r2DoorTag) {
      r2DoorTag.textContent = r2Open ? "🚪 ENTER DOOR ➔" : "🚪 ROSSO'S DOOR";
      r2DoorTag.classList.toggle("tle-tag-solved", r2Open);
    }
    const r3DoorTag = container.querySelector<HTMLElement>("#tag-r3-door");
    if (r3DoorTag) {
      r3DoorTag.textContent = r3Open ? "🚪 ESCAPE DOOR ➔" : "🚪 QUARANTINE EXIT";
      r3DoorTag.classList.toggle("tle-tag-solved", r3Open);
    }

    container.querySelector("#tag-r1-glove")?.classList.toggle("tle-tag-solved", state.r1GloveSolved);
    container.querySelector("#tag-r1-chem")?.classList.toggle("tle-tag-solved", state.r1ChemSolved);
    container.querySelector("#tag-r1-crate")?.classList.toggle("tle-tag-solved", state.r1ChemSolved);
    container.querySelector("#tag-r1-console")?.classList.toggle("tle-tag-solved", state.r1ConsoleSolved);
    container
      .querySelector("#tag-r2-chalk")
      ?.classList.toggle(
        "tle-tag-solved",
        state.inventory.includes("Brass Corkscrew") || state.r2ChalkSolved,
      );
    container.querySelector("#tag-r2-wine")?.classList.toggle("tle-tag-solved", state.r2ChalkSolved);
    container.querySelector("#tag-r2-taps")?.classList.toggle("tle-tag-solved", state.r2TapsSolved);
    container.querySelector("#tag-r2-board")?.classList.toggle("tle-tag-solved", state.r2BoardSolved);
    container
      .querySelector("#tag-r3-coat")
      ?.classList.toggle(
        "tle-tag-solved",
        state.inventory.includes("Oscilloscope Key") || state.r3CoatSolved,
      );
    container.querySelector("#tag-r3-graffiti")?.classList.toggle("tle-tag-solved", state.r3CoatSolved);
    container.querySelector("#tag-r3-oscillo")?.classList.toggle("tle-tag-solved", state.r3OscilloSolved);
    container.querySelector("#tag-r3-hnocs")?.classList.toggle("tle-tag-solved", state.r3HnocsSolved);

    // Corridor LED Columns light up green when wheel turned!
    container.querySelectorAll("#corridor-led-cols rect").forEach((r) => {
      r.setAttribute("fill", state.corridorEqualized ? "#22c55e" : "#27272a");
    });

    // Preview Switcher Bar + Fixed Robot Nameplates (Saif on Robot 1, Drek on Robot 2)
    const perspBar = container.querySelector<HTMLElement>("#perspective-bar");
    perspBar?.classList.toggle("hidden", !state.showTestRoleSwitcher);
    perspBar?.classList.toggle(
      "tle-persp-in-game",
      !inLobby && !endModalOpen && !state.escaped && state.rematchInvitedBy === null,
    );
    container.querySelectorAll<HTMLElement>("[data-role]").forEach((btn) => {
      btn.classList.toggle("tle-role-active", btn.dataset.role === state.localRole);
    });

    const p1BotName = container.querySelector<HTMLElement>("#lobby-bot-p1-name");
    const p2BotName = container.querySelector<HTMLElement>("#lobby-bot-p2-name");
    if (p1BotName) p1BotName.textContent = state.player1Name;
    if (p2BotName) p2BotName.textContent = state.player2Name;
    container.querySelector("#you-chip-p1")?.classList.toggle("hidden", state.localRole !== "host");
    container.querySelector("#you-chip-p2")?.classList.toggle("hidden", state.localRole !== "guest");

    // Both Voice Microphones (In-Room PUBG Mic + Optional Lobby Mic — Symbol Only)
    const micBtn = container.querySelector<HTMLElement>("#btn-pubg-mic");
    const micMutedSvg = container.querySelector<HTMLElement>("#mic-svg-muted");
    const micLiveSvg = container.querySelector<HTMLElement>("#mic-svg-live");
    micBtn?.classList.toggle("tle-mic-live", !state.micMuted);
    micMutedSvg?.classList.toggle("hidden", !state.micMuted);
    micLiveSvg?.classList.toggle("hidden", state.micMuted);

    const lobbyMicBtn = container.querySelector<HTMLElement>("#btn-lobby-mic");
    const lobbyMicMuted = container.querySelector<HTMLElement>("#lobby-mic-muted");
    const lobbyMicLive = container.querySelector<HTMLElement>("#lobby-mic-live");
    lobbyMicBtn?.classList.toggle("tle-mic-live", !state.micMuted);
    lobbyMicMuted?.classList.toggle("hidden", !state.micMuted);
    lobbyMicLive?.classList.toggle("hidden", state.micMuted);

    // In-Lobby Chatbox Messages
    const chatLog = container.querySelector<HTMLElement>("#lobby-chat-log");
    if (chatLog) {
      chatLog.innerHTML = state.lobbyMessages
        .map((m) => {
          const sName = m.sender === "p1" ? state.player1Name : state.player2Name;
          const sCls = m.sender === "p1" ? "tle-chat-sender-p1" : "tle-chat-sender-p2";
          return (
            `<div class="tle-chat-msg">` +
            `<span class="${sCls}">${escapeChatHtml(sName)}:</span> ` +
            `${escapeChatHtml(m.text)}</div>`
          );
        })
        .join("");
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    // Lobby Name Box Green Checkmarks (Visible to BOTH Saif & Drek!)
    container.querySelector("#lobby-box-p1")?.classList.toggle("tle-nameplate-ready", state.player1Ready);
    container.querySelector("#lobby-box-p2")?.classList.toggle("tle-nameplate-ready", state.player2Ready);
    container.querySelector("#saif-ready-tick")?.classList.toggle("hidden", !state.player1Ready);
    container.querySelector("#drek-ready-tick")?.classList.toggle("hidden", !state.player2Ready);

    // Lobby Bottom-Left Button (Host vs Opponent Ready / Waiting / Start!)
    const lobbyBtn = container.querySelector<HTMLButtonElement>("#btn-lobby-start");
    const cancelReadyBtn = container.querySelector<HTMLElement>("#btn-host-cancel-ready");
    if (lobbyBtn) {
      lobbyBtn.classList.remove("tle-lobby-btn-green", "tle-lobby-btn-gray", "tle-lobby-btn-waiting");
      if (state.localRole === "guest") {
        lobbyBtn.textContent = "READY";
        lobbyBtn.classList.add(state.player2Ready ? "tle-lobby-btn-green" : "tle-lobby-btn-gray");
        cancelReadyBtn?.classList.add("hidden");
      } else if (!state.player1Ready) {
        lobbyBtn.textContent = "READY";
        lobbyBtn.classList.add("tle-lobby-btn-gray");
        cancelReadyBtn?.classList.add("hidden");
      } else if (!state.player2Ready) {
        lobbyBtn.textContent = "WAITING FOR OTHERS";
        lobbyBtn.classList.add("tle-lobby-btn-waiting");
        cancelReadyBtn?.classList.add("hidden");
      } else {
        lobbyBtn.textContent = "▶ START";
        lobbyBtn.classList.add("tle-lobby-btn-green");
        cancelReadyBtn?.classList.remove("hidden");
      }
    }

    // End-of-Game Modal & Perspective-Aware Rematch Invite ("Saif invited you..." / "Drek invited you...")
    const isRecipient =
      (state.rematchInvitedBy === "p1" && state.localRole === "guest") ||
      (state.rematchInvitedBy === "p2" && state.localRole === "host");
    const pubgDrawer = container.querySelector<HTMLElement>("#pubg-side-drawer");
    const inviteTextEl = container.querySelector<HTMLElement>("#pubg-invite-text");
    if (inviteTextEl && state.rematchInvitedBy) {
      const inviterName = state.rematchInvitedBy === "p1" ? state.player1Name : state.player2Name;
      inviteTextEl.textContent = `${inviterName} invited you for a rematch`;
    }
    pubgDrawer?.classList.toggle("tle-side-hidden", !isRecipient);

    const showScoreModal = endModalOpen && !isRecipient && !inLobby;
    scoreModal?.classList.toggle("hidden", !showScoreModal);
    if (showScoreModal) {
      const titleEl = container.querySelector<HTMLElement>("#score-modal-title");
      if (titleEl) {
        titleEl.textContent = state.escaped ? "🏆 ESCAPE COMPLETE — FINAL STATS" : "📊 LIVE MATCH STATS";
      }

      const otherName = state.localRole === "host" ? state.player2Name : state.player1Name;
      const myName = state.localRole === "host" ? state.player1Name : state.player2Name;
      const myKey: RematchSender = state.localRole === "host" ? "p1" : "p2";
      const iSent = state.rematchInvitedBy === myKey;

      const myLoopsArr = state.localRole === "host" ? state.p1RoomLoops : state.p2RoomLoops;
      const oppLoopsArr = state.localRole === "host" ? state.p2RoomLoops : state.p1RoomLoops;
      const myTotalLoops = Math.max(1, myLoopsArr[0] + myLoopsArr[1] + myLoopsArr[2]);
      const oppRawSum = oppLoopsArr[0] + oppLoopsArr[1] + oppLoopsArr[2];
      const oppTotalLoops = Math.max(
        1,
        state.localRole === "host" && oppRawSum === 0 ? state.friendLoopCount : oppRawSum,
      );

      const myTime = state.localRole === "host" ? state.p1TimeSpentSeconds : state.p2TimeSpentSeconds;
      const oppTime = state.localRole === "host" ? state.p2TimeSpentSeconds : state.p1TimeSpentSeconds;
      const myRooms =
        state.localRole === "host"
          ? state.escaped
            ? 3
            : state.p1RoomsCleared
          : state.escaped
            ? 3
            : state.p2RoomsCleared;
      const oppRooms = state.localRole === "host" ? state.p2RoomsCleared : state.p1RoomsCleared;

      const bannerEl = container.querySelector<HTMLElement>("#stats-winner-banner");
      if (bannerEl) {
        if (!state.escaped) {
          bannerEl.textContent =
            `⏱️ Match in progress — ${myName}: ${myRooms}/3 rooms · ` + `${otherName}: ${oppRooms}/3 rooms`;
        } else if (myTotalLoops < oppTotalLoops) {
          bannerEl.textContent =
            `🥇 ${myName} escaped in fewer loops! (${myTotalLoops} vs ${otherName}'s ` +
            `${oppTotalLoops} loops)`;
        } else if (oppTotalLoops < myTotalLoops) {
          bannerEl.textContent =
            `🥇 ${otherName} escaped in fewer loops! (${oppTotalLoops} vs your ` + `${myTotalLoops} loops)`;
        } else {
          bannerEl.textContent = `🤝 Tied! Both ${myName} & ${otherName} took ${myTotalLoops} loop(s)`;
        }
      }

      const fmtRoomLoop = (n: number): string => (n <= 0 ? "—" : `${n} ${n === 1 ? "loop" : "loops"}`);

      const meCol = container.querySelector<HTMLElement>("#stats-col-me");
      if (meCol) {
        meCol.innerHTML = `
          <div class="tle-stat-player-head">👤 ${myName} (You)</div>
          <div class="tle-stat-hero-box">
            <span class="tle-stat-hero-num">${myTotalLoops}</span>
            <span class="tle-stat-hero-sub">YOUR TOTAL LOOPS</span>
          </div>
          <div class="tle-stat-row">
            <span>Room 1 (Bio-Bunker)</span>
            <strong>${fmtRoomLoop(myLoopsArr[0])}</strong>
          </div>
          <div class="tle-stat-row">
            <span>Room 2 (Speakeasy)</span>
            <strong>${fmtRoomLoop(myLoopsArr[1])}</strong>
          </div>
          <div class="tle-stat-row">
            <span>Room 3 (Command Lab)</span>
            <strong>${fmtRoomLoop(myLoopsArr[2])}</strong>
          </div>
          <div class="tle-stat-row">
            <span>Rooms Escaped</span>
            <strong>${myRooms} / 3</strong>
          </div>
          <div class="tle-stat-row">
            <span>Time Spent</span>
            <strong>${formatTime(myTime)}</strong>
          </div>
        `;
      }

      const oppCol = container.querySelector<HTMLElement>("#stats-col-opp");
      if (oppCol) {
        oppCol.innerHTML = `
          <div class="tle-stat-player-head">🤖 ${otherName}</div>
          <div class="tle-stat-hero-box">
            <span class="tle-stat-hero-num">${oppTotalLoops}</span>
            <span class="tle-stat-hero-sub">LOOPS ${otherName.toUpperCase()} TOOK</span>
          </div>
          <div class="tle-stat-row">
            <span>Room 1 (Bio-Bunker)</span>
            <strong>${fmtRoomLoop(oppLoopsArr[0])}</strong>
          </div>
          <div class="tle-stat-row">
            <span>Room 2 (Speakeasy)</span>
            <strong>${fmtRoomLoop(oppLoopsArr[1])}</strong>
          </div>
          <div class="tle-stat-row">
            <span>Room 3 (Command Lab)</span>
            <strong>${fmtRoomLoop(oppLoopsArr[2])}</strong>
          </div>
          <div class="tle-stat-row">
            <span>Rooms Escaped</span>
            <strong>${oppRooms} / 3</strong>
          </div>
          <div class="tle-stat-row">
            <span>Time Spent</span>
            <strong>${formatTime(oppTime)}</strong>
          </div>
        `;
      }

      const rematchBtn = container.querySelector<HTMLElement>("#btn-invite-rematch");
      const senderHint = container.querySelector<HTMLElement>("#rematch-sender-hint");
      if (rematchBtn) {
        rematchBtn.textContent = iSent
          ? `⏳ Invite Sent to ${otherName} (Cancel)`
          : `⚔️ Invite ${otherName} for Rematch`;
      }
      if (senderHint) {
        senderHint.classList.toggle("hidden", !iSent);
        senderHint.textContent = iSent
          ? `📨 Switch Preview to ${otherName} (top-right) to see: "${myName} invited you for a rematch"`
          : "";
      }
    }

    // Right Sidebar: Room Progress
    const solvedCount = countRoomSolved();
    const ratioEl = container.querySelector<HTMLElement>("#hud-tasks-ratio");
    if (ratioEl) ratioEl.textContent = `${solvedCount} / ${totalRoomTasks()}`;

    const tasksEl = container.querySelector<HTMLElement>("#tasks-checklist");
    if (tasksEl) {
      const rows =
        state.difficulty === "basic"
          ? [
              { done: state.r1GloveSolved, label: "1. Check Glass Glovebox" },
              { done: state.r1ConsoleSolved, label: "2. Tap Shuffled Color Order" },
            ]
          : state.difficulty === "medium"
            ? [
                { done: state.r2ChalkSolved, label: "1. Inspect Chalk Outline" },
                { done: state.r2TapsSolved, label: "2. Pour Shuffled Drink Order" },
                { done: state.r2BoardSolved, label: "3. Pick Culprit on Board" },
              ]
            : [
                { done: state.r3CoatSolved, label: "1. Check Lab Coat & Radio" },
                { done: state.r3OscilloSolved, label: "2. Select 8 Hz on CRT" },
                { done: state.r3HnocsSolved, label: "3. Tap C-O-N on Console" },
              ];
      tasksEl.innerHTML = rows
        .map(
          (r) => `
          <div class="tle-task-row ${r.done ? "tle-task-done" : ""}">
            <span>${r.done ? "✅" : "⬜"}</span>
            <span>${r.label}</span>
          </div>`,
        )
        .join("");
    }

    // Inventory (Selected items use muted purple border/background, no large glow)
    const invEl = container.querySelector<HTMLElement>("#inventory-list");
    if (invEl) {
      const cells: string[] = [];
      for (let i = 0; i < 3; i += 1) {
        const item = state.inventory[i];
        if (item) {
          const isSelected = state.selectedInventoryItem === item;
          cells.push(`
            <button
              type="button"
              class="tle-inv-slot tle-slot-filled ${isSelected ? "tle-inv-selected" : ""}"
              data-inv-item="${item}"
              title="Click to select ${item}"
            >
              <span style="font-size: 1.25rem">${renderItemIcon(item)}</span>
              <span class="tle-slot-name">${item}</span>
            </button>
          `);
        } else {
          cells.push(`
            <div class="tle-inv-slot">
              <span class="tle-slot-empty">EMPTY</span>
            </div>
          `);
        }
      }
      invEl.innerHTML = cells.join("");
      invEl.querySelectorAll<HTMLElement>("[data-inv-item]").forEach((slot) => {
        slot.addEventListener("click", () => {
          const itm = slot.dataset.invItem as InventoryItemId | undefined;
          if (itm) {
            state.selectedInventoryItem = state.selectedInventoryItem === itm ? null : itm;
            renderState();
          }
        });
      });
    }

    // Permanent Clues
    const cluesEl = container.querySelector<HTMLElement>("#clues-list");
    if (cluesEl) {
      if (state.clues.length === 0) {
        const tip =
          state.difficulty === "basic"
            ? "Click the lit Glass Glovebox on the left ledge (1 click grabs key & clue)!"
            : state.difficulty === "medium"
              ? "Click the white Chalk Outline on the floor for both Room 2 clues!"
              : "Click the draped Lab Coat & Radio at the corner desk for both Room 3 clues!";
        cluesEl.innerHTML = `<li class="tle-clue-empty">${tip}</li>`;
      } else {
        cluesEl.innerHTML = state.clues.map((c) => `<li class="tle-clue-item">${c}</li>`).join("");
      }
    }
  }

  function update(partial: Partial<GameScreenState>): void {
    const prevTime = state.timeLeftSeconds;
    const isTick =
      partial.timeLeftSeconds !== undefined &&
      partial.timeLeftSeconds < prevTime &&
      !state.escaped &&
      state.stageView !== "lobby";

    if (isTick) {
      const delta = prevTime - (partial.timeLeftSeconds ?? prevTime);
      if (state.localRole === "host") {
        state.p1TimeSpentSeconds += delta;
      } else {
        state.p2TimeSpentSeconds += delta;
      }
    }

    if (partial.opponentEscapedRoom) {
      const otherName = state.localRole === "host" ? state.player2Name : state.player1Name;
      showEscapeGreenPopup(`${otherName} escaped Room ${partial.opponentEscapedRoom}`);
    }

    state = {
      ...state,
      ...partial,
      lobbyMessages: partial.lobbyMessages ? [...partial.lobbyMessages] : state.lobbyMessages,
      p1RoomLoops: partial.p1RoomLoops ? [...partial.p1RoomLoops] : state.p1RoomLoops,
      p2RoomLoops: partial.p2RoomLoops ? [...partial.p2RoomLoops] : state.p2RoomLoops,
      clues: partial.clues ? [...partial.clues] : state.clues,
      inventory: partial.inventory ? [...partial.inventory] : state.inventory,
    };
    saveActiveProgress();

    // Realistic independent opponent progress when solo-testing as Saif
    if (isTick && state.localRole === "host" && !p2ControlledManually && !p2Prog.escaped) {
      matchElapsedTicks += 1;
      state.p2TimeSpentSeconds += 1;
      p2Prog.timeLeftSeconds = Math.max(1, p2Prog.timeLeftSeconds - 1);

      if (matchElapsedTicks === 35 && state.p2RoomsCleared < 1) {
        state.p2RoomsCleared = 1;
        state.p2RoomLoops[0] = 1;
        state.p2RoomLoops[1] = 1;
        p2Prog.maxUnlockedRoom = 2;
        p2Prog.difficulty = "medium";
        p2Prog.stageView = "medium";
        p2Prog.loopCount = 1;
        p2Prog.timeLeftSeconds = 60;
        showEscapeGreenPopup(`${state.player2Name} escaped Room 1`);
      } else if (matchElapsedTicks === 76 && state.p2RoomsCleared < 2) {
        state.p2RoomsCleared = 2;
        state.p2RoomLoops[1] = 2;
        state.p2RoomLoops[2] = 1;
        p2Prog.maxUnlockedRoom = 3;
        p2Prog.difficulty = "hard";
        p2Prog.stageView = "hard";
        p2Prog.loopCount = 1;
        p2Prog.timeLeftSeconds = 60;
        showEscapeGreenPopup(`${state.player2Name} escaped Room 2`);
      } else if (matchElapsedTicks === 114 && state.p2RoomsCleared < 3) {
        state.p2RoomsCleared = 3;
        state.p2RoomLoops[2] = 1;
        p2Prog.escaped = true;
        p2Prog.timerRunning = false;
        showEscapeGreenPopup(`${state.player2Name} escaped Room 3`);
      }
    }

    if (partial.escaped) {
      endModalOpen = true;
    }

    if (
      partial.timeLeftSeconds !== undefined &&
      partial.timeLeftSeconds <= 0 &&
      prevTime > 0 &&
      !state.escaped &&
      state.stageView !== "lobby"
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
