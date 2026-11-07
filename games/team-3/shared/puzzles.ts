// biome-ignore-all lint/correctness/noVoidTypeReturn: each puzzle branch ends with `return say(p, ...)`, which reads as "answer and stop"; say() returns nothing.
/**
 * Time Loop Escape puzzles and story, ported from the team repo's plain-JS puzzles.js.
 * Pure and browser-safe: no clocks, no Math.random(). Answers come from a seed the room draws from ctx.rng.
 *
 * Co-op: both players have the same rooms, but their answers differ, and some of your clues sit in your
 * PARTNER's room. They read them out to you in the chat. Lore ("Meridian Trust, floor 14"): every
 * 13 October two night auditors sign in, the door lets only one out, and whoever stays feeds the clock.
 */

import { SeededRandom } from "@sdm/core/shared";
import type { SimContext } from "@sdm/core/sim";
import { InputRequest, type Player, type TimeLoopConfig, type TimeLoopState } from "./index.ts";

export type Ctx = SimContext<TimeLoopState, TimeLoopConfig>;
export type Role = "A" | "B";

export interface Answers {
  color: string;
  clicks: number;
  year: string;
  casket: "left" | "right";
  keypad: string;
  vent: string;
}

// ---------- answers: never synced, worked out from a per-room seed ----------
const roomSeeds = new WeakMap<TimeLoopState, number>();
/** Called from init(): draw the seed every answer in this room comes from. */
export function seedAnswers(ctx: Ctx): void {
  roomSeeds.set(ctx.state, ctx.rng.int(1, 2 ** 31 - 2));
}
export function answersFor(ctx: Ctx, role: Role): Answers {
  const r = new SeededRandom((roomSeeds.get(ctx.state) ?? 1) + (role === "B" ? 2 : 1));
  const c = ctx.config;
  const digits = (n: number) => String(r.int(10 ** (n - 1), 10 ** n - 1));
  return {
    color: c.painting.colors[r.int(0, c.painting.colors.length - 1)] as string,
    clicks: r.int(c.painting.minClicks, c.painting.maxClicks),
    year: String(r.int(c.years[0], c.years[1])),
    casket: r.int(0, 1) ? "right" : "left",
    keypad: digits(c.keypadDigits),
    vent: digits(c.ventDigits),
  };
}
/** Does your photo show your partner's year? Same for both players. */
export function photoIsRemote(ctx: Ctx): boolean {
  return new SeededRandom((roomSeeds.get(ctx.state) ?? 1) + 3).next() < 0.5;
}

// ---------- small helpers on one player's state ----------
const flag = (p: Player, name: string) => p.flags.get(name) ?? 0;
const setFlag = (p: Player, name: string, v: number | boolean) => p.flags.set(name, Number(v));
export const hasItem = (p: Player, id: string) => p.items.includes(id);
const addItem = (p: Player, id: string) => p.items.push(id);
const knows = (p: Player, text: string) => p.clues.some((c) => c.includes(text));
function addClue(p: Player, text: string): void {
  if (!p.clues.includes(text)) p.clues.push(text);
}
const remember = (p: Player, text: string) => addClue(p, `Memory: ${text}`);
export function say(p: Player, text: string, kind = ""): void {
  p.message = text;
  p.messageKind = kind;
}
const atLoop = (p: Player, lines: string[]) => lines[Math.min(p.loop, lines.length) - 1] as string;
const roleOf = (p: Player): Role => (p.role === "B" ? "B" : "A");
const otherRole = (p: Player): Role => (p.role === "B" ? "A" : "B");

export function partnerOf(ctx: Ctx, playerId: string): Player | undefined {
  for (const [id, p] of ctx.state.players) if (id !== playerId) return p;
  return undefined;
}
const partnerName = (ctx: Ctx, playerId: string) => partnerOf(ctx, playerId)?.name ?? "your partner";

/** Your partner told you, in the chat (spread over any number of lines). Numbers must stand alone. */
export function partnerSaid(ctx: Ctx, playerId: string, ...words: string[]): boolean {
  const heard = ` ${ctx.state.chat
    .filter((m) => m.fromId !== playerId)
    .map((m) => m.text)
    .join(" ")
    .toUpperCase()} `;
  return words.every((w) =>
    /^\d+$/.test(w) ? new RegExp(`(^|\\D)${w}(\\D|$)`).test(heard) : heard.includes(w.toUpperCase()),
  );
}
const inputLocked = (p: Player) => p.flags.has("lockedUntil") && p.timeLeft > flag(p, "lockedUntil");
function askInput(p: Player, forId: string, label: string): void {
  const req = new InputRequest();
  req.for = forId;
  req.label = label;
  p.input = req;
}

