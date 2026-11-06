// Owner: Room & objects (see README)
// Builds the clickable objects inside #room. No puzzle logic here: every click goes to onObjectClick(id).
// Art is inline SVG so CSS can animate parts of it (clock hand, cabinet doors, door bolt and light, computer screen, ceiling tube).
function buildRoom() {
  const S = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><g filter="url(#grime)">${body}</g></svg>`;
  const ink = 'stroke="#090806" stroke-width="2" stroke-linejoin="round"';
  const objects = [  // DOM order = Tab order: wall left to right, then floor left to right
    ["clock", "Clock", S("0 0 100 100", `
      <circle cx="50" cy="50" r="46" fill="#3b2c1e" ${ink}/><circle cx="50" cy="50" r="38" fill="#8d8671" ${ink}/>
      <path d="M50 16v8M50 76v8M16 50h8M76 50h8" stroke="#16130e" stroke-width="3"/>
      <path d="M50 50L47 28M50 50L37 62" stroke="#16130e" stroke-width="4" stroke-linecap="round"/>
      <line class="sec" x1="50" y1="56" x2="50" y2="20" stroke="#a31f1a" stroke-width="1.6"/>
      <path d="M70 18L58 38l7 7-11 13 4 8M58 38L42 34M65 45l15 3" fill="none" stroke="#e8e2cf" stroke-opacity=".6" stroke-width="1"/>
      <circle cx="50" cy="50" r="3" fill="#16130e"/>`)],
    ["painting", "Blue painting", S("0 0 120 90", `
      <rect x="1" y="1" width="118" height="88" rx="2" fill="#544126" ${ink}/><rect x="8" y="8" width="104" height="74" fill="#231a0e"/>
      <rect x="11" y="11" width="98" height="68" fill="url(#sea)"/><circle cx="88" cy="27" r="7" fill="#d5e2ff"/>
      <path d="M60 58c-2-9-2-16 0-19 1-3 5-3 6 0 2 3 2 10 0 19z" fill="#04060e"/><circle cx="63" cy="33" r="4" fill="#04060e"/>
      <path d="M11 56q12-9 24 0t25 0 25 0 24 0v23H11z" fill="#0f338f"/><path d="M11 65q12-8 24 0t25 0 25 0 24 0" fill="none" stroke="#7fa8fb" stroke-width="1.6"/>
      <path d="M22 82c0 6 1 7 2 7s2-1 2-7zM93 82c0 3 .8 4 1.5 4s1.5-1 1.5-4z" fill="#8c1a15"/>`)],
    ["photo", "Photograph", S("0 0 60 72", `
      <g transform="rotate(-3 30 36)"><rect x="3" y="3" width="54" height="66" fill="#a89c7c" ${ink}/><rect x="8" y="8" width="44" height="42" fill="#59513d"/>
      <rect x="8" y="8" width="44" height="23" fill="#79705a"/><path d="M14 50V33l10-8 10 8v17z" fill="#2c271c"/><rect x="21" y="36" width="6" height="6" fill="#c9b985"/>
      <path d="M40 50v-9c0-3 6-3 6 0v9z" fill="#17140e"/><circle cx="43" cy="36" r="3.8" fill="#17140e"/>
      <path d="M38 33l10 5M38 37l10-5M39 40l9-6" stroke="#9a1f18" stroke-width="1.3"/>
      <path d="M13 59c4-3 6 2 10 0s5-2 9 0 7-2 13-1" fill="none" stroke="#2c271c" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M57 3l-9 0 9 8z" fill="#191712"/></g>`)],
    ["door", "Exit door", S("0 -16 60 156", `
      <rect x="12" y="-15" width="36" height="12" fill="#1a1612" ${ink}/><text x="30" y="-6" font-size="8" font-weight="bold" text-anchor="middle" fill="#c23a30" font-family="monospace">EXIT</text>
      <rect x="1" y="1" width="58" height="138" fill="#1d1a15" ${ink}/><rect x="6" y="6" width="48" height="133" fill="#45443c" ${ink}/>
      <path d="M6 22h48M6 118h48" stroke="#27261f" stroke-width="3"/>
      <g fill="#1d1c17"><circle cx="11" cy="14" r="1.5"/><circle cx="49" cy="14" r="1.5"/><circle cx="11" cy="30" r="1.5"/><circle cx="49" cy="30" r="1.5"/><circle cx="11" cy="110" r="1.5"/><circle cx="49" cy="110" r="1.5"/><circle cx="11" cy="126" r="1.5"/><circle cx="49" cy="126" r="1.5"/></g>
      <path d="M14 22c1 16 0 24 2 34M36 118c-1 6 0 14 1 21M48 22c-1 12 1 24-1 36" fill="none" stroke="#6b3e20" stroke-opacity=".8" stroke-width="2.5"/>
      <path d="M20 86l5 13M25 84l5 15M30 85l4 12" stroke="#16140f" stroke-width="1.3"/>
      <rect class="bolt" x="27" y="62" width="27" height="7" fill="#22211b" stroke="#090806"/>
      <circle class="lock" cx="46" cy="55" r="2.8" fill="#c6352c"/><circle cx="46" cy="77" r="3.6" fill="#6c5a35" ${ink}/>`)],
    ["shelf", "Bookshelf", S("0 0 80 110", `
      <rect x="1" y="1" width="78" height="108" fill="#33261a" ${ink}/><rect x="6" y="6" width="68" height="98" fill="#120e0a"/>
      <path d="M6 38h68M6 71l68 3" stroke="#33261a" stroke-width="4"/>
      <g stroke="#090806" stroke-width="1"><rect x="9" y="12" width="7" height="24" fill="#4c2c28"/><rect x="16" y="15" width="6" height="21" fill="#37423a"/><rect x="22" y="10" width="8" height="26" fill="#5b4c2f"/><rect x="34" y="16" width="6" height="20" fill="#3b3e48" transform="rotate(14 37 36)"/>
      <rect x="9" y="47" width="9" height="23" fill="#2f3a42"/><rect x="18" y="50" width="6" height="20" fill="#61573b"/><rect x="24" y="45" width="7" height="25" fill="#3c4530"/>
      <rect x="9" y="82" width="8" height="20" fill="#513b28"/><rect x="17" y="79" width="7" height="23" fill="#2e3439"/></g>
      <path d="M47 62c0-7 4-11 10-11s10 4 10 11c0 3-2 4-3 5v3H50v-3c-1-1-3-2-3-5z" fill="#a39b83" ${ink}/><circle cx="53" cy="60" r="2.6" fill="#0b0907"/><circle cx="61" cy="60" r="2.6" fill="#0b0907"/><path d="M53 70v-3M57 70v-3M61 70v-3" stroke="#0b0907"/>
      <path d="M74 6L52 6M74 6L60 22M74 6L74 28M58 6q4 6 8 7t8 5" fill="none" stroke="#d8d0ba" stroke-opacity=".45" stroke-width=".8"/>`)],
    ["cabinet", "Cabinet", S("0 0 70 96", `
      <rect x="1" y="1" width="68" height="86" fill="#2c2419" ${ink}/><rect x="6" y="6" width="58" height="76" fill="#070605"/>
      <rect x="22" y="40" width="26" height="16" fill="#b5ab90" transform="rotate(-6 35 48)"/>
      <path d="M8 87v8M62 87v8" stroke="#090806" stroke-width="4"/>
      <g class="dl"><rect x="6" y="6" width="29" height="76" fill="#4a3b29" ${ink}/><path d="M12 56l9 15M17 54l9 15M22 54l7 12" stroke="#17120c" stroke-width="1.3"/></g>
      <g class="dr"><rect x="35" y="6" width="29" height="76" fill="#4a3b29" ${ink}/><path d="M44 12c1 10-1 15 1 24" fill="none" stroke="#6a3b1f" stroke-width="2"/></g>
      <g class="padlock"><path d="M31 40v-4c0-6 8-6 8 0v4" fill="none" stroke="#17140e" stroke-width="2.2"/><rect x="28" y="40" width="14" height="11" fill="#6f5a30" ${ink}/><circle cx="35" cy="45" r="1.5" fill="#090806"/></g>`)],
    ["lamp", "Ceiling light", `<svg viewBox="0 0 120 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="14" fill="#6d6642" ${ink}/>
      <rect class="tube" x="6" y="5" width="108" height="7" rx="3" fill="url(#tube)"/>
      <path d="M92 5v7M101 5v7" stroke="#3a3519" stroke-width="2"/></svg>`],
    ["computer", "Computer", S("0 0 80 72", `
      <rect x="6" y="1" width="68" height="52" rx="4" fill="#6f6a57" ${ink}/><rect class="screen" x="13" y="7" width="54" height="38" rx="5" fill="#0c1a11"/>
      <text class="txt" x="18" y="21" font-size="7" font-family="monospace" fill="#73a57a">PASSWORD</text>
      <path class="txt" d="M18 29h20" stroke="#73a57a" stroke-width="1.5"/><rect class="cursor" x="40" y="25" width="5" height="6" fill="#73a57a"/>
      <path d="M60 7l-7 12 5 6-8 9M53 19l-8-3" fill="none" stroke="#b9c7b3" stroke-opacity=".5" stroke-width=".8"/>
      <rect x="30" y="53" width="20" height="6" fill="#55513f" ${ink}/><rect x="4" y="60" width="72" height="11" rx="1" fill="#6f6a57" ${ink}/>
      <path d="M10 65h60" stroke="#35322a" stroke-width="2" stroke-dasharray="4 2"/>
      <path d="M67 53c0 4 .8 6 1.5 6s1.5-2 1.5-6z" fill="#8c1a15"/>`)],
    ["note", "Note", S("0 0 40 44", `
      <g transform="rotate(-7 20 22)"><path d="M4 5l5-2 4 2 6-2 5 2 5-2 7 2-1 8 1 7-1 9 1 11-6-1-6 2-5-2-6 2-9-1 1-11-1-9 1-7z" fill="#a89c7c" ${ink}/>
      <path d="M9 14c5-3 6 2 10 0s5 0 11-1" fill="none" stroke="#1c50d2" stroke-width="2" stroke-linecap="round"/>
      <path d="M9 22c4-2 7 1 11 0s5-1 7 0M9 29c3-1 6 1 10 0" fill="none" stroke="#231e15" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="29" cy="33" rx="3.5" ry="4.5" fill="#8c1a15" fill-opacity=".85"/></g>`)],
  ];
  const room = document.getElementById("room");
  room.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="grime" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".22" numOctaves="4" seed="7"/>
      <feColorMatrix values="0 0 0 0 .04  0 0 0 0 .03  0 0 0 0 .02  1.7 0 0 0 -.72"/>
      <feComposite in2="SourceAlpha" operator="in" result="dirt"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="dirt"/></feMerge>
    </filter>
    <linearGradient id="sea" x2="0" y2="1"><stop offset="0" stop-color="#5b92ff"/><stop offset=".55" stop-color="#1c50d2"/><stop offset="1" stop-color="#0b2474"/></linearGradient>
    <linearGradient id="tube"><stop offset="0" stop-color="#fff8cf"/><stop offset=".72" stop-color="#f3e9a6"/><stop offset=".8" stop-color="#6d6642"/></linearGradient>
  </defs></svg><div class="desk" aria-hidden="true">${S("0 0 140 60", `
    <rect x="1" y="1" width="138" height="9" rx="1" fill="#3a2a1c" ${ink}/><rect x="6" y="10" width="8" height="49" fill="#2a1e14" ${ink}/>
    <rect x="126" y="10" width="8" height="49" fill="#2a1e14" ${ink}/><rect x="88" y="10" width="38" height="20" fill="#33261a" ${ink}/><circle cx="107" cy="20" r="2" fill="#6c5a35"/>`)}</div>`;
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
