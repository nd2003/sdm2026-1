import type { HiddenObject } from "./types.ts";

export function getHiddenObjects(): HiddenObject[] {
  return [
    { id: "clock", name: "Alarm Clock", found: false, iconSvg: iconClock() },
    { id: "phone", name: "Rotary Telephone", found: false, iconSvg: iconPhone() },
    { id: "cup", name: "Tea Cup", found: false, iconSvg: iconCup() },
    { id: "lipstick", name: "Lipstick", found: false, iconSvg: iconLipstick() },
    { id: "necklace", name: "Pearl Necklace", found: false, iconSvg: iconNecklace() },
    { id: "scissors", name: "Scissors", found: false, iconSvg: iconScissors() },
    { id: "mirror", name: "Hand Mirror", found: false, iconSvg: iconMirror() },
    { id: "perfume", name: "Perfume Bottle", found: false, iconSvg: iconPerfume() },
    { id: "candle", name: "Candle", found: false, iconSvg: iconCandle() },
    { id: "key", name: "Golden Key", found: false, iconSvg: iconKey() },
    { id: "cards", name: "Playing Cards", found: false, iconSvg: iconCards() },
    { id: "cameo", name: "Cameo Brooch", found: false, iconSvg: iconCameo() },
    { id: "crystal", name: "Crystal Ball", found: false, iconSvg: iconCrystal() },
    { id: "feather", name: "Peacock Feather", found: false, iconSvg: iconFeather() },
    { id: "hatpin", name: "Hatpin", found: false, iconSvg: iconHatpin() },
  ];
}