// ---------- the loop ----------
export function openingLine(stage: number): string {
  return [
    "",
    "Your partner can see things you can't. Talk to them.",
    "The keypad here has no power. Find where the power comes from.",
    "Nothing in this shaft has power yet, and the lift is no way out. Look up.",
  ][stage] as string;
}
/** A fresh loop (or the first one): back to level 1, everything relocked. Clues and chat stay. */
export function startLoop(ctx: Ctx, p: Player): void {
  p.timeLeft = ctx.state.loopSeconds;
  p.stage = 1;
  p.items.clear();
  p.flags.clear();
  p.input = undefined;
}
export function resetLoop(ctx: Ctx, p: Player): void {
  p.loop++;
  startLoop(ctx, p);
  p.step = 0;
  say(p, "Time ran out. The loop reset: your items are gone, your journal stays.", "reset");
  setFlag(p, "justReset", 1); // the client shows what was lost and kept until the next click
}
function progress(p: Player, step: number): void {
  p.step = Math.max(p.step, step);
  setFlag(p, "lastProgressAt", p.timeLeft); // the hint clock restarts
}
function enterStage(ctx: Ctx, playerId: string, p: Player, stage: number, text: string): void {
  p.stage = stage;
  p.timeLeft += ctx.config.levelBonus;
  p.flags.delete("lockedUntil"); // measured against timeLeft, which just jumped
  say(p, `${text} (+${ctx.config.levelBonus}s) ${openingLine(stage)}`);
  progress(p, stage === 2 ? 5 : 7);
  const partner = partnerOf(ctx, playerId);
  if (partner && !partner.escaped)
    say(partner, `${p.name} reached ${stage === 2 ? "the casket corridor" : "the lift shaft"}.`);
}
export function escapeVent(ctx: Ctx, playerId: string, p: Player): void {
  p.escaped = true;
  setFlag(p, "escaped", 1);
  p.input = undefined;
  const partner = partnerOf(ctx, playerId);
  if (partner?.escaped) {
    say(
      p,
      "You crawl through the vent and drop into the street. Dawn. You walk out together. Upstairs, for the first time, two names are signed out. The clock stops.",
    );
    ctx.state.won = true;
    ctx.state.phase = "over";
    return;
  }
  say(
    p,
    `You crawl through the vent and drop into the street. Dawn. You're out, but upstairs ${partnerName(ctx, playerId)}'s name still has no sign-out. Talk them through it.`,
  );
  if (partner) say(partner, `${p.name} made it out. They're waiting for you. Ask them what they know.`);
}
/** Debug `skip` (and the old admin button): as if this level's exit were solved. */
export function skipLevel(ctx: Ctx, playerId: string, p: Player): void {
  if (ctx.state.phase !== "playing" || p.escaped) return;
  p.input = undefined;
  if (p.stage === 1)
    enterStage(ctx, playerId, p, 2, "You skip ahead. The door opens onto the casket corridor.");
  else if (p.stage === 2)
    enterStage(ctx, playerId, p, 3, "You skip ahead. The wall slides open onto the lift shaft.");
  else escapeVent(ctx, playerId, p);
}

