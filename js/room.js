// Owner: Room & objects (see README)
// Builds the clickable objects inside #room. No puzzle logic here: every click goes to onObjectClick(id).
// Art is inline SVG so CSS can animate parts of it (clock hand, cabinet doors, door lock light, computer screen).
function buildRoom() {
  const S = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const ink = 'stroke="#21140c" stroke-width="2" stroke-linejoin="round"';
  const objects = [  // DOM order = Tab order: wall left to right, then floor left to right
    ["clock", "Clock", S("0 0 100 100", `
      <circle cx="50" cy="50" r="46" fill="#6b4226" ${ink}/><circle cx="50" cy="50" r="38" fill="#f4ead2" ${ink}/>
      <path d="M50 16v8M50 76v8M16 50h8M76 50h8" stroke="#21140c" stroke-width="3"/>
      <path d="M50 50L50 30M50 50L66 58" stroke="#21140c" stroke-width="4" stroke-linecap="round"/>
      <line class="sec" x1="50" y1="56" x2="50" y2="20" stroke="#c22" stroke-width="1.5"/><circle cx="50" cy="50" r="3" fill="#21140c"/>`)],
    ["painting", "Blue painting", S("0 0 120 90", `
      <defs><linearGradient id="sea" x2="0" y2="1"><stop offset="0" stop-color="#6fa0ff"/><stop offset=".55" stop-color="#1e4fd0"/><stop offset="1" stop-color="#0d2a7a"/></linearGradient></defs>
      <rect x="1" y="1" width="118" height="88" rx="3" fill="#c8962f" ${ink}/><rect x="9" y="9" width="102" height="72" fill="#7a5418"/>
      <rect x="12" y="12" width="96" height="66" fill="url(#sea)"/><circle cx="88" cy="28" r="8" fill="#dfe9ff"/>
      <path d="M12 56q12-10 24 0t24 0 24 0 24 0V78H12z" fill="#123a9e"/><path d="M12 64q12-8 24 0t24 0 24 0 24 0" fill="none" stroke="#9cc0ff" stroke-width="2"/>`)],
    ["photo", "Photograph", S("0 0 60 72", `
      <rect x="1" y="1" width="58" height="70" rx="2" fill="#3b2416" ${ink}/><rect x="7" y="7" width="46" height="58" fill="#f3ead8"/>
      <rect x="11" y="11" width="38" height="40" fill="#c9a77c"/><circle cx="40" cy="20" r="4" fill="#efdcb0"/>
      <path d="M16 51V36l10-8 10 8v15z" fill="#7a5a3a"/><rect x="23" y="42" width="6" height="9" fill="#4a3220"/><path d="M11 51h38" stroke="#5a4028" stroke-width="2"/>
      <path d="M15 58h30" stroke="#b9a98c" stroke-width="2"/>`)],
    ["door", "Exit door", S("0 -16 60 156", `
      <rect x="14" y="-15" width="32" height="12" rx="2" fill="#178a4a" ${ink}/><text x="30" y="-6" font-size="8" font-weight="bold" text-anchor="middle" fill="#eaffea" font-family="sans-serif">EXIT</text>
      <rect x="1" y="1" width="58" height="138" fill="#3b2416" ${ink}/><rect x="6" y="6" width="48" height="133" fill="#8a5a35" ${ink}/>
      <rect x="12" y="14" width="36" height="42" rx="2" fill="#7a4d2c" stroke="#5a3820" stroke-width="2"/><rect x="12" y="66" width="36" height="62" rx="2" fill="#7a4d2c" stroke="#5a3820" stroke-width="2"/>
      <circle class="lock" cx="46" cy="68" r="2.6" fill="#e33"/><circle cx="46" cy="78" r="3.6" fill="#e0b040" ${ink}/>`)],
    ["shelf", "Bookshelf", S("0 0 80 110", `
      <rect x="1" y="1" width="78" height="108" fill="#6b4226" ${ink}/><rect x="6" y="6" width="68" height="98" fill="#3b2416"/>
      <path d="M6 38h68M6 72h68" stroke="#6b4226" stroke-width="4"/>
      <g stroke="#21140c" stroke-width="1"><rect x="9" y="12" width="7" height="24" fill="#b33"/><rect x="16" y="15" width="6" height="21" fill="#3a7"/><rect x="22" y="10" width="8" height="26" fill="#d9a441"/><rect x="34" y="16" width="6" height="20" fill="#4a6fd0" transform="rotate(12 37 36)"/>
      <rect x="50" y="13" width="7" height="23" fill="#7a3fa0"/><rect x="57" y="11" width="9" height="25" fill="#c65"/>
      <rect x="9" y="46" width="9" height="24" fill="#2b6f9e"/><rect x="18" y="49" width="6" height="21" fill="#e2c26b"/><rect x="24" y="44" width="7" height="26" fill="#8a3"/><rect x="44" y="50" width="22" height="20" fill="#a77"/>
      <rect x="9" y="80" width="8" height="22" fill="#c84"/><rect x="17" y="78" width="7" height="24" fill="#469"/><rect x="40" y="84" width="26" height="18" rx="9" fill="#ddd"/></g>`)],
    ["cabinet", "Cabinet", S("0 0 70 96", `
      <rect x="1" y="1" width="68" height="86" rx="2" fill="#7a4d2c" ${ink}/><rect x="6" y="6" width="58" height="76" fill="#1e130c"/>
      <rect x="22" y="40" width="26" height="16" fill="#f4ead2" transform="rotate(-6 35 48)"/>
      <path d="M8 87v8M62 87v8" stroke="#21140c" stroke-width="4"/>
      <g class="dl"><rect x="6" y="6" width="29" height="76" fill="#8a5a35" ${ink}/><circle cx="30" cy="44" r="2.5" fill="#e0b040"/></g>
      <g class="dr"><rect x="35" y="6" width="29" height="76" fill="#8a5a35" ${ink}/><circle cx="40" cy="44" r="2.5" fill="#e0b040"/></g>`)],
    ["lamp", "Lamp", S("0 0 50 70", `
      <defs><radialGradient id="glow"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd060" stop-opacity="0"/></radialGradient></defs>
      <circle cx="31" cy="32" r="19" fill="url(#glow)"/><ellipse cx="22" cy="66" rx="16" ry="4" fill="#2e4f3f" ${ink}/>
      <path d="M22 64L14 36L30 22" fill="none" stroke="#21140c" stroke-width="3"/><path d="M22 10l18 14-10 12-16-16z" fill="#2e7a5a" ${ink}/>
      <circle cx="31" cy="30" r="4" fill="#fff3b0"/>`)],
    ["computer", "Computer", S("0 0 80 72", `
      <rect x="6" y="1" width="68" height="52" rx="5" fill="#d8cfb8" ${ink}/><rect class="screen" x="13" y="7" width="54" height="38" rx="3" fill="#0b2a1c"/>
      <path class="txt" d="M18 15h18M18 22h28M18 29h12" stroke="#3f8" stroke-width="2.5"/><rect class="cursor" x="32" y="26" width="5" height="6" fill="#3f8"/>
      <rect x="30" y="53" width="20" height="6" fill="#bfb59c" ${ink}/><rect x="4" y="60" width="72" height="11" rx="2" fill="#e6dec9" ${ink}/>
      <path d="M10 65h60" stroke="#a99f86" stroke-width="2" stroke-dasharray="4 2"/>`)],
    ["note", "Note", S("0 0 40 44", `
      <g transform="rotate(-8 20 22)"><path d="M4 4h32v28l-8 8H4z" fill="#fff6c2" ${ink}/><path d="M28 40v-8h8" fill="#e8dc98" ${ink}/>
      <path d="M9 13h20M9 20h16M9 27h12" stroke="#4a6fd0" stroke-width="2" stroke-linecap="round"/></g>`)],
  ];
  const room = document.getElementById("room");
  room.innerHTML = `<div class="desk" aria-hidden="true">${S("0 0 140 60", `
    <rect x="1" y="1" width="138" height="9" rx="2" fill="#7a4d2c" ${ink}/><rect x="6" y="10" width="8" height="49" fill="#5a3820" ${ink}/>
    <rect x="126" y="10" width="8" height="49" fill="#5a3820" ${ink}/><rect x="88" y="10" width="38" height="20" fill="#6b4226" ${ink}/><circle cx="107" cy="20" r="2" fill="#e0b040"/>`)}</div>`;
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