export function createScene(): string {
  return `
<svg id="game-scene" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
<defs>
  <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#8A9C5A"/>
    <stop offset="100%" stop-color="#697840"/>
  </linearGradient>
  <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#C49048"/>
    <stop offset="100%" stop-color="#8A6028"/>
  </linearGradient>
  <linearGradient id="woodH" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#5C3808"/>
    <stop offset="20%" stop-color="#8B5A18"/>
    <stop offset="50%" stop-color="#C48028"/>
    <stop offset="80%" stop-color="#8B5A18"/>
    <stop offset="100%" stop-color="#5C3808"/>
  </linearGradient>
  <linearGradient id="woodV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#C48028"/>
    <stop offset="40%" stop-color="#8B5A18"/>
    <stop offset="100%" stop-color="#3C1C06"/>
  </linearGradient>
  <linearGradient id="woodDark" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#7A4A14"/>
    <stop offset="100%" stop-color="#3C1C06"/>
  </linearGradient>
  <linearGradient id="velvetGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D84040"/>
    <stop offset="100%" stop-color="#781818"/>
  </linearGradient>
  <radialGradient id="lampGlow" cx="50%" cy="10%" r="70%">
    <stop offset="0%" stop-color="#FFE8A0" stop-opacity="0.95"/>
    <stop offset="50%" stop-color="#FFCC60" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="#FFA820" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="crystalGrad" cx="38%" cy="30%" r="60%">
    <stop offset="0%" stop-color="#C0D8F8"/>
    <stop offset="40%" stop-color="#6090D0"/>
    <stop offset="100%" stop-color="#203880"/>
  </radialGradient>
  <radialGradient id="mirrorRefl" cx="38%" cy="28%" r="65%">
    <stop offset="0%" stop-color="#E0EEF8"/>
    <stop offset="100%" stop-color="#90B0D0"/>
  </radialGradient>
  <pattern id="wallPat" width="60" height="60" patternUnits="userSpaceOnUse">
    <circle cx="30" cy="30" r="11" fill="none" stroke="#96A865" stroke-width="0.8" opacity="0.25"/>
    <circle cx="0"  cy="0"  r="5.5" fill="none" stroke="#96A865" stroke-width="0.6" opacity="0.25"/>
    <circle cx="60" cy="0"  r="5.5" fill="none" stroke="#96A865" stroke-width="0.6" opacity="0.25"/>
    <circle cx="0"  cy="60" r="5.5" fill="none" stroke="#96A865" stroke-width="0.6" opacity="0.25"/>
    <circle cx="60" cy="60" r="5.5" fill="none" stroke="#96A865" stroke-width="0.6" opacity="0.25"/>
  </pattern>
  <pattern id="floorPat" width="80" height="80" patternUnits="userSpaceOnUse">
    <rect width="80" height="80" fill="#C49048"/>
    <rect x="2"  y="2"  width="37" height="37" fill="#B88038" opacity="0.5"/>
    <rect x="41" y="41" width="37" height="37" fill="#B88038" opacity="0.5"/>
    <rect x="2"  y="41" width="37" height="37" fill="#D09848" opacity="0.3"/>
    <rect x="41" y="2"  width="37" height="37" fill="#D09848" opacity="0.3"/>
  </pattern>
</defs>

<!-- ═══════════ ROOM BACKGROUND ═══════════ -->
<rect x="0" y="0" width="1600" height="582" fill="url(#wallGrad)"/>
<rect x="0" y="0" width="1600" height="582" fill="url(#wallPat)"/>
<rect x="0" y="574" width="1600" height="22" fill="#D4C49A"/>
<rect x="0" y="582" width="1600" height="318" fill="url(#floorGrad)"/>
<rect x="0" y="582" width="1600" height="318" fill="url(#floorPat)" opacity="0.55"/>
<rect x="0" y="0" width="1600" height="11" fill="#D4C49A"/>
<rect x="0" y="8"  width="1600" height="5"  fill="#B8A870"/>

<!-- ═══════════ WINDOW (left) ═══════════ -->
<rect x="10"  y="0" width="232" height="582" fill="#3C1E08"/>
<rect x="20"  y="10" width="92" height="285" fill="#B8D0E8" opacity="0.52"/>
<rect x="130" y="10" width="90" height="285" fill="#B8D0E8" opacity="0.52"/>
<rect x="20"  y="308" width="92" height="265" fill="#B8D4EC" opacity="0.48"/>
<rect x="130" y="308" width="90" height="265" fill="#B8D4EC" opacity="0.48"/>
<rect x="10"  y="296" width="232" height="14" fill="#2A1406"/>
<rect x="118" y="0"  width="14"  height="582" fill="#2A1406"/>
<polygon points="10,0 126,78 242,0" fill="#2A1406" opacity="0.55"/>
<circle cx="126" cy="42" r="28" fill="none" stroke="#C8A020" stroke-width="2.5"/>
<line x1="126" y1="14" x2="126" y2="70" stroke="#C8A020" stroke-width="2"/>
<line x1="98"  y1="42" x2="154" y2="42" stroke="#C8A020" stroke-width="2"/>
<!-- curtains -->
<path d="M10,0 C0,110 4,220 7,296 C4,392 0,490 10,582" fill="#78C8D0" opacity="0.38"/>
<path d="M242,0 C252,110 248,220 245,296 C248,392 252,490 242,582" fill="#78C8D0" opacity="0.38"/>
<!-- folds in curtains -->
<path d="M12,80 C18,120 14,160 16,200" stroke="#60B0B8" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M240,80 C234,120 238,160 236,200" stroke="#60B0B8" stroke-width="2" fill="none" opacity="0.5"/>
<!-- curtain rod -->
<rect x="0" y="0" width="260" height="10" fill="#A07828"/>
<circle cx="0"   cy="5" r="8" fill="#C8A020"/>
<circle cx="260" cy="5" r="8" fill="#C8A020"/>
<!-- window light shaft -->
<rect x="10" y="10" width="232" height="572" fill="#FFF8DC" opacity="0.055"/>

<!-- ═══════════ ARMCHAIR + CLOTHES ═══════════ -->
<!-- legs -->
<rect x="22" y="558" width="13" height="30" rx="2" fill="#4A2808"/>
<rect x="148" y="558" width="13" height="30" rx="2" fill="#4A2808"/>
<!-- seat -->
<path d="M12,474 Q28,498 100,502 Q172,498 188,474 L192,562 L8,562 Z" fill="#C490A8"/>
<ellipse cx="100" cy="476" rx="93" ry="20" fill="#D4A8BC"/>
<!-- back -->
<path d="M12,382 C6,428 6,474 12,476 L188,476 C194,474 194,428 188,382 Q156,362 100,360 Q44,362 12,382 Z" fill="#C490A8"/>
<rect x="8"   y="425" width="26" height="52" rx="4" fill="#B87898"/>
<rect x="166" y="425" width="26" height="52" rx="4" fill="#B87898"/>
<!-- coat -->
<path d="M12,384 Q46,342 100,338 Q154,342 188,384" fill="#E8B0C8" stroke="#C898B4" stroke-width="1.5"/>
<!-- sleeve -->
<path d="M188,390 Q218,440 213,476" stroke="#E0A8C0" stroke-width="22" fill="none" stroke-linecap="round"/>
<!-- hat on coat back -->
<ellipse cx="208" cy="354" rx="40" ry="15" fill="#8B6530"/>
<rect x="192" y="334" width="38" height="22" rx="5" fill="#6B4820"/>
<ellipse cx="208" cy="356" rx="40" ry="6" fill="#5C3A18" opacity="0.4"/>
<!-- shoes -->
<path d="M22,588 Q40,580 60,583 Q68,590 46,593 Q30,592 22,588 Z" fill="#8B6030"/>
<path d="M50,587 Q68,580 86,583 Q93,590 72,592 Q54,591 50,587 Z" fill="#7A5428"/>
<!-- yarn ball -->
<circle cx="22" cy="676" r="20" fill="#5888C8"/>
<line x1="22" y1="656" x2="44" y2="588" stroke="#5888C8" stroke-width="2" opacity="0.6"/>
<!-- cat -->
<ellipse cx="88" cy="716" rx="30" ry="22" fill="#D0D0C8"/>
<circle  cx="88" cy="688" r="18" fill="#D8D8D0"/>
<ellipse cx="80" cy="679" rx="5" ry="8" fill="#D0D0C8"/>
<ellipse cx="96" cy="679" rx="5" ry="8" fill="#D0D0C8"/>
<ellipse cx="84" cy="685" rx="3" ry="4" fill="#B0B0A8"/>
<ellipse cx="80" cy="688" rx="4" ry="5" fill="#181818" opacity="0.9"/>
<ellipse cx="96" cy="688" rx="4" ry="5" fill="#181818" opacity="0.9"/>
<circle cx="80" cy="688" r="1.5" fill="white"/>
<circle cx="96" cy="688" r="1.5" fill="white"/>
<line x1="78" y1="695" x2="62" y2="698" stroke="#888" stroke-width="1"/>
<line x1="78" y1="698" x2="60" y2="701" stroke="#888" stroke-width="1"/>
<line x1="98" y1="695" x2="114" y2="698" stroke="#888" stroke-width="1"/>
<line x1="98" y1="698" x2="116" y2="701" stroke="#888" stroke-width="1"/>
<path d="M75,730 Q88,760 100,730" stroke="#C0C0B8" stroke-width="12" fill="none" stroke-linecap="round"/>

<!-- ═══════════ BACK WALL SHELF UNIT ═══════════ -->
<rect x="246" y="0" width="1066" height="336" fill="#8B5A18" opacity="0.28"/>
<rect x="246" y="122" width="1066" height="14" fill="url(#woodH)"/>
<rect x="246" y="132" width="1066" height="5"  fill="#2A1206" opacity="0.5"/>
<rect x="246" y="270" width="1066" height="14" fill="url(#woodH)"/>
<rect x="246" y="280" width="1066" height="5"  fill="#2A1206" opacity="0.5"/>
<rect x="246" y="0"   width="12"   height="336" fill="#5C3808"/>
<rect x="1300" y="0"  width="12"   height="336" fill="#5C3808"/>
<rect x="246" y="324" width="1066" height="14"  fill="url(#woodH)"/>

<!-- decorative items on UPPER shelf (y≈60–122) -->
<!-- blue vase left -->
<ellipse cx="295" cy="118" rx="20" ry="8" fill="#2048A0"/>
<rect x="278" y="68" width="34" height="52" rx="8" fill="#2858C0"/>
<ellipse cx="295" cy="68" rx="17" ry="6" fill="#3068D0"/>
<path d="M278,90 Q272,80 275,70" stroke="#204898" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M312,90 Q318,80 315,70" stroke="#204898" stroke-width="6" fill="none" stroke-linecap="round"/>
<!-- green plant -->
<ellipse cx="372" cy="118" rx="22" ry="7" fill="#6B4820"/>
<path d="M370,118 Q350,80 338,52" stroke="#3A7820" stroke-width="5" fill="none"/>
<path d="M370,118 Q390,75 400,50" stroke="#3A8820" stroke-width="5" fill="none"/>
<path d="M370,118 Q360,90 348,78" stroke="#2A7018" stroke-width="4" fill="none"/>
<ellipse cx="338" cy="50" rx="16" ry="10" fill="#2A8020"/>
<ellipse cx="400" cy="48" rx="18" ry="10" fill="#348A28"/>
<!-- small figurine -->
<ellipse cx="440" cy="118" rx="12" ry="5" fill="#C8A020"/>
<rect x="432" y="78" width="16" height="40" rx="4" fill="#E8D090"/>
<ellipse cx="440" cy="78" rx="10" ry="12" fill="#F0D8A0"/>
<!-- photo frame standing -->
<rect x="468" y="62" width="38" height="56" rx="2" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
<rect x="472" y="66" width="30" height="48" fill="#E8D8B0"/>
<rect x="474" y="68" width="26" height="44" fill="#D0C090" opacity="0.7"/>
<!-- telephone [HIDDEN] -->
<g id="obj-phone" data-object-id="phone" class="hidden-object" style="cursor:crosshair" transform="translate(458,268)">
  <path d="M516,62 Q520,50 532,48 Q556,48 566,58 Q568,66 566,74 Q560,74 554,66 Q542,56 522,60 Q512,68 510,74 Z" fill="#2A2820" stroke="#1A1810" stroke-width="1"/>
  <rect x="508" y="72" width="68" height="40" rx="5" fill="#2A2820" stroke="#1A1810" stroke-width="1"/>
  <circle cx="542" cy="90" r="13" fill="#383828" stroke="#1A1810" stroke-width="1"/>
  <circle cx="542" cy="90" r="9"  fill="#2A2820"/>
  <circle cx="542" cy="80" r="2.5" fill="#1A1810"/>
  <circle cx="550" cy="84" r="2.5" fill="#1A1810"/>
  <circle cx="552" cy="92" r="2.5" fill="#1A1810"/>
  <circle cx="548" cy="100" r="2.5" fill="#1A1810"/>
  <circle cx="536" cy="100" r="2.5" fill="#1A1810"/>
  <circle cx="532" cy="92"  r="2.5" fill="#1A1810"/>
  <circle cx="534" cy="84"  r="2.5" fill="#1A1810"/>
  <circle cx="542" cy="90" r="4" fill="#C8A020"/>
  <rect x="508" y="68" width="68" height="48" fill="transparent"/>
</g>
<!-- lamp on shelf -->
<rect x="602" y="80" width="12" height="42" fill="#C8A020"/>
<path d="M584,52 Q618,40 652,52 L648,80 L588,80 Z" fill="#F5E8C0" stroke="#C8A020" stroke-width="1.5"/>
<ellipse cx="618" cy="52" rx="34" ry="12" fill="#F0E0A8" stroke="#C8A020" stroke-width="1"/>
<ellipse cx="618" cy="80" rx="22" ry="6"  fill="#C8A020"/>
<ellipse cx="618" cy="62" rx="28" ry="6"  fill="#FFE880" opacity="0.6"/>
<!-- alarm clock [HIDDEN] -->
<g id="obj-clock" data-object-id="clock" class="hidden-object" style="cursor:crosshair">
  <rect x="728" y="72" width="48" height="44" rx="6" fill="#C8A020" stroke="#A07810" stroke-width="1.5"/>
  <circle cx="752" cy="89" r="17" fill="#F8F0D8" stroke="#A07810" stroke-width="1"/>
  <line x1="752" y1="75" x2="752" y2="79" stroke="#2A1206" stroke-width="1.5"/>
  <line x1="752" y1="99" x2="752" y2="103" stroke="#2A1206" stroke-width="1.5"/>
  <line x1="738" y1="89" x2="742" y2="89" stroke="#2A1206" stroke-width="1.5"/>
  <line x1="762" y1="89" x2="766" y2="89" stroke="#2A1206" stroke-width="1.5"/>
  <line x1="752" y1="89" x2="750" y2="81" stroke="#2A1206" stroke-width="2"/>
  <line x1="752" y1="89" x2="760" y2="90" stroke="#2A1206" stroke-width="1.5"/>
  <circle cx="740" cy="72" r="8" fill="#C8A020" stroke="#A07810" stroke-width="1"/>
  <circle cx="764" cy="72" r="8" fill="#C8A020" stroke="#A07810" stroke-width="1"/>
  <line x1="732" y1="116" x2="738" y2="120" stroke="#A07810" stroke-width="2"/>
  <line x1="772" y1="116" x2="766" y2="120" stroke="#A07810" stroke-width="2"/>
  <rect x="722" y="62" width="60" height="62" fill="transparent"/>
</g>
<!-- tea tin -->
<rect x="800" y="76" width="34" height="46" rx="4" fill="#2A6040" stroke="#1A4028" stroke-width="1"/>
<ellipse cx="817" cy="76" rx="17" ry="5" fill="#3A8050"/>
<rect x="802" y="85" width="30" height="22" fill="#C8A020" opacity="0.6"/>
<!-- hourglass/decor -->
<path d="M862,118 Q876,98 862,78 Q876,78 876,98 Q876,118 862,118 Z" fill="#C8A020" opacity="0.8"/>
<line x1="862" y1="78" x2="876" y2="78" stroke="#A07810" stroke-width="2"/>
<line x1="862" y1="118" x2="876" y2="118" stroke="#A07810" stroke-width="2"/>
<!-- photo frame 2 -->
<rect x="902" y="62" width="44" height="56" rx="2" fill="#8B5A18" stroke="#6A3A08" stroke-width="2"/>
<rect x="906" y="66" width="36" height="48" fill="#C8B890"/>
<ellipse cx="924" cy="90" rx="12" ry="14" fill="#E8D8C0"/>
<!-- playing cards [HIDDEN] -->
<g id="obj-cards" data-object-id="cards" class="hidden-object" style="cursor:crosshair">
  <rect x="975" y="72" width="32" height="46" rx="3" fill="#A82020" transform="rotate(-10,991,95)"/>
  <rect x="980" y="70" width="32" height="46" rx="3" fill="white" stroke="#C0C0C0" stroke-width="0.8" transform="rotate(-4,996,93)"/>
  <text x="983" y="84" font-size="11" fill="#C82020" font-family="serif" transform="rotate(-4,996,93)">♥</text>
  <rect x="986" y="69" width="32" height="46" rx="3" fill="white" stroke="#B0B0B0" stroke-width="0.8"/>
  <text x="989" y="83" font-size="11" fill="#2020C0" font-family="serif">♠</text>
  <text x="1004" y="108" font-size="11" fill="#2020C0" font-family="serif" transform="rotate(180,1002,97)">♠</text>
  <rect x="968" y="62" width="60" height="62" fill="transparent"/>
</g>
<!-- books stacked -->
<rect x="1058" y="90" width="14" height="32" fill="#803020"/>
<rect x="1072" y="84" width="18" height="38" fill="#204080"/>
<rect x="1090" y="88" width="12" height="34" fill="#206040"/>
<rect x="1102" y="92" width="10" height="30" fill="#806020"/>
<!-- small photo pinned to wall -->
<rect x="1140" y="52" width="38" height="52" fill="white" stroke="#C0B080" stroke-width="1.5"/>
<rect x="1144" y="56" width="30" height="44" fill="#D8D0B0"/>
<ellipse cx="1159" cy="78" rx="10" ry="12" fill="#C0A878"/>
<!-- horse photo frame -->
<rect x="1200" y="56" width="52" height="58" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
<rect x="1204" y="60" width="44" height="50" fill="#D8D0B0"/>
<ellipse cx="1226" cy="85" rx="18" ry="12" fill="#808060" opacity="0.8"/>

<!-- decorative items on LOWER shelf (y≈185–270) -->
<!-- books group left -->
<rect x="258" y="210" width="12" height="60" fill="#802020"/>
<rect x="270" y="202" width="16" height="68" fill="#208040"/>
<rect x="286" y="208" width="12" height="62" fill="#204880"/>
<rect x="298" y="206" width="10" height="64" fill="#806020"/>
<!-- vase tall -->
<ellipse cx="340" cy="270" rx="18" ry="6" fill="#6B4820"/>
<path d="M326,270 Q322,230 328,210 Q334,202 340,200 Q346,202 352,210 Q358,230 354,270 Z" fill="#C84040"/>
<ellipse cx="340" cy="200" rx="12" ry="4" fill="#D85050"/>
<!-- candle [HIDDEN] -->
<g id="obj-candle" data-object-id="candle" class="hidden-object" style="cursor:crosshair" transform="translate(652,0)">
  <ellipse cx="398" cy="268" rx="13" ry="4" fill="#C8A020"/>
  <rect x="392" y="210" width="12" height="58" rx="2" fill="#F0E8D0" stroke="#D8D0B8" stroke-width="1"/>
  <path d="M392,218 Q389,230 390,242" stroke="#F0E8D0" stroke-width="3" fill="none"/>
  <ellipse cx="398" cy="204" rx="4" ry="6" fill="#FFD040"/>
  <ellipse cx="398" cy="206" rx="2.5" ry="4" fill="#FF8020"/>
  <ellipse cx="398" cy="208" rx="1.5" ry="2.5" fill="#FF4010"/>
  <ellipse cx="398" cy="204" rx="8" ry="10" fill="#FFF080" opacity="0.3"/>
  <rect x="386" y="196" width="24" height="76" fill="transparent"/>
</g>
<!-- green flower vase -->
<ellipse cx="450" cy="270" rx="20" ry="7" fill="#6B4820"/>
<path d="M436,270 Q432,236 440,220 Q445,210 450,208 Q455,210 460,220 Q468,236 464,270 Z" fill="#2A6840"/>
<ellipse cx="450" cy="208" rx="10" ry="4" fill="#3A8850"/>
<path d="M450,208 Q438,185 428,172" stroke="#3A8030" stroke-width="4" fill="none"/>
<path d="M450,208 Q462,183 472,170" stroke="#3A8030" stroke-width="4" fill="none"/>
<ellipse cx="428" cy="170" rx="12" ry="8" fill="#E04050"/>
<ellipse cx="472" cy="168" rx="13" ry="8" fill="#E84858"/>
<circle cx="450" cy="208" r="5" fill="#C83040"/>
<!-- photo frame standing -->
<rect x="496" y="202" width="44" height="64" rx="2" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
<rect x="500" y="206" width="36" height="56" fill="#D8D0B0"/>
<ellipse cx="518" cy="234" rx="13" ry="16" fill="#C0A880"/>
<!-- jewelry box -->
<rect x="558" y="228" width="52" height="38" rx="4" fill="#8B1C1C" stroke="#681010" stroke-width="1.5"/>
<rect x="558" y="228" width="52" height="18" rx="4" fill="#A02020"/>
<line x1="558" y1="246" x2="610" y2="246" stroke="#681010" stroke-width="1.5"/>
<rect x="578" y="242" width="12" height="6" rx="2" fill="#C8A020"/>
<!-- figurine ornament -->
<ellipse cx="654" cy="270" rx="12" ry="4" fill="#C8A020"/>
<rect x="648" y="230" width="14" height="40" rx="2" fill="#E8D090"/>
<ellipse cx="655" cy="230" rx="11" ry="13" fill="#F0DCB0"/>
<!-- stacked books right -->
<rect x="690" y="208" width="14" height="62" fill="#403870"/>
<rect x="704" y="214" width="12" height="56" fill="#702820"/>
<!-- pinned photo -->
<rect x="724" y="186" width="44" height="58" fill="white" stroke="#C0B080" stroke-width="1.5" transform="rotate(2,746,215)"/>
<rect x="728" y="190" width="36" height="50" fill="#C8C0A0" transform="rotate(2,746,215)"/>
<!-- small horse figurine right shelf -->
<rect x="780" y="232" width="40" height="38" rx="2" fill="none"/>
<path d="M790,270 Q786,250 788,236 Q792,228 798,228 Q808,228 814,238 Q818,246 816,256 Q820,260 820,270" stroke="#8B6030" stroke-width="3" fill="none"/>
<ellipse cx="798" cy="228" rx="8" ry="6" fill="#8B6030"/>
<!-- more items right -->
<rect x="840" y="218" width="34" height="52" rx="4" fill="#204880"/>
<ellipse cx="857" cy="218" rx="17" ry="5" fill="#2858A0"/>
<rect x="882" y="224" width="12" height="46" fill="#606030"/>
<rect x="894" y="216" width="16" height="54" fill="#306028"/>
<!-- abstract vase -->
<path d="M930,270 Q924,240 930,220 Q936,214 942,218 Q948,224 944,270 Z" fill="#A07828"/>
<!-- bookset -->
<rect x="964" y="210" width="10" height="60" fill="#802828"/>
<rect x="974" y="206" width="14" height="64" fill="#284880"/>
<rect x="988" y="212" width="10" height="58" fill="#286028"/>
<!-- figurine 2 -->
<ellipse cx="1030" cy="270" rx="10" ry="4" fill="#B88840"/>
<rect x="1024" y="236" width="12" height="34" rx="3" fill="#E8D8A0"/>
<ellipse cx="1030" cy="236" rx="9" ry="10" fill="#F0E0B0"/>
<!-- more books -->
<rect x="1060" y="204" width="12" height="66" fill="#480428"/>
<rect x="1072" y="208" width="10" height="62" fill="#083858"/>
<rect x="1082" y="210" width="14" height="60" fill="#384820"/>
<!-- photo 3 -->
<rect x="1108" y="192" width="40" height="58" fill="#8B5A18" stroke="#6A3A08" stroke-width="2"/>
<rect x="1112" y="196" width="32" height="50" fill="#C8C0A0"/>
<!-- photo 4 (wedding) -->
<rect x="1162" y="186" width="52" height="70" fill="white" stroke="#C8A020" stroke-width="2" transform="rotate(-3,1188,221)"/>
<rect x="1166" y="190" width="44" height="62" fill="#D8D0C0" transform="rotate(-3,1188,221)"/>
<!-- photo 5 -->
<rect x="1230" y="194" width="46" height="62" fill="white" stroke="#A09080" stroke-width="1.5"/>
<rect x="1234" y="198" width="38" height="54" fill="#C8C0A0"/>

<!-- ═══════════ RIGHT DISPLAY CABINET ═══════════ -->
<rect x="1312" y="8" width="284" height="572" fill="url(#woodV)" rx="2"/>
<rect x="1312" y="8"   width="284" height="12"  fill="#5C3808"/>
<rect x="1312" y="155" width="284" height="10"  fill="#7A5018"/>
<rect x="1312" y="315" width="284" height="10"  fill="#7A5018"/>
<rect x="1312" y="466" width="284" height="10"  fill="#7A5018"/>
<rect x="1312" y="8"   width="10"  height="572" fill="#5C3808"/>
<rect x="1586" y="8"   width="10"  height="572" fill="#5C3808"/>
<!-- glass panels -->
<rect x="1322" y="20"  width="264" height="130" fill="#A8C0D8" opacity="0.2"/>
<rect x="1322" y="165" width="264" height="145" fill="#A8C0D8" opacity="0.15"/>
<rect x="1322" y="325" width="264" height="136" fill="#A8C0D8" opacity="0.15"/>
<rect x="1322" y="476" width="264" height="90"  fill="#A8C0D8" opacity="0.15"/>
<!-- cabinet items shelf 1 -->
<rect x="1330" y="88"  width="50" height="68"  rx="2" fill="#C8A020" stroke="#A07810" stroke-width="1.5"/>
<rect x="1334" y="92"  width="42" height="60"  fill="#D8D0B0"/>
<ellipse cx="1355" cy="122" rx="14" ry="16" fill="#C0A880"/>
<!-- photo couple -->
<rect x="1398" y="82" width="54" height="74"  fill="white" stroke="#C8A020" stroke-width="2"/>
<rect x="1402" y="86" width="46" height="66"  fill="#C8C0A0"/>
<ellipse cx="1420" cy="119" rx="11" ry="14" fill="#D0B890"/>
<ellipse cx="1438" cy="119" rx="11" ry="14" fill="#C0A880"/>
<!-- peacock feather [HIDDEN] in vase -->
<g id="obj-feather" data-object-id="feather" class="hidden-object" style="cursor:crosshair">
  <ellipse cx="1472" cy="155" rx="24" ry="8" fill="#6B4820"/>
  <path d="M1468,155 Q1462,120 1466,78" stroke="#808040" stroke-width="2.5" fill="none"/>
  <path d="M1476,155 Q1482,118 1480,80" stroke="#606030" stroke-width="2" fill="none"/>
  <path d="M1468,110 Q1445,88 1434,62" stroke="#507840" stroke-width="2" fill="none" opacity="0.8"/>
  <path d="M1476,112 Q1498,88 1508,62" stroke="#408040" stroke-width="2" fill="none" opacity="0.8"/>
  <ellipse cx="1467" cy="62" rx="18" ry="22" fill="#2878A0"/>
  <ellipse cx="1467" cy="62" rx="12" ry="15" fill="#20A060"/>
  <ellipse cx="1467" cy="62" rx="8"  ry="10" fill="#1860A0"/>
  <ellipse cx="1467" cy="62" rx="5"  ry="6"  fill="#0A2050"/>
  <ellipse cx="1464" cy="58" rx="3"  ry="2"  fill="white" opacity="0.5"/>
  <path d="M1468,82 Q1448,70 1436,56" stroke="#2878A0" stroke-width="2.5" fill="none"/>
  <path d="M1476,82 Q1495,70 1508,56" stroke="#2878A0" stroke-width="2.5" fill="none"/>
  <path d="M1472,155 Q1448,148 1436,142" stroke="#606030" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M1472,155 Q1496,148 1508,142" stroke="#606030" stroke-width="10" fill="none" stroke-linecap="round"/>
  <rect x="1430" y="40" width="82" height="120" fill="transparent"/>
</g>
<!-- cabinet shelf 2 items -->
<rect x="1326" y="210" width="40" height="40" rx="4" fill="#8B1C1C" stroke="#681010" stroke-width="1.5"/>
<rect x="1326" y="210" width="40" height="20" rx="4" fill="#A02020"/>
<rect x="1374" y="198" width="30" height="52" rx="8" fill="#A040C0" opacity="0.85"/>
<ellipse cx="1389" cy="198" rx="15" ry="5" fill="#B050D0"/>
<rect x="1414" y="202" width="52" height="58" rx="2" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
<rect x="1418" y="206" width="44" height="50" fill="#D8D0B0"/>
<rect x="1476" y="206" width="10" height="60" fill="#802828"/>
<rect x="1486" y="202" width="14" height="64" fill="#482880"/>
<rect x="1500" y="208" width="10" height="58" fill="#206028"/>
<!-- cabinet shelf 3 items -->
<rect x="1326" y="348" width="12" height="58" fill="#802828"/>
<rect x="1338" y="342" width="16" height="64" fill="#284880"/>
<rect x="1354" y="348" width="12" height="58" fill="#286028"/>
<ellipse cx="1430" cy="466" rx="30" ry="10" fill="#6B4820"/>
<path d="M1414,466 Q1408,426 1414,404 Q1420,396 1430,394 Q1440,396 1446,404 Q1452,426 1446,466 Z" fill="#2A6840"/>
<ellipse cx="1430" cy="394" rx="16" ry="5" fill="#3A8850"/>
<rect x="1472" y="338" width="38" height="68" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
<rect x="1476" y="342" width="30" height="60" fill="#D8D0B0"/>
<ellipse cx="1491" cy="372" rx="10" ry="12" fill="#C0A878"/>
<!-- cabinet shelf 4 items -->
<rect x="1330" y="490" width="38" height="52" rx="2" fill="#304070"/>
<ellipse cx="1349" cy="490" rx="19" ry="6" fill="#405088"/>
<circle cx="1430" cy="510" r="22" fill="#D09040"/>
<circle cx="1430" cy="510" r="14" fill="#C08030"/>
<rect x="1480" y="484" width="24" height="58" rx="2" fill="#A83020"/>

<!-- ═══════════ LAMP GLOW (ambient) ═══════════ -->
<ellipse cx="285" cy="280" rx="200" ry="240" fill="url(#lampGlow)" opacity="0.7"/>

<!-- ═══════════ DRESSER BODY ═══════════ -->
<!-- back panel -->
<rect x="250" y="122" width="430" height="460" fill="url(#woodV)"/>
<!-- left side -->
<rect x="250" y="122" width="18" height="460" fill="url(#woodDark)"/>
<!-- right side -->
<rect x="662" y="122" width="18" height="460" fill="url(#woodDark)"/>
<!-- 4 drawer fronts -->
<rect x="268" y="140" width="410" height="88" rx="3" fill="url(#woodH)" stroke="#5C3808" stroke-width="2"/>
<rect x="268" y="234" width="410" height="88" rx="3" fill="url(#woodH)" stroke="#5C3808" stroke-width="2"/>
<rect x="268" y="328" width="410" height="88" rx="3" fill="url(#woodH)" stroke="#5C3808" stroke-width="2"/>
<rect x="268" y="422" width="410" height="88" rx="3" fill="url(#woodH)" stroke="#5C3808" stroke-width="2"/>
<!-- drawer handles -->
<rect x="455" y="176" width="30" height="8" rx="4" fill="#C8A020"/>
<rect x="455" y="270" width="30" height="8" rx="4" fill="#C8A020"/>
<rect x="455" y="364" width="30" height="8" rx="4" fill="#C8A020"/>
<rect x="455" y="458" width="30" height="8" rx="4" fill="#C8A020"/>
<!-- dresser top surface -->
<rect x="244" y="120" width="444" height="22" rx="2" fill="url(#woodH)"/>
<rect x="244" y="138" width="444" height="6"  fill="#2A1206" opacity="0.5"/>

<!-- DRESSER LAMP -->
<rect x="258" y="145" width="10" height="90" fill="#C8A020"/>
<path d="M242,112 Q268,100 310,112 L306,145 L246,145 Z" fill="#F5E8C0" stroke="#C8A020" stroke-width="1.5"/>
<ellipse cx="276" cy="112" rx="34" ry="12" fill="#F0E0A8" stroke="#C8A020" stroke-width="1"/>
<ellipse cx="276" cy="145" rx="22" ry="6" fill="#C8A020"/>

<!-- DRESSER TALL MIRROR -->
<rect x="316" y="8" width="302" height="124" rx="8" fill="#C8A020" stroke="#A07810" stroke-width="4"/>
<rect x="324" y="16" width="286" height="108" rx="5" fill="url(#mirrorRefl)"/>
<!-- mirror highlight -->
<path d="M332,22 Q338,18 346,22" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
<!-- mirror reflection hint -->
<rect x="332" y="24" width="270" height="92" rx="4" fill="url(#mirrorRefl)" opacity="0.5"/>

<!-- ═══════════ DRESSER SURFACE ITEMS ═══════════ -->
<!-- surface base tone -->
<rect x="244" y="120" width="444" height="22" fill="#D4A050" opacity="0.3"/>

<!-- tea cup [HIDDEN] -->
<g id="obj-cup" data-object-id="cup" class="hidden-object" style="cursor:crosshair">
  <ellipse cx="336" cy="130" rx="28" ry="8" fill="#E8E0D0" stroke="#C8B890" stroke-width="1"/>
  <path d="M312,112 Q310,126 312,130 Q322,136 358,132 Q362,128 360,112 Z" fill="#F0E8D8" stroke="#C8B890" stroke-width="1.5"/>
  <ellipse cx="336" cy="112" rx="22" ry="6" fill="#F0E8D8" stroke="#C8B890" stroke-width="1"/>
  <circle cx="332" cy="120" r="3" fill="#D04040" opacity="0.7"/>
  <circle cx="344" cy="118" r="2" fill="#40A040" opacity="0.7"/>
  <path d="M360,116 Q374,116 376,122 Q376,128 360,130" fill="none" stroke="#C8B890" stroke-width="2.5"/>
  <rect x="306" y="104" width="76" height="36" fill="transparent"/>
</g>

<!-- key [HIDDEN] -->
<g id="obj-key" data-object-id="key" class="hidden-object" style="cursor:crosshair">
  <circle cx="398" cy="130" r="10" fill="none" stroke="#C8A020" stroke-width="4"/>
  <circle cx="398" cy="130" r="5"  fill="none" stroke="#C8A020" stroke-width="1.5"/>
  <line x1="408" y1="130" x2="434" y2="130" stroke="#C8A020" stroke-width="4"/>
  <line x1="416" y1="130" x2="416" y2="138" stroke="#C8A020" stroke-width="3"/>
  <line x1="424" y1="130" x2="424" y2="140" stroke="#C8A020" stroke-width="3"/>
  <line x1="432" y1="130" x2="432" y2="136" stroke="#C8A020" stroke-width="3"/>
  <rect x="382" y="116" width="60" height="28" fill="transparent"/>
</g>

<!-- papers / letters on dresser -->
<rect x="444" y="108" width="58" height="42" rx="2" fill="#F8F0E0" transform="rotate(3,473,129)"/>
<rect x="448" y="112" width="58" height="42" rx="2" fill="#F0E8D8" transform="rotate(-2,477,133)"/>
<line x1="450" y1="120" x2="490" y2="120" stroke="#C0B090" stroke-width="1" opacity="0.5"/>
<line x1="450" y1="126" x2="490" y2="126" stroke="#C0B090" stroke-width="1" opacity="0.5"/>
<line x1="450" y1="132" x2="486" y2="132" stroke="#C0B090" stroke-width="1" opacity="0.5"/>

<!-- crystal ball [HIDDEN] -->
<g id="obj-crystal" data-object-id="crystal" class="hidden-object" style="cursor:crosshair">
  <path d="M510,142 Q522,138 534,142 Q530,146 522,148 Q514,146 510,142 Z" fill="#C8A020"/>
  <circle cx="522" cy="118" r="24" fill="url(#crystalGrad)"/>
  <ellipse cx="514" cy="108" rx="8" ry="6" fill="white" opacity="0.4"/>
  <path d="M514,116 Q518,112 522,113 Q526,116 524,120" stroke="white" stroke-width="1.5" fill="none" opacity="0.5"/>
  <rect x="496" y="92" width="52" height="58" fill="transparent"/>
</g>

<!-- hand mirror [HIDDEN] -->
<g id="obj-mirror" data-object-id="mirror" class="hidden-object" style="cursor:crosshair">
  <rect x="612" y="130" width="8" height="24" rx="3" fill="#C8A020" stroke="#A07810" stroke-width="1"/>
  <ellipse cx="616" cy="110" rx="20" ry="23" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
  <ellipse cx="616" cy="110" rx="16" ry="19" fill="url(#mirrorRefl)"/>
  <ellipse cx="610" cy="102" rx="5" ry="6" fill="white" opacity="0.35"/>
  <rect x="592" y="85" width="48" height="72" fill="transparent"/>
</g>

<!-- jewelry box on dresser -->
<rect x="640" y="102" width="58" height="40" rx="4" fill="#8B1C1C" stroke="#681010" stroke-width="1.5"/>
<rect x="640" y="102" width="58" height="20" rx="4" fill="#A02020"/>
<line x1="640" y1="122" x2="698" y2="122" stroke="#681010" stroke-width="1.5"/>
<rect x="662" y="118" width="14" height="6" rx="2" fill="#C8A020"/>
<!-- small golden box -->
<rect x="600" y="106" width="36" height="28" rx="3" fill="#C8A020" stroke="#A07810" stroke-width="1"/>
<rect x="600" y="106" width="36" height="14" rx="3" fill="#D4B030"/>

<!-- ═══════════ VANITY TABLE ═══════════ -->
<!-- table legs visible below surface -->
<rect x="688" y="142" width="22" height="440" rx="4" fill="url(#woodDark)"/>
<rect x="1290" y="142" width="22" height="440" rx="4" fill="url(#woodDark)"/>
<!-- cross brace -->
<rect x="688" y="380" width="624" height="12" rx="4" fill="url(#woodH)"/>
<!-- table top surface (velvet covered) -->
<rect x="676" y="118" width="640" height="30" rx="4" fill="url(#woodH)"/>
<rect x="680" y="122" width="632" height="22" rx="3" fill="url(#velvetGrad)"/>
<!-- velvet sheen -->
<rect x="680" y="122" width="632" height="8"  rx="3" fill="#E04040" opacity="0.4"/>

<!-- ═══════════ VANITY SURFACE ITEMS ═══════════ -->

<!-- lipstick [HIDDEN] -->
<g id="obj-lipstick" data-object-id="lipstick" class="hidden-object" style="cursor:crosshair">
  <rect x="742" y="84"  width="13" height="34" rx="2" fill="#C8A020" stroke="#A07810" stroke-width="1"/>
  <rect x="742" y="68"  width="13" height="18" rx="1" fill="#A07810"/>
  <path d="M742,68 L755,68 L755,56 Q748.5,50 742,56 Z" fill="#CC2828"/>
  <rect x="736" y="50" width="25" height="72" fill="transparent"/>
</g>

<!-- pincushion + hatpin [HIDDEN] -->
<g id="obj-hatpin" data-object-id="hatpin" class="hidden-object" style="cursor:crosshair">
  <ellipse cx="818" cy="128" rx="22" ry="14" fill="#8B2050"/>
  <ellipse cx="818" cy="122" rx="18" ry="10" fill="#B02868"/>
  <line x1="818" y1="78"  x2="818" y2="128" stroke="#C0C0C8" stroke-width="2.5"/>
  <circle cx="818" cy="74" r="8" fill="#F0E8D8" stroke="#C8A020" stroke-width="2"/>
  <circle cx="818" cy="74" r="4" fill="#C8A020"/>
  <line x1="802" y1="92"  x2="807" y2="128" stroke="#C0C0C8" stroke-width="2"/>
  <circle cx="802" cy="88" r="4" fill="#D04040"/>
  <line x1="834" y1="96"  x2="830" y2="128" stroke="#C0C0C8" stroke-width="2"/>
  <circle cx="834" cy="92" r="4" fill="#D04040"/>
  <rect x="796" y="62" width="44" height="80" fill="transparent"/>
</g>

<!-- scissors [HIDDEN] -->
<g id="obj-scissors" data-object-id="scissors" class="hidden-object" style="cursor:crosshair">
  <path d="M864,142 Q870,134 876,128 Q886,116 902,110" stroke="#B0B8C0" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M864,110 Q875,118 882,128 Q892,140 898,146" stroke="#B0B8C0" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="879" cy="128" r="5" fill="#A0A8B0" stroke="#808890" stroke-width="1"/>
  <circle cx="879" cy="128" r="2" fill="#C8A020"/>
  <ellipse cx="860" cy="128" rx="11" ry="13" fill="none" stroke="#B0B8C0" stroke-width="3.5"/>
  <ellipse cx="860" cy="116" rx="9"  ry="11" fill="none" stroke="#B0B8C0" stroke-width="2.5"/>
  <rect x="846" y="98" width="62" height="52" fill="transparent"/>
</g>

<!-- makeup brush set -->
<line x1="940" y1="68"  x2="944" y2="140" stroke="#8B5A18" stroke-width="6"  stroke-linecap="round"/>
<line x1="952" y1="62"  x2="956" y2="140" stroke="#6B4818" stroke-width="5"  stroke-linecap="round"/>
<line x1="964" y1="66"  x2="968" y2="140" stroke="#8B5A18" stroke-width="4.5" stroke-linecap="round"/>
<ellipse cx="940" cy="66"  rx="5" ry="7" fill="#D8D0C0"/>
<ellipse cx="952" cy="60"  rx="5" ry="8" fill="#E0D8C8"/>
<ellipse cx="964" cy="64"  rx="4" ry="6" fill="#C8C0B0"/>
<!-- small round mirror -->
<circle cx="1004" cy="88" r="28" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
<circle cx="1004" cy="88" r="23" fill="url(#mirrorRefl)"/>
<ellipse cx="997" cy="80" rx="7" ry="5" fill="white" opacity="0.3"/>

<!-- cameo brooch [HIDDEN] -->
<g id="obj-cameo" data-object-id="cameo" class="hidden-object" style="cursor:crosshair">
  <ellipse cx="1058" cy="122" rx="18" ry="22" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
  <ellipse cx="1058" cy="122" rx="13" ry="17" fill="#2A1810"/>
  <path d="M1051,110 Q1051,107 1054,106 Q1060,105 1064,110 Q1066,114 1064,118 Q1062,122 1060,125 Q1058,128 1055,127 Q1050,124 1050,120 Q1050,114 1051,110 Z" fill="#F8F0E0"/>
  <rect x="1036" y="96" width="44" height="52" fill="transparent"/>
</g>

<!-- pearl necklace [HIDDEN] -->
<g id="obj-necklace" data-object-id="necklace" class="hidden-object" style="cursor:crosshair">
  <ellipse cx="1116" cy="124" rx="24" ry="13" fill="none" stroke="#F0ECE4" stroke-width="11" opacity="0.9"/>
  <circle cx="1092" cy="124" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1100" cy="113" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1110" cy="109" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1122" cy="109" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1132" cy="114" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1138" cy="124" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1134" cy="134" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1124" cy="140" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1112" cy="140" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <circle cx="1100" cy="135" r="4.5" fill="#F8F4EC" stroke="#D8D0C0" stroke-width="1"/>
  <rect cx="1118" cy="107" width="8" height="5" rx="1" fill="#C8A020" x="1114" y="107"/>
  <rect x="1086" y="105" width="60" height="44" fill="transparent"/>
</g>

<!-- perfume bottle [HIDDEN] -->
<g id="obj-perfume" data-object-id="perfume" class="hidden-object" style="cursor:crosshair">
  <rect x="1170" y="88"  width="30" height="42" rx="6" fill="#A040C0" stroke="#801890" stroke-width="1.5" opacity="0.88"/>
  <rect x="1178" y="78"  width="14" height="12" rx="2" fill="#A040C0" stroke="#801890" stroke-width="1"/>
  <rect x="1176" y="70"  width="18" height="10" rx="3" fill="#C8A020" stroke="#A07810" stroke-width="1"/>
  <ellipse cx="1163" cy="90" rx="11" ry="8" fill="#E8C8D8"/>
  <line x1="1174" y1="90" x2="1180" y2="90" stroke="#A07810" stroke-width="2"/>
  <rect x="1172" y="104" width="26" height="22" rx="4" fill="#C048E0" opacity="0.5"/>
  <rect x="1172" y="92"  width="26" height="14" rx="2" fill="white" opacity="0.55"/>
  <rect x="1150" y="62" width="52" height="72" fill="transparent"/>
</g>

<!-- lipstick kiss mark (decorative) -->
<path d="M1218,106 Q1222,100 1230,102 Q1238,100 1242,106 Q1240,112 1230,116 Q1220,112 1218,106 Z" fill="#C83040" opacity="0.7"/>
<path d="M1230,106 L1226,114 L1234,114 Z" fill="#C83040" opacity="0.7"/>

<!-- photo frame standing on vanity -->
<rect x="1252" y="52" width="46" height="82" rx="2" fill="#C8A020" stroke="#A07810" stroke-width="2"/>
<rect x="1256" y="56" width="38" height="74" fill="#D8D0B0"/>
<ellipse cx="1272" cy="85" rx="12" ry="14" fill="#C0A878"/>
<ellipse cx="1286" cy="85" rx="10" ry="12" fill="#D0B890"/>

<!-- makeup palette -->
<rect x="1270" y="104" width="40" height="30" rx="3" fill="#2A1810"/>
<circle cx="1282" cy="114" r="6" fill="#D04040"/>
<circle cx="1296" cy="114" r="6" fill="#D87820"/>
<circle cx="1282" cy="124" r="6" fill="#8020D0"/>
<circle cx="1296" cy="124" r="6" fill="#D0B020"/>

<!-- scattered jewelry/rings on vanity -->
<circle cx="1192" cy="134" r="6" fill="none" stroke="#C8A020" stroke-width="3"/>
<circle cx="1206" cy="130" r="5" fill="none" stroke="#C8A020" stroke-width="3"/>
<circle cx="1198" cy="140" r="6" fill="none" stroke="#A8A8C0" stroke-width="2.5"/>
<!-- makeup sponge -->
<ellipse cx="1230" cy="136" rx="14" ry="9" fill="#F0C8B0"/>

<!-- ═══════════ OPEN DRAWER (foreground) ═══════════ -->
<rect x="262" y="510" width="416" height="68" rx="3" fill="url(#woodDark)" stroke="#2A1206" stroke-width="2"/>
<rect x="268" y="516" width="404" height="56" fill="#6B4010" opacity="0.6"/>
<!-- drawer contents -->
<rect x="276" y="522" width="58" height="44" rx="2" fill="#C89040"/>
<rect x="280" y="526" width="50" height="36" fill="#8B6030"/>
<!-- small items in drawer -->
<circle cx="360" cy="542" r="8" fill="#C8A020"/>
<circle cx="380" cy="538" r="6" fill="#A88020"/>
<rect x="400" y="528" width="32" height="22" rx="2" fill="#D8D0B0"/>
<line x1="402" y1="534" x2="428" y2="534" stroke="#B0A890" stroke-width="1"/>
<line x1="402" y1="540" x2="428" y2="540" stroke="#B0A890" stroke-width="1"/>
<rect x="440" y="524" width="12" height="38" rx="2" fill="#A83028"/>
<circle cx="446" cy="524" r="6" fill="#C03838"/>
<!-- drawer handle -->
<rect x="454" y="540" width="32" height="8" rx="4" fill="#C8A020"/>

</svg>`;
}

