export type RoomObjectId = "note" | "painting" | "key" | "cabinet" | "photo" | "computer" | "door";

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
  paintingClicks?: number;
  keyRevealed?: boolean;
  keyCollected?: boolean;
  cabinetUnlocked?: boolean;
  doorUnlocked?: boolean;
  escaped?: boolean;
  clues?: string[];
  inventory?: string[];
  feedbackMessage?: string;
  onObjectInteract?: (objectId: RoomObjectId, action: "select" | "inspect" | "interact") => void;
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

const OBJECT_LABELS: Record<RoomObjectId, string> = {
  note: "Sticky Note",
  painting: "Blue Painting",
  key: "Hidden Brass Key",
  cabinet: "Locked Cabinet",
  photo: "Framed Photograph",
  computer: "Computer Terminal",
  door: "Exit Door",
};

const COMPUTER_PASSCODE = "1984";

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
    statusText: initialState?.statusText ?? "Time Loop Active",
    selectedObjectId: initialState?.selectedObjectId ?? null,
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
      "Explore the room and click objects to inspect or interact before the 60s loop resets.",
  };

  container.innerHTML = `
    <div class="game-screen-layout">
      <!-- Top Status & Timer HUD -->
      <header class="game-hud">
        <div class="hud-group">
          <span class="hud-badge team-badge">TEAM 4</span>
          <span class="hud-meta" id="hud-room">Room: ${state.roomId}</span>
          <span class="hud-pill" id="hud-players">
            Players: ${state.connectedPlayers}/${state.maxPlayers}
          </span>
        </div>

        <div class="hud-center">
          <div class="hud-timer-row">
            <span class="hud-loop-badge" id="hud-loop">LOOP #${state.loopCount}</span>
            <div class="hud-timer" id="hud-timer">
              ⏱ <span id="hud-timer-val">${formatTime(state.timeLeftSeconds)}</span>
            </div>
          </div>
          <div class="hud-timer-track" aria-hidden="true">
            <div class="hud-timer-fill" id="hud-timer-fill"></div>
          </div>
          <div class="hud-status" id="hud-status">${state.statusText}</div>
        </div>

        <div class="hud-group hud-right">
          <div class="hud-score">Score: <strong id="hud-score-val">${state.score}</strong></div>
          <button type="button" class="hud-btn" id="btn-reset-loop" title="Reset the 60s loop early">
            ↻ Reset Loop
          </button>
          <button type="button" class="hud-btn" id="btn-pause-menu">Menu</button>
        </div>
      </header>

      <!-- Main Body: Room Area + Action Controls + Sidebar Dock -->
      <main class="game-body">
        <section class="game-viewport-wrapper">
          <div class="game-viewport" id="game-viewport">
            <!-- Loop Reset Banner -->
            <div class="loop-reset-banner hidden" id="loop-reset-banner">
              ⚡ TIME LOOP RESET — Items vanished, but your discovered clues remain!
            </div>

            <!-- Escape Room Scene & Object Placement -->
            <div class="escape-room-scene" id="escape-room-scene">
              <div class="room-wall-backdrop">
                <div class="room-ceiling-trim">TIME LOOP CHAMBER · SECTOR 04</div>
              </div>
              <div class="room-floor-area"></div>

              <!-- Placed Object 1: Sticky Note on Wall Board (Left) -->
              <button
                type="button"
                class="room-object pos-note"
                data-object-id="note"
                id="obj-note"
              >
                <span class="obj-icon">📝</span>
                <span class="obj-title">Wall Note</span>
                <span class="obj-state" id="state-note">Clue</span>
              </button>

              <!-- Placed Object 2: Blue Painting (Upper Left Wall) -->
              <button
                type="button"
                class="room-object room-object-blue pos-painting"
                data-object-id="painting"
                id="obj-painting"
              >
                <span class="obj-icon">🖼️</span>
                <span class="obj-title">Blue Painting</span>
                <span class="obj-state" id="state-painting">0/4 Clicks</span>
              </button>

              <!-- Placed Object 3: Hidden Brass Key (Revealed behind Blue Painting) -->
              <button
                type="button"
                class="room-object room-object-gold pos-key hidden"
                data-object-id="key"
                id="obj-key"
              >
                <span class="obj-icon">🔑</span>
                <span class="obj-title">Hidden Key</span>
                <span class="obj-state" id="state-key">Take Key</span>
              </button>

              <!-- Placed Object 4: Exit Door (Center Back Wall) -->
              <button
                type="button"
                class="room-object room-object-door pos-door"
                data-object-id="door"
                id="obj-door"
              >
                <span class="door-light" id="door-light"></span>
                <span class="obj-icon">🚪</span>
                <span class="obj-title">Exit Door</span>
                <span class="obj-state" id="state-door">LOCKED</span>
              </button>

              <!-- Placed Object 5: Framed Photograph (Right Wall) -->
              <button
                type="button"
                class="room-object pos-photo"
                data-object-id="photo"
                id="obj-photo"
              >
                <span class="obj-icon">📷</span>
                <span class="obj-title">Photograph</span>
                <span class="obj-state" id="state-photo">Inspect</span>
              </button>

              <!-- Placed Object 6: Computer Terminal (Center-Left Desk) -->
              <button
                type="button"
                class="room-object pos-computer"
                data-object-id="computer"
                id="obj-computer"
              >
                <span class="obj-icon">💻</span>
                <span class="obj-title">Terminal PC</span>
                <span class="obj-state" id="state-computer">Locked</span>
              </button>

              <!-- Placed Object 7: Locked Cabinet (Bottom Right) -->
              <button
                type="button"
                class="room-object pos-cabinet"
                data-object-id="cabinet"
                id="obj-cabinet"
              >
                <span class="obj-icon">🗄️</span>
                <span class="obj-title">Steel Cabinet</span>
                <span class="obj-state" id="state-cabinet">Locked</span>
              </button>
            </div>

            <!-- Bottom Room Action & Control Bar -->
            <footer class="room-action-bar">
              <div class="action-feedback-group">
                <span class="selected-object-pill" id="selected-object-pill">Selected: None</span>
                <p class="action-feedback-text" id="action-feedback-text">${state.feedbackMessage}</p>
              </div>

              <div class="action-buttons-group">
                <div class="terminal-code-group hidden" id="terminal-code-group">
                  <input
                    type="text"
                    maxlength="4"
                    placeholder="Year (4 digits)"
                    class="terminal-code-input"
                    id="terminal-code-input"
                    aria-label="Enter 4-digit computer password"
                  />
                  <button type="button" class="hud-btn hud-btn-primary" id="btn-submit-code">
                    Unlock
                  </button>
                </div>
                <button type="button" class="hud-btn" id="btn-inspect">🔍 Inspect</button>
                <button type="button" class="hud-btn hud-btn-primary" id="btn-interact">
                  ✋ Interact / Use
                </button>
              </div>
            </footer>
          </div>
        </section>

        <!-- Sidebar Dock for Clues (Persistent) & Inventory (Loop-scoped) -->
        <aside class="game-sidebar-dock" id="inventory-clues-dock">
          <div class="dock-header">
            <span>Clues & Inventory</span>
            <span class="dock-tag">Time Loop Sync</span>
          </div>

          <div class="dock-section">
            <div class="dock-section-title">
              <span>🧠 Discovered Clues</span>
              <span class="dock-badge-keep">Kept Across Loops</span>
            </div>
            <ul class="dock-list" id="clues-list"></ul>
          </div>

          <div class="dock-section">
            <div class="dock-section-title">
              <span>🎒 Loop Inventory</span>
              <span class="dock-badge-reset">Resets at 00:00</span>
            </div>
            <ul class="dock-list" id="inventory-list"></ul>
          </div>
        </aside>
      </main>

      <!-- Pause / Escape Overlay Modal -->
      <div class="game-modal-overlay hidden" id="pause-modal">
        <div class="game-modal-card">
          <h3 id="modal-title">Game Paused</h3>
          <p id="modal-desc">
            Work with your teammate to find clues and unlock the exit door within 60 seconds.
            When the timer hits 00:00, items reset—but your discovered clues stay!
          </p>
          <div class="modal-actions">
            <button type="button" class="hud-btn" id="btn-modal-reset">Restart Loop</button>
            <button type="button" class="hud-btn hud-btn-primary" id="btn-resume">Resume</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const modal = container.querySelector<HTMLElement>("#pause-modal");
  const modalTitle = container.querySelector<HTMLElement>("#modal-title");
  const modalDesc = container.querySelector<HTMLElement>("#modal-desc");
  const menuBtn = container.querySelector<HTMLButtonElement>("#btn-pause-menu");
  const resumeBtn = container.querySelector<HTMLButtonElement>("#btn-resume");
  const resetBtn = container.querySelector<HTMLButtonElement>("#btn-reset-loop");
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
      case "note":
        addClue("BLUE - 4 (Interact with the blue object 4 times)");
        state.feedbackMessage = 'Clue discovered on Wall Note: "BLUE - 4".';
        break;
      case "painting":
        state.feedbackMessage = state.keyRevealed
          ? "The blue painting has shifted aside, revealing a wall recess."
          : `A deep blue canvas (${state.paintingClicks}/4 clicks). Something rattles behind the frame.`;
        break;
      case "key":
        state.feedbackMessage = "A small brass key hidden behind the blue painting.";
        break;
      case "cabinet":
        state.feedbackMessage = state.cabinetUnlocked
          ? 'Inside the cabinet: "Find the year on the photograph".'
          : "A locked steel cabinet with a brass keyhole.";
        break;
      case "photo":
        addClue("Photograph Year: 1984");
        state.feedbackMessage =
          'A faded photograph of the facility opening ceremony, stamped with the year "1984".';
        break;
      case "computer":
        state.feedbackMessage = state.doorUnlocked
          ? "Computer Terminal: ACCESS GRANTED. Exit Door is unlocked."
          : "Computer Terminal requires a 4-digit year password to unlock the Exit Door.";
        break;
      case "door":
        state.feedbackMessage = state.doorUnlocked
          ? "The heavy Exit Door is UNLOCKED! Interact to escape the time loop!"
          : "The Exit Door is electronically locked by the Computer Terminal.";
        break;
    }
    callbacks.onObjectInteract?.(objectId, "inspect");
    renderState();
  }

  function handleInteract(objectId: RoomObjectId): void {
    state.selectedObjectId = objectId;
    switch (objectId) {
      case "note":
        addClue("BLUE - 4 (Interact with the blue object 4 times)");
        state.feedbackMessage = 'You read the sticky note: "BLUE - 4". Clue saved for all loops!';
        break;
      case "painting":
        if (!state.keyRevealed) {
          state.paintingClicks += 1;
          if (state.paintingClicks >= 4) {
            state.keyRevealed = true;
            state.score += 25;
            state.feedbackMessage =
              "Clicked Blue Painting 4/4 times! It slides aside and reveals a Hidden Key!";
          } else {
            state.feedbackMessage = `You tap the Blue Painting (${state.paintingClicks}/4)...`;
          }
        } else {
          state.feedbackMessage = "The Blue Painting has already moved aside.";
        }
        break;
      case "key":
        if (state.keyRevealed && !state.keyCollected) {
          state.keyCollected = true;
          addInventoryItem("Brass Key");
          state.score += 25;
          state.feedbackMessage = "Collected the Brass Key! (Resets if the 60s loop expires)";
        }
        break;
      case "cabinet":
        if (state.cabinetUnlocked) {
          addClue("Cabinet Clue: Find the year on the photograph");
          state.feedbackMessage = 'Cabinet note: "Find the year on the photograph".';
        } else if (state.keyCollected || state.inventory.includes("Brass Key")) {
          state.cabinetUnlocked = true;
          state.score += 50;
          addClue("Cabinet Clue: Find the year on the photograph");
          state.feedbackMessage =
            'Unlocked the Steel Cabinet with the Brass Key! Clue found: "Find the year on the photograph".';
        } else {
          state.feedbackMessage = "The Steel Cabinet is locked. You need a key.";
        }
        break;
      case "photo":
        addClue("Photograph Year: 1984");
        state.feedbackMessage =
          'You examine the photograph closely: the date on the frame reads "1984".';
        break;
      case "computer":
        if (state.doorUnlocked) {
          state.feedbackMessage = "Terminal already unlocked the Exit Door.";
        } else {
          state.feedbackMessage = "Enter the 4-digit year on the terminal keypad below.";
          codeInput?.focus();
        }
        break;
      case "door":
        if (state.doorUnlocked) {
          state.escaped = true;
          state.statusText = "Escaped!";
          state.score += 100;
          state.feedbackMessage = `You escaped the Time Loop on Loop #${state.loopCount}!`;
          const timeRemaining = state.timeLeftSeconds;
          if (modalTitle && modalDesc && modal) {
            modalTitle.textContent = "🎉 Time Loop Escaped!";
            modalDesc.textContent =
              `You and your teammate unlocked the Exit Door on Loop #${state.loopCount} ` +
              `with ${timeRemaining}s remaining!`;
            modal.classList.remove("hidden");
          }
        } else {
          state.feedbackMessage =
            "Exit Door is locked! Unlock it from the Computer Terminal first.";
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
      state.statusText = "Door Unlocked";
      state.feedbackMessage =
        "ACCESS GRANTED (1984)! The Computer Terminal unlocked the Exit Door!";
    } else {
      const codeText = entered || "----";
      state.feedbackMessage = `ACCESS DENIED ("${codeText}"). Hint: check the year on the photo.`;
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
      feedbackMessage: `Loop #${nextLoop} started! Items reset, but ${clueCount} clue(s) remain.`,
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

  // Wire up room object buttons
  const objectButtons = container.querySelectorAll<HTMLButtonElement>(".room-object");
  for (const btn of objectButtons) {
    btn.addEventListener("click", () => {
      const id = btn.dataset.objectId as RoomObjectId | undefined;
      if (!id) return;
      handleInteract(id);
    });
  }

  inspectBtn?.addEventListener("click", () => {
    if (!state.selectedObjectId) {
      state.feedbackMessage = "Click an object in the room first to inspect it.";
      renderState();
      return;
    }
    handleInspect(state.selectedObjectId);
  });

  interactBtn?.addEventListener("click", () => {
    if (!state.selectedObjectId) {
      state.feedbackMessage = "Click an object in the room first to interact with it.";
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
      modalTitle.textContent = "Game Paused";
      modalDesc.textContent =
        "Explore the room, collect items, and solve puzzles before the 60s timer resets. " +
        "Items vanish each loop, but discovered clues stay!";
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
    const loopVal = container.querySelector<HTMLElement>("#hud-loop");
    const playersVal = container.querySelector<HTMLElement>("#hud-players");
    const scoreVal = container.querySelector<HTMLElement>("#hud-score-val");
    const statusVal = container.querySelector<HTMLElement>("#hud-status");
    const roomVal = container.querySelector<HTMLElement>("#hud-room");
    const selectedPill = container.querySelector<HTMLElement>("#selected-object-pill");
    const feedbackEl = container.querySelector<HTMLElement>("#action-feedback-text");
    const terminalGroup = container.querySelector<HTMLElement>("#terminal-code-group");

    if (timerVal) {
      timerVal.textContent = formatTime(state.timeLeftSeconds);
    }
    if (timerEl) {
      timerEl.classList.toggle("timer-urgent", state.timeLeftSeconds <= 15);
    }
    if (timerFill) {
      const pct = Math.max(
        0,
        Math.min(100, (state.timeLeftSeconds / Math.max(1, state.loopDurationSeconds)) * 100),
      );
      timerFill.style.width = `${pct}%`;
      timerFill.classList.toggle("timer-fill-urgent", state.timeLeftSeconds <= 15);
    }
    if (loopVal) {
      loopVal.textContent = `LOOP #${state.loopCount}`;
    }
    if (playersVal) {
      playersVal.textContent = `Players: ${state.connectedPlayers}/${state.maxPlayers}`;
    }
    if (scoreVal) {
      scoreVal.textContent = String(state.score);
    }
    if (statusVal) {
      statusVal.textContent = state.statusText;
    }
    if (roomVal) {
      roomVal.textContent = `Room: ${state.roomId}`;
    }
    if (selectedPill) {
      selectedPill.textContent = state.selectedObjectId
        ? `Selected: ${OBJECT_LABELS[state.selectedObjectId]}`
        : "Selected: None";
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

    // Update room objects
    const paintingBtn = container.querySelector<HTMLElement>("#obj-painting");
    const paintingState = container.querySelector<HTMLElement>("#state-painting");
    if (paintingBtn) {
      paintingBtn.classList.toggle("painting-shifted", state.keyRevealed);
    }
    if (paintingState) {
      paintingState.textContent = state.keyRevealed
        ? "Moved Aside"
        : `${state.paintingClicks}/4 Clicks`;
    }

    const keyBtn = container.querySelector<HTMLElement>("#obj-key");
    const keyState = container.querySelector<HTMLElement>("#state-key");
    if (keyBtn) {
      keyBtn.classList.toggle("hidden", !state.keyRevealed || state.keyCollected);
    }
    if (keyState) {
      keyState.textContent = state.keyCollected ? "Collected" : "Take Key";
    }

    const cabinetState = container.querySelector<HTMLElement>("#state-cabinet");
    if (cabinetState) {
      cabinetState.textContent = state.cabinetUnlocked ? "Unlocked" : "Locked";
    }

    const computerState = container.querySelector<HTMLElement>("#state-computer");
    if (computerState) {
      computerState.textContent = state.doorUnlocked ? "Unlocked" : "Enter Code";
    }

    const doorBtn = container.querySelector<HTMLElement>("#obj-door");
    const doorState = container.querySelector<HTMLElement>("#state-door");
    if (doorBtn) {
      doorBtn.classList.toggle("door-unlocked", state.doorUnlocked);
    }
    if (doorState) {
      doorState.textContent = state.doorUnlocked ? "UNLOCKED" : "LOCKED";
    }

    for (const btn of objectButtons) {
      const id = btn.dataset.objectId as RoomObjectId | undefined;
      btn.classList.toggle("object-selected", id !== undefined && id === state.selectedObjectId);
    }

    // Render persistent clues list
    const cluesList = container.querySelector<HTMLElement>("#clues-list");
    if (cluesList) {
      if (state.clues.length === 0) {
        cluesList.innerHTML =
          '<li class="dock-empty">No clues discovered yet. Click objects in the room!</li>';
      } else {
        cluesList.innerHTML = state.clues
          .map((clue) => `<li class="dock-item dock-item-clue">💡 ${clue}</li>`)
          .join("");
      }
    }

    // Render loop-scoped inventory list
    const inventoryList = container.querySelector<HTMLElement>("#inventory-list");
    if (inventoryList) {
      if (state.inventory.length === 0) {
        inventoryList.innerHTML =
          '<li class="dock-empty">Empty (items reset every 60s loop)</li>';
      } else {
        inventoryList.innerHTML = state.inventory
          .map((item) => `<li class="dock-item dock-item-inv">🔑 ${item}</li>`)
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
