// Owner: Room & objects (see README)
// Builds the clickable objects inside #room. No puzzle logic here: every click goes to onObjectClick(id).
// Art is inline SVG so CSS can animate parts of it (clock hand, cabinet doors, door bolt and light, computer screen, ceiling tube).
function buildRoom() {
  const S = (vb, body) =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><g filter="url(#grime)">${body}</g></svg>`;
  const ink = 'stroke="#090806" stroke-width="2" stroke-linejoin="round"';
  const CASKET = `
      <path d="M60 4L104 34 90 146H30L16 34z" fill="#0a0806" ${ink}/>
      <g class="page"><path d="M43 52l30-5 7 42-7 5-4-4-6 6-16-1z" fill="#a89c7c" stroke="#120e08"/><path d="M49 60l20-3M50 67l20-3M51 74l14-2" stroke="#2c271c" stroke-width="1.6"/></g>
      <g class="lid"><path d="M60 10L97 36 85 140H35L23 36z" fill="#2c2017" ${ink}/><path d="M60 16L88 38 78 134H42L32 38z" fill="none" stroke="#120b06" stroke-width="2"/>
      <path d="M40 40l7 3M80 40l-7 3M42 128l7-2M78 128l-7-2" stroke="#0a0805" stroke-width="3"/><path d="M71 134c0 8 1 12 2 12s2-4 2-12z" fill="#8c1a15"/>
      <rect x="39" y="72" width="42" height="17" fill="#8d7433" stroke="#231a08" stroke-width="1.5"/><path d="M43 77h34M43 84h34M47 75l6 12M56 74l5 13M66 75l6 12" stroke="#2b2109" stroke-width="1.3"/></g>`;
  const objects = [
    // DOM order = Tab order: wall left to right, then floor left to right
    [
      "clock",
      "Clock",
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <g filter="url(#grime)"><circle cx="50" cy="50" r="46" fill="#3b2c1e" ${ink}/><circle cx="50" cy="50" r="38" fill="#8d8671" ${ink}/>
      <path d="M50 16v8M50 76v8M16 50h8M76 50h8" stroke="#16130e" stroke-width="3"/>
      <path d="M50 50L47 28M50 50L37 62" stroke="#16130e" stroke-width="4" stroke-linecap="round"/>
      <line class="sec" x1="50" y1="56" x2="50" y2="20" stroke="#a31f1a" stroke-width="1.6"/>
      <path d="M70 18L58 38l7 7-11 13 4 8M58 38L42 34M65 45l15 3" fill="none" stroke="#e8e2cf" stroke-opacity=".6" stroke-width="1"/>
      <circle cx="50" cy="50" r="3" fill="#16130e"/></g>
      <g stroke="#1b170d" stroke-width="2.4" stroke-linecap="round">
        <path d="M108 14v24M114 13v24M120 14v24M126 13v24M104 33l27-16M136 14v24M142 13v24M148 14v24M154 13v24M132 33l27-16"/>
        <path d="M108 48v24M114 47v24M120 48v24M126 47v24M104 67l27-16M136 48v24M142 47v24"/></g>
      <path d="M148 48v24M154 47v24" stroke="#d8d0ba" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    ],
    [
      "painting",
      "Painting",
      S(
        "0 0 120 90",
        `
      <path d="M1 1h96l6 7 16-3v84H12l-4-9-7 2z" fill="#3f3019" ${ink}/><rect x="8" y="8" width="104" height="74" fill="#120d07"/>
      <rect x="11" y="11" width="98" height="68" fill="url(#sea)"/><circle cx="96" cy="26" r="6" fill="#c9d6f2"/>
      <path d="M11 56q12-9 24 0t25 0 25 0 24 0v23H11z" style="fill:var(--paint3,#0f338f)"/><path d="M11 65q12-8 24 0t25 0 25 0 24 0" fill="none" style="stroke:var(--paint4,#7fa8fb)" stroke-width="1.6"/>
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
      <g transform="rotate(-5 30 36)" clip-path="url(#tornphoto)"><rect x="3" y="3" width="54" height="66" fill="#9c9070" ${ink}/><rect x="8" y="8" width="44" height="42" fill="#5f5844"/>
      <rect x="8" y="8" width="44" height="14" fill="#7a7259"/>
      <g fill="#231f15">${[
        [14, 22],
        [24, 22],
        [34, 22],
        [44, 22],
        [12, 34],
        [22, 34],
        [32, 34],
        [42, 34],
      ]
        .map(([x, y]) => `<path d="M${x - 5} ${y + 16}c0-7 2-9 5-9s5 2 5 9z"/>`)
        .join("")}</g>
      <g fill="#b5a987">${[
        [14, 22],
        [24, 22],
        [34, 22],
        [44, 22],
        [12, 34],
        [22, 34],
        [32, 34],
        [42, 34],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y + 2}" r="3.2"/>`)
        .join("")}</g>
      <g stroke="#120e08" stroke-width="1.5">${[
        [14, 22],
        [24, 22],
        [44, 22],
        [12, 34],
        [22, 34],
        [32, 34],
        [42, 34],
      ]
        .map(([x, y]) => `<path d="M${x - 4} ${y}l8 5M${x - 4} ${y + 4}l8-5M${x - 3} ${y + 2}h7"/>`)
        .join("")}</g>
      <path d="M13 59c4-3 6 2 10 0s5-2 9 0" fill="none" stroke="#2c271c" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="10" cy="11" r="6" fill="#121a0a" fill-opacity=".6"/></g>
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
      <g class="ad" transform="rotate(-2 30 40)"><path d="M13 26h34l1 30-9 2-6-2-20 1z" fill="#a89c7c" stroke="#090806" stroke-width=".8"/><path d="M26 24h8v4h-8z" fill="#c9bf9f" opacity=".7"/>
      <g font-family="monospace" font-weight="bold" fill="#17140d" font-size="4.6"><text x="16" y="33">NIGHT</text><text x="16" y="38">AUDITORS</text><text x="16" y="43">WANTED</text></g><g font-family="monospace" fill="#2c271c" font-size="3.4"><text x="16" y="48">Floor 14. Cash.</text><text x="16" y="52">No questions.</text></g></g>
      <g class="scrawl" font-family="Special Elite, monospace" fill="#c23a30" font-size="5.6" transform="rotate(-3 30 40)"><text x="10" y="32">DON'T LEAVE</text><text x="10" y="40">WITHOUT</text><text class="scrawl-name" x="10" y="49"></text></g>
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
      <g transform="rotate(-3 58 26)"><path d="M43 34V19c5-2 10-2 15 0 5-2 10-2 15 0v15c-5-2-10-2-15 0-5-2-10-2-15 0z" fill="#a89c7c" stroke="#090806"/><path d="M58 19v15" stroke="#090806"/><path d="M46 22h9M46 25h9M46 28h9M61 22h9M61 25h5M61 28h5" stroke="#2c271c" stroke-width="1"/></g>
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
    [
      "phone",
      "Old phone",
      S(
        "0 0 80 56",
        `
      <path d="M12 54l6-26h44l6 26z" fill="#1d1a15" ${ink}/><path d="M6 24c0-14 68-14 68 0l-4 8H56l-3-8H27l-3 8H10z" fill="#2a2620" ${ink}/>
      <circle cx="40" cy="42" r="9" fill="#4a4336" stroke="#090806"/><circle cx="40" cy="42" r="3" fill="#120e0a"/><g fill="#120e0a"><circle cx="40" cy="35.5" r="1.2"/><circle cx="46" cy="39" r="1.2"/><circle cx="46" cy="45" r="1.2"/><circle cx="40" cy="48.500" r="1.2"/><circle cx="34" cy="45" r="1.2"/><circle cx="34" cy="39" r="1.2"/></g>
      <path d="M12 34c-10 6-10 14-4 20" fill="none" stroke="#090806" stroke-width="2"/>`,
      ),
    ],
    [
      "coat",
      "Coat on a hook",
      S(
        "0 0 60 120",
        `
      <path d="M30 2v9" stroke="#6c5a35" stroke-width="3"/><circle cx="30" cy="3" r="2.500" fill="#6c5a35"/>
      <path d="M30 10c-14 2-22 8-24 20L2 100c8 6 14 6 20 2l4-40 4-8 4 8 4 40c6 4 12 4 20-2l-4-70c-2-12-10-18-24-20z" fill="#27231b" ${ink}/>
      <path d="M30 12l-9 22 9 20 9-20z" fill="#14120c" stroke="#090806"/><path d="M12 74h13v14H12z" fill="#1c1913" stroke="#090806"/>
      <path d="M14 18c8-3 24-3 32 0" fill="none" stroke="#6d6a58" stroke-opacity=".6" stroke-width="3"/><path d="M40 72l9 3-3 14-9-3z" fill="#a89c7c" stroke="#090806"/>`,
      ),
    ],
    [
      "vending",
      "Vending machine",
      S(
        "0 0 90 170",
        `
      <rect x="2" y="2" width="86" height="166" rx="3" fill="#33362f" ${ink}/><rect x="9" y="9" width="52" height="118" fill="#0c0d0a" ${ink}/>
      <g>${[0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2].map((c) => `<rect x="${13 + c * 16}" y="${14 + r * 23}" width="12" height="17" fill="#7a6d48" stroke="#090806"/><path d="M${15 + c * 16} ${21 + r * 23}h8" stroke="#17140d" stroke-width="1.5"/>`)).join("")}</g>
      <path d="M9 9L61 127M61 9L30 60" stroke="#c9c2a8" stroke-opacity=".3"/><rect x="66" y="14" width="17" height="10" fill="#120e0a" stroke="#090806"/>
      <g fill="#55524a" stroke="#090806">${[0, 1, 2, 3].map((r) => `<rect x="67" y="${32 + r * 12}" width="15" height="8"/>`).join("")}</g>
      <rect x="9" y="136" width="52" height="24" fill="#050403" stroke="#090806" stroke-width="2"/><path d="M6 168l12-3M60 168l18-2" stroke="#6b3e20" stroke-width="3"/>`,
      ),
    ],
    [
      "scratches",
      "Scratches on the door frame",
      S(
        "0 0 24 150",
        `
      <rect x="1" y="1" width="22" height="148" fill="#2a2820" stroke="#090806"/>
      <g stroke="#b8b09a" stroke-width="1.3" stroke-linecap="round"><path d="M7 30l3 26M12 28l3 30M17 31l2 24M6 72l4 30M11 70l3 34M16 73l3 28M7 112l2 20M12 110l2 24"/></g>
      <path d="M9 40l1 8M14 44l1 8M8 86l1 8M13 90l1 8" stroke="#6e0d08" stroke-width="1.6"/>`,
      ),
    ],
    ["casket-left", "Left casket", S("0 0 120 150", CASKET), 2],
    ["casket-right", "Right casket", S("0 0 120 150", CASKET), 2],
    [
      "fusebox",
      "Fuse box",
      S(
        "0 0 70 90",
        `
      <rect x="2" y="2" width="66" height="86" rx="2" fill="#3c4247" ${ink}/><rect x="9" y="9" width="52" height="72" fill="#14171a" stroke="#090806"/>
      <g fill="#6c6a5c" stroke="#090806">${[0, 1, 2].flatMap((r) => [0, 1].map((c) => `<rect x="${14 + c * 14}" y="${15 + r * 17}" width="9" height="13"/>`)).join("")}</g>
      <rect x="46" y="16" width="10" height="56" fill="#090a0b" stroke="#2c3338"/><g class="lever"><rect x="42" y="20" width="18" height="9" rx="2" fill="#8c1a15" stroke="#090806"/></g>
      <path d="M2 88c6 4 8 6 7 2M68 2l-8 6" stroke="#6b3e20" stroke-width="2"/><path d="M16 73c8-2 14 1 22 0" stroke="#c7a650" stroke-width="1.5" fill="none"/><circle class="led" cx="17" cy="79" r="1"/>`,
      ),
      2,
    ],
    [
      "shoes",
      "Pair of shoes",
      S(
        "0 0 100 44",
        `
      <path d="M4 34c0-14 6-22 12-22 8 0 8 10 18 14 8 3 12 6 10 12H6z" fill="#14120c" ${ink}/><path d="M16 15l6 8M20 13l6 8" stroke="#a79f8a" stroke-width="1.6"/>
      <path d="M54 34c0-14 6-22 12-22 8 0 8 10 18 14 8 3 12 6 10 12H56z" fill="#17150e" ${ink}/><path d="M66 15l6 8M70 13l6 8" stroke="#a79f8a" stroke-width="1.6"/>
      <path d="M6 38h38M56 38h38" stroke="#000" stroke-width="3"/>`,
      ),
      2,
    ],
    [
      "bricked-door",
      "Bricked-up door",
      S(
        "0 0 70 140",
        `
      <rect x="2" y="2" width="66" height="136" fill="#1a1d20" ${ink}/><rect x="8" y="10" width="54" height="128" fill="url(#bricks)"/>
      <path d="M8 10h54M8 10v128M62 10v128" stroke="#0a0c0e" stroke-width="4"/><path d="M18 64c6 6 16 6 22-2M24 90l14-6" stroke="#0a0c0e" stroke-width="2" fill="none"/>
      <rect x="20" y="20" width="30" height="9" fill="#8d7433" stroke="#231a08"/><path d="M23 24h24" stroke="#2b2109" stroke-width="2"/>`,
      ),
      2,
    ],
    [
      "candles",
      "Candle stubs",
      `<svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <g class="candles"><circle cx="44" cy="44" r="58" fill="url(#candle)"/><g fill="#f4d98a"><path d="M26 48c-4-7 0-12 0-17 3 6 5 11 0 17zM50 38c-4-8 0-14 0-20 3 7 6 13 0 20zM68 54c-3-6 0-10 0-14 3 5 4 9 0 14z"/></g></g>
      <g fill="#c9c2a8" stroke="#3b3323"><rect x="20" y="48" width="12" height="28"/><rect x="44" y="38" width="13" height="40"/><rect x="62" y="54" width="11" height="22"/></g>
      <path d="M14 78c20 6 50 6 64 0-2-6-12-6-14-2-10 2-30 2-36 0-4-4-12-2-14 2z" fill="#a79f8a" stroke="#3b3323"/></svg>`,
      2,
    ],
    [
      "keypad",
      "Keypad",
      S(
        "0 0 60 84",
        `
      <rect x="2" y="2" width="56" height="80" rx="3" fill="#2a2820" ${ink}/><rect x="9" y="8" width="42" height="14" fill="#2c0c09" stroke="#090806"/><circle class="led" cx="46" cy="15" r="2.5"/>
      <g fill="#6f6a57" stroke="#090806">${[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<rect x="${10 + c * 14}" y="${28 + r * 16}" width="11" height="12"/>`)).join("")}</g>`,
      ),
      2,
    ],
    [
      "lift",
      "Lift buttons",
      S(
        "0 0 60 170",
        `
      <rect x="2" y="2" width="56" height="166" rx="3" fill="#3a3019" ${ink}/><rect x="8" y="8" width="44" height="154" fill="#231d0f" stroke="#090806"/>
      <rect x="14" y="12" width="32" height="12" fill="#090806" stroke="#6f5a30"/><circle class="lift-lamp" cx="30" cy="18" r="3.500" fill="#3a1511"/>
      <g fill="#c7a650" stroke="#231a08" stroke-width="1.2">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((r) => [0, 1].map((c) => `<circle cx="${21 + c * 18}" cy="${34 + r * 12}" r="4"/>`)).join("")}</g>
      <path d="M12 164l10-5M40 160l14 4" stroke="#6b3e20" stroke-width="2"/>`,
      ),
      3,
    ],
    [
      "gate",
      "Lift gate",
      `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg"><g class="folds">
      <g stroke="#7a6530" stroke-width="3" fill="none"><path d="M3 2H117V188H3z"/>${[3, 17, 31, 45, 59, 73, 87, 101, 117].map((x) => `<path d="M${x} 2v186"/>`).join("")}</g>
      <g stroke="#57461f" stroke-width="2.200">${[3, 31, 59, 87].map((x) => `<path d="M${x} 20l28 40M${x + 28} 20l-28 40M${x} 76l28 40M${x + 28} 76l-28 40M${x} 132l28 40M${x + 28} 132l-28 40"/>`).join("")}</g>
      <rect x="104" y="86" width="13" height="18" fill="#c7a650" stroke="#231a08"/></g></svg>`,
      3,
    ],
    [
      "indicator",
      "Floor dial",
      S(
        "0 0 150 80",
        `
      <path d="M4 76a71 71 0 0 1 142 0z" fill="#3a3019" ${ink}/><path d="M16 76a59 59 0 0 1 118 0z" fill="#a89c7c" stroke="#231a08" stroke-width="2"/>
      <g stroke="#231a08" stroke-width="2"><path d="M26 66l8 3M38 44l7 6M58 27l4 8M92 27l-4 8M112 44l-7 6M124 66l-8 3"/></g>
      <g font-family="monospace" font-size="9" font-weight="bold" fill="#17140d" text-anchor="middle"><text x="42" y="68">G</text><text x="52" y="52">4</text><text x="68" y="44">8</text><text x="84" y="44">12</text><text x="99" y="52">16</text><text x="109" y="68">20</text></g>
      <path class="needle" d="M75 74L88 34" stroke="#8c1a15" stroke-width="3" stroke-linecap="round"/><circle cx="75" cy="74" r="5" fill="#120e0a"/>`,
      ),
      3,
    ],
    [
      "emergency-phone",
      "Emergency phone",
      S(
        "0 0 80 110",
        `
      <rect x="2" y="2" width="76" height="106" rx="3" fill="#6e0d08" ${ink}/><rect x="10" y="10" width="60" height="16" fill="#a89c7c" stroke="#090806"/><text x="40" y="22" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle" fill="#17140d">NIGHT DESK</text>
      <rect x="10" y="32" width="60" height="68" fill="#2c0504" stroke="#090806"/><path d="M28 40c-8 0-8 6-8 22s0 22 8 22c4 0 5-3 5-7 0-4-2-7-6-7-1-5-1-11 0-16 4 0 6-3 6-7 0-4-1-7-5-7z" fill="#0a0806" stroke="#000"/>
      <path d="M26 84c8 8 22 8 26-2s-4-22 4-32" fill="none" stroke="#0a0806" stroke-width="2"/><g fill="#a79f8a">${[0, 1, 2].flatMap((r) => [0, 1].map((c) => `<circle cx="${50 + c * 10}" cy="${44 + r * 10}" r="2.500"/>`)).join("")}</g>`,
      ),
      3,
    ],
    [
      "graffiti",
      "Words scratched into the wall",
      `<svg viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="110" fill="#000" fill-opacity=".01"/><g font-family="Special Elite, monospace" fill="#c9c2a8" opacity=".85"><text x="6" y="26" font-size="24">THE DOOR</text><text x="6" y="52" font-size="24">OPENS</text><text x="6" y="78" font-size="24">FOR ONE</text></g>
      <text x="44" y="104" font-family="Special Elite, monospace" font-size="20" fill="#8c1a15" transform="rotate(-3 44 104)">UNLESS</text></svg>`,
      3,
    ],
  ];
  const room = document.getElementById("room");
  const rays = (pts, col, w) =>
    pts.map(([x, y]) => `<path d="M800 470L${x} ${y}" stroke="${col}" stroke-width="${w}"/>`).join("");
  const range = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
  const blob = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#blob)"/>`;
  const drip = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#drip)"/>`;
  room.innerHTML = `<div class="scene"><svg class="walls" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true"><defs>
    <pattern id="carpet" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#4a4326"/><path d="M0 0l14 14M14 0L0 14" stroke="#231f10" stroke-width="2"/></pattern>
    <pattern id="bricks" width="44" height="26" patternUnits="userSpaceOnUse"><rect width="44" height="26" fill="#3a3f42"/><path d="M0 0h44M0 13h44M0 0v13M22 13v13" stroke="#14171a" stroke-width="3"/></pattern>
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
    <radialGradient id="candle"><stop offset="0" stop-color="#f4d98a" stop-opacity=".55"/><stop offset="1" stop-color="#f4d98a" stop-opacity="0"/></radialGradient>
    <radialGradient id="blob"><stop offset=".35" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <mask id="moldmask" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1000"><rect width="1600" height="1000" fill="#000"/>
      ${blob(470, 230, 150)}${blob(60, 60, 260)}${blob(50, 900, 230)}${blob(1130, 230, 130)}${blob(1550, 50, 220)}${blob(1130, 700, 100)}${blob(470, 700, 130)}</mask>
    <linearGradient id="drip" x2="0" y2="1"><stop offset="0" stop-color="#2b2109" stop-opacity=".85"/><stop offset="1" stop-color="#2b2109" stop-opacity="0"/></linearGradient>
    <linearGradient id="lwall"><stop offset="0" stop-color="#4f4925"/><stop offset="1" stop-color="#7f7640"/></linearGradient>
    <linearGradient id="rwall"><stop offset="0" stop-color="#7f7640"/><stop offset="1" stop-color="#4f4925"/></linearGradient>
    <linearGradient id="floor" x2="0" y2="1"><stop offset="0" stop-color="#3f3a1f"/><stop offset="1" stop-color="#1f1c0e"/></linearGradient>
    <linearGradient id="desktop" x2="0" y2="1"><stop offset="0" stop-color="#3d2c1c"/><stop offset="1" stop-color="#1b130b"/></linearGradient>
    <linearGradient id="sea" x2="0" y2="1"><stop offset="0" style="stop-color:var(--paint0,#5b92ff)"/><stop offset=".55" style="stop-color:var(--paint1,#1c50d2)"/><stop offset="1" style="stop-color:var(--paint2,#0b2474)"/></linearGradient>
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
    <path d="M0 600L470 512V700L0 1000z" fill="#0b0a05" opacity=".28"/><path d="M1600 600L1130 512V700L1600 1000z" fill="#0b0a05" opacity=".28"/><rect x="470" y="512" width="660" height="188" fill="#0b0a05" opacity=".2"/>
    <path d="M0 600L470 512H1130L1600 600" fill="none" stroke="#2b2610" stroke-width="7"/><path d="M0 593L470 508H1130L1600 593" fill="none" stroke="#b5ab6e" stroke-opacity=".28" stroke-width="2"/>
    <path d="M0 1000L470 700H1130L1600 1000z" fill="url(#carpet)" opacity=".55"/>
    <ellipse cx="800" cy="250" rx="360" ry="100" fill="url(#candle)" opacity=".45"/>
    <path d="M380 180c6 40-14 50-4 96 6 30-8 40-2 72" fill="none" stroke="#0a0805" stroke-width="3"/>
    <g transform="translate(980 800) rotate(-9)"><path d="M0 0L90 -8 104 34 10 44z" fill="#8f8664" stroke="#17140d" stroke-width="2"/><path d="M12 10l70-6M15 20l70-6M18 30l50-4" stroke="#3b3323" stroke-width="2"/></g>
    <g transform="translate(560 780) rotate(12)"><path d="M0 0L70 -6 80 24 8 32z" fill="#7a7259" stroke="#17140d" stroke-width="2"/></g>
    <ellipse cx="800" cy="704" rx="120" ry="12" fill="#000" opacity=".6"/><ellipse cx="1020" cy="704" rx="62" ry="8" fill="#000" opacity=".5"/>
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
    <path transform="translate(-300 -20) skewY(14)" d="M612 500c-6 50 2 110-6 176M636 490c-4 60 4 120-3 200M660 494c-5 56 3 104-4 170M682 506c-3 42 2 86-3 132" fill="none" stroke="#4a0e0a" stroke-width="9" stroke-linecap="round" opacity=".7"/>
    <g><rect x="965" y="320" width="110" height="380" fill="#090704" stroke="#2c2813" stroke-width="8"/><rect x="985" y="370" width="70" height="285" fill="#3d3819"/><rect x="1001" y="410" width="38" height="200" fill="#6f6735"/><path d="M965 700L985 655H1055L1075 700z" fill="#1c190c"/>
      <g class="figure"><circle cx="1020" cy="520" r="13" fill="#040302"/><path d="M1007 538q13-8 26 0l5 42-4 62-6 46h-16l-6-46-4-62z" fill="#040302"/><path d="M1007 540l-11 70 6 62M1033 540l11 70-6 62" fill="none" stroke="#040302" stroke-width="6" stroke-linecap="round"/></g></g>
    <path d="M210 860H860L990 1040H100z" fill="url(#desktop)" stroke="#090806" stroke-width="4"/><path d="M210 860H860" stroke="#6b5234" stroke-width="3" opacity=".6"/>
    <path d="M340 900l60 40M640 880l-40 70M760 950l50 40M300 960h90" stroke="#0d0905" stroke-width="3"/>
    <g transform="translate(520 882) rotate(-4)"><path d="M0 0H92L104 58H-6z" fill="#7d7559" stroke="#120e08" stroke-width="2"/><path d="M4 -5H94L104 50H-2z" fill="#a89c7c" stroke="#120e08" stroke-width="2"/><path d="M10 6h72M9 16h78M8 26h60M7 36h74" stroke="#3b3323" stroke-width="2"/></g>
    <g transform="translate(860 884)"><path d="M0 8c0 30 6 42 22 42s22-12 22-42z" fill="#a39b83" stroke="#120e08" stroke-width="3"/><ellipse cx="22" cy="8" rx="22" ry="7" fill="#17120b" stroke="#120e08" stroke-width="3"/><path d="M44 16c14-2 14 22-2 22" fill="none" stroke="#a39b83" stroke-width="5"/><path d="M6 12c-2 12 1 22 3 30" stroke="#6b3e20" stroke-width="3" fill="none"/></g>
    <path d="M420 930l80-22" stroke="#8c1a15" stroke-width="5" stroke-linecap="round"/><path d="M500 908l8-2" stroke="#d8d0ba" stroke-width="5"/>
    <path d="M300 880c-90 40-140 40-240 90" fill="none" stroke="#090806" stroke-width="6"/>
    <ellipse cx="760" cy="980" rx="50" ry="14" fill="#231a0f" stroke="#090806" stroke-width="3"/><path d="M730 974l40 6M750 968l26 20" stroke="#6d6a58" stroke-width="3"/>
    <ellipse cx="640" cy="975" rx="40" ry="12" fill="none" stroke="#120c07" stroke-width="4"/>
  </svg>
  <svg class="walls level-view" data-stage="2" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
        <rect width="1600" height="1000" fill="#14171a"/>
    <path d="M0 0H1600L870 420H730z" fill="#22272b"/><path d="M0 0L730 420V520L0 1000z" fill="#2c3338"/><path d="M1600 0L870 420V520L1600 1000z" fill="#2c3338"/>
    <path d="M0 1000L730 520H870L1600 1000z" fill="#15181b"/><rect x="730" y="420" width="140" height="100" fill="#020203"/>
    ${[
      [50, 165],
      [255, 335],
      [430, 490],
      [560, 605],
      [650, 682],
    ]
      .map(([a, b]) => {
        const top = (x) => (420 * x) / 730,
          bottom = (x) => 1000 - (480 * x) / 730,
          y = (x) => top(x) + (bottom(x) - top(x)) * 0.22;
        const door = (mirror) => {
          const X = (x) => (mirror ? 1600 - x : x);
          return `<path d="M${X(a)} ${y(a)}L${X(b)} ${y(b)}V${bottom(b)}L${X(a)} ${bottom(a)}z" fill="url(#bricks)" stroke="#0a0c0e" stroke-width="7"/>`;
        };
        return door(false) + door(true);
      })
      .join("")}
    <path d="M0 0L730 420M1600 0L870 420M0 1000L730 520M1600 1000L870 520" stroke="#07090a" stroke-width="6"/>
    <rect width="1600" height="1000" filter="url(#mold)" mask="url(#moldmask)" opacity=".8"/>
    ${drip(180, 90, 18, 420)}${drip(420, 220, 14, 300)}${drip(1180, 220, 18, 320)}${drip(1420, 110, 22, 400)}
    <g fill="#08090a" stroke="#000" stroke-width="2"><path d="M630 660c20-8 40-8 50 2l-4 12h-46zM690 664c20-8 40-8 50 2l-4 12h-46z"/><path d="M930 640c14-6 28-6 36 1l-3 9h-33zM974 642c14-6 28-6 36 1l-3 9h-33z"/><path d="M822 575c9-4 18-4 24 1l-2 6h-22zM852 577c9-4 18-4 24 1l-2 6h-22z"/></g>
    <path d="M770 690c30-18 80-24 118-8 18 10 10 34-14 34h-94c-20 0-26-16-10-26z" fill="#1c2024" stroke="#000" stroke-width="2"/><path d="M820 676l6 40M852 682l-4 34" stroke="#0a0c0e" stroke-width="3"/>
  </svg>
  <svg class="walls level-view" data-stage="3" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
    <defs><pattern id="plate" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="#2c2b22"/><path d="M0 0h120M0 0v120" stroke="#141309" stroke-width="4"/><g fill="#0d0c07"><circle cx="10" cy="10" r="3"/><circle cx="110" cy="10" r="3"/><circle cx="10" cy="110" r="3"/><circle cx="110" cy="110" r="3"/></g></pattern></defs>
    <rect width="1600" height="1000" fill="#14130e"/>
    <path d="M0 0H1600L1190 150H410z" fill="#0d0c07"/><path d="M0 0L410 150V790L0 1000z" fill="url(#plate)"/><path d="M1600 0L1190 150V790L1600 1000z" fill="url(#plate)"/>
    <rect x="410" y="150" width="780" height="640" fill="#26251c"/><path d="M0 1000L410 790H1190L1600 1000z" fill="#0d0c07"/>
    <path d="M0 0L410 150M1600 0L1190 150M0 1000L410 790M1600 1000L1190 790M410 790H1190" stroke="#050403" stroke-width="7"/>
    <g fill="none" stroke="#1a1810" stroke-width="20"><path d="M150 30V940"/><path d="M1450 30V940"/></g><g fill="none" stroke="#3b3323" stroke-width="3" opacity=".6"><path d="M142 30V940M1442 30V940"/></g>
    <g stroke="#0a0805" stroke-width="7"><path d="M250 0C262 200 238 500 250 900M300 0C290 240 312 520 296 860M1320 0c-10 260 14 540 0 880"/></g>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M300 ${870 - i * 120}h-60" stroke="#0a0805" stroke-width="8"/>`).join("")}
    <rect x="470" y="150" width="480" height="680" fill="#3a3019" stroke="#090806" stroke-width="6"/><rect x="494" y="176" width="432" height="654" fill="#090806"/>
    <path class="car-light" d="M600 176H820L926 830H494z" fill="#d9c98a" opacity=".1"/><rect x="630" y="180" width="160" height="14" fill="#6d6642"/><rect class="car-light" x="636" y="183" width="148" height="8" fill="#fff0b3" opacity=".25"/>
    <path d="M494 760h432M494 830h432" stroke="#1d190c" stroke-width="5"/><path d="M520 200v630M900 200v630" stroke="#1d190c" stroke-width="10"/>
    <rect width="1600" height="1000" filter="url(#dirtwall)" opacity=".45"/><rect width="1600" height="1000" filter="url(#mold)" mask="url(#moldmask)"/>
    ${drip(1000, 150, 22, 360)}${drip(1110, 150, 14, 260)}${drip(420, 150, 18, 300)}
    <path d="M980 880l80 14-20 30-90-12z" fill="#7a7259" stroke="#0a0805" stroke-width="2"/>
  </svg></div>
  <div class="redlight"></div>
  <svg class="vampire" viewBox="0 0 300 400" aria-hidden="true">
    <defs><radialGradient id="flesh" cx=".5" cy=".36" r=".62"><stop offset="0" stop-color="#8b8676"/><stop offset=".55" stop-color="#4c493d"/><stop offset="1" stop-color="#0b0a07"/></radialGradient></defs>
    <path d="M150 188c-40 4-60 26-84 40-34 20-48 70-54 172h276c-6-102-20-152-54-172-24-14-44-36-84-40z" fill="#040302"/>
    <g filter="url(#grime)"><path d="M150 8c-30 0-50 22-54 58-3 30 4 58 12 84 7 24 12 48 22 62 6 8 14 12 20 12s14-4 20-12c10-14 15-38 22-62 8-26 15-54 12-84-4-36-24-58-54-58z" fill="url(#flesh)"/></g>
    <path d="M104 84c10-12 30-12 38 2-2 18-28 26-38-2zM196 84c-10-12-30-12-38 2 2 18 28 26 38 2z" fill="#020101"/>
    <circle cx="125" cy="90" r="1.8" fill="#c9c2a8"/><circle cx="175" cy="90" r="1.8" fill="#c9c2a8"/>
    <path d="M146 108l-5 26 9 3 9-3-5-26z" fill="#1c1a13" opacity=".7"/>
    <path d="M122 152c16 8 40 8 56 0-1 26-10 56-28 62-18-6-27-36-28-62z" fill="#020101"/>
    <path d="M128 154l4 24 5-21zM172 154l-4 24-5-21z" fill="#b5ae98"/>
    <path d="M172 196c1 22 2 44 4 44s3-22 2-44z" fill="#6e0d08"/>
    <g transform="rotate(-6 200 290)"><rect x="176" y="272" width="56" height="34" fill="#a89c7c" stroke="#050303" stroke-width="2"/><rect x="181" y="278" width="14" height="22" fill="#1c1a13"/><path d="M182 281l12 16M194 281l-12 16" stroke="#a89c7c" stroke-width="1.5"/><text x="199" y="285" font-family="monospace" font-size="6" font-weight="bold" fill="#17140d">MERIDIAN</text><text x="199" y="294" font-family="monospace" font-size="6" font-weight="bold" fill="#17140d">TRUST</text></g>
    <g fill="none" stroke="#5c5849" stroke-width="5" stroke-linecap="round"><path d="M30 400c6-40 2-70 12-96M42 304l-16-60M42 304l-2-70M42 304l14-66M42 304l28-52"/><path d="M270 400c-6-40-2-70-12-96M258 304l16-60M258 304l2-70M258 304l-14-66M258 304l-28-52"/></g>
  </svg>
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
  for (const [id, label, art, stage = 1] of objects) {
    const el = document.createElement("button"); // button = keyboard + screen reader for free
    el.id = "obj-" + id;
    el.className = "obj";
    el.dataset.stage = stage;
    el.type = "button";
    el.setAttribute("aria-label", label);
    el.innerHTML = `<span class="art" aria-hidden="true">${art}</span><span class="label">${label}</span>`;
    el.addEventListener("click", () => onObjectClick(id));
    scene.append(el);
  }
  // First-person look: the flashlight follows the pointer, or the focused object for keyboard players.
  // The beam is its own layer moved with transform, so following the pointer never repaints the room.
  room.insertAdjacentHTML(
    "beforeend",
    '<div class="beam" aria-hidden="true"><div class="dust"></div></div><div class="wipe l" aria-hidden="true"></div><div class="wipe r" aria-hidden="true"></div>',
  );
  const beam = room.querySelector(".beam");
  const arm = room.querySelector(".arm");
  let frame = 0,
    px = 0,
    py = 0,
    rect = null;
  for (const type of ["resize", "scroll"])
    addEventListener(
      type,
      () => {
        rect = null;
      },
      { passive: true },
    );
  const aim = (x, y) => {
    px = x;
    py = y;
    frame ||= requestAnimationFrame(() => {
      // at most one update per screen frame
      frame = 0;
      if (!rect || !rect.width) rect = room.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (px - rect.left) / rect.width)),
        ny = Math.min(1, Math.max(0, (py - rect.top) / rect.height));
      beam.style.transform = `translate(${nx * 50}%, ${ny * 50}%)`; // beam is 2x the room, so 50% = full width
      for (const el of [scene, arm]) {
        el.style.setProperty("--nx", nx);
        el.style.setProperty("--ny", ny);
      }
    });
  };
  room.addEventListener("pointermove", (e) => aim(e.clientX, e.clientY));
  room.addEventListener("focusin", (e) => {
    const b = e.target.getBoundingClientRect();
    aim(b.left + b.width / 2, b.top + b.height / 2);
  });
}

