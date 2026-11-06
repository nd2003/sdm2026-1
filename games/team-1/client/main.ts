import "./style.css";
import { audio } from "./audio.ts";
import {
  addClue,
  CODE_ANSWER,
  type GameState,
  hasClue,
  LOOP_DURATION,
  makeState,
  resetLoop,
  SAFE_CODE,
  switchPlayer,
} from "./game.ts";
import * as ui from "./ui.ts";

// ── singleton state ───────────────────────────────────────────────────────────

let state: GameState = makeState();

// ── helpers ───────────────────────────────────────────────────────────────────

function playerName(): string {
  return `P${state.activePlayer}`;
}

function switchTurn(): void {
  switchPlayer(state);
  ui.updateActivePlayer(state.activePlayer);
}

// ── timer ─────────────────────────────────────────────────────────────────────

function startTimer(): void {
  if (state.timerHandle !== null) clearInterval(state.timerHandle);
  state.timerHandle = setInterval(() => {
    state.timeLeft -= 1;
    ui.updateTimer(state.timeLeft, LOOP_DURATION);
    if (state.timeLeft === 20) audio.alarm();
    if (state.timeLeft <= 0) triggerLoopReset();
  }, 1000);
}

// ── loop reset ────────────────────────────────────────────────────────────────

function triggerLoopReset(): void {
  if (state.timerHandle !== null) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
  state.phase = "resetting";
  audio.loopReset();

  const nextLoop = state.loop + 1;
  ui.showReset(nextLoop);
  ui.startParticles();

  setTimeout(() => {
    resetLoop(state);
    applyRoomReset();
    ui.updateLoop(state.loop);
    ui.updateTimer(state.timeLeft, LOOP_DURATION);
    ui.hideReset();
    state.phase = "playing";
    startTimer();
  }, 3200);
}

function applyRoomReset(): void {
  ui.resetPaintCounter();
  ui.hideKey();
  ui.hideSafe();
  ui.setPlayerKey(1, false);
  ui.setPlayerKey(2, false);
  ui.resetCabinet();
  ui.hidePhoto();
  ui.hideUsb();
  ui.resetLaptop();
  // Keep USB inventory badges if player still holds USB
  if (state.usbHolder === 1) ui.setPlayerUsb(1, true);
  if (state.usbHolder === 2) ui.setPlayerUsb(2, true);
}

// ── interaction handlers ──────────────────────────────────────────────────────

function onClickNote(): void {
  if (state.phase !== "playing") return;
  audio.click();
  if (hasClue(state, "blue4")) {
    ui.toast(`Already noted: "Blue — 4"`);
    return;
  }
  addClue(state, "blue4");
  ui.renderClues(state.clues);
  ui.toast(`${playerName()} reads the note: "Blue — 4"`, "success");
  audio.clue();
  switchTurn();
}

function onClickPainting(): void {
  if (state.phase !== "playing") return;
  if (state.keyVisible || state.safeVisible) {
    ui.toast("The painting is already open — look for the key and the safe.");
    return;
  }
  audio.click();
  state.paintClicks += 1;
  ui.updatePaintCounter(state.paintClicks);

  if (state.paintClicks < 4) {
    const msgs = [
      "shifts. Something stirs behind it.",
      "swings. A shadow hints at something hidden.",
      "almost there — one more.",
    ] as const;
    ui.toast(`${playerName()}: the painting ${msgs[state.paintClicks - 1] ?? "moves."}`);
    switchTurn();
  } else {
    state.keyVisible = true;
    state.safeVisible = true;
    ui.showKey();
    ui.showSafe();
    if (addClue(state, "findyear")) ui.renderClues(state.clues);
    ui.toast(`${playerName()} swings the painting open — a key drops and a safe is exposed!`, "success");
    audio.success();
    switchTurn();
  }
}

