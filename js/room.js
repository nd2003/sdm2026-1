// Owner: Room & objects (see README)
// Builds the clickable objects inside #room. No puzzle logic here: every click goes to onObjectClick(id).
// Art is inline SVG so CSS can animate parts of it (clock hand, cabinet doors, door bolt and light, computer screen, ceiling tube).
function buildRoom() {
  const S = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><g filter="url(#grime)">${body}</g></svg>`;
  const ink = 'stroke="#090806" stroke-width="2" stroke-linejoin="round"';
  const CASKET = `
      <path d="M60 4L104 34 90 146H30L16 34z" fill="#0a0806" ${ink}/>
      <g class="page"><path d="M43 52l30-5 7 42-7 5-4-4-6 6-16-1z" fill="#a89c7c" stroke="#120e08"/><path d="M49 60l20-3M50 67l20-3M51 74l14-2" stroke="#2c271c" stroke-width="1.6"/></g>
      <g class="lid"><path d="M60 10L97 36 85 140H35L23 36z" fill="#2c2017" ${ink}/><path d="M60 16L88 38 78 134H42L32 38z" fill="none" stroke="#120b06" stroke-width="2"/>
      <path d="M40 40l7 3M80 40l-7 3M42 128l7-2M78 128l-7-2" stroke="#0a0805" stroke-width="3"/><path d="M71 134c0 8 1 12 2 12s2-4 2-12z" fill="#8c1a15"/>
      <rect x="39" y="72" width="42" height="17" fill="#8d7433" stroke="#231a08" stroke-width="1.5"/><path d="M43 77h34M43 84h34M47 75l6 12M56 74l5 13M66 75l6 12" stroke="#2b2109" stroke-width="1.3"/></g>`;
  const objects = [  // DOM order = Tab order: wall left to right, then floor left to right
    ["clock", "Clock", `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <g filter="url(#grime)"><circle cx="50" cy="50" r="46" fill="#3b2c1e" ${ink}/><circle cx="50" cy="50" r="38" fill="#8d8671" ${ink}/>
      <path d="M50 16v8M50 76v8M16 50h8M76 50h8" stroke="#16130e" stroke-width="3"/>
      <path d="M50 50L47 28M50 50L37 62" stroke="#16130e" stroke-width="4" stroke-linecap="round"/>
      <line class="sec" x1="50" y1="56" x2="50" y2="20" stroke="#a31f1a" stroke-width="1.6"/>
      <path d="M70 18L58 38l7 7-11 13 4 8M58 38L42 34M65 45l15 3" fill="none" stroke="#e8e2cf" stroke-opacity=".6" stroke-width="1"/>
      <circle cx="50" cy="50" r="3" fill="#16130e"/></g>
      <g stroke="#1b170d" stroke-width="2.4" stroke-linecap="round">
        <path d="M108 14v24M114 13v24M120 14v24M126 13v24M104 33l27-16M136 14v24M142 13v24M148 14v24M154 13v24M132 33l27-16"/>
        <path d="M108 48v24M114 47v24M120 48v24M126 47v24M104 67l27-16M136 48v24M142 47v24"/></g>
      <path d="M148 48v24M154 47v24" stroke="#d8d0ba" stroke-width="2.4" stroke-linecap="round"/></svg>`],
    ["painting", "Painting", S("0 0 120 90", `
      <path d="M1 1h96l6 7 16-3v84H12l-4-9-7 2z" fill="#3f3019" ${ink}/><rect x="8" y="8" width="104" height="74" fill="#120d07"/>
      <rect x="11" y="11" width="98" height="68" fill="url(#sea)"/><circle cx="96" cy="26" r="6" fill="#c9d6f2"/>
      <path d="M11 56q12-9 24 0t25 0 25 0 24 0v23H11z" style="fill:var(--paint3,#0f338f)"/><path d="M11 65q12-8 24 0t25 0 25 0 24 0" fill="none" style="stroke:var(--paint4,#7fa8fb)" stroke-width="1.6"/>
      <path d="M25 58c-2-9-2-16 0-19 1-3 5-3 6 0 2 3 2 10 0 19z" fill="#04060e"/><circle cx="28" cy="33" r="4" fill="#04060e"/>
      <path d="M72 11L60 28l8 15-13 16 8 20h24l-8-21 11-16-11-14 8-17z" fill="#050403"/>
      <path d="M60 28L42 46l13 13 13-16z" fill="#2c58bf" stroke="#0a1a4a"/><path d="M60 28l-7 14 15 1z" fill="#16368f"/>
      <path d="M87 11l-8 17 11 14 19-8V11z" fill="#000" fill-opacity=".25"/>
      <path d="M26 78l-5 11 8-4 5 4 3-11z" fill="#1c50d2" stroke="#0a1a4a"/><path d="M92 79l3 8 5-5 3 6 1-9z" fill="#0f338f" stroke="#0a1a4a"/>
      <path d="M1 28l6 5-2 8 5 6M112 60l6 4-3 9" fill="none" stroke="#0a0805" stroke-width="1.5"/>
      <path d="M12 11c10 0 13 4 15 10-6 2-11 1-15 5zM109 79c-8 0-14-2-16-8 6-2 11-2 16-8z" fill="#121a0a" fill-opacity=".8"/>`)],
    ["photo", "Photograph", S("0 0 60 72", `
      <g transform="rotate(-5 30 36)" clip-path="url(#tornphoto)"><rect x="3" y="3" width="54" height="66" fill="#9c9070" ${ink}/><rect x="8" y="8" width="44" height="42" fill="#5f5844"/>
      <rect x="8" y="8" width="44" height="14" fill="#7a7259"/>
      <g fill="#231f15">${[[14, 22], [24, 22], [34, 22], [44, 22], [12, 34], [22, 34], [32, 34], [42, 34]].map(([x, y]) => `<path d="M${x - 5} ${y + 16}c0-7 2-9 5-9s5 2 5 9z"/>`).join("")}</g>
      <g fill="#b5a987">${[[14, 22], [24, 22], [34, 22], [44, 22], [12, 34], [22, 34], [32, 34], [42, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y + 2}" r="3.2"/>`).join("")}</g>
      <g stroke="#120e08" stroke-width="1.5">${[[14, 22], [24, 22], [44, 22], [12, 34], [22, 34], [32, 34], [42, 34]].map(([x, y]) => `<path d="M${x - 4} ${y}l8 5M${x - 4} ${y + 4}l8-5M${x - 3} ${y + 2}h7"/>`).join("")}</g>
      <path d="M13 59c4-3 6 2 10 0s5-2 9 0" fill="none" stroke="#2c271c" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="10" cy="11" r="6" fill="#121a0a" fill-opacity=".6"/></g>
      <circle cx="30" cy="5" r="2" fill="#4a4336" stroke="#090806"/>`)],
    ["door", "Exit door", S("0 -16 60 156", `
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
      <circle class="lock" cx="46" cy="55" r="2.8" fill="#c6352c"/><circle cx="46" cy="77" r="3.6" fill="#6c5a35" ${ink}/>`)],
    ["shelf", "Bookshelf", S("0 0 80 110", `
      <rect x="1" y="1" width="78" height="108" fill="#33261a" ${ink}/><rect x="6" y="6" width="68" height="98" fill="#120e0a"/>
      <path d="M6 38h68M6 71l68 3" stroke="#33261a" stroke-width="4"/>
      <g stroke="#090806" stroke-width="1"><rect x="9" y="12" width="7" height="24" fill="#4c2c28"/><rect x="16" y="15" width="6" height="21" fill="#37423a"/><rect x="22" y="10" width="8" height="26" fill="#5b4c2f"/><rect x="34" y="16" width="6" height="20" fill="#3b3e48" transform="rotate(14 37 36)"/>
      <rect x="9" y="47" width="9" height="23" fill="#2f3a42"/><rect x="18" y="50" width="6" height="20" fill="#61573b"/><rect x="24" y="45" width="7" height="25" fill="#3c4530"/>
      <rect x="9" y="82" width="8" height="20" fill="#513b28"/><rect x="17" y="79" width="7" height="23" fill="#2e3439"/></g>
      <path d="M47 62c0-7 4-11 10-11s10 4 10 11c0 3-2 4-3 5v3H50v-3c-1-1-3-2-3-5z" fill="#a39b83" ${ink}/><circle cx="53" cy="60" r="2.6" fill="#0b0907"/><circle cx="61" cy="60" r="2.6" fill="#0b0907"/><path d="M53 70v-3M57 70v-3M61 70v-3" stroke="#0b0907"/>
      <g transform="rotate(-3 58 26)"><path d="M43 34V19c5-2 10-2 15 0 5-2 10-2 15 0v15c-5-2-10-2-15 0-5-2-10-2-15 0z" fill="#a89c7c" stroke="#090806"/><path d="M58 19v15" stroke="#090806"/><path d="M46 22h9M46 25h9M46 28h9M61 22h9M61 25h5M61 28h5" stroke="#2c271c" stroke-width="1"/></g>
      <path d="M74 6L52 6M74 6L60 22M74 6L74 28M58 6q4 6 8 7t8 5" fill="none" stroke="#d8d0ba" stroke-opacity=".45" stroke-width=".8"/>`)],
    ["cabinet", "Cabinet", S("0 0 70 96", `
      <rect x="1" y="1" width="68" height="86" fill="#2c2419" ${ink}/><rect x="6" y="6" width="58" height="76" fill="#070605"/>
      <rect x="22" y="40" width="26" height="16" fill="#b5ab90" transform="rotate(-6 35 48)"/>
      <path d="M8 87v8M62 87v8" stroke="#090806" stroke-width="4"/>
      <g class="dl"><rect x="6" y="6" width="29" height="76" fill="#4a3b29" ${ink}/><path d="M12 56l9 15M17 54l9 15M22 54l7 12" stroke="#17120c" stroke-width="1.3"/></g>
      <g class="dr"><rect x="35" y="6" width="29" height="76" fill="#4a3b29" ${ink}/><path d="M44 12c1 10-1 15 1 24" fill="none" stroke="#6a3b1f" stroke-width="2"/></g>
      <g class="padlock"><path d="M31 40v-4c0-6 8-6 8 0v4" fill="none" stroke="#17140e" stroke-width="2.2"/><rect x="28" y="40" width="14" height="11" fill="#6f5a30" ${ink}/><circle cx="35" cy="45" r="1.5" fill="#090806"/></g>`)],
    ["lamp", "Ceiling light", `<svg viewBox="0 0 120 26" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0l3 6M112 0l-4 6" stroke="#0a0805" stroke-width="1.5"/>
      <rect x="1" y="6" width="118" height="14" fill="#4b4630" ${ink}/>
      <rect class="tube" x="6" y="10" width="108" height="7" rx="3" fill="url(#tube)"/>
      <path d="M92 10v7M101 10v7" stroke="#2c2813" stroke-width="2"/>
      <path d="M116 20c2 2 1 4 3 6" fill="none" stroke="#0a0805"/></svg>`],
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
    ["phone", "Old phone", S("0 0 80 56", `
      <path d="M12 54l6-26h44l6 26z" fill="#1d1a15" ${ink}/><path d="M6 24c0-14 68-14 68 0l-4 8H56l-3-8H27l-3 8H10z" fill="#2a2620" ${ink}/>
      <circle cx="40" cy="42" r="9" fill="#4a4336" stroke="#090806"/><circle cx="40" cy="42" r="3" fill="#120e0a"/><g fill="#120e0a"><circle cx="40" cy="35.5" r="1.2"/><circle cx="46" cy="39" r="1.2"/><circle cx="46" cy="45" r="1.2"/><circle cx="40" cy="48.500" r="1.2"/><circle cx="34" cy="45" r="1.2"/><circle cx="34" cy="39" r="1.2"/></g>
      <path d="M12 34c-10 6-10 14-4 20" fill="none" stroke="#090806" stroke-width="2"/>`)],
    ["coat", "Coat on a hook", S("0 0 60 120", `
      <path d="M30 2v9" stroke="#6c5a35" stroke-width="3"/><circle cx="30" cy="3" r="2.500" fill="#6c5a35"/>
      <path d="M30 10c-14 2-22 8-24 20L2 100c8 6 14 6 20 2l4-40 4-8 4 8 4 40c6 4 12 4 20-2l-4-70c-2-12-10-18-24-20z" fill="#27231b" ${ink}/>
      <path d="M30 12l-9 22 9 20 9-20z" fill="#14120c" stroke="#090806"/><path d="M12 74h13v14H12z" fill="#1c1913" stroke="#090806"/>
      <path d="M14 18c8-3 24-3 32 0" fill="none" stroke="#6d6a58" stroke-opacity=".6" stroke-width="3"/><path d="M40 72l9 3-3 14-9-3z" fill="#a89c7c" stroke="#090806"/>`)],
    ["vending", "Vending machine", S("0 0 90 170", `
      <rect x="2" y="2" width="86" height="166" rx="3" fill="#33362f" ${ink}/><rect x="9" y="9" width="52" height="118" fill="#0c0d0a" ${ink}/>
      <g>${[0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2].map((c) => `<rect x="${13 + c * 16}" y="${14 + r * 23}" width="12" height="17" fill="#7a6d48" stroke="#090806"/><path d="M${15 + c * 16} ${21 + r * 23}h8" stroke="#17140d" stroke-width="1.5"/>`)).join("")}</g>
      <path d="M9 9L61 127M61 9L30 60" stroke="#c9c2a8" stroke-opacity=".3"/><rect x="66" y="14" width="17" height="10" fill="#120e0a" stroke="#090806"/>
      <g fill="#55524a" stroke="#090806">${[0, 1, 2, 3].map((r) => `<rect x="67" y="${32 + r * 12}" width="15" height="8"/>`).join("")}</g>
      <rect x="9" y="136" width="52" height="24" fill="#050403" stroke="#090806" stroke-width="2"/><path d="M6 168l12-3M60 168l18-2" stroke="#6b3e20" stroke-width="3"/>`)],
    ["scratches", "Scratches on the door frame", S("0 0 24 150", `
      <rect x="1" y="1" width="22" height="148" fill="#2a2820" stroke="#090806"/>
      <g stroke="#b8b09a" stroke-width="1.3" stroke-linecap="round"><path d="M7 30l3 26M12 28l3 30M17 31l2 24M6 72l4 30M11 70l3 34M16 73l3 28M7 112l2 20M12 110l2 24"/></g>
      <path d="M9 40l1 8M14 44l1 8M8 86l1 8M13 90l1 8" stroke="#6e0d08" stroke-width="1.6"/>`)],
    ["casket-left", "Left casket", S("0 0 120 150", CASKET), 2],
    ["casket-right", "Right casket", S("0 0 120 150", CASKET), 2],
    ["fusebox", "Fuse box", S("0 0 70 90", `
      <rect x="2" y="2" width="66" height="86" rx="2" fill="#3c4247" ${ink}/><rect x="9" y="9" width="52" height="72" fill="#14171a" stroke="#090806"/>
      <g fill="#6c6a5c" stroke="#090806">${[0, 1, 2].flatMap((r) => [0, 1].map((c) => `<rect x="${14 + c * 14}" y="${15 + r * 17}" width="9" height="13"/>`)).join("")}</g>
      <rect x="46" y="16" width="10" height="56" fill="#090a0b" stroke="#2c3338"/><g class="lever"><rect x="42" y="20" width="18" height="9" rx="2" fill="#8c1a15" stroke="#090806"/></g>
      <path d="M2 88c6 4 8 6 7 2M68 2l-8 6" stroke="#6b3e20" stroke-width="2"/><path d="M16 73c8-2 14 1 22 0" stroke="#c7a650" stroke-width="1.5" fill="none"/><circle class="led" cx="17" cy="79" r="1"/>`), 2],
    ["shoes", "Pair of shoes", S("0 0 100 44", `
      <path d="M4 34c0-14 6-22 12-22 8 0 8 10 18 14 8 3 12 6 10 12H6z" fill="#14120c" ${ink}/><path d="M16 15l6 8M20 13l6 8" stroke="#a79f8a" stroke-width="1.6"/>
      <path d="M54 34c0-14 6-22 12-22 8 0 8 10 18 14 8 3 12 6 10 12H56z" fill="#17150e" ${ink}/><path d="M66 15l6 8M70 13l6 8" stroke="#a79f8a" stroke-width="1.6"/>
      <path d="M6 38h38M56 38h38" stroke="#000" stroke-width="3"/>`), 2],
    ["bricked-door", "Bricked-up door", S("0 0 70 140", `
      <rect x="2" y="2" width="66" height="136" fill="#1a1d20" ${ink}/><rect x="8" y="10" width="54" height="128" fill="url(#bricks)"/>
      <path d="M8 10h54M8 10v128M62 10v128" stroke="#0a0c0e" stroke-width="4"/><path d="M18 64c6 6 16 6 22-2M24 90l14-6" stroke="#0a0c0e" stroke-width="2" fill="none"/>
      <rect x="20" y="20" width="30" height="9" fill="#8d7433" stroke="#231a08"/><path d="M23 24h24" stroke="#2b2109" stroke-width="2"/>`), 2],
    ["candles", "Candle stubs", `<svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <g class="candles"><circle cx="44" cy="44" r="58" fill="url(#candle)"/><g fill="#f4d98a"><path d="M26 48c-4-7 0-12 0-17 3 6 5 11 0 17zM50 38c-4-8 0-14 0-20 3 7 6 13 0 20zM68 54c-3-6 0-10 0-14 3 5 4 9 0 14z"/></g></g>
      <g fill="#c9c2a8" stroke="#3b3323"><rect x="20" y="48" width="12" height="28"/><rect x="44" y="38" width="13" height="40"/><rect x="62" y="54" width="11" height="22"/></g>
      <path d="M14 78c20 6 50 6 64 0-2-6-12-6-14-2-10 2-30 2-36 0-4-4-12-2-14 2z" fill="#a79f8a" stroke="#3b3323"/></svg>`, 2],
["vampire", "Vampire in a coffin", `<svg viewBox="-16 -22 150 232" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <path d="M40 -18L88 14 75 206H5L-8 14z" fill="#24140c" stroke="#070504" stroke-width="3"/><path d="M40 -10L80 17 68 200H12L0 17z" fill="#3c0a0c"/>
      <g stroke="#250608" stroke-width="1.4">${[20, 46, 72, 98, 124, 150, 176].map((y) => `<path d="M${6 + y * .03} ${y}L${74 - y * .03} ${y}"/>`).join("")}<path d="M40 -10V200M22 2l-6 196M58 2l6 196"/></g>
      <g class="v-lid" transform="rotate(9 128 206)"><path d="M104 -10L144 16 133 206H75L64 16z" fill="#2e1a10" stroke="#070504" stroke-width="3"/><path d="M104 22v78M88 46h32" stroke="#160c06" stroke-width="6"/><path d="M104 0L136 21 127 196H81L72 21z" fill="none" stroke="#1a0f08" stroke-width="2"/></g>
      <ellipse cx="40" cy="196" rx="30" ry="5" fill="#000" opacity=".6"/>
      <path d="M40 40c-14 2-22 10-26 22L4 196h72L66 62c-4-12-12-20-26-22z" fill="#060506"/>
      <path d="M14 62C10 44 14 26 22 18l8 22zM66 62c4-18 0-36-8-44l-8 22z" fill="#1a0507" stroke="#050304" stroke-width="1.2"/>
      <path d="M22 18l8 22-10 2zM58 18l-8 22 10 2z" fill="#4a0c10"/>
      <path d="M40 6c-9 0-14 8-14 20 0 10 3 20 7 25 2 3 5 4 7 4s5-1 7-4c4-5 7-15 7-25 0-12-5-20-14-20z" fill="url(#vflesh)"/>
      <path d="M26 20c4-10 24-10 28 0-6-4-22-4-28 0z" fill="#050304"/><path d="M40 6c-2 4-3 8-3 12M40 6c2 4 3 8 3 12" stroke="#050304" stroke-width="2"/>
      <path d="M31 25c2-2 6-2 7 1-2 2-5 2-7-1zM42 26c1-3 5-3 7-1-2 3-5 3-7 1z" fill="#050304"/>
      <circle class="v-eye" cx="34.5" cy="25.6" r="1.6" fill="#ff3b2a"/><circle class="v-eye" cx="45.5" cy="25.6" r="1.6" fill="#ff3b2a"/>
      <path d="M35 42c3 2 7 2 10 0l-1 3c-2 1-6 1-8 0z" fill="#1c0403"/><path d="M36.5 42.6l1 3.2 1-3M43.5 42.6l-1 3.2-1-3" fill="#e8e2cf"/>
      <path d="M44 46c0 6 1 10 2 10s1-4 0-10z" fill="#6e0d08"/>
      <g fill="none" stroke="#8d8874" stroke-width="1.6" stroke-linecap="round"><path d="M10 112c-2 8-6 14-8 22M10 112c0 8-2 16-2 24M10 112c2 8 2 16 4 22M10 112c4 6 6 12 8 18"/><path d="M70 112c2 8 6 14 8 22M70 112c0 8 2 16 2 24M70 112c-2 8-2 16-4 22M70 112c-4 6-6 12-8 18"/></g>
      <path d="M12 104c-4 4-4 8-2 10M68 104c4 4 4 8 2 10" stroke="#8d8874" stroke-width="5" stroke-linecap="round"/>
      <rect x="0" y="0" width="80" height="200" fill="url(#vshade)" pointer-events="none"/>
      <path d="M-8 14L5 206H75L88 14" fill="none" stroke="#070504" stroke-width="5"/>
    </svg>`, 2],
    ["keypad", "Keypad", S("0 0 60 84", `
      <rect x="2" y="2" width="56" height="80" rx="3" fill="#2a2820" ${ink}/><rect x="9" y="8" width="42" height="14" fill="#2c0c09" stroke="#090806"/><circle class="led" cx="46" cy="15" r="2.5"/>
      <g fill="#6f6a57" stroke="#090806">${[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<rect x="${10 + c * 14}" y="${28 + r * 16}" width="11" height="12"/>`)).join("")}</g>`), 2],
    ["lift-panel", "Lift buttons", S("0 0 60 170", `
      <rect x="2" y="2" width="56" height="166" rx="3" fill="#3a3019" ${ink}/><rect x="8" y="8" width="44" height="154" fill="#231d0f" stroke="#090806"/>
      <rect x="14" y="12" width="32" height="12" fill="#090806" stroke="#6f5a30"/><circle class="lift-lamp" cx="30" cy="18" r="3.500" fill="#3a1511"/>
      <g fill="#c7a650" stroke="#231a08" stroke-width="1.2">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((r) => [0, 1].map((c) => `<circle cx="${21 + c * 18}" cy="${34 + r * 12}" r="4"/>`)).join("")}</g>
      <path d="M12 164l10-5M40 160l14 4" stroke="#6b3e20" stroke-width="2"/>`), 3],
    ["zombie", "Zombie in the lift", `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <rect class="z-back" x="2" y="2" width="116" height="186" fill="#020202" opacity=".7"/>
      <g class="zsway">
      <g class="zbody">
        <path d="M6 190c0-40 4-70 22-86 10-8 20-12 32-12s22 4 32 12c18 16 22 46 22 86z" fill="#151711"/>
        <path d="M30 104c8 10 18 16 30 16s22-6 30-16l-4 86H34z" fill="#2c2a22"/>
        <path d="M44 120l8 14-10 8 6 12M84 112l-6 16 10 10-4 18M60 150l-4 40" stroke="#0e0d0a" stroke-width="2.4" fill="none"/>
        <g stroke="#3d4334" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M50 128c6 3 14 3 20 0M48 138c8 4 16 4 24 0M48 148c8 4 16 4 24 0"/></g>
        <path d="M36 106c-3 14-2 26 2 34M86 104c4 12 4 26 0 36" stroke="#5a120d" stroke-width="1.6" fill="none" opacity=".8"/>
        <rect x="70" y="160" width="14" height="10" fill="#8f8664" stroke="#090806" transform="rotate(8 77 165)"/>
        <path d="M51 84c0 12 3 20 9 22 6-2 9-10 9-22z" fill="#2b3024"/><path d="M55 90l3 12M66 88l-2 14" stroke="#161a12" stroke-width="1.2"/>
      </g>
      <g class="zhead">
        <path d="M38 34c0-22 9-32 22-32s22 10 22 32c0 18-4 30-9 40-4 6-9 8-13 8s-9-2-13-8c-5-10-9-22-9-40z" fill="url(#zskin)"/>
        <path d="M40 46c4 10 4 20 2 26M80 46c-4 10-4 20-2 26" stroke="#141710" stroke-width="3" fill="none" opacity=".8"/>
        <ellipse cx="47" cy="22" rx="7" ry="5" fill="#1d2218" opacity=".85"/><ellipse cx="76" cy="58" rx="4" ry="7" fill="#3a1410" opacity=".7"/>
        <path d="M40 18c-2 12-4 22-2 34M84 18c2 12 4 22 2 34M48 6c-2 10-8 16-10 24M72 6c2 10 8 16 10 24M60 2c-1 8-4 12-8 16M64 3c2 8 6 10 10 14" stroke="#0a0907" stroke-width="1.5" fill="none"/>
        <path d="M44 36c3-6 12-6 15 0-3 7-12 7-15 0zM62 36c3-6 12-6 15 0-3 7-12 7-15 0z" fill="#050504"/>
        <ellipse class="z-eye" cx="51.5" cy="36" rx="5" ry="3.6" fill="#c9cbbd"/><ellipse class="z-eye" cx="69.5" cy="36" rx="5" ry="3.6" fill="#c9cbbd"/>
        <circle cx="51.5" cy="36" r="2.2" fill="#9ea294" opacity=".7"/><circle cx="69.5" cy="36" r="2.2" fill="#9ea294" opacity=".7"/>
        <path d="M47 35l3 1M74 34l-3 2" stroke="#7a1b14" stroke-width=".6"/>
        <path d="M57 44l-2 7h3zM63 44l2 7h-3z" fill="#050504"/>
        <path d="M48 56c4-2 20-2 24 0l-1 4c-6-1-16-1-22 0z" fill="#0c0201"/>
        <path d="M49 57l1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3" fill="#b3a986" stroke="#4a4232" stroke-width=".4"/>
        <g class="zjaw">
          <path d="M46 62c2 18 6 30 14 32 8-2 12-14 14-32-6 4-22 4-28 0z" fill="#0a0201"/>
          <path d="M46 62c2 18 6 30 14 32 8-2 12-14 14-32l3 4c-2 20-8 32-17 34-9-2-15-14-17-34z" fill="url(#zskin)"/>
          <path d="M50 80l1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3 1.6-3 1.6 3" fill="#b3a986" stroke="#4a4232" stroke-width=".4"/>
          <path d="M57 94c-1 10 0 18 1 22M63 93c0 8 1 12 0 16" stroke="#6e0d08" stroke-width="1.6" fill="none"/>
        </g>
      </g>
      <g class="zarms">
        <path d="M92 102l16 20 12 26" fill="none" stroke="#151711" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M93 103l15 19 11 25" fill="none" stroke="#454b3c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
        <circle cx="108" cy="122" r="4.4" fill="#262a20"/><path d="M100 110l2 4M114 134l2 4" stroke="#5a120d" stroke-width="1.8"/>
        <path d="M116 144c5-3 11 0 12 6 1 5-3 9-8 10-5 0-8-4-8-8 0-4 1-6 4-8z" fill="#2b3024"/>
        <g fill="none" stroke="#2b3024" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M127 146l9-6 7 3 4 6"/><path d="M129 152l11 0 6 6 1 6"/><path d="M127 158l7 8 0 8"/><path d="M120 161l2 10-3 7"/><path d="M113 155l-7 6-1 7"/></g>
        <g fill="#0b0906"><circle cx="147" cy="149" r="1.2"/><circle cx="147" cy="164" r="1.2"/><circle cx="134" cy="174" r="1.2"/><circle cx="119" cy="178" r="1.2"/><circle cx="105" cy="168" r="1.2"/></g>
      </g>
      </g>
      <rect x="0" y="0" width="120" height="190" fill="url(#zdark)" pointer-events="none"/>
      <rect class="z-under" x="0" y="0" width="120" height="190" fill="url(#zunder)" pointer-events="none"/>
    </svg>`, 3],
    ["gate", "Lift gate", `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" style="overflow:visible"><g class="rattle">
      <g class="folds">
        <g stroke="#7a6530" stroke-width="3" fill="none"><path d="M3 2H117V188H3z"/>${[3, 17, 31, 45, 59, 73, 87, 101, 117].map((x) => `<path d="M${x} 2v186"/>`).join("")}</g>
        <g stroke="#57461f" stroke-width="2.2">${[3, 31, 59, 87].map((x) => `<path d="M${x} 20l28 40M${x + 28} 20l-28 40M${x} 76l28 40M${x + 28} 76l-28 40M${x} 132l28 40M${x + 28} 132l-28 40"/>`).join("")}</g>
        <rect x="104" y="86" width="13" height="18" fill="#c7a650" stroke="#231a08"/>
      </g>
      <g class="zreach-out" pointer-events="none">
        <path d="M44 92c-14 10-28 28-38 52-6 14-12 24-20 32" fill="none" stroke="#151711" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M44 92c-14 10-28 28-38 52-6 14-12 24-20 32" fill="none" stroke="#4b5240" stroke-width="3.4" stroke-linecap="round" opacity=".75"/>
        <path d="M18 120l-3 4M2 152l-3 4" stroke="#5a120d" stroke-width="2"/>
        <path d="M-18 172c-6 0-10 6-8 12 2 5 8 6 12 3 4-3 5-9 2-13z" fill="#2b3024"/>
        <g class="zclaw" fill="none" stroke="#2b3024" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M-24 180l-12 4-6 8"/><path d="M-22 186l-12 10-2 10"/><path d="M-16 188l-6 12 2 10"/><path d="M-10 186l2 12 6 6"/><path d="M-26 174l-10-4-8 2"/></g>
        <g fill="#0b0906"><circle cx="-42" cy="192" r="1.3"/><circle cx="-36" cy="206" r="1.3"/><circle cx="-20" cy="210" r="1.3"/><circle cx="-4" cy="204" r="1.3"/><circle cx="-44" cy="172" r="1.3"/></g>
      </g>
    </g></svg>`, 3],
    ["lift", "Lift (out of order)", S("0 0 120 44", `
      <path d="M30 0l-8 12M90 0l8 12" stroke="#2c2813" stroke-width="2"/>
      <g transform="rotate(-4 60 26)"><rect x="8" y="10" width="104" height="30" fill="#a89c7c" stroke="#120e08" stroke-width="2"/><rect x="12" y="14" width="96" height="22" fill="none" stroke="#8c1a15" stroke-width="1.5"/>
      <text x="60" y="31" font-family="monospace" font-size="15" font-weight="bold" text-anchor="middle" fill="#8c1a15">OUT OF ORDER</text>
      <path d="M90 12c4 6 2 14 6 20M20 14c-2 6 2 12 0 18" stroke="#5a4a2a" stroke-width="1" fill="none" opacity=".6"/></g>`), 3],
    ["hatch", "Roof hatch", S("0 0 140 70", `
      <path d="M10 8h120l-14 52H24z" fill="#1a1810" ${ink}/><path d="M20 14h100l-11 40H31z" fill="#2d2b21" stroke="#090806" stroke-width="2"/>
      <path d="M28 20h84M26 30h88M24 40h92" stroke="#15130c" stroke-width="2"/><rect x="62" y="44" width="16" height="6" fill="#6f5a30" stroke="#090806"/>
      <path d="M118 56c6 6 4 12 10 14" stroke="#0a0805" stroke-width="2" fill="none"/><path d="M30 56l-6 12M34 58l2 10" stroke="#3b3323" stroke-width="1.5"/>`), 3],
    ["lift-breaker", "Breaker box", S("0 0 70 100", `
      <rect x="2" y="2" width="66" height="96" rx="2" fill="#2f312b" ${ink}/><rect x="9" y="10" width="52" height="40" fill="#141510" stroke="#090806"/>
      <rect x="28" y="16" width="14" height="28" fill="#090806" stroke="#4a4a40"/><rect class="fuse-in" x="30" y="19" width="10" height="22" rx="2" fill="#c7a650" stroke="#231a08"/>
      <circle class="power-led" cx="20" cy="64" r="4.5" fill="#3a0d0a" stroke="#090806"/><text x="30" y="67" font-family="monospace" font-size="7" fill="#8a8574">POWER</text>
      <path d="M12 78h46M12 86h30" stroke="#4a4a40" stroke-width="2"/><path d="M60 4c-6 10-2 20-8 30" stroke="#6b3e20" stroke-width="2" fill="none"/>`), 3],
    ["vent", "Vent with a fan", `<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <defs><radialGradient id="daylight"><stop offset="0" stop-color="#f4ead0" stop-opacity=".9"/><stop offset="1" stop-color="#f4ead0" stop-opacity="0"/></radialGradient></defs>
      <rect x="2" y="2" width="106" height="106" fill="#0c0c09" stroke="#090806" stroke-width="2"/>
      <circle class="daylight" cx="55" cy="55" r="46" fill="url(#daylight)"/>
      <g class="fan"><circle cx="55" cy="55" r="7" fill="#3a3a32"/>${[0, 72, 144, 216, 288].map((a) => `<path d="M55 55c4-14 18-26 34-28-4 12-16 24-34 28z" fill="#2c2c26" stroke="#0a0a08" transform="rotate(${a} 55 55)"/>`).join("")}</g>
      <g class="vent-cover"><rect x="4" y="4" width="102" height="102" fill="none" stroke="#55534a" stroke-width="6"/>
        ${[18, 30, 42, 54, 66, 78, 90].map((y) => `<path d="M8 ${y}h94" stroke="#4a4840" stroke-width="5"/><path d="M8 ${y + 2.5}h94" stroke="#141410" stroke-width="1.5"/>`).join("")}
        ${[[10, 10], [100, 10], [10, 100], [100, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#7a7466" stroke="#090806"/>`).join("")}
        <rect x="44" y="94" width="22" height="10" rx="2" fill="#6f5a30" stroke="#090806"/></g>
      <path class="draft" d="M30 50c10-6 20 6 30 0s20 6 30 0M26 64c10-6 22 6 32 0s20 6 32 0" stroke="#d8d0ba" stroke-width="1.2" fill="none" opacity=".35"/>
    </svg>`, 3],
    ["indicator", "Floor dial", S("0 0 150 80", `
      <path d="M4 76a71 71 0 0 1 142 0z" fill="#3a3019" ${ink}/><path d="M16 76a59 59 0 0 1 118 0z" fill="#a89c7c" stroke="#231a08" stroke-width="2"/>
      <g stroke="#231a08" stroke-width="2"><path d="M26 66l8 3M38 44l7 6M58 27l4 8M92 27l-4 8M112 44l-7 6M124 66l-8 3"/></g>
      <g font-family="monospace" font-size="9" font-weight="bold" fill="#17140d" text-anchor="middle"><text x="42" y="68">G</text><text x="52" y="52">4</text><text x="68" y="44">8</text><text x="84" y="44">12</text><text x="99" y="52">16</text><text x="109" y="68">20</text></g>
      <path class="needle" d="M75 74L88 34" stroke="#8c1a15" stroke-width="3" stroke-linecap="round"/><circle cx="75" cy="74" r="5" fill="#120e0a"/>`), 3],
    ["emergency-phone", "Emergency phone", S("0 0 80 110", `
      <rect x="2" y="2" width="76" height="106" rx="3" fill="#6e0d08" ${ink}/><rect x="10" y="10" width="60" height="16" fill="#a89c7c" stroke="#090806"/><text x="40" y="22" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle" fill="#17140d">NIGHT DESK</text>
      <rect x="10" y="32" width="60" height="68" fill="#2c0504" stroke="#090806"/><path d="M28 40c-8 0-8 6-8 22s0 22 8 22c4 0 5-3 5-7 0-4-2-7-6-7-1-5-1-11 0-16 4 0 6-3 6-7 0-4-1-7-5-7z" fill="#0a0806" stroke="#000"/>
      <path d="M26 84c8 8 22 8 26-2s-4-22 4-32" fill="none" stroke="#0a0806" stroke-width="2"/><g fill="#a79f8a">${[0, 1, 2].flatMap((r) => [0, 1].map((c) => `<circle cx="${50 + c * 10}" cy="${44 + r * 10}" r="2.500"/>`)).join("")}</g>`), 3],
    ["graffiti", "Words scratched into the wall", `<svg viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="110" fill="#000" fill-opacity=".01"/><g font-family="Special Elite, monospace" fill="#c9c2a8" opacity=".85"><text x="6" y="26" font-size="24">THE DOOR</text><text x="6" y="52" font-size="24">OPENS</text><text x="6" y="78" font-size="24">FOR ONE</text></g>
      <text x="44" y="104" font-family="Special Elite, monospace" font-size="20" fill="#8c1a15" transform="rotate(-3 44 104)">UNLESS</text></svg>`, 3],
  ];
  const room = document.getElementById("room");
  const rays = (pts, col, w) => pts.map(([x, y]) => `<path d="M800 470L${x} ${y}" stroke="${col}" stroke-width="${w}"/>`).join("");
  const range = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
  const blob = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#blob)"/>`;
  const drip = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#drip)"/>`;

  // Level 2 set dressing: open doors, a chandelier, portraits, chains, clutter, fog and a shadow at the far end
  const corridor = (() => {
    const top = (x) => 420 * x / 730, bottom = (x) => 1000 - 480 * x / 730, doorTop = (x) => top(x) + (bottom(x) - top(x)) * .22;
    const door = ([a, b], side, num, hand) => {
      const X = (x) => (side === "R" ? 1600 - x : x), leafB = a + (b - a) * .62;
      const frame = `M${X(a)} ${doorTop(a)}L${X(b)} ${doorTop(b)}V${bottom(b)}L${X(a)} ${bottom(a)}z`;
      const leaf = `M${X(a)} ${doorTop(a)}L${X(leafB)} ${doorTop(leafB) + 6}V${bottom(leafB) - 4}L${X(a)} ${bottom(a)}z`;
      const mx = X(a + (b - a) * .3), my = doorTop(a) + (bottom(a) - doorTop(a)) * .14, k = (b - a) / 110;
      return `<path d="${frame}" fill="#010101" stroke="#0a0c0e" stroke-width="7"/>
        <path d="${leaf}" fill="#30373b" stroke="#0a0c0e" stroke-width="3"/>
        <path d="M${X(a + (b - a) * .1)} ${doorTop(a) + 40}l${(side === "R" ? -1 : 1) * 10 * k} 30 ${(side === "R" ? 1 : -1) * 4 * k} 50M${X(a + (b - a) * .4)} ${bottom(a) - 120}l${(side === "R" ? -1 : 1) * 8 * k} 40" stroke="#4d565a" stroke-width="${3 * k}" fill="none" opacity=".7"/>
        <g transform="translate(${mx} ${my}) skewY(${side === "R" ? -24 : 24}) scale(${k})"><rect x="-18" y="-10" width="36" height="16" fill="#8d7433" stroke="#231a08"/><text x="0" y="3" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#231a08">${num}</text></g>
        ${hand ? `<g transform="translate(${X(a + (b - a) * .35)} ${doorTop(a) + (bottom(a) - doorTop(a)) * .45}) skewY(${side === "R" ? -20 : 20}) scale(${k * 1.3})" fill="#7a0e09" opacity=".85"><path d="M-10 8c-2-8 0-14 6-16l2-18c0-3 4-3 4 0l1 14 2-20c0-3 4-3 4 0l0 20 3-17c1-3 5-2 4 1l-2 19 4-10c1-3 5-2 4 1l-5 18c-2 10-8 14-16 12-5-1-7-2-11-4z"/><path d="M-4 16c0 14 1 24 2 30M6 18c0 10 1 16 2 22" stroke="#7a0e09" stroke-width="2.4"/></g>` : ""}`;
    };
    const portrait = (x, y, w, h, skew) => `<g transform="translate(${x} ${y}) skewY(${skew})">
      <rect x="-6" y="-6" width="${w + 12}" height="${h + 12}" fill="#3a2614" stroke="#120b06" stroke-width="3"/><rect width="${w}" height="${h}" fill="#1a1712"/>
      <path d="M${w * .2} ${h}c0-${h * .3} ${w * .1}-${h * .42} ${w * .3}-${h * .46}c${w * .2} ${h * .04} ${w * .3} ${h * .16} ${w * .3} ${h * .46}z" fill="#0d0c09"/>
      <ellipse cx="${w * .5}" cy="${h * .36}" rx="${w * .2}" ry="${h * .22}" fill="#5f594a"/><ellipse cx="${w * .5}" cy="${h * .3}" rx="${w * .22}" ry="${h * .12}" fill="#1a1712" opacity=".8"/>
      <g class="eyes-follow"><ellipse cx="${w * .42}" cy="${h * .36}" rx="${w * .055}" ry="${h * .03}" fill="#d8d2bd"/><ellipse cx="${w * .58}" cy="${h * .36}" rx="${w * .055}" ry="${h * .03}" fill="#d8d2bd"/>
      <g class="pupils"><circle cx="${w * .42}" cy="${h * .36}" r="${w * .025}" fill="#050403"/><circle cx="${w * .58}" cy="${h * .36}" r="${w * .025}" fill="#050403"/></g></g>
      <path d="M${w * .44} ${h * .5}h${w * .12}" stroke="#2a0806" stroke-width="2"/><path d="M${w * .7} 0l-${w * .2} ${h * .4}" stroke="#0a0805" stroke-width="2"/></g>`;
    const candle = (x, y) => `<rect x="${x - 4}" y="${y - 26}" width="8" height="26" fill="url(#wax)"/><g transform="translate(${x} ${y - 28})"><g class="flame"><circle r="34" fill="url(#candle)"/><path d="M0 -14c-3 5-4 8-4 11 0 3 2 5 4 5s4-2 4-5c0-3-1-6-4-11z" fill="#f6c45a"/></g></g>`;
    return `
    <g class="far-fade"><path d="M640 470L960 470 1060 600H540z" fill="url(#farfade)"/></g>
    <g clip-path="url(#farEnd)"><g class="far-shadow"><path d="M700 520c0-30 4-46 10-52 2-6 2-14 8-14s6 8 8 14c6 6 10 22 10 52z" fill="#000"/></g></g>
    ${[[700, 512, .3, -4], [748, 508, .26, 3], [902, 510, .28, 5], [430, 642, .62, 7], [1188, 640, .6, -6], [338, 700, .5, -11]].map(([x, y, k, lean]) => `<g transform="translate(${x} ${y}) rotate(${lean}) scale(${k})" opacity="${.45 + k * .6}">
      <path d="M0 -190L56 -152 42 0H-42L-56 -152z" fill="#1a110b" stroke="#060403" stroke-width="6"/><path d="M0 -176L44 -146 32 -10H-32L-44 -146z" fill="none" stroke="#2c1d12" stroke-width="4"/>
      <path d="M0 -150v84M-20 -124h40" stroke="#3a281a" stroke-width="7"/></g>`).join("")}
    ${door([255, 335], "L", "1408")}${door([560, 605], "L", "1413")}${door([430, 490], "R", "1411", true)}${door([650, 682], "R", "1416")}
    ${portrait(186, 270, 52, 70, 6)}${portrait(1186, 330, 58, 78, -8)}
    <path d="M1600 70L880 336" stroke="#1a1d1e" stroke-width="18"/><path d="M1600 64L880 330" stroke="#4a5052" stroke-width="3" opacity=".6"/>
    ${[[1360, 162, 0], [1120, 250, 1.3], [960, 309, 2.4]].map(([x, y, d]) => `<path d="M${x - 6} ${y}h12" stroke="#2a2d2e" stroke-width="10"/><circle class="drop" cx="${x}" cy="${y + 8}" r="3.2" fill="#9fb3b8" style="animation-delay:${d}s"/>`).join("")}
    <g class="chains" fill="none" stroke="#2c2c28" stroke-width="5" stroke-dasharray="7 3"><path class="chain chain-a" d="M470 268V420"/><path class="chain chain-b" d="M1130 268V400"/><path d="M465 420a6 6 0 1 0 10 0M1125 400a6 6 0 1 0 10 0"/></g>
    <g class="chandelier"><path d="M800 0V140" stroke="#151510" stroke-width="5" stroke-dasharray="8 3"/>
      <ellipse cx="800" cy="172" rx="80" ry="15" fill="none" stroke="#151510" stroke-width="7"/><path d="M800 140l-60 30M800 140l60 30M800 140l-22 32M800 140l22 32" stroke="#151510" stroke-width="3"/>
      ${[-72, -36, 0, 36, 72].map((dx) => `<path d="M${800 + dx} ${172 + (Math.abs(dx) > 50 ? -6 : 10)}v-6" stroke="#151510" stroke-width="5"/>${candle(800 + dx, 172 + (Math.abs(dx) > 50 ? -12 : 4))}`).join("")}
      <path d="M760 182c0 10 1 16 2 22M840 182c0 8 1 12 0 18" stroke="#e8dfc0" stroke-width="2" fill="none"/>
      <g class="chandelier-bat" transform="translate(800 186)">
        <path d="M-6 0v10M6 0v10" stroke="#0a0806" stroke-width="4" stroke-linecap="round"/>
        <g class="cbat-wings">
          <path d="M-14 12c-16 44-70 52-110 32 16-10 22-22 22-34-12 6-28 6-40 0 28-12 64-22 98-18zM14 12c16 44 70 52 110 32-16-10-22-22-22-34 12 6 28 6 40 0-28-12-64-22-98-18z" fill="#120d0a" stroke="#050403" stroke-width="2"/>
          <path d="M-26 20c-22 18-48 22-76 22M-20 16c-16 12-36 16-58 16M26 20c22 18 48 22 76 22M20 16c16 12 36 16 58 16" stroke="#2c2018" stroke-width="2" fill="none"/>
        </g>
        <path d="M-18 8c-4 46 6 82 18 92 12-10 22-46 18-92z" fill="#1b1410" stroke="#050403" stroke-width="2"/>
        <path d="M-6 24c0 20 2 40 6 56M6 24c0 20-2 40-6 56" stroke="#2c2018" stroke-width="1.4" fill="none"/>
        <g transform="translate(0 104)">
          <path d="M-14 6l-10 24 15-12zM14 6l10 24-15-12z" fill="#1b1410" stroke="#050403" stroke-width="1.5"/>
          <ellipse cx="0" cy="2" rx="17" ry="14" fill="#1b1410"/>
          <circle class="cbat-eye" cx="-6.5" cy="5" r="3.8" fill="#ff3a26"/><circle class="cbat-eye" cx="6.5" cy="5" r="3.8" fill="#ff3a26"/>
          <path d="M-4 -8l1.5 -6 1.5 5M4 -8l-1.5 -6-1.5 5" fill="#efe9d6"/>
        </g>
      </g></g>
    <g transform="translate(372 336) skewY(-4)" font-family="Special Elite, monospace" fill="#6a0c08"><text font-size="34" opacity=".9">ONLY ONE LEAVES</text>
      <path d="M14 6c0 18 2 30 2 40M70 6c0 12 1 20 1 26M150 8c0 22 2 34 1 46M222 6c0 14 2 22 1 30" stroke="#6a0c08" stroke-width="3"/></g>
    <g stroke="#0c0e0f" stroke-width="3" fill="none"><path d="M1268 520l18 50M1280 516l18 52M1292 520l14 44"/></g>
    <ellipse class="puddle" cx="640" cy="705" rx="70" ry="10" fill="url(#puddle)"/><ellipse class="puddle" cx="990" cy="770" rx="90" ry="12" fill="url(#puddle)"/>
    <g transform="translate(520 560)"><path d="M0 22h130l10-6H10z" fill="#4f5355" stroke="#0a0c0e" stroke-width="2"/><path d="M8 22v22M128 22v22M20 44h12M118 44h12" stroke="#2c3033" stroke-width="4"/><path d="M14 16c20-8 60-10 100-6l12 6" fill="#8f897a" stroke="#0a0c0e" stroke-width="2"/><path d="M60 12c6 4 14 4 20 0" stroke="#5a120d" stroke-width="3" fill="none"/><circle cx="14" cy="48" r="5" fill="#0a0c0e"/><circle cx="124" cy="48" r="5" fill="#0a0c0e"/></g>
    <g transform="translate(905 600) rotate(-78)"><circle cx="0" cy="0" r="28" fill="none" stroke="#3a3f42" stroke-width="5"/><path d="M-28 0h56M0 -28v56M-20 -20l40 40M20 -20l-40 40" stroke="#2c3033" stroke-width="2"/><path d="M-6 -30l-10 -40h44l6 40" fill="#3e2e2a" stroke="#0a0c0e" stroke-width="2"/><path d="M-16 -70l-6 -30" stroke="#3a3f42" stroke-width="5"/><circle cx="40" cy="-6" r="8" fill="none" stroke="#3a3f42" stroke-width="4"/></g>
    ${[[690, 640, -12], [740, 670, 18], [600, 760, 6], [1040, 690, -24], [860, 800, 30], [430, 700, 14]].map(([x, y, a]) => `<path d="M${x} ${y}l26 -4 4 18 -26 4z" fill="#8f8664" stroke="#2c271c" stroke-width="1" transform="rotate(${a} ${x} ${y})"/>`).join("")}
    <g transform="translate(700 632) rotate(-8) skewX(-20)"><rect width="46" height="34" fill="#3a2614" stroke="#120b06" stroke-width="3"/><rect x="5" y="5" width="36" height="24" fill="#4a4a44"/><path d="M5 5l36 24M30 5l-12 24" stroke="#c9c2a8" stroke-width="1" opacity=".5"/></g>
    <g class="fog"><ellipse class="fog-a" cx="500" cy="860" rx="520" ry="70" fill="url(#fog)"/><ellipse class="fog-b" cx="1150" cy="900" rx="560" ry="80" fill="url(#fog)"/><ellipse class="fog-a" cx="800" cy="640" rx="380" ry="40" fill="url(#fog)" opacity=".6"/></g>`;
  })();
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
    <radialGradient id="zskin" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#6a6f5c"/><stop offset=".55" stop-color="#3a3f33"/><stop offset="1" stop-color="#121410"/></radialGradient>
    <linearGradient id="zdark" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient>
    <linearGradient id="farfade" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".9"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <radialGradient id="puddle"><stop offset="0" stop-color="#9fb3b8" stop-opacity=".35"/><stop offset=".7" stop-color="#3a4448" stop-opacity=".5"/><stop offset="1" stop-color="#14181a" stop-opacity="0"/></radialGradient>
    <radialGradient id="fog"><stop offset="0" stop-color="#b8c4c8" stop-opacity=".14"/><stop offset="1" stop-color="#b8c4c8" stop-opacity="0"/></radialGradient>
    <clipPath id="farEnd"><rect x="730" y="420" width="140" height="100"/></clipPath>
    <radialGradient id="vflesh" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#d4cfc0"/><stop offset=".6" stop-color="#8a8576"/><stop offset="1" stop-color="#1c1a16"/></radialGradient>
    <linearGradient id="vshade" x1="1" x2="0"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset=".55" stop-color="#000" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
    <radialGradient id="zunder" cx=".5" cy="1" r=".62"><stop offset="0" stop-color="#c0281a" stop-opacity=".42"/><stop offset="1" stop-color="#9a1a10" stop-opacity="0"/></radialGradient>
    <radialGradient id="roachShell" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#8a4f1e"/><stop offset=".55" stop-color="#5a2f10"/><stop offset="1" stop-color="#230f04"/></radialGradient>
    <linearGradient id="wax"><stop offset="0" stop-color="#b5ab8a"/><stop offset=".45" stop-color="#e6dcbc"/><stop offset="1" stop-color="#8f8668"/></linearGradient>
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
      ${rays(range(0, 1600, 11).map((x) => [x, 0]), "#3e3a24", 3)}
      ${[50, 120, 180].map((y) => { const k = (470 - y) / 470; return `<path d="M${800 - 800 * k} ${y}H${800 + 800 * k}" stroke="#3e3a24" stroke-width="3"/>`; }).join("")}
      ${rays(range(0, 1000, 15).map((y) => [0, y]), "#00000020", 2)}${rays(range(0, 1000, 15).map((y) => [1600, y]), "#00000020", 2)}
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
    <g transform="translate(1240 590) skewY(-20)" stroke="#201a0d" stroke-width="5">${range(0, 60, 5).map((x, i) => `<path d="M${x} 0v52"/>`).join("")}<path d="M-6 44L68 8"/><g transform="translate(92 0)">${range(0, 60, 5).map((x) => `<path d="M${x} 0v52"/>`).join("")}<path d="M-6 44L68 8"/></g></g>
    <text transform="translate(1142 496) skewY(-11)" font-family="Special Elite, monospace" font-size="44" fill="#5a120d" opacity=".9">YOU WERE HERE</text>
    <path transform="translate(-300 -20) skewY(14)" d="M612 500c-6 50 2 110-6 176M636 490c-4 60 4 120-3 200M660 494c-5 56 3 104-4 170M682 506c-3 42 2 86-3 132" fill="none" stroke="#4a0e0a" stroke-width="9" stroke-linecap="round" opacity=".7"/>
    <g><rect x="965" y="320" width="110" height="380" fill="#090704" stroke="#2c2813" stroke-width="8"/><rect x="985" y="370" width="70" height="285" fill="#3d3819"/><rect x="1001" y="410" width="38" height="200" fill="#6f6735"/><path d="M965 700L985 655H1055L1075 700z" fill="#1c190c"/>
      <g class="figure"><g class="dz-body">
        <path d="M1003 700c-2-40 0-90 6-120 4-16 12-24 22-24s18 8 22 24c6 30 8 80 6 120z" fill="#0b0c09"/>
        <path d="M1014 580l8 30-8 40M1048 584l-6 34 8 32" stroke="#1e211a" stroke-width="2" fill="none"/>
        <g class="dz-head"><path d="M1018 520c0-14 6-22 14-22s14 8 14 22c0 12-4 22-8 28-2 3-4 4-6 4s-4-1-6-4c-4-6-8-16-8-28z" fill="#3f4636"/>
          <ellipse cx="1026" cy="522" rx="3.6" ry="2.6" fill="#c9cbbd"/><ellipse cx="1038" cy="522" rx="3.6" ry="2.6" fill="#c9cbbd"/>
          <path d="M1025 536c4 2 10 2 14 0l-2 14c-3 2-7 2-10 0z" fill="#0c0201"/><path d="M1020 504c-2 8-4 14-3 20M1044 504c2 8 4 14 3 20" stroke="#0a0907" stroke-width="1.4" fill="none"/></g>
        <g class="dz-hand"><path d="M1050 578c10 6 16 10 22 10" stroke="#2b3024" stroke-width="7" stroke-linecap="round" fill="none"/>
          <g stroke="#3f4636" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M1072 584l6-4M1073 588l7 0M1072 592l6 4M1070 595l3 6M1068 578l4-6"/></g></g>
        <path d="M1010 590c-8 14-10 30-8 44" stroke="#2b3024" stroke-width="7" stroke-linecap="round" fill="none"/>
      </g></g></g>
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
    ${[[50, 165], [255, 335], [430, 490], [560, 605], [650, 682]].map(([a, b]) => {
      const top = (x) => 420 * x / 730, bottom = (x) => 1000 - 480 * x / 730, y = (x) => top(x) + (bottom(x) - top(x)) * .22;
      const door = (mirror) => { const X = (x) => (mirror ? 1600 - x : x); return `<path d="M${X(a)} ${y(a)}L${X(b)} ${y(b)}V${bottom(b)}L${X(a)} ${bottom(a)}z" fill="url(#bricks)" stroke="#0a0c0e" stroke-width="7"/>`; };
      return door(false) + door(true);
    }).join("")}
    <path d="M0 0L730 420M1600 0L870 420M0 1000L730 520M1600 1000L870 520" stroke="#07090a" stroke-width="6"/>
    <rect width="1600" height="1000" filter="url(#mold)" mask="url(#moldmask)" opacity=".8"/>
    ${drip(180, 90, 18, 420)}${drip(420, 220, 14, 300)}${drip(1180, 220, 18, 320)}${drip(1420, 110, 22, 400)}${corridor}
    <g transform="translate(690 830) rotate(-12) scale(1.40)"><g class="roach roach-a">
        <g class="legs" fill="none" stroke="#1f1007" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 -4l5 -7 7 -2M7 4l5 7 7 2"/><path d="M1 -6l1 -9 -3 -6M1 6l1 9 -3 6"/><path d="M-6 -6l-6 -8 -9 -3M-6 6l-6 8 -9 3"/>
        </g>
        <path d="M-17 -1l-6 -3M-17 1l-6 3" stroke="#2a160a" stroke-width="1"/>
        <ellipse cx="-4" cy="0" rx="14" ry="7.5" fill="url(#roachShell)"/>
        <path d="M10 0H-17" stroke="#1a0c04" stroke-width=".9"/>
        <path d="M-15 -3c6 -3 16 -4 22 -2M-15 3c6 3 16 4 22 2" stroke="#9a5a26" stroke-width=".6" fill="none" opacity=".6"/>
        <ellipse cx="9" cy="0" rx="5.5" ry="6.5" fill="#5a3214" stroke="#2a160a" stroke-width=".8"/><ellipse cx="9.5" cy="0" rx="3" ry="3.8" fill="#2a1408"/>
        <ellipse cx="14.5" cy="0" rx="2.6" ry="3" fill="#1f1007"/>
        <ellipse cx="-6" cy="-3" rx="7" ry="1.6" fill="#f4e0b8" opacity=".28"/>
        <g class="antennae" fill="none" stroke="#2a160a" stroke-width=".7"><path d="M16 -1.5q9 -5 21 -15"/><path d="M16 1.5q10 4 23 8"/></g></g></g><g transform="translate(1010 700) rotate(160) scale(0.8)"><g class="roach roach-b">
        <g class="legs" fill="none" stroke="#1f1007" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 -4l5 -7 7 -2M7 4l5 7 7 2"/><path d="M1 -6l1 -9 -3 -6M1 6l1 9 -3 6"/><path d="M-6 -6l-6 -8 -9 -3M-6 6l-6 8 -9 3"/>
        </g>
        <path d="M-17 -1l-6 -3M-17 1l-6 3" stroke="#2a160a" stroke-width="1"/>
        <ellipse cx="-4" cy="0" rx="14" ry="7.5" fill="url(#roachShell)"/>
        <path d="M10 0H-17" stroke="#1a0c04" stroke-width=".9"/>
        <path d="M-15 -3c6 -3 16 -4 22 -2M-15 3c6 3 16 4 22 2" stroke="#9a5a26" stroke-width=".6" fill="none" opacity=".6"/>
        <ellipse cx="9" cy="0" rx="5.5" ry="6.5" fill="#5a3214" stroke="#2a160a" stroke-width=".8"/><ellipse cx="9.5" cy="0" rx="3" ry="3.8" fill="#2a1408"/>
        <ellipse cx="14.5" cy="0" rx="2.6" ry="3" fill="#1f1007"/>
        <ellipse cx="-6" cy="-3" rx="7" ry="1.6" fill="#f4e0b8" opacity=".28"/>
        <g class="antennae" fill="none" stroke="#2a160a" stroke-width=".7"><path d="M16 -1.5q9 -5 21 -15"/><path d="M16 1.5q10 4 23 8"/></g></g></g><g transform="translate(330 640) rotate(-70) scale(0.9)"><g class="roach roach-c">
        <g class="legs" fill="none" stroke="#1f1007" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 -4l5 -7 7 -2M7 4l5 7 7 2"/><path d="M1 -6l1 -9 -3 -6M1 6l1 9 -3 6"/><path d="M-6 -6l-6 -8 -9 -3M-6 6l-6 8 -9 3"/>
        </g>
        <path d="M-17 -1l-6 -3M-17 1l-6 3" stroke="#2a160a" stroke-width="1"/>
        <ellipse cx="-4" cy="0" rx="14" ry="7.5" fill="url(#roachShell)"/>
        <path d="M10 0H-17" stroke="#1a0c04" stroke-width=".9"/>
        <path d="M-15 -3c6 -3 16 -4 22 -2M-15 3c6 3 16 4 22 2" stroke="#9a5a26" stroke-width=".6" fill="none" opacity=".6"/>
        <ellipse cx="9" cy="0" rx="5.5" ry="6.5" fill="#5a3214" stroke="#2a160a" stroke-width=".8"/><ellipse cx="9.5" cy="0" rx="3" ry="3.8" fill="#2a1408"/>
        <ellipse cx="14.5" cy="0" rx="2.6" ry="3" fill="#1f1007"/>
        <ellipse cx="-6" cy="-3" rx="7" ry="1.6" fill="#f4e0b8" opacity=".28"/>
        <g class="antennae" fill="none" stroke="#2a160a" stroke-width=".7"><path d="M16 -1.5q9 -5 21 -15"/><path d="M16 1.5q10 4 23 8"/></g></g></g><g transform="translate(880 905) rotate(20) scale(1.61)"><g class="roach roach-d">
        <g class="legs" fill="none" stroke="#1f1007" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 -4l5 -7 7 -2M7 4l5 7 7 2"/><path d="M1 -6l1 -9 -3 -6M1 6l1 9 -3 6"/><path d="M-6 -6l-6 -8 -9 -3M-6 6l-6 8 -9 3"/>
        </g>
        <path d="M-17 -1l-6 -3M-17 1l-6 3" stroke="#2a160a" stroke-width="1"/>
        <ellipse cx="-4" cy="0" rx="14" ry="7.5" fill="url(#roachShell)"/>
        <path d="M10 0H-17" stroke="#1a0c04" stroke-width=".9"/>
        <path d="M-15 -3c6 -3 16 -4 22 -2M-15 3c6 3 16 4 22 2" stroke="#9a5a26" stroke-width=".6" fill="none" opacity=".6"/>
        <ellipse cx="9" cy="0" rx="5.5" ry="6.5" fill="#5a3214" stroke="#2a160a" stroke-width=".8"/><ellipse cx="9.5" cy="0" rx="3" ry="3.8" fill="#2a1408"/>
        <ellipse cx="14.5" cy="0" rx="2.6" ry="3" fill="#1f1007"/>
        <ellipse cx="-6" cy="-3" rx="7" ry="1.6" fill="#f4e0b8" opacity=".28"/>
        <g class="antennae" fill="none" stroke="#2a160a" stroke-width=".7"><path d="M16 -1.5q9 -5 21 -15"/><path d="M16 1.5q10 4 23 8"/></g></g></g>
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
    <g class="emergency"><rect x="372" y="168" width="26" height="14" fill="#2a0806" stroke="#090806" stroke-width="2"/><circle cx="385" cy="175" r="90" fill="#9a1a10" opacity=".22"/></g>
  </svg><div class="shaft-dark level-view" data-stage="3" aria-hidden="true"></div></div>
  <div class="redlight"></div>
  <svg class="vampire" viewBox="0 0 300 400" aria-hidden="true">
    <path d="M150 96c-50 6-80 34-94 74L20 400h260l-36-230c-14-40-44-68-94-74z" fill="#050405"/>
    <path d="M56 170C40 110 56 50 86 26l28 80zM244 170c16-60 0-120-30-144l-28 80z" fill="#1a0507" stroke="#050304" stroke-width="3"/>
    <path d="M86 26l28 80-36 6zM214 26l-28 80 36 6z" fill="#4a0c10"/>
    <path d="M150 20c-34 0-52 28-52 72 0 34 10 70 26 88 8 10 18 14 26 14s18-4 26-14c16-18 26-54 26-88 0-44-18-72-52-72z" fill="url(#vflesh)"/>
    <path d="M98 70c14-36 90-36 104 0-24-14-80-14-104 0z" fill="#050304"/>
    <path d="M114 92c8-8 24-8 28 4-8 8-22 8-28-4zM158 96c4-12 20-12 28-4-6 12-20 12-28 4z" fill="#050304"/>
    <circle cx="128" cy="94" r="5" fill="#ff3b2a"/><circle cx="172" cy="94" r="5" fill="#ff3b2a"/><circle cx="128" cy="94" r="14" fill="#ff3b2a" opacity=".18"/><circle cx="172" cy="94" r="14" fill="#ff3b2a" opacity=".18"/>
    <path d="M146 112l-6 22 10 3 10-3-6-22z" fill="#1c1a13" opacity=".7"/>
    <path d="M120 150c18 10 42 10 60 0-2 22-12 40-30 44-18-4-28-22-30-44z" fill="#120201"/>
    <path d="M128 152l6 30 6-27zM172 152l-6 30-6-27z" fill="#e8e2cf"/><path d="M142 156l2 8 2-8M154 156l2 8 2-8" fill="#c9c2a8"/>
    <path d="M168 190c1 26 3 46 5 46s4-20 2-46z" fill="#6e0d08"/>
    <g fill="none" stroke="#8d8874" stroke-width="6" stroke-linecap="round"><path d="M40 290l-26-70M40 290l-8-80M40 290l12-78M40 290l30-66M40 290l44-40"/><path d="M260 290l26-70M260 290l8-80M260 290l-12-78M260 290l-30-66M260 290l-44-40"/></g>
    <g fill="#d8d2bd"><circle cx="14" cy="220" r="3"/><circle cx="32" cy="210" r="3"/><circle cx="52" cy="212" r="3"/><circle cx="70" cy="224" r="3"/><circle cx="286" cy="220" r="3"/><circle cx="268" cy="210" r="3"/><circle cx="248" cy="212" r="3"/><circle cx="230" cy="224" r="3"/></g>
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
    const el = document.createElement("button");  // button = keyboard + screen reader for free
    el.id = "obj-" + id;
    el.className = "obj";
    el.dataset.stage = stage;
    el.type = "button";
    el.setAttribute("aria-label", label);
    el.innerHTML = `<span class="art" aria-hidden="true">${art}</span><span class="label">${label}</span>`;
    el.addEventListener("click", () => onObjectClick(id));
    scene.append(el);
  }
  scene.insertAdjacentHTML("beforeend", `<svg class="candelabra level-view" data-stage="2" viewBox="-115 -300 230 320" aria-hidden="true">
    <g>
      <ellipse cx="0" cy="2" rx="60" ry="10" fill="#000" opacity=".6"/>
      <g fill="#14110c" stroke="#050403" stroke-width="1.5">
        <path d="M-46 2c10-4 22-10 30-22l8 4c-8 10-20 16-30 20zM46 2c-10-4-22-10-30-22l-8 4c8 10 20 16 30 20zM-4 -20h8l2 22h-12z"/>
        <ellipse cx="0" cy="-22" rx="16" ry="6"/><path d="M-4 -24v-120h8v120z"/><ellipse cx="0" cy="-70" rx="9" ry="5"/><ellipse cx="0" cy="-120" rx="10" ry="6"/>
        <path d="M-2 -150c-14 0-34-2-52-14-12-8-18-20-24-32" fill="none" stroke="#14110c" stroke-width="7" stroke-linecap="round"/>
        <path d="M2 -150c14 0 34-2 52-14 12-8 18-20 24-32" fill="none" stroke="#14110c" stroke-width="7" stroke-linecap="round"/>
        <path d="M-78 -196c-6 4-10 12-6 18M78 -196c6 4 10 12 6 18" fill="none" stroke="#14110c" stroke-width="3"/>
        <path d="M-92 -198h28l-4 6h-20zM64 -198h28l-4 6h-20z"/><path d="M-4 -150v-62h8v62z"/><path d="M-14 -214h28l-4 6h-20z"/>
      </g>
      <path d="M-2 -146v-118M-1 -22v-120" stroke="#4a4236" stroke-width="1.2" opacity=".7"/>
      <path d="M-46 0c10-4 20-10 28-20" stroke="#4a4236" stroke-width="1" fill="none" opacity=".6"/>
      <path d="M-86 -192c1 8 0 14 2 22M86 -192c-1 7 0 13-1 20" stroke="#e8dfc0" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <rect x="-85" y="-244" width="14" height="46" fill="url(#wax)"/><path d="M-85 -242c2 8 1 14 2 22M-73 -241c1 5 2 12 1 18" stroke="#efe6c8" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="-78" cy="-244" rx="7" ry="2.5" fill="#f2e9cc"/><g transform="translate(-78 -246)"><g class="flame"><circle r="60" fill="url(#candle)" opacity=".9"/><path d="M0 -24c-5 8-7 14-7 18 0 5 3 8 7 8s7-3 7-8c0-4-2-10-7-18z" fill="#f6c45a"/><path d="M0 -14c-2 5-3 8-3 10 0 3 1 4 3 4s3-1 3-4c0-2-1-5-3-10z" fill="#fff4cf"/><path d="M0 -4v4" stroke="#1a1208" stroke-width="1.2"/></g></g><rect x="71" y="-236" width="14" height="38" fill="url(#wax)"/><path d="M71 -234c2 8 1 14 2 22M83 -233c1 5 2 12 1 18" stroke="#efe6c8" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="78" cy="-236" rx="7" ry="2.5" fill="#f2e9cc"/><g transform="translate(78 -238)"><g class="flame"><circle r="60" fill="url(#candle)" opacity=".9"/><path d="M0 -24c-5 8-7 14-7 18 0 5 3 8 7 8s7-3 7-8c0-4-2-10-7-18z" fill="#f6c45a"/><path d="M0 -14c-2 5-3 8-3 10 0 3 1 4 3 4s3-1 3-4c0-2-1-5-3-10z" fill="#fff4cf"/><path d="M0 -4v4" stroke="#1a1208" stroke-width="1.2"/></g></g>
      <g class="bat" transform="translate(0 -214)">
        <path d="M-6 0l-2 4M-2 0l-1 4M2 0l1 4M6 0l2 4" stroke="#0a0806" stroke-width="1.6" stroke-linecap="round"/>
        <g class="bat-wing-l"><path d="M-5 -4c-12 -2-20-14-20-34 0-8 3-14 8-18l3 8 4-6c3 14 7 30 8 46z" fill="#120d0a" stroke="#050403"/><path d="M-21 -46l2 30M-15 -48l2 34M-9 -42l1 30" stroke="#2c2018" stroke-width="1"/><path d="M-17 -56l-4 -6" stroke="#0a0806" stroke-width="1.6" stroke-linecap="round"/></g>
        <g class="bat-wing-r"><path d="M5 -4c12 -2 20-14 20-34 0-8-3-14-8-18l-3 8-4-6c-3 14-7 30-8 46z" fill="#120d0a" stroke="#050403"/><path d="M21 -46l-2 30M15 -48l-2 34M9 -42l-1 30" stroke="#2c2018" stroke-width="1"/><path d="M17 -56l4 -6" stroke="#0a0806" stroke-width="1.6" stroke-linecap="round"/></g>
        <path d="M-7 -2c-2 -14 0-30 7-36 7 6 9 22 7 36z" fill="#1b1410"/><path d="M-3 -8c0-8 1-16 3-22M3 -8c0-8-1-16-3-22" stroke="#2c2018" stroke-width=".8" fill="none"/>
        <g class="bat-head">
          <path d="M-7 -40l-5 -16 9 9zM7 -40l5 -16 -9 9z" fill="#1b1410" stroke="#050403" stroke-width=".8"/><path d="M-6 -44l-3 -8M6 -44l3 -8" stroke="#3a2a1e" stroke-width=".8"/>
          <ellipse cx="0" cy="-42" rx="8" ry="7" fill="#1b1410"/><path d="M-3 -37c1 3 5 3 6 0l-3 4z" fill="#0a0604"/>
          <circle cx="-3.4" cy="-43.5" r="1.5" fill="#c23a30"/><circle cx="3.4" cy="-43.5" r="1.5" fill="#c23a30"/>
          <path d="M-1.8 -36.6l.5 2.2.6 -2M1.8 -36.6l-.5 2.2-.6 -2" fill="#e8e2cf"/>
        </g>
      </g>
    </g>
  </svg>`);
  // First-person look: the flashlight follows the pointer, or the focused object for keyboard players.
  // The beam is its own layer moved with transform, so following the pointer never repaints the room.
  room.insertAdjacentHTML("beforeend", '<div class="beam" aria-hidden="true"><div class="dust"></div></div><div class="wipe l" aria-hidden="true"></div><div class="wipe r" aria-hidden="true"></div>');
  const beam = room.querySelector(".beam");
  const arm = room.querySelector(".arm");
  let frame = 0, px = 0, py = 0, rect = null;
  for (const type of ["resize", "scroll"]) addEventListener(type, () => { rect = null; }, { passive: true });
  const aim = (x, y) => {
    px = x; py = y;
    frame ||= requestAnimationFrame(() => {  // at most one update per screen frame
      frame = 0;
      if (!rect || !rect.width) rect = room.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (px - rect.left) / rect.width)), ny = Math.min(1, Math.max(0, (py - rect.top) / rect.height));
      beam.style.transform = `translate(${nx * 50}%, ${ny * 50}%)`;  // beam is 2x the room, so 50% = full width
      for (const el of [scene, arm]) { el.style.setProperty("--nx", nx); el.style.setProperty("--ny", ny); }
    });
  };
  room.addEventListener("pointermove", (e) => aim(e.clientX, e.clientY));
  room.addEventListener("focusin", (e) => { const b = e.target.getBoundingClientRect(); aim(b.left + b.width / 2, b.top + b.height / 2); });
}