// Called once when a match starts, because the seed only exists then. Same room code = same layout on both screens.
function placeObjects() {
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const put = (id, spot, width) => {
    const el = document.getElementById("obj-" + id);
    el.style.left = spot.left + "%";
    el.style.top = spot.top === undefined ? "auto" : spot.top + "%";
    el.style.bottom = spot.bottom === undefined ? "auto" : spot.bottom + "%";
    el.style.setProperty("--w", width + "cqw");
    el.style.transform = `translateX(-50%) perspective(70cqw) rotateY(${spot.turn}deg)`;
  };
  const wallSpots = shuffle([
    { left: 18, top: 19, turn: 36, scale: 1 },
    { left: 37, top: 27, turn: 0, scale: 0.6 },
    { left: 72, top: 25, turn: -34, scale: 0.8 },
  ]);
  [
    ["painting", 18],
    ["clock", 9],
    ["photo", 8],
  ].forEach(([id, width], i) => {
    put(id, wallSpots[i], width * wallSpots[i].scale);
  });
  const floorSpots = shuffle([
    { left: 74, bottom: 25, turn: -36, cabinet: 9, shelf: 12 },
    { left: 89, bottom: 10, turn: -40, cabinet: 13, shelf: 17 },
    { left: 12, bottom: 13, turn: 36, cabinet: 11, shelf: 14 },
  ]);
  put("cabinet", floorSpots[0], floorSpots[0].cabinet);
  put("shelf", floorSpots[1], floorSpots[1].shelf);
  // The painting is the colour your answer needs: [top, middle, bottom, waves, wave line]
  const PAINT = {
    BLUE: ["#5b92ff", "#1c50d2", "#0b2474", "#0f338f", "#7fa8fb"],
    RED: ["#ff6b5b", "#c11f1a", "#5a0b08", "#7e130f", "#f59a8f"],
    GREEN: ["#79d98a", "#1f8f3c", "#0b3f1c", "#115a28", "#9be8a8"],
    WHITE: ["#f2efe4", "#cfcabb", "#9b968a", "#b4ae9f", "#ffffff"],
    BLACK: ["#5a5a5a", "#2a2a2a", "#0e0e0e", "#1a1a1a", "#8a8a8a"],
  };
  const room = document.getElementById("room"),
    answers = puzzleAnswers(game.role);
  PAINT[answers.color].forEach((c, i) => {
    room.style.setProperty("--paint" + i, c);
  });
  // Which casket hides what. Same art, so nothing gives the answer away until one opens.
  const wrong = answers.casket === "left" ? "right" : "left";
  room.dataset.wrong = wrong;
  document.getElementById("obj-casket-" + answers.casket).classList.add("right-one");
  document.getElementById("obj-casket-" + wrong).classList.add("wrong-one");
}
