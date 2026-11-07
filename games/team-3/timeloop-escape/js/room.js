// Owner: Room & objects (see README)
// Builds the clickable objects inside #room. No puzzle logic here: every click goes to onObjectClick(id).
// Art is inline SVG so CSS can animate parts of it (clock hand, cabinet doors, door bolt and light, computer screen, ceiling tube).
function buildRoom() {
  const S = (vb, body) =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><g filter="url(#grime)">${body}</g></svg>`;
  const ink = 'stroke="#090806" stroke-width="2" stroke-linejoin="round"';
  const objects = [
    // DOM order = Tab order: wall left to right, then floor left to right
    [
      "clock",
      "Clock",
      S(
        "0 0 100 100",
        `
      <circle cx="50" cy="50" r="46" fill="#3b2c1e" ${ink}/><circle cx="50" cy="50" r="38" fill="#8d8671" ${ink}/>
      <path d="M50 16v8M50 76v8M16 50h8M76 50h8" stroke="#16130e" stroke-width="3"/>
      <path d="M50 50L47 28M50 50L37 62" stroke="#16130e" stroke-width="4" stroke-linecap="round"/>
      <line class="sec" x1="50" y1="56" x2="50" y2="20" stroke="#a31f1a" stroke-width="1.6"/>
      <path d="M70 18L58 38l7 7-11 13 4 8M58 38L42 34M65 45l15 3" fill="none" stroke="#e8e2cf" stroke-opacity=".6" stroke-width="1"/>
      <circle cx="50" cy="50" r="3" fill="#16130e"/>`,
      ),
    ],
    [
      "painting",
      "Blue painting",
      S(
        "0 0 120 90",
        `
      <path d="M1 1h96l6 7 16-3v84H12l-4-9-7 2z" fill="#3f3019" ${ink}/><rect x="8" y="8" width="104" height="74" fill="#120d07"/>
      <rect x="11" y="11" width="98" height="68" fill="url(#sea)"/><circle cx="96" cy="26" r="6" fill="#c9d6f2"/>
      <path d="M11 56q12-9 24 0t25 0 25 0 24 0v23H11z" fill="#0f338f"/><path d="M11 65q12-8 24 0t25 0 25 0 24 0" fill="none" stroke="#7fa8fb" stroke-width="1.6"/>
      <path d="M25 58c-2-9-2-16 0-19 1-3 5-3 6 0 2 3 2 10 0 19z" fill="#04060e"/><circle cx="28" cy="33" r="4" fill="#04060e"/>
      <path d="M72 11L60 28l8 15-13 16 8 20h24l-8-21 11-16-11-14 8-17z" fill="#050403"/>
      <path d="M60 28L42 46l13 13 13-16z" fill="#2c58bf" stroke="#0a1a4a"/><path d="M60 28l-7 14 15 1z" fill="#16368f"/>
      <path d="M87 11l-8 17 11 14 19-8V11z" fill="#000" fill-opacity=".25"/>
      <path d="M26 78l-5 11 8-4 5 4 3-11z" fill="#1c50d2" stroke="#0a1a4a"/><path d="M92 79l3 8 5-5 3 6 1-9z" fill="#0f338f" stroke="#0a1a4a"/>
      <path d="M1 28l6 5-2 8 5 6M112 60l6 4-3 9" fill="none" stroke="#0a0805" stroke-width="1.5"/>
      <path d="M12 11c10 0 13 4 15 10-6 2-11 1-15 5zM109 79c-8 0-14-2-16-8 6-2 11-2 16-8z" fill="#121a0a" fill-opacity=".8"/>`,
      ),
    ],
    [
      "photo",
      "Photograph",
      S(
        "0 0 60 72",
        `
      <g transform="rotate(-5 30 36)" clip-path="url(#tornphoto)"><rect x="3" y="3" width="54" height="66" fill="#9c9070" ${ink}/><rect x="8" y="8" width="44" height="42" fill="#4f4835"/>
      <rect x="8" y="8" width="44" height="23" fill="#6f6650"/><path d="M14 50V33l10-8 10 8v17z" fill="#2c271c"/><rect x="21" y="36" width="6" height="6" fill="#c9b985"/>
      <path d="M40 50v-9c0-3 6-3 6 0v9z" fill="#17140e"/><circle cx="43" cy="36" r="3.8" fill="#17140e"/>
      <path d="M38 33l10 5M38 37l10-5M39 40l9-6" stroke="#9a1f18" stroke-width="1.3"/>
      <path d="M13 59c4-3 6 2 10 0s5-2 9 0" fill="none" stroke="#2c271c" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="8" fill="#121a0a" fill-opacity=".7"/></g>
      <circle cx="30" cy="5" r="2" fill="#4a4336" stroke="#090806"/>`,
      ),
    ],
    [
      "door",
      "Exit door",
      S(
        "0 -16 60 156",
        `
      <rect x="12" y="-15" width="36" height="12" fill="#1a1612" ${ink}/><text x="30" y="-6" font-size="8" font-weight="bold" text-anchor="middle" fill="#c23a30" font-family="monospace">EXIT</text>
      <rect x="1" y="1" width="58" height="138" fill="#1d1a15" ${ink}/><rect x="6" y="6" width="48" height="133" fill="#45443c" ${ink}/>
      <path d="M6 22h48M6 118h48" stroke="#27261f" stroke-width="3"/>
      <g fill="#1d1c17"><circle cx="11" cy="14" r="1.5"/><circle cx="49" cy="14" r="1.5"/><circle cx="11" cy="30" r="1.5"/><circle cx="49" cy="30" r="1.5"/><circle cx="11" cy="110" r="1.5"/><circle cx="49" cy="110" r="1.5"/><circle cx="11" cy="126" r="1.5"/><circle cx="49" cy="126" r="1.5"/></g>
      <path d="M14 22c1 16 0 24 2 34M36 118c-1 6 0 14 1 21M48 22c-1 12 1 24-1 36" fill="none" stroke="#6b3e20" stroke-opacity=".8" stroke-width="2.5"/>
      <path d="M20 86l5 13M25 84l5 15M30 85l4 12" stroke="#16140f" stroke-width="1.3"/>
      <rect class="bolt" x="27" y="62" width="27" height="7" fill="#22211b" stroke="#090806"/>
      <circle class="lock" cx="46" cy="55" r="2.8" fill="#c6352c"/><circle cx="46" cy="77" r="3.6" fill="#6c5a35" ${ink}/>`,
      ),
    ],
    [
      "shelf",
      "Bookshelf",
      S(
        "0 0 80 110",
        `
      <rect x="1" y="1" width="78" height="108" fill="#33261a" ${ink}/><rect x="6" y="6" width="68" height="98" fill="#120e0a"/>
      <path d="M6 38h68M6 71l68 3" stroke="#33261a" stroke-width="4"/>
      <g stroke="#090806" stroke-width="1"><rect x="9" y="12" width="7" height="24" fill="#4c2c28"/><rect x="16" y="15" width="6" height="21" fill="#37423a"/><rect x="22" y="10" width="8" height="26" fill="#5b4c2f"/><rect x="34" y="16" width="6" height="20" fill="#3b3e48" transform="rotate(14 37 36)"/>
      <rect x="9" y="47" width="9" height="23" fill="#2f3a42"/><rect x="18" y="50" width="6" height="20" fill="#61573b"/><rect x="24" y="45" width="7" height="25" fill="#3c4530"/>
      <rect x="9" y="82" width="8" height="20" fill="#513b28"/><rect x="17" y="79" width="7" height="23" fill="#2e3439"/></g>
      <path d="M47 62c0-7 4-11 10-11s10 4 10 11c0 3-2 4-3 5v3H50v-3c-1-1-3-2-3-5z" fill="#a39b83" ${ink}/><circle cx="53" cy="60" r="2.6" fill="#0b0907"/><circle cx="61" cy="60" r="2.6" fill="#0b0907"/><path d="M53 70v-3M57 70v-3M61 70v-3" stroke="#0b0907"/>
      <path d="M74 6L52 6M74 6L60 22M74 6L74 28M58 6q4 6 8 7t8 5" fill="none" stroke="#d8d0ba" stroke-opacity=".45" stroke-width=".8"/>`,
      ),
    ],
    [
      "cabinet",
      "Cabinet",
      S(
        "0 0 70 96",
        `
      <rect x="1" y="1" width="68" height="86" fill="#2c2419" ${ink}/><rect x="6" y="6" width="58" height="76" fill="#070605"/>
      <rect x="22" y="40" width="26" height="16" fill="#b5ab90" transform="rotate(-6 35 48)"/>
      <path d="M8 87v8M62 87v8" stroke="#090806" stroke-width="4"/>
      <g class="dl"><rect x="6" y="6" width="29" height="76" fill="#4a3b29" ${ink}/><path d="M12 56l9 15M17 54l9 15M22 54l7 12" stroke="#17120c" stroke-width="1.3"/></g>
      <g class="dr"><rect x="35" y="6" width="29" height="76" fill="#4a3b29" ${ink}/><path d="M44 12c1 10-1 15 1 24" fill="none" stroke="#6a3b1f" stroke-width="2"/></g>
      <g class="padlock"><path d="M31 40v-4c0-6 8-6 8 0v4" fill="none" stroke="#17140e" stroke-width="2.2"/><rect x="28" y="40" width="14" height="11" fill="#6f5a30" ${ink}/><circle cx="35" cy="45" r="1.5" fill="#090806"/></g>`,
      ),
    ],
    [
      "lamp",
      "Ceiling light",
      `<svg viewBox="0 0 120 26" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0l3 6M112 0l-4 6" stroke="#0a0805" stroke-width="1.5"/>
      <rect x="1" y="6" width="118" height="14" fill="#4b4630" ${ink}/>
      <rect class="tube" x="6" y="10" width="108" height="7" rx="3" fill="url(#tube)"/>
      <path d="M92 10v7M101 10v7" stroke="#2c2813" stroke-width="2"/>
      <path d="M116 20c2 2 1 4 3 6" fill="none" stroke="#0a0805"/></svg>`,
    ],
    [
      "computer",
      "Computer",
      S(
        "0 0 80 72",
        `
      <rect x="6" y="1" width="68" height="52" rx="4" fill="#6f6a57" ${ink}/><rect class="screen" x="13" y="7" width="54" height="38" rx="5" fill="#0c1a11"/>
      <text class="txt" x="18" y="21" font-size="7" font-family="monospace" fill="#73a57a">PASSWORD</text>
      <path class="txt" d="M18 29h20" stroke="#73a57a" stroke-width="1.5"/><rect class="cursor" x="40" y="25" width="5" height="6" fill="#73a57a"/>
      <path d="M60 7l-7 12 5 6-8 9M53 19l-8-3" fill="none" stroke="#b9c7b3" stroke-opacity=".5" stroke-width=".8"/>
      <rect x="30" y="53" width="20" height="6" fill="#55513f" ${ink}/><rect x="4" y="60" width="72" height="11" rx="1" fill="#6f6a57" ${ink}/>
      <path d="M10 65h60" stroke="#35322a" stroke-width="2" stroke-dasharray="4 2"/>
      <path d="M67 53c0 4 .8 6 1.5 6s1.5-2 1.5-6z" fill="#8c1a15"/>`,
      ),
    ],
    [
      "note",
      "Note",
      S(
        "0 0 40 44",
        `
      <g transform="rotate(-7 20 22)"><path d="M4 5l5-2 4 2 6-2 5 2 5-2 7 2-1 8 1 7-1 9 1 11-6-1-6 2-5-2-6 2-9-1 1-11-1-9 1-7z" fill="#a89c7c" ${ink}/>
      <path d="M9 14c5-3 6 2 10 0s5 0 11-1" fill="none" stroke="#1c50d2" stroke-width="2" stroke-linecap="round"/>
      <path d="M9 22c4-2 7 1 11 0s5-1 7 0M9 29c3-1 6 1 10 0" fill="none" stroke="#231e15" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="29" cy="33" rx="3.5" ry="4.5" fill="#8c1a15" fill-opacity=".85"/></g>`,
      ),
    ],
  ];
  const room = document.getElementById("room");
  const rays = (pts, col, w) =>
    pts.map(([x, y]) => `<path d="M800 470L${x} ${y}" stroke="${col}" stroke-width="${w}"/>`).join("");
  const range = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
  const blob = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#blob)"/>`;
  const drip = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#drip)"/>`;
  room.innerHTML = `<div class="scene"><svg class="walls" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true"><defs>
    <filter id="grime" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".22" numOctaves="4" seed="7"/>
      <feColorMatrix values="0 0 0 0 .04  0 0 0 0 .03  0 0 0 0 .02  1.7 0 0 0 -.72"/>
      <feComposite in2="SourceAlpha" operator="in" result="dirt"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="dirt"/></feMerge>
    </filter>
    <filter id="mold" filterUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1000" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="4" seed="11"/>
      <feColorMatrix values="0 0 0 0 .05  0 0 0 0 .07  0 0 0 0 .025  9 0 0 0 -4.75"/>
    </filter>
    <filter id="dirtwall" filterUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1000" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".008 .03" numOctaves="4" seed="3"/>
      <feColorMatrix values="0 0 0 0 .16  0 0 0 0 .12  0 0 0 0 .04  2.6 0 0 0 -1.05"/>
    </filter>
    <radialGradient id="blob"><stop offset=".35" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <mask id="moldmask" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1000"><rect width="1600" height="1000" fill="#000"/>
      ${blob(470, 230, 150)}${blob(60, 60, 260)}${blob(50, 900, 230)}${blob(1130, 230, 130)}${blob(1550, 50, 220)}${blob(1130, 700, 100)}${blob(470, 700, 130)}</mask>
    <linearGradient id="drip" x2="0" y2="1"><stop offset="0" stop-color="#2b2109" stop-opacity=".85"/><stop offset="1" stop-color="#2b2109" stop-opacity="0"/></linearGradient>
    <linearGradient id="lwall"><stop offset="0" stop-color="#4f4925"/><stop offset="1" stop-color="#7f7640"/></linearGradient>
    <linearGradient id="rwall"><stop offset="0" stop-color="#7f7640"/><stop offset="1" stop-color="#4f4925"/></linearGradient>
    <linearGradient id="floor" x2="0" y2="1"><stop offset="0" stop-color="#3f3a1f"/><stop offset="1" stop-color="#1f1c0e"/></linearGradient>
    <linearGradient id="desktop" x2="0" y2="1"><stop offset="0" stop-color="#3d2c1c"/><stop offset="1" stop-color="#1b130b"/></linearGradient>
    <linearGradient id="sea" x2="0" y2="1"><stop offset="0" stop-color="#5b92ff"/><stop offset=".55" stop-color="#1c50d2"/><stop offset="1" stop-color="#0b2474"/></linearGradient>
    <linearGradient id="tube"><stop offset="0" stop-color="#fff8cf"/><stop offset=".72" stop-color="#f3e9a6"/><stop offset=".8" stop-color="#4b4630"/></linearGradient>
    <clipPath id="outer"><path clip-rule="evenodd" d="M0 0H1600V1000H0zM470 230V700H1130V230z"/></clipPath>
    <clipPath id="tornphoto"><path d="M0 0h60v42l-8 4-5 9-9 2-5 9-7-1-6 7H0z"/></clipPath>
  </defs>
    <path d="M0 0H1600L1130 230H470z" fill="#6a6443"/>
    <path d="M0 0L470 230V700L0 1000z" fill="url(#lwall)"/>
    <path d="M1600 0L1130 230V700L1600 1000z" fill="url(#rwall)"/>
    <rect x="470" y="230" width="660" height="470" fill="#857b43"/>
    <path d="M0 1000L470 700H1130L1600 1000z" fill="url(#floor)"/>
    <g fill="none" clip-path="url(#outer)">
      ${rays(
        range(0, 1600, 11).map((x) => [x, 0]),
        "#3e3a24",
        3,
      )}
      ${[50, 120, 180]
        .map((y) => {
          const k = (470 - y) / 470;
          return `<path d="M${800 - 800 * k} ${y}H${800 + 800 * k}" stroke="#3e3a24" stroke-width="3"/>`;
        })
        .join("")}
      ${rays(
        range(0, 1000, 15).map((y) => [0, y]),
        "#00000020",
        2,
      )}${rays(
        range(0, 1000, 15).map((y) => [1600, y]),
        "#00000020",
        2,
      )}
    </g>
    <path d="M395 92L540 92 505 180 410 180z" fill="#060503"/><path d="M1110 120L1240 120 1190 180 1090 180z" fill="#060503"/>
    <path d="M430 180c-8 40 14 56 2 96M1140 180c10 30-10 50 6 88" fill="none" stroke="#0a0805" stroke-width="3"/>
    <path d="M470 700L0 1000M1130 700L1600 1000M470 700H1130" stroke="#201d0e" stroke-width="10"/>
    <rect width="1600" height="1000" filter="url(#dirtwall)" opacity=".45"/>
    ${drip(150, 70, 16, 420)}${drip(240, 118, 10, 300)}${drip(356, 174, 22, 380)}${drip(520, 230, 14, 240)}${drip(655, 230, 24, 330)}${drip(790, 230, 10, 170)}${drip(1040, 230, 18, 280)}${drip(1190, 200, 16, 300)}${drip(1320, 136, 24, 430)}${drip(1490, 54, 18, 360)}
    <rect width="1600" height="1000" filter="url(#mold)" mask="url(#moldmask)"/>
    <path d="M470 330L556 318 570 402 530 470 480 448z" fill="#1c170d"/><path d="M556 318l-30 30 14 72 30-18z" fill="#a39958" stroke="#2c2813"/>
    <path d="M70 600L190 630 176 760 110 800 62 730z" fill="#17130a"/><path d="M190 630l-44 28 6 92 24 10z" fill="#6f6738" stroke="#1f1b0d" stroke-width="2"/>
    <path d="M1000 230l24 80-18 60 16 64-12 50M1024 310l36-20M1006 370l-30 18M260 150l-30 90 20 70-40 90M230 240l-40-14" fill="none" stroke="#17130a" stroke-width="3"/>
    <g transform="rotate(5 545 450)"><rect x="500" y="420" width="72" height="92" fill="#2c2214" stroke="#090806" stroke-width="4"/><rect x="508" y="428" width="56" height="76" fill="#0a0805"/><path d="M508 428h56v24l-18 12-12-8-8 22-18 8z" fill="#6c6650"/><path d="M526 450c-5 14 5 16 12 10 6-8-3-20-12-10z" fill="#17130a"/></g>
    <g transform="translate(1270 180) skewY(-22)"><rect width="88" height="70" fill="#2c2214" stroke="#090806" stroke-width="4"/><rect x="8" y="8" width="72" height="54" fill="#0a0805"/><path d="M8 8h72v14l-20 16-14-10-16 20-22-6z" fill="#514b39"/></g>
    <g transform="translate(1240 590) skewY(-20)" stroke="#201a0d" stroke-width="5">${range(0, 60, 5)
      .map((x, i) => `<path d="M${x} 0v52"/>`)
      .join("")}<path d="M-6 44L68 8"/><g transform="translate(92 0)">${range(0, 60, 5)
      .map((x) => `<path d="M${x} 0v52"/>`)
      .join("")}<path d="M-6 44L68 8"/></g></g>
    <text transform="translate(1142 496) skewY(-11)" font-family="Special Elite, monospace" font-size="44" fill="#5a120d" opacity=".9">YOU WERE HERE</text>
    <path d="M612 500c-6 50 2 110-6 176M636 490c-4 60 4 120-3 200M660 494c-5 56 3 104-4 170M682 506c-3 42 2 86-3 132" fill="none" stroke="#4a0e0a" stroke-width="9" stroke-linecap="round" opacity=".7"/>
    <g><rect x="965" y="320" width="110" height="380" fill="#090704" stroke="#2c2813" stroke-width="8"/><rect x="985" y="370" width="70" height="285" fill="#3d3819"/><rect x="1001" y="410" width="38" height="200" fill="#6f6735"/><path d="M965 700L985 655H1055L1075 700z" fill="#1c190c"/>
      <g class="figure"><circle cx="1020" cy="520" r="13" fill="#040302"/><path d="M1007 538q13-8 26 0l5 42-4 62-6 46h-16l-6-46-4-62z" fill="#040302"/><path d="M1007 540l-11 70 6 62M1033 540l11 70-6 62" fill="none" stroke="#040302" stroke-width="6" stroke-linecap="round"/></g></g>
    <path d="M210 860H860L990 1040H100z" fill="url(#desktop)" stroke="#090806" stroke-width="4"/><path d="M340 900l60 40M640 880l-40 70M760 950l50 40M300 960h90" stroke="#0d0905" stroke-width="3"/>
    <ellipse cx="800" cy="930" rx="48" ry="16" fill="none" stroke="#120c07" stroke-width="5"/>
  </svg></div>
  <svg class="arm" viewBox="0 0 300 360" aria-hidden="true">
    <path d="M300 360V200L184 174l-38 58 44 128z" fill="#14120a" stroke="#000" stroke-width="3"/>
    <path d="M176 186c-24-16-46-8-54 14-8 22 0 42 18 50l44 2 34-40z" fill="#5c4a35" stroke="#000" stroke-width="3"/>
    <path d="M132 196l44 20M124 214l44 20M128 232l36 14" stroke="#2a1f12" stroke-width="4" fill="none"/>
    <path d="M42 90L22 112 142 226 164 200z" fill="#26241a" stroke="#000" stroke-width="3"/><path d="M28 70L0 100 26 128 58 94z" fill="#3a3626" stroke="#000" stroke-width="3"/>
    <path d="M16 78L6 94 28 118 40 96z" fill="#f4e8ab"/>
  </svg>
  <svg class="killer" viewBox="0 0 200 400" aria-hidden="true">
    <ellipse cx="112" cy="44" rx="23" ry="33" transform="rotate(24 112 44)" fill="#020101"/>
    <path d="M92 74l20 8c26 6 38 22 42 50l10 92 8 96 6 62-7 16-9-15-5 12-7-14-8-70-12-92-4 62 2 119H72l-3-119-7-62-10 96-6 66-8 14-5-12-9 15-7-16 9-64 8-98 9-88c4-30 20-48 49-58z" fill="#020101"/>
  </svg>`;
  const scene = room.querySelector(".scene");
  for (const [id, label, art] of objects) {
    const el = document.createElement("button"); // button = keyboard + screen reader for free
    el.id = "obj-" + id;
    el.className = "obj";
    el.type = "button";
    el.setAttribute("aria-label", label);
    el.innerHTML = `<span class="art" aria-hidden="true">${art}</span><span class="label">${label}</span>`;
    el.addEventListener("click", () => onObjectClick(id));
    scene.append(el);
  }
  // First-person look: the flashlight follows the pointer, or the focused object for keyboard players.
  // The beam is its own layer moved with transform, so following the pointer never repaints the room.
  room.insertAdjacentHTML("beforeend", '<div class="beam" aria-hidden="true"></div>');
  const beam = room.querySelector(".beam");
  let frame = 0,
    px = 0,
    py = 0;
  const aim = (x, y) => {
    px = x;
    py = y;
    frame ||= requestAnimationFrame(() => {
      // at most one update per screen frame
      frame = 0;
      const r = room.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (px - r.left) / r.width)),
        ny = Math.min(1, Math.max(0, (py - r.top) / r.height));
      beam.style.transform = `translate(${nx * 50}%, ${ny * 50}%)`; // beam is 2x the room, so 50% = full width
      room.style.setProperty("--nx", nx);
      room.style.setProperty("--ny", ny);
    });
  };
  room.addEventListener("pointermove", (e) => aim(e.clientX, e.clientY));
  room.addEventListener("focusin", (e) => {
    const b = e.target.getBoundingClientRect();
    aim(b.left + b.width / 2, b.top + b.height / 2);
  });
}
