// Owner: Puzzles (see README)
// Co-op: both players have the same rooms, but each player's answers are different, and some of your clues sit in
// your PARTNER's room. They read them out to you in the chat. Answers come from game.seed, so they change every match.

// Tuning: becomes config/game.json in the course port
const COLORS = ["BLUE", "RED", "GREEN", "WHITE", "BLACK"];
const WRONG_CODE_LOCK = 5;    // seconds the input stays locked after a wrong code
const VAMPIRE_DRAIN = 20;     // seconds a vampire takes when you open the wrong casket
const LEVEL_BONUS = 60;       // seconds added when you enter a new level
const NIGHT = "13 October";

// Answers for one role, from the seed. Independent of rand()'s position, so call order never matters.
function puzzleAnswers(role) {
  const r = mulberry32(game.seed + (role === "B" ? 2 : 1));
  const pick = (n) => Math.floor(r() * n);
  return {
    color: COLORS[pick(COLORS.length)],      // the painting's colour (the UI can tint it)
    clicks: 3 + pick(4),                     // painting clicks: 3-6
    year: String(1950 + pick(50)),           // computer password, on a photo
    casket: pick(2) ? "right" : "left",      // level 2: the casket with your code in it
    keypad: String(100 + pick(900)),         // level 2 exit code, inside that casket
    floor: String(2 + pick(18)),             // level 3: lift floor, inside your PARTNER's casket
  };
}
function photoIsRemote() { return mulberry32(game.seed + 3)() < 0.5; }  // does your photo show your partner's year?
function mine() { return puzzleAnswers(game.role); }
function theirs() { return puzzleAnswers(game.role === "A" ? "B" : "A"); }
function partnerName() { return game.partner ? game.partner.name : "your partner"; }
function knows(text) { return game.clues.some((c) => c.includes(text)); }  // found it in this match (journal)
function partnerSaid(...words) {  // your partner told you, in the chat (spread over any number of lines)
  const heard = " " + game.chat.filter((m) => !m.mine).map((m) => m.text).join(" ").toUpperCase() + " ";
  // numbers must stand alone ("2" doesn't match "12"); words just have to appear
  return words.every((w) => /^\d+$/.test(w) ? new RegExp(`(^|\\D)${w}(\\D|$)`).test(heard) : heard.includes(w.toUpperCase()));
}
const OFFICE = ["note", "painting", "cabinet", "photo", "computer", "door", "clock", "shelf", "lamp"];  // level 1 objects
function inputLocked() { return !isAdmin() && game.flags.lockedUntil !== undefined && game.timeLeft > game.flags.lockedUntil; }

// ponytail: testing cheat, becomes a ?debug command in the course port. The name "admin" (any case) passes every gate,
// any code is right, nothing drains time, and the timer never runs out. Checked only at the gates below.
function isAdmin() { return String(game.playerName || "").toLowerCase() === "admin"; }
function adminSkip() {  // the UI's "Skip level" button: as if this level's exit were solved
  if (!isAdmin() || game.phase !== "playing" || game.flags.escaped) return;
  game.input = null;
  if (game.stage === 1) enterStage(2, "You skip ahead. The door opens onto the casket corridor.");
  else if (game.stage === 2) enterStage(3, "You skip ahead. The wall slides open onto the lift shaft.");
  else escapeNow();
}

// Lore: "Meridian Trust, floor 14". Every year on the night of 13 October the firm hires two night auditors.
// They sign in at 23:59, and the door lets only one of them out. The one who stays becomes one of the hungry things
// that feed on time to keep the clock running (the faceless figure, the vampires in the caskets). The players have
// been here together for many years, so the notes they find for each other are in their own handwriting.
// Role A is the auditor who never went home. Role B is the one who came looking for them.
// Objects say more on later loops, and "Memory:" pages collect in the journal (loop 1 how, 2 who, 3 what, 4+ truth).
function atLoop(lines) { return lines[Math.min(game.loop, lines.length) - 1]; }
function remember(text) { addClue("Memory: " + text); }