// ---------- hints: stuck too long -> a vague whisper, twice as long -> a plain one ----------
function nextHint(ctx: Ctx, playerId: string, p: Player): [string, string, string] {
  const me = answersFor(ctx, roleOf(p));
  const name = partnerName(ctx, playerId);
  if (p.stage === 1) {
    if (!hasItem(p, "key") && !flag(p, "paintingMoved")) {
      return partnerSaid(ctx, playerId, me.color, String(me.clicks))
        ? ["painting", "You know the painting's code now.", `Click the painting exactly ${me.clicks} times.`]
        : [
            "ask-painting",
            "The painting matters, but its code isn't in your room.",
            `Ask ${name} what the note in their room says: your painting's colour and a number.`,
          ];
    }
    if (!flag(p, "cabinetOpen")) return ["cabinet", "Keys open things.", "Use the key on the cabinet."];
    if (!flag(p, "doorUnlocked")) {
      if (!knows(p, "dated")) return ["photo", "The card told you where to look.", "Look at the photograph."];
      return [
        "computer",
        "The computer wants a year. Yours.",
        photoIsRemote(ctx)
          ? `Your year is on ${name}'s photo, not yours. Ask them, then type it into the computer.`
          : "Type the year from your photograph into the computer.",
      ];
    }
    return ["door", "Something unlocked behind you.", "Go through the door."];
  }
  if (p.stage === 2) {
    if (!flag(p, "casketOpen"))
      return [
        "casket",
        "One casket is safe. One is hungry.",
        `${name}'s cabinet says which casket holds your code. Ask them before you open one.`,
      ];
    if (!flag(p, "powerOn"))
      return [
        "fusebox",
        "The keypad is dead. Something here still has power.",
        "Throw the switch on the fuse box.",
      ];
    return ["keypad", "You have the code.", "Type the code from the casket into the keypad."];
  }
  if (!flag(p, "liftPower") && !hasItem(p, "fuse"))
    return ["hatch", "Nothing down here has power. Look up.", "Search the hatch in the roof of the shaft."];
  if (!flag(p, "liftPower"))
    return ["lift-breaker", "That fuse belongs somewhere.", "Put the fuse in the lift breaker."];
  if (!partnerSaid(ctx, playerId, me.vent))
    return [
      "ask-vent",
      "The vent's lock has a code. Not one in your room.",
      `The code is in your partner's room. Ask ${name} for the vent code.`,
    ];
  return ["vent", "The fan has stopped. You know the code.", "Open the vent with the code."];
}
function hintTick(ctx: Ctx, playerId: string, p: Player): void {
  const h = ctx.config.hints;
  const after = p.loop <= h.earlyLoops ? h.afterEarly : h.after; // first-timers get help sooner
  if (!after || p.escaped || p.input) return;
  const stuck = (p.flags.get("lastProgressAt") ?? ctx.state.loopSeconds) - p.timeLeft;
  if (stuck < after) return;
  const [step, vague, plain] = nextHint(ctx, playerId, p);
  const tier = stuck >= 2 * after ? 2 : 1;
  const key = `${step}${tier}`;
  if (p.flags.get(`hinted:${key}`)) return;
  setFlag(p, `hinted:${key}`, 1);
  say(p, `A whisper, in your own voice: ${tier === 1 ? vague : plain}`, "hint");
}
/** One second of one player's loop: count down, reset at 0, maybe whisper a hint. */
export function secondPassed(ctx: Ctx, playerId: string, p: Player): void {
  if (ctx.state.phase !== "playing" || p.escaped) return;
  p.timeLeft = Math.max(0, p.timeLeft - 1);
  if (p.timeLeft === 0) return resetLoop(ctx, p);
  hintTick(ctx, playerId, p);
}

// ---------- clicks ----------
const OFFICE = [
  "note",
  "painting",
  "cabinet",
  "photo",
  "computer",
  "door",
  "clock",
  "shelf",
  "lamp",
  "phone",
  "coat",
  "vending",
  "scratches",
];
const CORRIDOR = ["casket-left", "casket-right", "keypad", "fusebox", "shoes", "bricked-door", "candles"];
const SHAFT = [
  "lift",
  "lift-panel",
  "hatch",
  "lift-breaker",
  "vent",
  "gate",
  "indicator",
  "emergency-phone",
  "graffiti",
];
export const OBJECT_IDS = [...OFFICE, ...CORRIDOR, ...SHAFT];
const FOR_PARTNER = "This isn't for you. Read it to your partner.";

