// Owner: Room & objects (see README)
// Builds the clickable objects inside #room. No puzzle logic here: every click goes to onObjectClick(id).
// ponytail: emoji + CSS shapes for art, swap for images in assets/ later.
function buildRoom() {
  const objects = [
    ["painting", "Blue painting", "🌊"],
    ["photo",    "Photograph",    "🖼️"],
    ["clock",    "Clock",         "🕰️"],  // decoy
    ["door",     "Exit door",     "🚪"],
    ["shelf",    "Bookshelf",     "📚"],  // decoy
    ["cabinet",  "Cabinet",       "🗄️"],
    ["computer", "Computer",      "🖥️"],
    ["note",     "Note",          "📝"],
    ["lamp",     "Lamp",          "💡"],  // decoy
  ];
  const room = document.getElementById("room");
  room.innerHTML = "";
  for (const [id, label, art] of objects) {
    const el = document.createElement("button");  // button = keyboard + screen reader for free
    el.id = "obj-" + id;
    el.className = "obj";
    el.type = "button";
    el.setAttribute("aria-label", label);
    el.innerHTML = `<span class="art" aria-hidden="true">${art}</span><span class="label">${label}</span>`;
    el.addEventListener("click", () => onObjectClick(id));
    room.append(el);
  }
}