function iconClock(): string {
  return `<svg viewBox="0 0 48 48"><rect x="8" y="12" width="32" height="28" rx="4" fill="#C8A020"/><circle cx="24" cy="26" r="10" fill="#F8F0D8"/><line x1="24" y1="26" x2="22" y2="20" stroke="#2A1206" stroke-width="2"/><line x1="24" y1="26" x2="30" y2="27" stroke="#2A1206" stroke-width="1.5"/><circle cx="16" cy="12" r="5" fill="#C8A020"/><circle cx="32" cy="12" r="5" fill="#C8A020"/></svg>`;
}

function iconPhone(): string {
  return `<svg viewBox="0 0 48 48"><rect x="8" y="20" width="32" height="22" rx="4" fill="#2A2820"/><path d="M10,20 Q12,10 24,8 Q36,10 38,20" fill="#2A2820"/><circle cx="24" cy="30" r="8" fill="#383828"/><circle cx="24" cy="30" r="4" fill="#C8A020"/></svg>`;
}

function iconCup(): string {
  return `<svg viewBox="0 0 48 48"><path d="M10,18 Q9,30 10,34 Q18,38 32,36 Q34,32 32,18 Z" fill="#F0E8D8" stroke="#C8B890" stroke-width="1.5"/><ellipse cx="21" cy="18" rx="11" ry="4" fill="#F0E8D8" stroke="#C8B890" stroke-width="1.5"/><path d="M32,22 Q40,22 40,28 Q40,34 32,34" fill="none" stroke="#C8B890" stroke-width="2"/><ellipse cx="21" cy="38" rx="16" ry="5" fill="#E0D8C0"/></svg>`;
}

