// Owner: Puzzles (see README)
// Tuning: becomes config/game.json in the course port
const PAINTING_CLICKS = 4;
const PHOTO_YEAR = "1987";  // the computer password, shown on the photo

// Progress steps the opponent sees: 1 clue, 2 key, 3 cabinet, 4 door unlocked (escaping is its own message)
function progress(step) { send("progress", { loop: game.loop, step }); }

function onObjectClick(id) {
  if (game.phase === "over" || game.won) return;  // the race is decided, the room is dead
  const f = game.flags;
  switch (id) {
    case "note":
      addClue("BLUE - 4");
      say('A note in shaking handwriting: "BLUE - 4". The ink is still wet.');
      if (!hasItem("key") && !f.cabinetOpen && !f.doorUnlocked) progress(1);  // never report going backwards
      break;
    case "painting": {
      const clicks = (f.paintingClicks || 0) + 1;
      setFlag("paintingClicks", clicks);
      if (clicks === PAINTING_CLICKS) {
        setFlag("paintingMoved", true);
        addItem("key");
        say("The painting swings aside. A key drops out, wrapped in hair.");
        progress(2);
      } else if (clicks < PAINTING_CLICKS) {
        say(["The painting tilts. It wasn't you.", "Something behind the canvas scratches back.", "The frame is warm now. Like skin."][(clicks - 1) % 3]);
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
      say("A family photo, dated " + PHOTO_YEAR + ". Every face is scratched out but one. It's yours.");
      break;
    case "computer": {
      const answer = prompt("Password:");
      if (answer === null) { say("The cursor blinks, waiting for a password."); break; }  // cancelled, or the browser blocked the dialog
      if (answer.trim() === PHOTO_YEAR) {
        setFlag("doorUnlocked", true);
        say("ACCESS GRANTED. Behind you, the door unlocks by itself.");
        progress(4);
      } else {
        say("Access denied. For a second the screen shows your face, from behind.");
      }
      break;
    }
    case "door":
      if (f.doorUnlocked) {
        game.won = true;
        render();
        send("escaped", { loop: game.loop, timeLeft: game.timeLeft });
      } else {
        say("The door won't budge. Someone on the other side is holding it.");
      }
      break;
    case "clock":
      say("The clock has no hands. You can still hear it ticking down.");
      break;
    case "shelf":
      say("Every book has the same title: YOU WERE HERE BEFORE.");
      break;
    case "lamp":
      say("The light flickers in a rhythm. Like a heartbeat. Not yours.");
      break;
    default:
      say("Nothing. But something saw you touch it.");
  }
}