export function click(ctx: Ctx, playerId: string, p: Player, id: string): void {
  if (ctx.state.phase !== "playing" || p.escaped) return;
  p.flags.delete("justReset"); // the reset overlay goes away on the next click
  const stageOf = OFFICE.includes(id) ? 1 : CORRIDOR.includes(id) ? 2 : SHAFT.includes(id) ? 3 : 0;
  if (stageOf === 1 && p.stage !== 1)
    return say(
      p,
      id === "door" ? "The door is behind you now." : "That's back in the office. You can't go back.",
    );
  if (stageOf && stageOf !== p.stage) return say(p, "It isn't here. Not yet.");
  const me = answersFor(ctx, roleOf(p));
  const them = answersFor(ctx, otherRole(p));
  const name = partnerName(ctx, playerId);
  const night = ctx.config.night;
  const later = p.loop >= 2;
  const much = p.loop >= 3;

  switch (id) {
    // ---------- level 1: the office ----------
    case "note":
      addClue(p, `For ${name}: "${them.color} - ${them.clicks}"`);
      say(
        p,
        atLoop(p, [
          `A note addressed to ${name}: "${them.color} - ${them.clicks}". It's in your handwriting. You don't remember writing it. ${FOR_PARTNER}`,
          `The same note for ${name}, in your handwriting: "${them.color} - ${them.clicks}". The ink is still wet. ${FOR_PARTNER}`,
        ]),
      );
      if (!hasItem(p, "key") && !flag(p, "cabinetOpen")) progress(p, 1);
      return;
    case "painting": {
      if (flag(p, "paintingMoved")) return say(p, "Only the hole behind it remains. It breathes.");
      if (!partnerSaid(ctx, playerId, me.color, String(me.clicks)))
        return say(
          p,
          `A ${me.color.toLowerCase()} painting. The code for it is in your partner's room. Ask them.`,
        );
      const clicks = flag(p, "paintingClicks") + 1;
      setFlag(p, "paintingClicks", clicks);
      if (clicks === me.clicks) {
        setFlag(p, "paintingMoved", 1);
        addItem(p, "key");
        say(
          p,
          atLoop(p, [
            'The painting swings aside. A key drops out. Its paper tag reads: "14-B. Return before sunrise."',
            'The painting swings aside. The same key, the same tag. On the back, in your handwriting: "Again."',
          ]),
        );
        return progress(p, 2);
      }
      return say(
        p,
        [
          "The painting tilts. It wasn't you.",
          "Something behind the canvas scratches back.",
          "The frame is warm now. Like skin.",
        ][(clicks - 1) % 3] as string,
      );
    }
    case "cabinet":
      if (flag(p, "cabinetOpen"))
        return say(p, "The cabinet is empty now. You're sure something was watching from inside.");
      if (!hasItem(p, "key")) return say(p, "It's locked. Something inside knocks back.");
      setFlag(p, "cabinetOpen", 1);
      addClue(p, "Find the year on the photograph");
      addClue(p, `For ${name}: the code sleeps in the ${them.casket.toUpperCase()} casket`);
      say(
        p,
        `The key turns. Two cards inside. One: "Find the year on the photograph". The other, for ${name}: "${them.casket.toUpperCase()} casket". That one isn't for you. Read it to your partner.` +
          (later
            ? p.role === "A"
              ? " Under them, your own Meridian Trust badge. Night auditor. The photo on it has been scratched off."
              : ` Under them, a missing-person flyer. MISSING: ${name}. Last seen at Meridian Trust, ${night}.`
            : ""),
      );
      if (later)
        remember(
          p,
          p.role === "A"
            ? "My own staff badge was in the cabinet. I worked here. I never went home."
            : `A missing-person flyer for ${name} was in the cabinet. I came here looking for them.`,
        );
      return progress(p, 3);
    case "photo": {
      if (!knows(p, "Find the year"))
        return say(p, "A photo of two night auditors. The faces mean nothing to you. Yet.");
      const remote = photoIsRemote(ctx);
      const year = remote ? them.year : me.year;
      addClue(p, remote ? `For ${name}: the photo is dated ${year}` : `The photograph is dated ${year}`);
      say(
        p,
        `A photo of the night shift: "${night}, ${year}". Two people. One face is scratched out. The other is yours.` +
          (remote
            ? ` On the back, in your handwriting: "${year} is ${name}'s password, not yours." ${FOR_PARTNER} Yours is in their room.`
            : ' On the back: "Your password: the year."'),
      );
      if (later)
        remember(p, `Every photo shows the same night, ${night}, in a different year. I'm in all of them.`);
      return;
    }
    case "computer":
      if (!knows(p, "Find the year"))
        return say(p, "The screen asks for a password. You have no idea where to start.");
      if (inputLocked(p)) return say(p, "The screen is frozen. Something is still reading your last answer.");
      askInput(p, "computer", "Password");
      return say(
        p,
        photoIsRemote(ctx)
          ? `The screen wants your year. It isn't on your photo: ${name} has it.`
          : "The screen wants a password. The year on your photo.",
      );
    case "door":
      if (!flag(p, "doorUnlocked")) {
        say(
          p,
          atLoop(p, [
            'The door won\'t budge. Taped to it: the ad you answered. "NIGHT AUDITORS WANTED. Floor 14. Cash. No questions."',
            `The door won't budge. Under the ad, in your handwriting: "DON'T LEAVE WITHOUT ${name.toUpperCase()}."`,
            "The door won't budge. On the other side, something whispers your name in your own voice.",
          ]),
        );
        return remember(
          p,
          p.role === "B"
            ? "I answered the same ad they did: night auditors wanted, floor 14. It was the only way in."
            : "I answered an ad: night auditors wanted, floor 14, cash, no questions.",
        );
      }
      return enterStage(
        ctx,
        playerId,
        p,
        2,
        "The door opens onto a corridor that wasn't there before. Bricked-up offices on both sides, candles burning on the floor, and two caskets laid across it. At the far end, a keypad sits dark and dead.",
      );
    case "clock":
      say(
        p,
        atLoop(p, [
          "The clock has no hands. You can still hear it ticking down.",
          `Tally marks are scratched beside the clock. ${p.loop} of them. The newest is in your handwriting.`,
          `${p.loop} marks now. Under them are older ones, hundreds, in handwriting that isn't yours.`,
        ]),
      );
      if (later) remember(p, "The tally marks by the clock are in my handwriting. I have been here before.");
      return;
    case "shelf":
      say(
        p,
        atLoop(p, [
          `The visitor log lies open at tonight. Two signatures at 23:59: yours, and ${name}'s. Neither of you has signed out.`,
          `Older pages of the log. Every ${night}, two names sign in. Only one ever signs out.`,
          "Every book on the shelf has the same title: YOU WERE HERE BEFORE.",
          "The first page of the log is a hundred years old. Two names. Nobody, on any page, has ever signed out together.",
        ]),
      );
      remember(p, `I signed in at 23:59. ${name} signed in right under me.`);
      if (later) remember(p, `Every ${night} two people sign in to floor 14. Only one ever signs out.`);
      if (p.loop >= 4) remember(p, "Nobody has ever signed out together.");
      return;
    case "lamp":
      say(
        p,
        atLoop(p, [
          "The light flickers in a rhythm. Like a heartbeat. Not yours.",
          "The light stutters: three short, three long, three short. Someone tried to call for help from here.",
          "In the flicker you see it under the lamp: a figure with no face. It is wearing your shoes.",
        ]),
      );
      if (much) remember(p, "The thing with no face wears my shoes. It used to be one of us.");
      return;
    case "phone":
      say(
        p,
        atLoop(p, [
          'You lift the receiver. Dial tone. Then breathing. Then your own voice: "Don\'t answer it next time."',
          `It rings before you touch it. Your voice again: "Is ${name} still with you? Don't let go of them."`,
          "The cord has been cut. It's still ringing.",
        ]),
      );
      if (later) remember(p, "The office phone calls from inside the building. It has my voice.");
      return;
    case "coat":
      say(
        p,
        atLoop(p, [
          `A coat on the hook. In the pocket: a Meridian Trust payslip in your name, dated ${night}. Paid in cash.`,
          "The same coat. Dust lies thick on the shoulders, like it's been hanging here for years. It's your size.",
        ]),
      );
      return remember(
        p,
        later
          ? "The coat by the door is mine. It's been hanging there for years."
          : `There's a payslip in the coat with my name on it, dated ${night}.`,
      );
    case "vending":
      say(
        p,
        atLoop(p, [
          'The vending machine hums. Every slot holds the same packet, labelled "TIME". The price tag reads: one of you.',
          "You press a button. Something drops: a Meridian Trust badge with a bite taken out of it.",
        ]),
      );
      if (later)
        remember(p, "A bitten staff badge came out of the vending machine. Somebody paid with a person.");
      return;
    case "scratches":
      say(
        p,
        atLoop(p, [
          "Fingernail marks gouged into the inside of the door frame. Someone wanted out very badly.",
          "Among the scratches, two names. One of them is yours. The marks under your name are fresh.",
        ]),
      );
      if (later) remember(p, "My name is scratched into the door frame, under someone else's.");
      return;

    // ---------- level 2: the casket corridor ----------
    case "casket-left":
    case "casket-right": {
      if (flag(p, "casketOpen")) return say(p, "You've already disturbed enough of the dead tonight.");
      if ((id === "casket-left" ? "left" : "right") !== me.casket) {
        p.timeLeft = Math.max(1, p.timeLeft - ctx.config.vampireDrain);
        say(
          p,
          `The lid slides open. Something in a Meridian Trust badge sits up and drinks the seconds out of you. (-${ctx.config.vampireDrain}s) The other casket, maybe.`,
        );
        return remember(
          p,
          "The things in the caskets wear Meridian Trust badges. They're the ones who stayed behind.",
        );
      }
      setFlag(p, "casketOpen", 1);
      addClue(p, `The keypad code is ${me.keypad}`);
      addClue(p, `For ${name}: the vent's screw-lock code is ${them.vent}`);
      say(
        p,
        `Empty, except for a torn diary page with your code: "${me.keypad}". On the back: "They went first. I stayed. I'm so hungry." A second scrap, for ${name}: "VENT ${them.vent}". ${FOR_PARTNER}`,
      );
      if (later) remember(p, 'A diary page from someone who stayed behind: "I\'m so hungry."');
      return progress(p, 6);
    }
    case "fusebox":
      if (flag(p, "powerOn"))
        return say(p, "The switch is up. The bulbs buzz. Don't look at what they show you.");
      setFlag(p, "powerOn", 1);
      return say(
        p,
        "You throw the big switch. The corridor bulbs flicker on, one by one, toward you. The keypad lights up.",
      );
    case "keypad":
      if (!flag(p, "powerOn"))
        return say(
          p,
          "The keypad is dead. No light, no sound. Somewhere in the corridor there must be power.",
        );
      if (!knows(p, "The keypad code is"))
        return say(p, "Three digits. You could guess, but something is listening for wrong ones.");
      if (inputLocked(p)) return say(p, "The keypad is still flashing red. Wait.");
      return askInput(p, "keypad", "Code");
    case "shoes":
      say(
        p,
        atLoop(p, [
          "A pair of office shoes, placed neatly side by side. Your size. The laces are still tied.",
          "The shoes have moved. They're facing you now.",
        ]),
      );
      if (later) remember(p, "There are shoes in the corridor in my size. They move when I look away.");
      return;
    case "bricked-door":
      say(
        p,
        atLoop(p, [
          "A bricked-up office door. From behind it, someone knocks twice, like a question.",
          "You knock back twice. The knocking stops. Then it starts again on every door at once.",
        ]),
      );
      if (much) remember(p, "Every bricked-up door in the corridor has someone behind it, still knocking.");
      return;
    case "candles":
      say(
        p,
        atLoop(p, [
          "Candles burnt down to stubs, still burning. Nobody lit them.",
          "In the candle smoke, two shapes are holding a door open between them.",
        ]),
      );
      if (later) remember(p, "In the candle smoke I saw two people holding a door open together.");
      return;

    // ---------- level 3: the lift shaft. The way out is the vent beside the lift. ----------
    case "lift":
      return say(
        p,
        atLoop(p, [
          'A sign hangs on the cage: "OUT OF ORDER". It has been out of order since 1902.',
          "You press every button. None of them light up. The lift was never going to take you out.",
        ]),
      );
    case "lift-panel":
      return say(
        p,
        "Buttons from G to 20, all dead. Someone has scratched next to them: THE DOOR OPENS FOR ONE.",
      );
    case "hatch":
      if (flag(p, "liftPower") || hasItem(p, "fuse"))
        return say(p, "Nothing else up there. Just the sound of something breathing on the roof.");
      addItem(p, "fuse");
      say(p, "You force the roof hatch. Wrapped in an old payslip, a fuse, still warm.");
      return progress(p, 8);
    case "lift-breaker":
      if (flag(p, "liftPower")) return say(p, "The breaker hums. The vent fan beside the lift has stopped.");
      if (!hasItem(p, "fuse"))
        return say(p, "A breaker box with one empty fuse slot. Nothing down here has power.");
      setFlag(p, "liftPower", 1);
      say(
        p,
        "The fuse clicks in. The shaft lights stutter on, and the big fan in the vent beside the lift winds down and stops.",
      );
      return progress(p, 9);
    case "vent":
      if (!flag(p, "liftPower"))
        return say(
          p,
          "A vent beside the lift. Behind the grille, the fan blades are still spinning, fast enough to take a hand off.",
        );
      if (!partnerSaid(ctx, playerId, me.vent))
        return say(
          p,
          "The grille is held by a screw lock with a code. The code is in your partner's room. Ask them.",
        );
      if (inputLocked(p)) return say(p, "The screw lock has jammed. Wait.");
      return askInput(p, "vent", "Vent code");
    case "gate":
      if (flag(p, "gateClosed"))
        return say(
          p,
          "The gate is shut. Through the bars, the shaft goes down further than the building is tall.",
        );
      setFlag(p, "gateClosed", 1);
      return say(
        p,
        "You drag the cage gate shut. It screams the whole way. Nothing happens. Nothing was ever going to.",
      );
    case "indicator":
      return say(
        p,
        atLoop(p, [
          "The floor needle swings past 14 and keeps going. There's no 15 printed on the dial, but it stops there anyway.",
          "The needle points at you.",
        ]),
      );
    case "emergency-phone":
      say(
        p,
        atLoop(p, [
          'A red emergency phone. A tired voice: "Meridian Trust night desk. Have you both signed out?" Click.',
          '"Night desk. We only ever see one of you at sunrise. Every year, one." Click.',
        ]),
      );
      return remember(
        p,
        "The night desk asked if we had both signed out. Only one ever comes down at sunrise.",
      );
    case "graffiti":
      say(
        p,
        atLoop(p, [
          "Scratched into the wall by many hands: THE DOOR OPENS FOR ONE.",
          "Under THE DOOR OPENS FOR ONE, newer and deeper, in your handwriting: UNLESS.",
        ]),
      );
      if (later) remember(p, 'Someone, me, scratched "UNLESS" under THE DOOR OPENS FOR ONE.');
      return;
    default:
      return say(p, "Nothing. But something saw you touch it.");
  }
}