function onClickKey(): void {
  if (state.phase !== "playing") return;
  if (!state.keyVisible) return;
  if (state.keyHolder !== null) {
    ui.toast("The key is already held.");
    return;
  }
  audio.click();
  state.keyHolder = state.activePlayer;
  ui.hideKey();
  ui.setPlayerKey(state.activePlayer, true);
  ui.toast(`${playerName()} secures the key.`, "success");
  audio.clue();
  switchTurn();
}

function onClickCabinet(): void {
  if (state.phase !== "playing") return;
  if (state.cabinetOpen) {
    ui.toast("Wardrobe is open — examine the photograph inside.");
    return;
  }
  if (state.keyHolder === null) {
    ui.toast("The wardrobe is locked. Find the key first.", "warn");
    audio.fail();
    return;
  }
  audio.click();
  state.cabinetOpen = true;
  ui.openCabinet();
  ui.showPhoto();
  ui.toast(`${playerName()} unlocks the wardrobe — a photograph is pinned inside.`, "success");
  audio.success();
  switchTurn();
}

function onClickPhoto(): void {
  if (state.phase !== "playing") return;
  if (!state.cabinetOpen) {
    ui.toast("Wardrobe is locked. Can't see anything.", "warn");
    return;
  }
  audio.click();
  if (addClue(state, "year1998")) {
    ui.renderClues(state.clues);
    ui.toast(`${playerName()}: the photograph shows 1998 — and "follow the rainbow".`, "success");
    audio.clue();
    switchTurn();
  } else {
    ui.toast(`${playerName()}: 1998. You already know this.`);
  }
}

function onClickCorkboard(): void {
  if (state.phase !== "playing") return;
  audio.click();
  if (hasClue(state, "ciphercard")) {
    ui.toast(`Cipher: R=2  Y=8  G=4  B=7 → safe code is 2847`);
    return;
  }
  addClue(state, "ciphercard");
  ui.renderClues(state.clues);
  ui.toast(`${playerName()} decodes the corkboard — R=2  Y=8  G=4  B=7 → 2847`, "success");
  audio.clue();
  switchTurn();
}

function onClickSafe(): void {
  if (state.phase !== "playing") return;
  if (!state.safeVisible) {
    ui.toast("There's nothing here yet.");
    return;
  }
  if (state.safeOpen) {
    ui.toast("The safe is already open — take the USB drive.");
    return;
  }
  audio.click();
  ui.openSafeModal();
}

function onClickUsb(): void {
  if (state.phase !== "playing") return;
  if (!state.safeOpen) return;
  if (state.usbHolder !== null) {
    ui.toast("The USB drive is already secured.");
    return;
  }
  audio.usbPickup();
  state.usbHolder = state.activePlayer;
  ui.hideUsb();
  ui.setPlayerUsb(state.activePlayer, true);
  if (addClue(state, "usbfound")) ui.renderClues(state.clues);
  ui.toast(`${playerName()} secures the USB drive!`, "success");
  switchTurn();
}

function onClickLaptop(): void {
  if (state.phase !== "playing") return;
  if (state.laptopDone) {
    ui.toast("Door is unlocked — go!", "success");
    return;
  }
  audio.click();
  const usbReady = state.usbHolder !== null;
  const hint = !usbReady
    ? "USB drive required. Find the wall safe first."
    : hasClue(state, "year1998")
      ? "USB detected. Enter the year code."
      : "USB detected. Find the year from the photograph.";
  ui.openLaptopModal(hint, usbReady);
}

function onClickDoor(): void {
  if (state.phase !== "playing") return;
  if (!state.laptopDone) {
    ui.toast("The door is sealed. Access the laptop first.", "warn");
    audio.fail();
    return;
  }
  triggerWin();
}

function onSubmitCode(): void {
  const val = ui.getCodeInput();
  if (state.usbHolder === null) {
    ui.setModalStatus(false, "USB drive not inserted");
    audio.fail();
    return;
  }
  if (val === CODE_ANSWER) {
    ui.setModalStatus(true, "Access granted — door unlocked");
    state.laptopDone = true;
    ui.setLaptopDone();
    audio.win();
    setTimeout(() => {
      ui.closeLaptopModal();
      ui.toast("ACCESS GRANTED — exit door is unlocked!", "success");
      switchTurn();
    }, 1200);
  } else {
    ui.setModalStatus(false, "Incorrect code");
    audio.fail();
  }
}

