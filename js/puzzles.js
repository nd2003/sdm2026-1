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
function partnerSaid(...words) {  // your partner told you, in the chat
  return game.chat.some((m) => m.from !== game.playerName && words.every((w) => m.text.toUpperCase().includes(w.toUpperCase())));
}
function inputLocked() { return game.flags.lockedUntil !== undefined && game.timeLeft > game.flags.lockedUntil; }

// Lore: "Meridian Trust, floor 14". Objects say more on later loops, and "Memory:" pages collect in the journal.
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
  const f = game.flags, me = mine(), them = theirs(), p = partnerName(), later = game.loop >= 2, much = game.loop >= 3;
  switch (id) {
    // ---------- Level 1: the office ----------
    case "note":
      addClue(`For ${p}: "${them.color} - ${them.clicks}"`);
      say(`A note in shaking handwriting: "${them.color} - ${them.clicks}". It isn't meant for you. Tell ${p}.`);
      if (!hasItem("key") && !f.cabinetOpen) progress(1);
      break;
    case "painting": {
      if (f.paintingMoved) { say("Only the hole behind it remains. It breathes."); break; }
      if (!partnerSaid(me.color, String(me.clicks))) { say(`A ${me.color.toLowerCase()} painting. Something about it matters, but you don't know what yet.`); break; }
      const clicks = (f.paintingClicks || 0) + 1;
      setFlag("paintingClicks", clicks);
      if (clicks === me.clicks) {
        setFlag("paintingMoved", true);
        addItem("key");
        say(atLoop(["The painting swings aside. A key drops out, wrapped in hair.",
                    "The painting swings aside. The same key, wrapped in the same hair. Your hair."]));
        progress(2);
      } else {
        say(["The painting tilts. It wasn't you.", "Something behind the canvas scratches back.", "The frame is warm now. Like skin."][(clicks - 1) % 3]);
      }
      break;
    }
    case "cabinet":
      if (f.cabinetOpen) { say("The cabinet is empty now. You're sure something was watching from inside."); break; }
      if (!hasItem("key")) { say("It's locked. Something inside knocks back."); break; }
      setFlag("cabinetOpen", true);
      addClue("Find the year on the photograph");
      addClue(`For ${p}: the code sleeps in the ${them.casket.toUpperCase()} casket`);
      say(`The key turns. Two cards inside. One: "Find the year on the photograph". The other, for ${p}: "${them.casket.toUpperCase()} casket".`);
      progress(3);
      break;
    case "photo": {
      if (!knows("Find the year")) { say("A staff photo of Meridian Trust. The faces mean nothing to you. Yet."); break; }
      const remote = photoIsRemote(), year = remote ? them.year : me.year;
      addClue(remote ? `For ${p}: the photo is dated ${year}` : `The photograph is dated ${year}`);
      say(`The staff photo of Meridian Trust, ${year}. Every face is scratched out but one. It's yours.`
        + (remote ? ` Wait. This is ${p}'s year, not yours.` : "") + (later ? ` On the back: "Night shift, ${NIGHT}."` : ""));
      if (later) remember("The staff photo. Every face is scratched out except mine.");
      break;
    }
    case "computer":
      if (!knows("Find the year")) { say("The screen asks for a password. You have no idea where to start."); break; }
      if (inputLocked()) { say("The screen is frozen. Something is still reading your last answer."); break; }
      game.input = { for: "computer", label: "Password" };
      render();
      break;
    case "door":
      if (!f.doorUnlocked) {
        say(atLoop(["The door won't budge. Someone on the other side is holding it.",
                    "The door won't budge. On the other side, something whispers your name in your own voice."]));
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
      say(atLoop(["Every book has the same title: YOU WERE HERE BEFORE.",
                  "A visitor log for Meridian Trust, floor 14. Every night, two names sign in. Only one ever signs out.",
                  "A visitor log for Meridian Trust, floor 14. Every night, two names sign in. Only one ever signs out.",
                  `The newest page has two names in fresh ink: yours and ${p}'s. Nobody has ever signed out together.`]));
      if (later) remember("Every night two people sign in to floor 14. Only one ever signs out.");
      if (game.loop >= 4) remember(`Tonight's page in the log: my name, and ${p}'s. Nobody has ever left together.`);
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
      if (side !== me.casket) {
        game.timeLeft = Math.max(1, game.timeLeft - VAMPIRE_DRAIN);
        say(`The lid slides open. A vampire sits up and drinks the seconds out of you. (-${VAMPIRE_DRAIN}s) The other casket, maybe.`);
        if (much) remember("The wrong casket is never empty.");
        break;
      }
      setFlag("casketOpen", true);
      addClue(`The keypad code is ${me.keypad}`);
      addClue(`For ${p}: the lift goes to floor ${them.floor}`);
      say(`It's empty except for two scraps of paper. Yours: "${me.keypad}". The other, for ${p}: "FLOOR ${them.floor}".`);
      progress(6);
      break;
    }
    case "keypad":
      if (game.stage !== 2) { say("A keypad, dead and cold."); break; }
      if (!knows("The keypad code is")) { say("Three digits. You could guess, but something is listening for wrong ones."); break; }
      if (inputLocked()) { say("The keypad is still flashing red. Wait."); break; }
      game.input = { for: "keypad", label: "Code" };
      render();
      break;

    // ---------- Level 3: the lift ----------
    case "lift":
      if (game.stage !== 3) { say("A lift door, painted shut."); break; }
      if (!partnerSaid("floor", me.floor)) { say("The lift has every button from G to 20. Only one of them goes anywhere real."); break; }
      if (inputLocked()) { say("The buttons are dark. Wait."); break; }
      game.input = { for: "lift", label: "Floor" };
      render();
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
  if (text === null) return say("You step back.");
  const me = mine(), answer = String(text).trim();
  const wrong = (msg) => { setFlag("lockedUntil", game.timeLeft - WRONG_CODE_LOCK); say(msg + ` (locked for ${WRONG_CODE_LOCK}s)`); };
  if (what === "computer") {
    if (answer !== me.year) return wrong("Access denied. For a second the screen shows your face, from behind.");
    setFlag("doorUnlocked", true);
    if (game.loop >= 3) {
      say(`ACCESS GRANTED. One unread memo, ${NIGHT}: "The door opens for one. Unless two hold it open together." Behind you, the door unlocks.`);
      remember(`A memo from ${NIGHT}: the door opens for one, unless two hold it open together.`);
    } else {
      say("ACCESS GRANTED. Behind you, the door unlocks by itself.");
    }
    progress(4);
  } else if (what === "keypad") {
    if (answer !== me.keypad) return wrong("The keypad buzzes. In one of the caskets, something turns over.");
    enterStage(3, "The wall slides open onto a lift shaft. The lift is waiting, lights flickering.");
  } else if (what === "lift") {
    if (answer !== me.floor) return wrong("The lift drops a few metres and stops. Laughter from the shaft.");
    setFlag("escaped", true);  // stops my timer: I wait for my partner
    say(game.partner && game.partner.escaped
      ? "The lift opens onto the street. You both walk out. Behind you, the clock stops."
      : `The lift opens onto the street. You're out. ${partnerName()} is still inside. Talk them through it.`);
    send("escaped", { loop: game.loop });
  }
}