// ---------- the in-game input box: answer(text) on submit, answer(null) on cancel ----------
export function answer(ctx: Ctx, playerId: string, p: Player, text: string | null): void {
  const what = p.input?.for;
  p.input = undefined;
  if (!what || ctx.state.phase !== "playing" || p.escaped) return;
  const given = (text ?? "").trim();
  if (!given) return say(p, "You step back."); // cancel or an empty box never costs a lock
  const me = answersFor(ctx, roleOf(p));
  const wrong = (msg: string) => {
    setFlag(p, "lockedUntil", p.timeLeft - ctx.config.wrongCodeLock);
    say(p, `${msg} (locked for ${ctx.config.wrongCodeLock}s)`);
  };
  if (what === "computer") {
    if (given !== me.year)
      return wrong(
        `Access denied. For a second the screen shows your face, from behind.${photoIsRemote(ctx) ? ` The year on your photo is ${partnerName(ctx, playerId)}'s. Ask them for yours.` : ""}`,
      );
    setFlag(p, "doorUnlocked", 1);
    if (p.loop >= 3) {
      say(
        p,
        'ACCESS GRANTED. One unread memo: "To whoever is left. The door opens for one. The one who stays feeds the clock. Unless two hold it open together." Behind you, the door unlocks.',
      );
      remember(
        p,
        "A memo: the door opens for one, and the one who stays feeds the clock. Unless two hold it open together.",
      );
    } else say(p, "ACCESS GRANTED. Behind you, the door unlocks by itself.");
    return progress(p, 4);
  }
  if (what === "keypad") {
    if (given !== me.keypad) return wrong("The keypad buzzes. In one of the caskets, something turns over.");
    return enterStage(
      ctx,
      playerId,
      p,
      3,
      "The wall slides open onto a lift shaft. An old cage lift waits, a vent with a spinning fan beside it, a hatch in the roof above. Somewhere above you, the night desk phone is ringing.",
    );
  }
  if (what === "vent") {
    if (given !== me.vent) return wrong("The screw lock grinds and holds. Something in the duct laughs.");
    return escapeVent(ctx, playerId, p);
  }
}
