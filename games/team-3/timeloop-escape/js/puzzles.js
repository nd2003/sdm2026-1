// Owner: Puzzles (see README)
// Tuning: becomes config/game.json in the course port
const PAINTING_CLICKS = 4;
const PHOTO_YEAR = "1987"; // the computer password, shown on the photo
const NIGHT = "13 October " + PHOTO_YEAR;

// Lore: "Meridian Trust, floor 14". The room remembers you, so objects say more on later loops,
// and 6 "Memory:" pages collect in the journal (clues persist). Read in order they tell the story:
// two people sign in every night, the door lets only one out, and whoever stays becomes the faceless thing.
function atLoop(lines) {
  return lines[Math.min(game.loop, lines.length) - 1];
} // line for this loop, the last one repeats
function remember(text) {
  addClue("Memory: " + text);
}

// Progress steps the opponent sees: 1 clue, 2 key, 3 cabinet, 4 door unlocked (escaping is its own message)
function progress(step) {
  send("progress", { loop: game.loop, step });
}

function onObjectClick(id) {
  if (game.phase === "over" || game.won) return; // the race is decided, the room is dead
  const f = game.flags,
    later = game.loop >= 2,
    much = game.loop >= 3;
  switch (id) {
    case "note":
      addClue("BLUE - 4");
      say(
        atLoop([
          'A note in shaking handwriting: "BLUE - 4". The ink is still wet.',
          'The same note: "BLUE - 4". The ink is still wet. It is always still wet.',
        ]),
      );
      if (!hasItem("key") && !f.cabinetOpen && !f.doorUnlocked) progress(1); // never report going backwards
      break;
    case "painting": {
      const clicks = (f.paintingClicks || 0) + 1;
      setFlag("paintingClicks", clicks);
      if (clicks === PAINTING_CLICKS) {
        setFlag("paintingMoved", true);
        addItem("key");
        say(
          atLoop([
            "The painting swings aside. A key drops out, wrapped in hair.",
            "The painting swings aside. The same key, wrapped in the same hair. Your hair.",
          ]),
        );
        progress(2);
      } else if (clicks < PAINTING_CLICKS) {
        say(
          [
            "The painting tilts. It wasn't you.",
            "Something behind the canvas scratches back.",
            "The frame is warm now. Like skin.",
          ][(clicks - 1) % 3],
        );
      } else {
        say("Only the hole behind it remains. It breathes.");
      }
      break;
    }
    case "cabinet":
      if (f.cabinetOpen) {
        say("The cabinet is empty now. You're sure something was watching from inside.");
      } else if (hasItem("key")) {
        setFlag("cabinetOpen", true);
        addClue("Find the year on the photograph");
        say('The key turns. Inside, a card in a child\'s handwriting: "Find the year on the photograph".');
        progress(3);
      } else {
        say("It's locked. Something inside knocks back.");
      }
      break;
    case "photo":
      addClue("The photograph is dated " + PHOTO_YEAR);
      say(
        `The staff photo of Meridian Trust, ${PHOTO_YEAR}. Every face is scratched out but one. It's yours.` +
          (later ? ` On the back: "Night shift, ${NIGHT}."` : ""),
      );
      if (later) remember(`The ${PHOTO_YEAR} staff photo. Every face is scratched out except mine.`);
      break;
    case "computer": {
      const answer = prompt("Password:");
      if (answer === null) {
        say("The cursor blinks, waiting for a password.");
        break;
      } // cancelled, or the browser blocked the dialog
      if (answer.trim() === PHOTO_YEAR) {
        setFlag("doorUnlocked", true);
        if (much) {
          say(
            `ACCESS GRANTED. One unread memo, ${NIGHT}: "The door opens for one. Whoever stays behind keeps the clock running." Behind you, the door unlocks.`,
          );
          remember(`A memo from ${NIGHT}: the door opens for one. Whoever stays keeps the clock running.`);
        } else {
          say("ACCESS GRANTED. Behind you, the door unlocks by itself.");
        }
        progress(4);
      } else {
        say("Access denied. For a second the screen shows your face, from behind.");
      }
      break;
    }
    case "door":
      if (f.doorUnlocked) {
        say("You step out. Behind you, the clock starts ticking again, for someone else.");
        game.won = true;
        render();
        send("escaped", { loop: game.loop, timeLeft: game.timeLeft });
      } else {
        say(
          atLoop([
            "The door won't budge. Someone on the other side is holding it.",
            "The door won't budge. On the other side, something whispers your name in your own voice.",
          ]),
        );
      }
      break;
    case "clock":
      say(
        atLoop([
          "The clock has no hands. You can still hear it ticking down.",
          `Tally marks are scratched beside the clock. ${game.loop} of them. The newest is in your handwriting.`,
          `${game.loop} marks now. Under them are older ones, hundreds, in handwriting that isn't yours.`,
        ]),
      );
      if (later) remember("The tally marks by the clock are in my handwriting. I have been here before.");
      break;
    case "shelf": {
      const other = game.opponent ? game.opponent.name : "a name you don't know";
      say(
        atLoop([
          "Every book has the same title: YOU WERE HERE BEFORE.",
          "A visitor log for Meridian Trust, floor 14. Every night, two names sign in. Only one ever signs out.",
          "A visitor log for Meridian Trust, floor 14. Every night, two names sign in. Only one ever signs out.",
          `The newest page of the visitor log has two names in fresh ink. One is yours. The other is ${other}.`,
        ]),
      );
      if (later) remember("Every night two people sign in to floor 14. Only one ever signs out.");
      if (game.loop >= 4) remember(`Tonight's page in the log: my name, and ${other}.`);
      break;
    }
    case "lamp":
      say(
        atLoop([
          "The light flickers in a rhythm. Like a heartbeat. Not yours.",
          "The light stutters: three short, three long, three short. Someone tried to call for help from here.",
          "In the flicker you see it under the lamp: a figure with no face. It is wearing your shoes.",
        ]),
      );
      if (much) remember("The thing with no face wears my shoes. It used to be one of us.");
      break;
    default:
      say("Nothing. But something saw you touch it.");
  }
}
