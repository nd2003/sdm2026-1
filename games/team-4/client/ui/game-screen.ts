export type RoomObjectId =
  | "note"
  | "painting"
  | "key"
  | "cabinet"
  | "photo"
  | "computer"
  | "door"
  | "clock";

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
  pingedObjectId?: RoomObjectId | null;
  uvMode?: boolean;
  paintingClicks?: number;
  keyRevealed?: boolean;
  keyCollected?: boolean;
  cabinetUnlocked?: boolean;
  doorUnlocked?: boolean;
  escaped?: boolean;
  clues?: string[];
  inventory?: string[];
  feedbackMessage?: string;
  coopLog?: string;
  onObjectInteract?: (
    objectId: RoomObjectId,
    action: "select" | "inspect" | "interact" | "ping",
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
  pingedObjectId: RoomObjectId | null;
  uvMode: boolean;
  paintingClicks: number;
  keyRevealed: boolean;
  keyCollected: boolean;
  cabinetUnlocked: boolean;
  doorUnlocked: boolean;
  escaped: boolean;
  clues: string[];
  inventory: string[];
  feedbackMessage: string;
  coopLog: string;
}

const OBJECT_LABELS: Record<RoomObjectId, string> = {
  note: "Evidence Board",
  painting: "Cobalt Painting",
  key: "Hidden Brass Key",
  cabinet: "Cryo-Steel Safe",
  photo: "Archive Photo '84",
  computer: "Chronos Terminal",
  door: "Temporal Airlock",
  clock: "Anomaly Chronometer",
};