function iconLipstick(): string {
  return `<svg viewBox="0 0 48 48"><rect x="18" y="24" width="12" height="18" rx="2" fill="#C8A020"/><rect x="18" y="12" width="12" height="14" rx="1" fill="#A07810"/><path d="M18,12 L30,12 L30,4 Q24,0 18,4 Z" fill="#CC2828"/></svg>`;
}

function iconNecklace(): string {
  return `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="16" ry="10" fill="none" stroke="#F8F4EC" stroke-width="8"/><circle cx="8" cy="24" r="3" fill="#F8F4EC"/><circle cx="40" cy="24" r="3" fill="#F8F4EC"/><circle cx="24" cy="14" r="3" fill="#C8A020"/></svg>`;
}

function iconScissors(): string {
  return `<svg viewBox="0 0 48 48"><path d="M12,38 Q18,28 24,22 Q30,16 38,10" stroke="#B0B8C0" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M12,10 Q20,20 24,22 Q28,24 38,38" stroke="#B0B8C0" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="24" cy="22" r="5" fill="#A0A8B0"/><circle cx="24" cy="22" r="2" fill="#C8A020"/><circle cx="10" cy="24" r="7" fill="none" stroke="#B0B8C0" stroke-width="3"/></svg>`;
}

function iconMirror(): string {
  return `<svg viewBox="0 0 48 48"><rect x="21" y="34" width="6" height="12" rx="2" fill="#C8A020"/><ellipse cx="24" cy="22" rx="16" ry="18" fill="#C8A020" stroke="#A07810" stroke-width="2"/><ellipse cx="24" cy="22" rx="12" ry="14" fill="#B8D4E8"/><ellipse cx="20" cy="16" rx="4" ry="3" fill="white" opacity="0.4"/></svg>`;
}