function onSafeDigit(digit: string): void {
  audio.safeBeep();
  ui.appendSafeDigit(digit);
  const current = ui.getSafeInput();
  if (current.length === 4) {
    setTimeout(onSafeEnter, 150);
  }
}

function onSafeEnter(): void {
  const code = ui.getSafeInput();
  if (code.length < 4) return;
  if (code === SAFE_CODE) {
    ui.setSafeStatus(true, "Combination accepted — vault open");
    state.safeOpen = true;
    ui.openSafeBody();
    audio.safeOpen();
    setTimeout(() => {
      ui.closeSafeModal();
      ui.showUsb();
      ui.toast(`${playerName()} cracks the vault — a USB drive is inside!`, "success");
      switchTurn();
    }, 1300);
  } else {
    ui.setSafeStatus(false, "Invalid combination");
    audio.fail();
    setTimeout(() => {
      ui.resetSafeDigits();
      ui.setSafeStatus(false, "");
    }, 1000);
  }
}

// ── game init / restart ───────────────────────────────────────────────────────

function startGame(): void {
  state = makeState();
  state.phase = "playing";
  applyRoomReset();
  ui.updateLoop(state.loop);
  ui.updateTimer(state.timeLeft, LOOP_DURATION);
  ui.renderClues(state.clues);
  ui.updateActivePlayer(state.activePlayer);
  ui.showGame();
  ui.startRain();
  ui.startLampFlicker();
  startTimer();
}

function triggerWin(): void {
  if (state.timerHandle !== null) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
  state.phase = "won";
  audio.win();
  ui.showWin(state.loop, state.timeLeft, state.clues.length);
}

// ── event bindings ────────────────────────────────────────────────────────────

function bind(id: string, handler: () => void): void {
  document.getElementById(id)?.addEventListener("click", handler);
}

function bindKey(id: string, handler: () => void): void {
  document.getElementById(id)?.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") handler();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bind("btn-start", startGame);
  bind("btn-restart", () => {
    ui.showStart();
  });

  // Room objects
  bind("obj-note", onClickNote);
  bind("obj-painting", onClickPainting);
  bind("obj-key", onClickKey);
  bind("obj-cabinet", onClickCabinet);
  bind("obj-photo", onClickPhoto);
  bind("obj-corkboard", onClickCorkboard);
  bind("obj-safe", onClickSafe);
  bind("obj-usb", onClickUsb);
  bind("obj-laptop", onClickLaptop);
  bind("obj-door", onClickDoor);

  // Laptop modal
  bind("modal-cancel", ui.closeLaptopModal);
  bind("modal-close", ui.closeLaptopModal);
  bind("modal-submit", onSubmitCode);
  bindKey("code-input", onSubmitCode);
  document.getElementById("code-input")?.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Escape") ui.closeLaptopModal();
  });
  document.getElementById("modal-laptop")?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "modal-laptop") ui.closeLaptopModal();
  });

  // Safe modal
  bind("safe-modal-close", ui.closeSafeModal);
  bind("np-clear", ui.clearSafeDigit);
  bind("np-enter", onSafeEnter);
  document.querySelectorAll(".np-btn[data-digit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      onSafeDigit((btn as HTMLElement).dataset.digit ?? "");
    });
  });
  document.getElementById("modal-safe")?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "modal-safe") ui.closeSafeModal();
  });
  document.addEventListener("keydown", (e) => {
    const ke = e as KeyboardEvent;
    const safeOpen = !document.getElementById("modal-safe")?.classList.contains("hidden");
    if (!safeOpen) return;
    if (ke.key >= "0" && ke.key <= "9") onSafeDigit(ke.key);
    if (ke.key === "Backspace") ui.clearSafeDigit();
    if (ke.key === "Enter") onSafeEnter();
    if (ke.key === "Escape") ui.closeSafeModal();
  });
});