const COMPUTER_PASSCODE = "1984";
const RING_CIRCUMFERENCE = 113.1; // 2 * Math.PI * 18

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
    roomId: initialState?.roomId ?? "CHAMBER-04",
    timeLeftSeconds: initialState?.timeLeftSeconds ?? 60,
    loopDurationSeconds: initialState?.loopDurationSeconds ?? 60,
    loopCount: initialState?.loopCount ?? 1,
    connectedPlayers: initialState?.connectedPlayers ?? 2,
    maxPlayers: initialState?.maxPlayers ?? 2,
    score: initialState?.score ?? 0,
    statusText: initialState?.statusText ?? "Temporal Loop Stable",
    selectedObjectId: initialState?.selectedObjectId ?? null,
    pingedObjectId: initialState?.pingedObjectId ?? null,
    uvMode: initialState?.uvMode ?? false,
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
      "Explore the chamber, toggle UV Blacklight, or click objects before the 60s loop collapses.",
    coopLog: initialState?.coopLog ?? "P2 connected · Synchronized on Temporal Frequency 04",
  };

  container.innerHTML = `
    <div class="game-screen-layout" id="game-screen-root">
      <!-- Top Chrono HUD -->
      <header class="game-hud">
        <div class="hud-group">
          <span class="hud-badge team-badge">TEAM 4 · CHRONO</span>
          <span class="hud-meta" id="hud-room">${state.roomId}</span>
          <span class="hud-pill" id="hud-players">
            <span class="pulse-dot"></span> ${state.connectedPlayers}/${state.maxPlayers} Co-op
          </span>
        </div>

        <div class="hud-center">
          <div class="chrono-cluster">
            <div class="chrono-ring-wrap">
              <svg class="chrono-ring-svg" viewBox="0 0 44 44">
                <circle class="chrono-ring-bg" cx="22" cy="22" r="18"></circle>
                <circle
                  class="chrono-ring-fg"
                  id="chrono-ring-fg"
                  cx="22"
                  cy="22"
                  r="18"
                  stroke-dasharray="${RING_CIRCUMFERENCE}"
                  stroke-dashoffset="0"
                ></circle>
              </svg>
              <span class="chrono-ring-icon">⏳</span>
            </div>
            <div class="chrono-readout">
              <div class="hud-timer-row">
                <span class="hud-loop-badge" id="hud-loop">LOOP #${state.loopCount}</span>
                <div class="hud-timer" id="hud-timer">
                  <span id="hud-timer-val">${formatTime(state.timeLeftSeconds)}</span>
                </div>
                <span class="stability-tag" id="stability-tag">STABLE</span>
              </div>
              <div class="hud-timer-track" aria-hidden="true">
                <div class="hud-timer-fill" id="hud-timer-fill"></div>
              </div>
              <div class="hud-status" id="hud-status">${state.statusText}</div>
            </div>
          </div>
        </div>

        <div class="hud-group hud-right">
          <div class="hud-score">PTS <strong id="hud-score-val">${state.score}</strong></div>
          <button
            type="button"
            class="hud-btn hud-btn-uv"
            id="btn-uv-toggle"
            title="Toggle UV Blacklight Vision"
          >
            🔦 UV Light
          </button>
          <button
            type="button"
            class="hud-btn"
            id="btn-reset-loop"
            title="Trigger manual time loop rewind"
          >
            ⏪ Rewind
          </button>
          <button type="button" class="hud-btn" id="btn-pause-menu">☰ Menu</button>
        </div>
      </header>

      <!-- Main Body: 3D Chamber Viewport + Sidebar Memory Dock -->
      <main class="game-body">
        <section class="game-viewport-wrapper">
          <div class="game-viewport" id="game-viewport">
            <!-- Temporal Collapse Rewind Banner -->
            <div class="loop-reset-banner hidden" id="loop-reset-banner">
              ⚡ TEMPORAL COLLAPSE — Physical items vanished, but neural clues survived the loop!
            </div>

            <!-- Co-op Partner Comms Bar -->
            <div class="coop-comms-bar">
              <span class="coop-Status-pill">📡 CO-OP LINK</span>
              <span class="coop-log-text" id="coop-log-text">${state.coopLog}</span>
              <span class="puzzle-chain-pills" id="puzzle-chain-pills"></span>
            </div>

            <!-- 3D Architectural Escape Room Scene -->
            <div class="escape-room-scene" id="escape-room-scene">
              <!-- Perspective Room Geometry -->
              <div class="room-wall-left"></div>
              <div class="room-wall-right"></div>
              <div class="room-wall-back">
                <div class="room-ceiling-trim">TEMPORAL CONTAINMENT CHAMBER · SECTOR 04</div>
                <!-- Hidden UV Graffiti only visible in UV Mode -->
                <div class="uv-graffiti uv-graffiti-left">
                  UV ECHO #1: "FOUR TAPS ON COBALT REVEALS THE KEY"
                </div>
                <div class="uv-graffiti uv-graffiti-right">
                  UV ECHO #2: "THE ARCHIVE YEAR OPENS THE TERMINAL"
                </div>
              </div>
              <div class="room-floor-area">
                <div class="floor-grid-lines"></div>
              </div>

              <!-- glowing circuit trace between Terminal PC and Airlock Door -->
              <div class="power-conduit-line" id="power-conduit-line"></div>

              <!-- Object 0: Anomaly Chronometer above Airlock -->
              <button
                type="button"
                class="room-object pos-clock"
                data-object-id="clock"
                id="obj-clock"
              >
                <span class="obj-hotspot"></span>
                <span class="obj-icon">🕰️</span>
                <span class="obj-title">Chronometer</span>
                <span class="obj-state" id="state-clock">60s Cycle</span>
              </button>

              <!-- Object 1: Evidence Board & Sticky Note (Left Wall) -->
              <button
                type="button"
                class="room-object pos-note"
                data-object-id="note"
                id="obj-note"
              >
                <span class="obj-hotspot"></span>
                <span class="obj-icon">📌</span>
                <span class="obj-title">Evidence Board</span>
                <span class="obj-state" id="state-note">Clue: BLUE-4</span>
              </button>

              <!-- Object 2: Cobalt Blue Painting (Upper Left Wall) -->
              <button
                type="button"
                class="room-object room-object-blue pos-painting"
                data-object-id="painting"
                id="obj-painting"
              >
                <span class="obj-hotspot"></span>
                <span class="uv-fingerprint">🐾 4x</span>
                <span class="obj-icon">🖼️</span>
                <span class="obj-title">Cobalt Painting</span>
                <span class="obj-state" id="state-painting">0/4 Taps</span>
              </button>

              <!-- Object 3: Hidden Brass Key (Wall Recess behind Painting) -->
              <button
                type="button"
                class="room-object room-object-gold pos-key hidden"
                data-object-id="key"
                id="obj-key"
              >
                <span class="obj-hotspot"></span>
                <span class="obj-icon">🗝️</span>
                <span class="obj-title">Brass Key</span>
                <span class="obj-state" id="state-key">Collect</span>
              </button>

              <!-- Object 4: Temporal Airlock Exit Door (Center Back Wall) -->
              <button
                type="button"
                class="room-object room-object-door pos-door"
                data-object-id="door"
                id="obj-door"
              >
                <span class="door-frame-header">EXIT AIRLOCK 04</span>
                <span class="door-light" id="door-light"></span>
                <span class="obj-icon" id="door-icon">🚪</span>
                <span class="obj-title">Temporal Airlock</span>
                <span class="obj-state" id="state-door">SEALED</span>
              </button>

              <!-- Object 5: Archive Photograph (Right Wall) -->
              <button
                type="button"
                class="room-object pos-photo"
                data-object-id="photo"
                id="obj-photo"
              >
                <span class="obj-hotspot"></span>
                <span class="obj-icon">📷</span>
                <span class="obj-title">Archive Photo</span>
                <span class="obj-state" id="state-photo">Inspect Year</span>
              </button>

              <!-- Object 6: Chronos CRT Terminal (Bottom Left Desk) -->
              <button
                type="button"
                class="room-object room-object-terminal pos-computer"
                data-object-id="computer"
                id="obj-computer"
              >
                <span class="obj-hotspot"></span>
                <span class="obj-icon">🖥️</span>
                <span class="obj-title">Chronos Terminal</span>
                <span class="obj-state" id="state-computer">Passcode Req.</span>
              </button>

              <!-- Object 7: Cryo-Steel Safe Cabinet (Bottom Right) -->
              <button
                type="button"
                class="room-object pos-cabinet"
                data-object-id="cabinet"
                id="obj-cabinet"
              >
                <span class="obj-hotspot"></span>
                <span class="obj-icon">🗄️</span>
                <span class="obj-title">Cryo-Steel Safe</span>
                <span class="obj-state" id="state-cabinet">Key Locked</span>
              </button>
            </div>

            <!-- Interactive Bottom Deck: Inspector + Tactile Keypad + Action Buttons -->
            <footer class="room-action-bar">
              <div class="action-feedback-group">
                <span class="selected-object-pill" id="selected-object-pill">Selected: None</span>
                <p class="action-feedback-text" id="action-feedback-text">${state.feedbackMessage}</p>
              </div>

              <div class="action-buttons-group">
                <!-- Interactive Keypad Pill when Computer is active -->
                <div class="terminal-code-group hidden" id="terminal-code-group">
                  <div class="keypad-mini-btns">
                    <button type="button" class="kp-digit" data-digit="1">1</button>
                    <button type="button" class="kp-digit" data-digit="9">9</button>
                    <button type="button" class="kp-digit" data-digit="8">8</button>
                    <button type="button" class="kp-digit" data-digit="4">4</button>
                  </div>
                  <input
                    type="text"
                    maxlength="4"
                    placeholder="CODE"
                    class="terminal-code-input"
                    id="terminal-code-input"
                    aria-label="Enter 4-digit computer password"
                  />
                  <button type="button" class="hud-btn hud-btn-primary" id="btn-submit-code">
                    Unlock
                  </button>
                </div>

                <button type="button" class="hud-btn" id="btn-ping" title="Ping object for Player 2">
                  📡 Ping P2
                </button>
                <button type="button" class="hud-btn" id="btn-inspect">🔍 Inspect</button>
                <button type="button" class="hud-btn hud-btn-primary" id="btn-interact">
                  ⚡ Interact
                </button>
              </div>
            </footer>
          </div>
        </section>

        <!-- Sidebar Memory & Inventory Dock -->
        <aside class="game-sidebar-dock" id="inventory-clues-dock">
          <div class="dock-header">
            <span>Neural Memory & Loop Bag</span>
            <span class="dock-tag">SYNCED</span>
          </div>

          <!-- Escape Sequence Progress Tracker -->
          <div class="dock-section dock-progress-section">
            <div class="dock-section-title">
              <span>🔓 Escape Sequence</span>
              <span class="dock-badge-step" id="escape-step-count">0/4 Steps</span>
            </div>
            <div class="sequence-steps" id="sequence-steps"></div>
          </div>

          <div class="dock-section">
            <div class="dock-section-title">
              <span>🧠 Neural Clues</span>
              <span class="dock-badge-keep">Persists Loops</span>
            </div>
            <ul class="dock-list" id="clues-list"></ul>
          </div>

          <div class="dock-section">
            <div class="dock-section-title">
              <span>🎒 Physical Items</span>
              <span class="dock-badge-reset">Wiped at 00:00</span>
            </div>
            <ul class="dock-list" id="inventory-list"></ul>
          </div>
        </aside>
      </main>

      <!-- Pause / Victory Modal -->
      <div class="game-modal-overlay hidden" id="pause-modal">
        <div class="game-modal-card">
          <h3 id="modal-title">Temporal Chamber Paused</h3>
          <p id="modal-desc">
            You and your partner have 60 seconds per loop. Physical items vanish when the loop
            resets, but discovered clues stay in your Neural Memory forever!
          </p>
          <div class="modal-actions">
            <button type="button" class="hud-btn" id="btn-modal-reset">⏪ Rewind Loop</button>
            <button type="button" class="hud-btn hud-btn-primary" id="btn-resume">Resume</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const rootLayout = container.querySelector<HTMLElement>("#game-screen-root");
  const modal = container.querySelector<HTMLElement>("#pause-modal");
  const modalTitle = container.querySelector<HTMLElement>("#modal-title");
  const modalDesc = container.querySelector<HTMLElement>("#modal-desc");
  const menuBtn = container.querySelector<HTMLButtonElement>("#btn-pause-menu");
  const resumeBtn = container.querySelector<HTMLButtonElement>("#btn-resume");
  const resetBtn = container.querySelector<HTMLButtonElement>("#btn-reset-loop");
  const uvBtn = container.querySelector<HTMLButtonElement>("#btn-uv-toggle");
  const pingBtn = container.querySelector<HTMLButtonElement>("#btn-ping");
  const modalResetBtn = container.querySelector<HTMLButtonElement>("#btn-modal-reset");
  const inspectBtn = container.querySelector<HTMLButtonElement>("#btn-inspect");
  const interactBtn = container.querySelector<HTMLButtonElement>("#btn-interact");
  const submitCodeBtn = container.querySelector<HTMLButtonElement>("#btn-submit-code");
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

  function handleInspect(objectId: RoomObjectId): void {
    state.selectedObjectId = objectId;
    switch (objectId) {
      case "clock":
        state.feedbackMessage =
          `Anomaly Chronometer: Loop #${state.loopCount} has ${state.timeLeftSeconds}s ` +
          "before temporal collapse.";
        break;
      case "note":
        addClue("BLUE - 4 (Tap Cobalt Painting 4 times)");
        state.feedbackMessage = 'Evidence Board Note: "BLUE - 4". Saved to Neural Memory!';
        break;
      case "painting":
        state.feedbackMessage = state.keyRevealed
          ? "The Cobalt Painting slid open on hidden rails, exposing a secret recess."
          : `Cobalt Painting (${state.paintingClicks}/4 taps). Something metallic sits behind it.`;
        break;
      case "key":
        state.feedbackMessage = "A heavy Brass Key glinting inside the hidden wall recess.";
        break;
      case "cabinet":
        state.feedbackMessage = state.cabinetUnlocked
          ? 'Cryo-Steel Safe is open: "Find the year on the photograph".'
          : "Cryo-Steel Safe: Requires the Brass Key from behind the Cobalt Painting.";
        break;
      case "photo":
        addClue("Archive Photo Year: 1984");
        state.feedbackMessage =
          'Magnified Archive Photo: Lab Dedication Stamp reads "1984". Saved to Neural Memory!';
        break;
      case "computer":
        state.feedbackMessage = state.doorUnlocked
          ? "Chronos Terminal: OVERRIDE ACCEPTED. Temporal Airlock is unsealed."
          : "Chronos Terminal: Enter the 4-digit Archive Photo year to unseal the Airlock.";
        break;
      case "door":
        state.feedbackMessage = state.doorUnlocked
          ? "Temporal Airlock is UNSEALED! Click Interact to break the time loop!"
          : "Temporal Airlock is magnetically sealed by the Chronos Terminal.";
        break;
    }
    callbacks.onObjectInteract?.(objectId, "inspect");
    renderState();
  }

  function handleInteract(objectId: RoomObjectId): void {
    state.selectedObjectId = objectId;
    switch (objectId) {
      case "clock":
        state.uvMode = !state.uvMode;
        state.feedbackMessage = state.uvMode
          ? "Chronometer pulse shifted room into UV Blacklight Vision! Look at the walls."
          : "Returned room to standard spectrum lighting.";
        break;
      case "note":
        addClue("BLUE - 4 (Tap Cobalt Painting 4 times)");
        state.feedbackMessage = 'Pinned Clue Logged: "BLUE - 4" (persists across all loops!).';
        break;
      case "painting":
        if (!state.keyRevealed) {
          state.paintingClicks += 1;
          if (state.paintingClicks >= 4) {
            state.keyRevealed = true;
            state.score += 25;
            state.feedbackMessage =
              "4/4 Taps! The Cobalt Painting slides open, revealing a Hidden Brass Key!";
          } else {
            state.feedbackMessage =
              `Tapped Cobalt Painting (${state.paintingClicks}/4) — mechanical latch clicked...`;
          }
        } else {
          state.feedbackMessage = "The Cobalt Painting has already slid aside.";
        }
        break;
      case "key":
        if (state.keyRevealed && !state.keyCollected) {
          state.keyCollected = true;
          addInventoryItem("Brass Key");
          state.score += 25;
          state.feedbackMessage =
            "Collected Brass Key! Unlock the Cryo-Steel Safe before the 60s loop ends.";
        }
        break;
      case "cabinet":
        if (state.cabinetUnlocked) {
          addClue("Safe Clue: Find the year on the photograph");
          state.feedbackMessage = 'Safe Dossier: "Find the year on the photograph".';
        } else if (state.keyCollected || state.inventory.includes("Brass Key")) {
          state.cabinetUnlocked = true;
          state.score += 50;
          addClue("Safe Clue: Find the year on the photograph");
          state.feedbackMessage =
            'Unlocked Cryo-Steel Safe with Brass Key! Found clue: "Find the year on the photograph".';
        } else {
          state.feedbackMessage = "Cryo-Steel Safe is locked. You need the Brass Key first.";
        }
        break;
      case "photo":
        addClue("Archive Photo Year: 1984");
        state.feedbackMessage =
          'Inspected Archive Photo: Stamp in corner reads "1984"! Use it on the Terminal.';
        break;
      case "computer":
        if (state.doorUnlocked) {
          state.feedbackMessage = "Chronos Terminal already unsealed the Temporal Airlock.";
        } else {
          state.feedbackMessage =
            "Chronos Terminal active: Click digits 1-9-8-4 or type the year below.";
          codeInput?.focus();
        }
        break;
      case "door":
        if (state.doorUnlocked) {
          state.escaped = true;
          state.statusText = "Loop Broken!";
          state.score += 150;
          state.feedbackMessage = `TIME LOOP BROKEN on Loop #${state.loopCount}!`;
          const timeRemaining = state.timeLeftSeconds;
          if (modalTitle && modalDesc && modal) {
            modalTitle.textContent = "⚡ TIME LOOP BROKEN!";
            modalDesc.textContent =
              `You and Player 2 unsealed the Temporal Airlock on Loop #${state.loopCount} ` +
              `with ${timeRemaining}s remaining! Total Score: ${state.score} PTS.`;
            modal.classList.remove("hidden");
          }
        } else {
          state.feedbackMessage =
            "Temporal Airlock is SEALED! Enter the 4-digit year on the Chronos Terminal first.";
        }
        break;
    }
    callbacks.onObjectInteract?.(objectId, "interact");
    renderState();
  }

  function submitTerminalCode(): void {
    const entered = codeInput?.value.trim() ?? "";
    if (entered === COMPUTER_PASSCODE) {
      state.doorUnlocked = true;
      state.score += 75;
      state.statusText = "Airlock Unsealed";
      state.feedbackMessage =
        "PASSCODE 1984 ACCEPTED! Power conduit energized — Temporal Airlock is UNSEALED!";
    } else {
      const codeText = entered || "----";
      state.feedbackMessage =
        `ACCESS DENIED ("${codeText}"). Hint: inspect the Archive Photo for the 4-digit year.`;
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
      statusText: "Loop Rewound",
      paintingClicks: 0,
      keyRevealed: false,
      keyCollected: false,
      cabinetUnlocked: false,
      doorUnlocked: false,
      escaped: false,
      inventory: [],
      feedbackMessage:
        `Loop #${nextLoop} initiated! Physical items reset, but ${clueCount} neural clue(s) kept.`,
    };
    if (codeInput) {
      codeInput.value = "";
    }
    if (resetBanner) {
      resetBanner.classList.remove("hidden");
      setTimeout(() => {
        resetBanner.classList.add("hidden");
      }, 3200);
    }
    callbacks.onLoopReset?.(state.loopCount);
    renderState();
  }

  const objectButtons = container.querySelectorAll<HTMLButtonElement>(".room-object");
  for (const btn of objectButtons) {
    btn.addEventListener("click", () => {
      const id = btn.dataset.objectId as RoomObjectId | undefined;
      if (!id) return;
      handleInteract(id);
    });
  }

  const digitButtons = container.querySelectorAll<HTMLButtonElement>(".kp-digit");
  for (const dBtn of digitButtons) {
    dBtn.addEventListener("click", () => {
      if (!codeInput) return;
      const digit = dBtn.dataset.digit ?? "";
      if (codeInput.value.length < 4) {
        codeInput.value += digit;
      }
      if (codeInput.value.length === 4) {
        submitTerminalCode();
      }
    });
  }

  uvBtn?.addEventListener("click", () => {
    state.uvMode = !state.uvMode;
    state.feedbackMessage = state.uvMode
      ? "🔦 UV Blacklight ON — Hidden temporal echoes revealed on the chamber walls!"
      : "🔦 UV Blacklight OFF — Standard chamber illumination restored.";
    renderState();
  });

  pingBtn?.addEventListener("click", () => {
    const target = state.selectedObjectId ?? "painting";
    state.pingedObjectId = target;
    state.coopLog = `📡 You pinged [${OBJECT_LABELS[target]}] for Player 2!`;
    state.feedbackMessage = `Sent co-op sonar ping on ${OBJECT_LABELS[target]} to Player 2.`;
    callbacks.onObjectInteract?.(target, "ping");
    renderState();
  });

  inspectBtn?.addEventListener("click", () => {
    if (!state.selectedObjectId) {
      state.feedbackMessage = "Select any object in the 3D chamber first to inspect it.";
      renderState();
      return;
    }
    handleInspect(state.selectedObjectId);
  });

  interactBtn?.addEventListener("click", () => {
    if (!state.selectedObjectId) {
      state.feedbackMessage = "Select any object in the 3D chamber first to interact with it.";
      renderState();
      return;
    }
    handleInteract(state.selectedObjectId);
  });

  submitCodeBtn?.addEventListener("click", () => {
    submitTerminalCode();
  });

  codeInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitTerminalCode();
    }
  });

  resetBtn?.addEventListener("click", () => {
    resetLoop();
  });

  modalResetBtn?.addEventListener("click", () => {
    modal?.classList.add("hidden");
    resetLoop();
  });

  menuBtn?.addEventListener("click", () => {
    if (modalTitle && modalDesc) {
      modalTitle.textContent = "Temporal Chamber Paused";
      modalDesc.textContent =
        "Explore the 3D chamber, toggle UV Blacklight, and solve the sequence within 60 seconds. " +
        "Items vanish each loop, but Neural Clues persist forever!";
    }
    modal?.classList.remove("hidden");
  });

  resumeBtn?.addEventListener("click", () => {
    modal?.classList.add("hidden");
  });

  function formatTime(seconds: number): string {
    const clamped = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function renderState(): void {
    const timerEl = container.querySelector<HTMLElement>("#hud-timer");
    const timerVal = container.querySelector<HTMLElement>("#hud-timer-val");
    const timerFill = container.querySelector<HTMLElement>("#hud-timer-fill");
    const ringFg = container.querySelector<SVGCircleElement>("#chrono-ring-fg");
    const stabilityTag = container.querySelector<HTMLElement>("#stability-tag");
    const loopVal = container.querySelector<HTMLElement>("#hud-loop");
    const playersVal = container.querySelector<HTMLElement>("#hud-players");
    const scoreVal = container.querySelector<HTMLElement>("#hud-score-val");
    const statusVal = container.querySelector<HTMLElement>("#hud-status");
    const roomVal = container.querySelector<HTMLElement>("#hud-room");
    const selectedPill = container.querySelector<HTMLElement>("#selected-object-pill");
    const feedbackEl = container.querySelector<HTMLElement>("#action-feedback-text");
    const coopLogEl = container.querySelector<HTMLElement>("#coop-log-text");
    const terminalGroup = container.querySelector<HTMLElement>("#terminal-code-group");
    const conduitLine = container.querySelector<HTMLElement>("#power-conduit-line");

    const isUrgent = state.timeLeftSeconds <= 15;
    const ratio = Math.max(
      0,
      Math.min(1, state.timeLeftSeconds / Math.max(1, state.loopDurationSeconds)),
    );

    rootLayout?.classList.toggle("uv-mode-active", state.uvMode);
    rootLayout?.classList.toggle("temporal-critical", isUrgent && !state.escaped);
    uvBtn?.classList.toggle("hud-btn-uv-on", state.uvMode);

    if (timerVal) {
      timerVal.textContent = formatTime(state.timeLeftSeconds);
    }
    if (timerEl) {
      timerEl.classList.toggle("timer-urgent", isUrgent);
    }
    if (timerFill) {
      timerFill.style.width = `${ratio * 100}%`;
      timerFill.classList.toggle("timer-fill-urgent", isUrgent);
    }
    if (ringFg) {
      const offset = RING_CIRCUMFERENCE * (1 - ratio);
      ringFg.style.strokeDashoffset = String(offset);
      ringFg.classList.toggle("ring-urgent", isUrgent);
    }
    if (stabilityTag) {
      stabilityTag.textContent = isUrgent ? "CRITICAL" : state.uvMode ? "UV SCAN" : "STABLE";
      stabilityTag.classList.toggle("stability-critical", isUrgent);
    }
    if (loopVal) {
      loopVal.textContent = `LOOP #${state.loopCount}`;
    }
    if (playersVal) {
      const countText = `${state.connectedPlayers}/${state.maxPlayers} Co-op`;
      playersVal.innerHTML = `<span class="pulse-dot"></span> ${countText}`;
    }
    if (scoreVal) {
      scoreVal.textContent = String(state.score);
    }
    if (statusVal) {
      statusVal.textContent = state.statusText;
    }
    if (roomVal) {
      roomVal.textContent = state.roomId;
    }
    if (coopLogEl) {
      coopLogEl.textContent = state.coopLog;
    }
    if (selectedPill) {
      selectedPill.textContent = state.selectedObjectId
        ? `Target: ${OBJECT_LABELS[state.selectedObjectId]}`
        : "Target: None";
    }
    if (feedbackEl) {
      feedbackEl.textContent = state.feedbackMessage;
    }
    if (terminalGroup) {
      terminalGroup.classList.toggle(
        "hidden",
        state.selectedObjectId !== "computer" || state.doorUnlocked,
      );
    }
    if (conduitLine) {
      conduitLine.classList.toggle("conduit-active", state.doorUnlocked);
    }

    // Update room objects
    const clockState = container.querySelector<HTMLElement>("#state-clock");
    if (clockState) {
      clockState.textContent = `${state.timeLeftSeconds}s Left`;
    }

    const paintingBtn = container.querySelector<HTMLElement>("#obj-painting");
    const paintingState = container.querySelector<HTMLElement>("#state-painting");
    if (paintingBtn) {
      paintingBtn.classList.toggle("painting-shifted", state.keyRevealed);
    }
    if (paintingState) {
      paintingState.textContent = state.keyRevealed
        ? "Recess Open"
        : `${state.paintingClicks}/4 Taps`;
    }

    const keyBtn = container.querySelector<HTMLElement>("#obj-key");
    const keyState = container.querySelector<HTMLElement>("#state-key");
    if (keyBtn) {
      keyBtn.classList.toggle("hidden", !state.keyRevealed || state.keyCollected);
    }
    if (keyState) {
      keyState.textContent = state.keyCollected ? "In Bag" : "Take Key";
    }

    const cabinetState = container.querySelector<HTMLElement>("#state-cabinet");
    if (cabinetState) {
      cabinetState.textContent = state.cabinetUnlocked ? "Open" : "Key Locked";
    }

    const computerState = container.querySelector<HTMLElement>("#state-computer");
    if (computerState) {
      computerState.textContent = state.doorUnlocked ? "Override OK" : "Enter 1984";
    }

    const doorBtn = container.querySelector<HTMLElement>("#obj-door");
    const doorState = container.querySelector<HTMLElement>("#state-door");
    const doorIcon = container.querySelector<HTMLElement>("#door-icon");
    if (doorBtn) {
      doorBtn.classList.toggle("door-unlocked", state.doorUnlocked);
    }
    if (doorState) {
      doorState.textContent = state.doorUnlocked ? "UNSEALED" : "SEALED";
    }
    if (doorIcon) {
      doorIcon.textContent = state.doorUnlocked ? "🔓" : "🚪";
    }

    for (const btn of objectButtons) {
      const id = btn.dataset.objectId as RoomObjectId | undefined;
      btn.classList.toggle("object-selected", id !== undefined && id === state.selectedObjectId);
      btn.classList.toggle("object-pinged", id !== undefined && id === state.pingedObjectId);
    }

    // Escape sequence progress tracker in sidebar
    const steps = [
      { label: "1. Tap Cobalt Painting 4x", done: state.keyRevealed },
      { label: "2. Unlock Safe with Brass Key", done: state.cabinetUnlocked },
      {
        label: "3. Find 1984 on Archive Photo",
        done: state.clues.some((c) => c.includes("1984")),
      },
      { label: "4. Unseal Airlock via Terminal", done: state.doorUnlocked },
    ];
    const doneCount = steps.filter((s) => s.done).length;
    const stepCountEl = container.querySelector<HTMLElement>("#escape-step-count");
    if (stepCountEl) {
      stepCountEl.textContent = `${doneCount}/4 Steps`;
    }
    const stepsEl = container.querySelector<HTMLElement>("#sequence-steps");
    if (stepsEl) {
      stepsEl.innerHTML = steps
        .map(
          (s) =>
            `<div class="seq-step ${s.done ? "seq-step-done" : ""}">` +
            `<span>${s.done ? "✅" : "⬜"}</span> <span>${s.label}</span></div>`,
        )
        .join("");
    }

    // Render persistent clues list
    const cluesList = container.querySelector<HTMLElement>("#clues-list");
    if (cluesList) {
      if (state.clues.length === 0) {
        cluesList.innerHTML =
          '<li class="dock-empty">No neural clues yet. Toggle UV Light or inspect objects!</li>';
      } else {
        cluesList.innerHTML = state.clues
          .map((clue) => `<li class="dock-item dock-item-clue">🧠 ${clue}</li>`)
          .join("");
      }
    }

    // Render loop-scoped inventory list
    const inventoryList = container.querySelector<HTMLElement>("#inventory-list");
    if (inventoryList) {
      if (state.inventory.length === 0) {
        inventoryList.innerHTML =
          '<li class="dock-empty">Empty (physical items wipe every 60s)</li>';
      } else {
        inventoryList.innerHTML = state.inventory
          .map((item) => `<li class="dock-item dock-item-inv">🗝️ ${item}</li>`)
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