function iconPerfume(): string {
  return `<svg viewBox="0 0 48 48"><rect x="14" y="22" width="22" height="24" rx="6" fill="#A040C0" opacity="0.9"/><rect x="20" y="12" width="10" height="12" rx="2" fill="#A040C0"/><rect x="18" y="6" width="14" height="8" rx="3" fill="#C8A020"/><ellipse cx="10" cy="22" rx="8" ry="6" fill="#E8C8D8"/></svg>`;
}

function iconCandle(): string {
  return `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="44" rx="10" ry="4" fill="#C8A020"/><rect x="18" y="14" width="12" height="30" rx="2" fill="#F0E8D0" stroke="#D8D0B8"/><ellipse cx="24" cy="10" rx="4" ry="6" fill="#FFD040"/><ellipse cx="24" cy="12" rx="2.5" ry="4" fill="#FF8020"/></svg>`;
}

function iconKey(): string {
  return `<svg viewBox="0 0 48 48"><circle cx="14" cy="24" r="10" fill="none" stroke="#C8A020" stroke-width="4"/><circle cx="14" cy="24" r="5" fill="none" stroke="#C8A020" stroke-width="1.5"/><line x1="24" y1="24" x2="44" y2="24" stroke="#C8A020" stroke-width="4"/><line x1="34" y1="24" x2="34" y2="30" stroke="#C8A020" stroke-width="3"/><line x1="40" y1="24" x2="40" y2="28" stroke="#C8A020" stroke-width="3"/></svg>`;
}