// Progress the partner sees: steps 1 note, 2 key, 3 cabinet, 4 computer, 5 level 2, 6 casket, 7 level 3
function progress(step) { send("progress", { loop: game.loop, step, stage: game.stage }); }

function enterStage(stage, text) {
  game.stage = stage;
  game.timeLeft += LEVEL_BONUS;
  delete game.flags.lockedUntil;  // the lock is measured against timeLeft, which just jumped
  say(text + ` (+${LEVEL_BONUS}s)`);
  progress(stage === 2 ? 5 : 7);
}

function onObjectClick(id) {
  if (game.phase !== "playing" || game.flags.escaped) return;
  if (OFFICE.includes(id) && game.stage !== 1) return say(id === "door" ? "The door is behind you now." : "That's back in the office. You can't go back.");
  const f = game.flags, me = mine(), them = theirs(), p = partnerName(), later = game.loop >= 2, much = game.loop >= 3;
  switch (id) {
    // ---------- Level 1: the office ----------
    case "note":
      addClue(`For ${p}: "${them.color} - ${them.clicks}"`);
      say(atLoop([`A note addressed to ${p}: "${them.color} - ${them.clicks}". It's in your handwriting. You don't remember writing it. Tell ${p}.`,
                  `The same note for ${p}, in your handwriting: "${them.color} - ${them.clicks}". The ink is still wet. It always is.`]));
      if (!hasItem("key") && !f.cabinetOpen) progress(1);
      break;
    case "painting": {
      if (f.paintingMoved) { say("Only the hole behind it remains. It breathes."); break; }
      if (!isAdmin() && !partnerSaid(me.color, String(me.clicks))) { say(`A ${me.color.toLowerCase()} painting. Something about it matters, but you don't know what yet. Ask ${p} what they found.`); break; }
      const clicks = (f.paintingClicks || 0) + 1;
      setFlag("paintingClicks", clicks);
      if (clicks === me.clicks || isAdmin()) {
        setFlag("paintingMoved", true);
        addItem("key");
        say(atLoop(['The painting swings aside. A key drops out. Its paper tag reads: "14-B. Return before sunrise."',
                    'The painting swings aside. The same key, the same tag. On the back, in your handwriting: "Again."']));
        progress(2);
      } else {
        say(["The painting tilts. It wasn't you.", "Something behind the canvas scratches back.", "The frame is warm now. Like skin."][(clicks - 1) % 3]);
      }
      break;
    }
    case "cabinet":
      if (f.cabinetOpen) { say("The cabinet is empty now. You're sure something was watching from inside."); break; }
      if (!hasItem("key") && !isAdmin()) { say("It's locked. Something inside knocks back."); break; }
      setFlag("cabinetOpen", true);
      addClue("Find the year on the photograph");
      addClue(`For ${p}: the code sleeps in the ${them.casket.toUpperCase()} casket`);
      say(`The key turns. Two cards inside. One: "Find the year on the photograph". The other, for ${p}: "${them.casket.toUpperCase()} casket".`
        + (later ? (game.role === "A"
          ? " Under them, your own Meridian Trust badge. Night auditor. The photo on it has been scratched off."
          : ` Under them, a missing-person flyer. MISSING: ${p}. Last seen at Meridian Trust, 13 October.`) : ""));
      if (later) remember(game.role === "A" ? "My own staff badge was in the cabinet. I worked here. I never went home."
                                            : `A missing-person flyer for ${p} was in the cabinet. I came here looking for them.`);
      progress(3);
      break;
    case "photo": {
      if (!knows("Find the year") && !isAdmin()) { say("A photo of two night auditors. The faces mean nothing to you. Yet."); break; }
      const remote = photoIsRemote(), year = remote ? them.year : me.year;
      addClue(remote ? `For ${p}: the photo is dated ${year}` : `The photograph is dated ${year}`);
      say(`A photo of the night shift: "${NIGHT}, ${year}". Two people. One face is scratched out. The other is yours.`
        + (remote ? ` On the back, in your handwriting: "${year} is ${p}'s password, not yours. Tell them. Yours is in their room."`
                  : ` On the back: "Your password: the year."`));
      if (later) remember(`Every photo shows the same night, ${NIGHT}, in a different year. I'm in all of them.`);
      break;
    }
    case "computer":
      if (!knows("Find the year") && !isAdmin()) { say("The screen asks for a password. You have no idea where to start."); break; }
      if (inputLocked()) { say("The screen is frozen. Something is still reading your last answer."); break; }
      game.input = { for: "computer", label: "Password" };
      say(photoIsRemote() ? `The screen wants your year. It isn't on your photo: ${partnerName()} has it.` : "The screen wants a password. The year on your photo.");
      break;
    case "door":
      if (!f.doorUnlocked) {
        say(atLoop(['The door won\'t budge. Taped to it: the ad you answered. "NIGHT AUDITORS WANTED. Floor 14. Cash. No questions."',
                    `The door won't budge. Under the ad, in your handwriting: "DON'T LEAVE WITHOUT ${p.toUpperCase()}."`,
                    "The door won't budge. On the other side, something whispers your name in your own voice."]));
        remember(game.role === "B" ? "I answered the same ad they did: night auditors wanted, floor 14. It was the only way in."
                                   : "I answered an ad: night auditors wanted, floor 14, cash, no questions.");
        break;
      }
      enterStage(2, "The door opens onto a corridor that wasn't there before. Two caskets lie across the floor.");
      break;
    case "clock":
      say(atLoop(["The clock has no hands. You can still hear it ticking down.",
                  `Tally marks are scratched beside the clock. ${game.loop} of them. The newest is in your handwriting.`,
                  `${game.loop} marks now. Under them are older ones, hundreds, in handwriting that isn't yours.`]));
      if (later) remember("The tally marks by the clock are in my handwriting. I have been here before.");
      break;
    case "shelf":
      say(atLoop([`The visitor log lies open at tonight. Two signatures at 23:59: yours, and ${p}'s. Neither of you has signed out.`,
                  `Older pages of the log. Every ${NIGHT}, two names sign in. Only one ever signs out.`,
                  "Every book on the shelf has the same title: YOU WERE HERE BEFORE.",
                  "The first page of the log is a hundred years old. Two names. Nobody, on any page, has ever signed out together."]));
      remember(`I signed in at 23:59. ${p} signed in right under me.`);
      if (later) remember(`Every ${NIGHT} two people sign in to floor 14. Only one ever signs out.`);
      if (game.loop >= 4) remember("Nobody has ever signed out together.");
      break;
    case "lamp":
      say(atLoop(["The light flickers in a rhythm. Like a heartbeat. Not yours.",
                  "The light stutters: three short, three long, three short. Someone tried to call for help from here.",
                  "In the flicker you see it under the lamp: a figure with no face. It is wearing your shoes."]));
      if (much) remember("The thing with no face wears my shoes. It used to be one of us.");
      break;

    // ---------- Level 2: the corridor with two caskets ----------
    case "casket-left":
    case "casket-right": {
      const side = id === "casket-left" ? "left" : "right";
      if (game.stage !== 2) { say("A casket. The lid is nailed down from the inside."); break; }
      if (f.casketOpen) { say("You've already disturbed enough of the dead tonight."); break; }
      if (side !== me.casket && !isAdmin()) {
        game.timeLeft = Math.max(1, game.timeLeft - VAMPIRE_DRAIN);
        say(`The lid slides open. Something in a Meridian Trust badge sits up and drinks the seconds out of you. (-${VAMPIRE_DRAIN}s) The other casket, maybe.`);
        remember("The things in the caskets wear Meridian Trust badges. They're the ones who stayed behind.");
        break;
      }
      setFlag("casketOpen", true);
      addClue(`The keypad code is ${me.keypad}`);
      addClue(`For ${p}: the lift goes to floor ${them.floor}`);
      say(`Empty, except for a torn diary page with your code: "${me.keypad}". On the back: "They went first. I stayed. I'm so hungry." A second scrap, for ${p}: "FLOOR ${them.floor}".`);
      if (later) remember('A diary page from someone who stayed behind: "I\'m so hungry."');
      progress(6);
      break;
    }
    case "keypad":
      if (game.stage !== 2) { say("A keypad, dead and cold."); break; }
      if (!f.powerOn && !isAdmin()) { say("The keypad is dead. No light, no sound. Somewhere in the corridor there must be power."); break; }
      if (!knows("The keypad code is") && !isAdmin()) { say("Three digits. You could guess, but something is listening for wrong ones."); break; }
      if (inputLocked()) { say("The keypad is still flashing red. Wait."); break; }
      game.input = { for: "keypad", label: "Code" };
      render();
      break;

    // ---------- Level 3: the lift ----------
    case "lift":
      if (game.stage !== 3) { say("A lift door, painted shut."); break; }
      if (!f.gateClosed && !isAdmin()) { say("The lift won't move while its cage gate hangs open."); break; }
      if (!partnerSaid(me.floor) && !isAdmin()) { say(`The lift has every button from G to 20. Scratched into the wall: THE DOOR OPENS FOR ONE. Ask ${p} which floor.`); break; }
      if (inputLocked()) { say("The buttons are dark. Wait."); break; }
      game.input = { for: "lift", label: "Floor" };
      render();
      break;

    // ---------- Story props (#15): no puzzle, just the story. Each one only exists at its own level. ----------
    // Level 1
    case "phone":
      if (game.stage !== 1) break;
      say(atLoop(['You lift the receiver. Dial tone. Then breathing. Then your own voice: "Don\'t answer it next time."',
                  `It rings before you touch it. Your voice again: "Is ${p} still with you? Don't let go of them."`,
                  "The cord has been cut. It's still ringing."]));
      if (later) remember("The office phone calls from inside the building. It has my voice.");
      break;
    case "coat":
      if (game.stage !== 1) break;
      say(atLoop([`A coat on the hook. In the pocket: a Meridian Trust payslip in your name, dated ${NIGHT}. Paid in cash.`,
                  "The same coat. Dust lies thick on the shoulders, like it's been hanging here for years. It's your size."]));
      remember(later ? "The coat by the door is mine. It's been hanging there for years."
                     : `There's a payslip in the coat with my name on it, dated ${NIGHT}.`);
      break;
    case "vending":
      if (game.stage !== 1) break;
      say(atLoop(['The vending machine hums. Every slot holds the same packet, labelled "TIME". The price tag reads: one of you.',
                  "You press a button. Something drops: a Meridian Trust badge with a bite taken out of it."]));
      if (later) remember("A bitten staff badge came out of the vending machine. Somebody paid with a person.");
      break;
    case "scratches":
      if (game.stage !== 1) break;
      say(atLoop(["Fingernail marks gouged into the inside of the door frame. Someone wanted out very badly.",
                  "Among the scratches, two names. One of them is yours. The marks under your name are fresh."]));
      if (later) remember("My name is scratched into the door frame, under someone else's.");
      break;
    // Level 2
    case "fusebox":
      if (game.stage !== 2) break;
      if (f.powerOn) { say("The switch is up. The bulbs buzz. Don't look at what they show you."); break; }
      setFlag("powerOn", true);
      say("You throw the big switch. The corridor bulbs flicker on, one by one, toward you. The keypad lights up.");
      break;
    case "shoes":
      if (game.stage !== 2) break;
      say(atLoop(["A pair of office shoes, placed neatly side by side. Your size. The laces are still tied.",
                  "The shoes have moved. They're facing you now."]));
      if (later) remember("There are shoes in the corridor in my size. They move when I look away.");
      break;
    case "bricked-door":
      if (game.stage !== 2) break;
      say(atLoop(["A bricked-up office door. From behind it, someone knocks twice, like a question.",
                  "You knock back twice. The knocking stops. Then it starts again on every door at once."]));
      if (much) remember("Every bricked-up door in the corridor has someone behind it, still knocking.");
      break;
    case "candles":
      if (game.stage !== 2) break;
      say(atLoop(["Candles burnt down to stubs, still burning. Nobody lit them.",
                  "In the candle smoke, two shapes are holding a door open between them."]));
      if (later) remember("In the candle smoke I saw two people holding a door open together.");
      break;
    // Level 3
    case "gate":
      if (game.stage !== 3) break;
      if (f.gateClosed) { say("The gate is shut. Through the bars, the shaft goes down further than the building is tall."); break; }
      setFlag("gateClosed", true);
      say("You drag the cage gate shut. It screams the whole way. The lift buttons glow.");
      break;
    case "indicator":
      if (game.stage !== 3) break;
      say(atLoop(["The floor needle swings past 14 and keeps going. There's no 15 printed on the dial, but it stops there anyway.",
                  "The needle points at you."]));
      break;
    case "emergency-phone":
      if (game.stage !== 3) break;
      say(atLoop(['A red emergency phone. A tired voice: "Meridian Trust night desk. Have you both signed out?" Click.',
                  '"Night desk. We only ever see one of you at sunrise. Every year, one." Click.']));
      remember("The night desk asked if we had both signed out. Only one ever comes down at sunrise.");
      break;
    case "graffiti":
      if (game.stage !== 3) break;
      say(atLoop(["Scratched into the wall by many hands: THE DOOR OPENS FOR ONE.",
                  "Under THE DOOR OPENS FOR ONE, newer and deeper, in your handwriting: UNLESS."]));
      if (later) remember('Someone, me, scratched "UNLESS" under THE DOOR OPENS FOR ONE.');
      break;

    default:
      say("Nothing. But something saw you touch it.");
  }
}