// Called once when a match starts, because the seed only exists then. Same room code = same layout on both screens.
function placeObjects() {
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const put = (id, spot, width) => {
    const el = document.getElementById("obj-" + id);
    el.style.left = spot.left + "%";
    el.style.top = spot.top === undefined ? "auto" : spot.top + "%";
    el.style.bottom = spot.bottom === undefined ? "auto" : spot.bottom + "%";
    el.style.setProperty("--w", width + "cqw");
    el.style.transform = `translateX(-50%) perspective(70cqw) rotateY(${spot.turn}deg)`;
  };
  const wallSpots = shuffle([{ left: 18, top: 19, turn: 36, scale: 1 }, { left: 37, top: 27, turn: 0, scale: .6 }, { left: 72, top: 25, turn: -34, scale: .8 }]);
  [["painting", 18], ["clock", 9], ["photo", 8]].forEach(([id, width], i) => put(id, wallSpots[i], width * wallSpots[i].scale));
  const floorSpots = shuffle([{ left: 74, bottom: 25, turn: -36, cabinet: 9, shelf: 12 }, { left: 84, bottom: 15, turn: -40, cabinet: 12, shelf: 15 }, { left: 12, bottom: 13, turn: 36, cabinet: 11, shelf: 14 }]);
  put("cabinet", floorSpots[0], floorSpots[0].cabinet);
  put("shelf", floorSpots[1], floorSpots[1].shelf);
  // The painting is the colour your answer needs: [top, middle, bottom, waves, wave line]
  const PAINT = { BLUE: ["#5b92ff", "#1c50d2", "#0b2474", "#0f338f", "#7fa8fb"], RED: ["#ff6b5b", "#c11f1a", "#5a0b08", "#7e130f", "#f59a8f"], GREEN: ["#79d98a", "#1f8f3c", "#0b3f1c", "#115a28", "#9be8a8"], WHITE: ["#f2efe4", "#cfcabb", "#9b968a", "#b4ae9f", "#ffffff"], BLACK: ["#5a5a5a", "#2a2a2a", "#0e0e0e", "#1a1a1a", "#8a8a8a"] };
  const room = document.getElementById("room"), answers = puzzleAnswers(game.role);
  PAINT[answers.color].forEach((c, i) => room.style.setProperty("--paint" + i, c));
  // Which casket hides what. Same art, so nothing gives the answer away until one opens.
  const wrong = answers.casket === "left" ? "right" : "left";
  room.dataset.wrong = wrong;
  document.getElementById("obj-casket-" + answers.casket).classList.add("right-one");
  document.getElementById("obj-casket-" + wrong).classList.add("wrong-one");
}