function iconCards(): string {
  return `<svg viewBox="0 0 48 48"><rect x="8" y="12" width="28" height="36" rx="3" fill="#A82020" transform="rotate(-8,22,30)"/><rect x="12" y="10" width="28" height="36" rx="3" fill="white" stroke="#C0C0C0" stroke-width="1"/><text x="14" y="26" font-size="14" fill="#C82020" font-family="serif">♥</text><text x="14" y="42" font-size="14" fill="#C82020" font-family="serif" transform="rotate(180,26,36)">♥</text></svg>`;
}

function iconCameo(): string {
  return `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="17" ry="21" fill="#C8A020" stroke="#A07810" stroke-width="2"/><ellipse cx="24" cy="24" rx="12" ry="16" fill="#2A1810"/><path d="M18,14 Q18,11 21,10 Q27,9 30,14 Q32,18 30,22 Q28,26 26,29 Q24,32 21,31 Q16,28 16,24 Q16,18 18,14 Z" fill="#F8F0E0"/></svg>`;
}

function iconCrystal(): string {
  return `<svg viewBox="0 0 48 48"><path d="M6,44 Q16,38 24,36 Q32,38 42,44 Q38,46 24,46 Q10,46 6,44 Z" fill="#C8A020"/><circle cx="24" cy="22" r="20" fill="url(#crystalGrad)"/><ellipse cx="18" cy="14" rx="6" ry="5" fill="white" opacity="0.4"/></svg>`;
}

function iconFeather(): string {
  return `<svg viewBox="0 0 48 48"><path d="M24,46 Q22,34 24,8" stroke="#808040" stroke-width="2" fill="none"/><path d="M24,20 Q10,10 4,2" stroke="#507840" stroke-width="1.5" fill="none"/><path d="M24,20 Q38,10 44,2" stroke="#507840" stroke-width="1.5" fill="none"/><ellipse cx="24" cy="8" rx="12" ry="10" fill="#2878A0"/><ellipse cx="24" cy="8" rx="8" ry="7" fill="#20A060"/><ellipse cx="24" cy="8" rx="5" ry="4" fill="#1860A0"/><ellipse cx="24" cy="8" rx="3" ry="2.5" fill="#0A2050"/></svg>`;
}

function iconHatpin(): string {
  return `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="40" rx="16" ry="10" fill="#8B2050"/><ellipse cx="24" cy="34" rx="13" ry="7" fill="#B02868"/><line x1="24" y1="6" x2="24" y2="40" stroke="#C0C0C8" stroke-width="2.5"/><circle cx="24" cy="6" r="6" fill="#F0E8D8" stroke="#C8A020" stroke-width="2"/><circle cx="24" cy="6" r="3" fill="#C8A020"/></svg>`;
}