// The UI's in-game input calls this: onInput(text) on submit, onInput(null) on cancel.
function onInput(text) {
  const what = game.input && game.input.for;
  game.input = null;
  if (!what || game.phase !== "playing") return render();
  const me = mine(), answer = String(text ?? "").trim();
  if (!answer && !isAdmin()) return say("You step back.");  // cancel or an empty box never costs a lock
  const right = (correct) => isAdmin() || answer === correct;
  const wrong = (msg) => { setFlag("lockedUntil", game.timeLeft - WRONG_CODE_LOCK); say(msg + ` (locked for ${WRONG_CODE_LOCK}s)`); };
  if (what === "computer") {
    if (!right(me.year)) return wrong("Access denied. For a second the screen shows your face, from behind."
      + (photoIsRemote() ? ` The year on your photo is ${partnerName()}'s. Ask them for yours.` : ""));
    setFlag("doorUnlocked", true);
    if (game.loop >= 3) {
      say(`ACCESS GRANTED. One unread memo: "To whoever is left. The door opens for one. The one who stays feeds the clock. Unless two hold it open together." Behind you, the door unlocks.`);
      remember("A memo: the door opens for one, and the one who stays feeds the clock. Unless two hold it open together.");
    } else {
      say("ACCESS GRANTED. Behind you, the door unlocks by itself.");
    }
    progress(4);
  } else if (what === "keypad") {
    if (!right(me.keypad)) return wrong("The keypad buzzes. In one of the caskets, something turns over.");
    enterStage(3, "The wall slides open onto a lift shaft. The lift is waiting, lights flickering.");
  } else if (what === "lift") {
    if (!right(me.floor)) return wrong("The lift drops a few metres and stops. Laughter from the shaft.");
    escapeNow();
  }
}

function escapeNow() {
  setFlag("escaped", true);  // stops my timer: I wait for my partner
  say(game.partner && game.partner.escaped
    ? "The lift opens onto the street. Dawn. You walk out together. Upstairs, for the first time, two names are signed out. The clock stops."
    : `The lift opens onto the street. Dawn. You're out, but upstairs ${partnerName()}'s name still has no sign-out. Talk them through it.`);
  send("escaped", { loop: game.loop });
}
