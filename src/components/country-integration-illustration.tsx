import type { JSX } from "react";
import type { CountryCode } from "@/lib/schema";

/**
 * One reusable plate per market edition. Every vignette is drawn in the same
 * 160x100 atlas coordinate system with the same grammar:
 *
 *   - a thin plate frame with corner ticks,
 *   - three motif zones (left 10-52, centre 58-102, right 108-150) sitting on
 *     the same optical baseline,
 *   - connector geometry between the zones carrying the direction of the
 *     handoff, with a small node where control changes hands.
 *
 * Ink is `currentColor`. Two accents only: `--illus-accent` (the market accent,
 * assigned in globals.css) for structure that belongs to the local rail, and
 * `--illus-mark` (vermilion) for the single thing that decides the outcome.
 * No gradients, no animation, no text nodes, no flags or landmarks.
 */

const VIEW_BOX = "0 0 160 100";

const ACCENT = "var(--illus-accent)";
const MARK = "var(--illus-mark)";

/** Plate frame plus corner ticks. Shared by all six. */
function Plate() {
  return (
    <g>
      <rect
        x="4"
        y="4"
        width="152"
        height="92"
        rx="1"
        stroke="currentColor"
        strokeOpacity="0.45"
      />
      <path
        d="M4 14V4h10M146 4h10v10M156 86v10h-10M14 96H4V86"
        stroke="currentColor"
      />
      <line
        x1="10"
        y1="88"
        x2="150"
        y2="88"
        stroke="currentColor"
        strokeOpacity="0.3"
      />
    </g>
  );
}

/** A connector between two motif zones, with the handoff node on the path. */
function Connector({
  d,
  node,
  dashed = false,
  marked = false,
}: {
  d: string;
  node?: [number, number];
  dashed?: boolean;
  marked?: boolean;
}) {
  const stroke = marked ? MARK : ACCENT;
  return (
    <g>
      <path d={d} stroke={stroke} strokeDasharray={dashed ? "3 3" : undefined} />
      {node ? (
        <circle cx={node[0]} cy={node[1]} r="2.6" fill="var(--color-paper)" stroke={stroke} />
      ) : null}
    </g>
  );
}

/* --------------------------------------------------------------------- */
/* KR: signed-in super-app shell, carrier/OTP identity handoff, unit address */

function Korea() {
  return (
    <g>
      {/* super-app shell: outer app frame with nested panels, session dot */}
      <rect x="12" y="20" width="34" height="58" rx="3" stroke="currentColor" />
      <line x1="12" y1="29" x2="46" y2="29" stroke="currentColor" />
      <circle cx="17.5" cy="24.5" r="1.8" fill={ACCENT} stroke="none" />
      <rect x="17" y="34" width="24" height="14" rx="1" stroke={ACCENT} />
      <rect x="17" y="52" width="11" height="10" rx="1" stroke="currentColor" strokeOpacity="0.6" />
      <rect x="30" y="52" width="11" height="10" rx="1" stroke="currentColor" strokeOpacity="0.6" />
      <line x1="17" y1="68" x2="41" y2="68" stroke="currentColor" strokeOpacity="0.5" />
      <line x1="17" y1="72" x2="34" y2="72" stroke="currentColor" strokeOpacity="0.5" />

      {/* carrier identity: SIM plate with carrier arcs, OTP digit boxes */}
      <rect x="64" y="24" width="26" height="20" rx="2" stroke="currentColor" />
      <path d="M70 34h6v6h-6z" stroke="currentColor" strokeOpacity="0.6" />
      <path d="M79 30a6 6 0 0 1 0 8M83 27a10 10 0 0 1 0 14" stroke={ACCENT} />
      <g stroke={MARK}>
        <rect x="64" y="52" width="6" height="8" rx="1" />
        <rect x="71" y="52" width="6" height="8" rx="1" />
        <rect x="78" y="52" width="6" height="8" rx="1" />
        <rect x="85" y="52" width="6" height="8" rx="1" />
      </g>

      {/* handoff out and back: agent stops at the identity boundary */}
      <Connector d="M46 38h14" node={[60, 38]} />
      <Connector d="M60 56H46" node={[60, 56]} marked dashed />

      {/* apartment block with building and unit, plus the unit plate */}
      <rect x="108" y="18" width="34" height="60" stroke="currentColor" />
      <line x1="108" y1="26" x2="142" y2="26" stroke="currentColor" strokeOpacity="0.5" />
      <g stroke="currentColor" strokeOpacity="0.55">
        <rect x="113" y="32" width="8" height="7" />
        <rect x="129" y="32" width="8" height="7" />
        <rect x="113" y="45" width="8" height="7" />
        <rect x="113" y="58" width="8" height="7" />
        <rect x="129" y="58" width="8" height="7" />
      </g>
      <rect x="129" y="45" width="8" height="7" fill={MARK} stroke={MARK} />
      <path d="M120 78h10v6h-10z" stroke={ACCENT} />
      <Connector d="M91 62q9 10 20 10h9" node={[120, 72]} dashed />
    </g>
  );
}

/* --------------------------------------------------------------------- */
/* JP: kana/kanji field pair, postal-code autofill, konbini handoff */

function Japan() {
  return (
    <g>
      {/* paired name fields: solid block reading, dotted phonetic reading */}
      <rect x="12" y="22" width="40" height="14" rx="1" stroke="currentColor" />
      <g stroke="currentColor" strokeOpacity="0.7">
        <path d="M18 27h5M18 31h5M28 27h6M28 31h6" />
      </g>
      <rect x="12" y="42" width="40" height="14" rx="1" stroke={MARK} strokeDasharray="3 2" />
      <path d="M18 49h5M28 49h6M38 49h5" stroke={MARK} />
      <line x1="12" y1="64" x2="52" y2="64" stroke="currentColor" strokeOpacity="0.4" />
      <line x1="12" y1="70" x2="42" y2="70" stroke="currentColor" strokeOpacity="0.4" />

      {/* postal code boxes auto-filling the region and ward bars */}
      <g stroke={ACCENT}>
        <rect x="64" y="20" width="5" height="8" />
        <rect x="70" y="20" width="5" height="8" />
        <rect x="76" y="20" width="5" height="8" />
        <rect x="84" y="20" width="5" height="8" />
        <rect x="90" y="20" width="5" height="8" />
      </g>
      <path d="M79 32v6" stroke={ACCENT} />
      <path d="M76.5 35.5 79 38l2.5-2.5" stroke={ACCENT} />
      <rect x="64" y="42" width="31" height="7" rx="1" stroke="currentColor" />
      <rect x="64" y="53" width="31" height="7" rx="1" stroke="currentColor" />
      <path d="M64 66h31" stroke="currentColor" strokeOpacity="0.4" />
      {/* whole-form validation verdict */}
      <circle cx="79.5" cy="76" r="6" stroke={MARK} />
      <path d="M76.5 76.5 79 79l4-6" stroke={MARK} />

      <Connector d="M52 30h10" node={[62, 30]} />
      <Connector d="M52 49h10" node={[62, 49]} marked dashed />

      {/* convenience store: awning, door, parcel shelf, deadline clock */}
      <rect x="108" y="34" width="38" height="34" stroke="currentColor" />
      <path d="M106 34h42l-4-8h-34z" stroke={ACCENT} />
      <path d="M112 30h30" stroke={ACCENT} strokeOpacity="0.6" />
      <rect x="112" y="52" width="10" height="16" stroke="currentColor" strokeOpacity="0.6" />
      <rect x="128" y="40" width="12" height="9" stroke="currentColor" />
      <path d="M128 44.5h12M134 40v9" stroke="currentColor" strokeOpacity="0.5" />
      <circle cx="134" cy="78" r="6" stroke={MARK} />
      <path d="M134 74.5V78l2.5 2" stroke={MARK} />
      <Connector d="M95 60q7 6 13 6" node={[108 - 2, 66]} dashed />
    </g>
  );
}

/* --------------------------------------------------------------------- */
/* SG: multi-rail payment choice, block+unit address, late fee readback */

function Singapore() {
  return (
    <g>
      {/* three rails, one selected by the bracket */}
      <rect x="12" y="18" width="30" height="18" rx="2" stroke="currentColor" />
      <path d="M12 24h30" stroke="currentColor" strokeOpacity="0.6" />
      <path d="M16 30h8" stroke="currentColor" strokeOpacity="0.6" />

      <rect x="12" y="41" width="18" height="18" stroke={ACCENT} />
      <path
        d="M15 44h4v4h-4zM23 44h4v4h-4zM15 52h4v4h-4zM24 53h3v3h-3z"
        stroke={ACCENT}
      />

      <rect x="12" y="64" width="30" height="16" rx="3" stroke="currentColor" />
      <path d="M34 68h6v8h-6z" stroke="currentColor" strokeOpacity="0.6" />

      <path d="M46 41v18" stroke={MARK} />
      <path d="M46 41h-4M46 59h-4" stroke={MARK} />

      {/* block and unit: two blocks, unit plate with the highlighted cell */}
      <rect x="62" y="26" width="16" height="42" stroke="currentColor" />
      <rect x="82" y="34" width="16" height="34" stroke="currentColor" />
      <g stroke="currentColor" strokeOpacity="0.5">
        <path d="M62 34h16M62 42h16M62 50h16M62 58h16M82 42h16M82 50h16M82 58h16M70 26v42M90 34v34" />
      </g>
      <rect x="82" y="42" width="8" height="8" fill={MARK} stroke={MARK} />
      <path d="M62 74h36" stroke={ACCENT} />
      <path d="M62 71v6M74 71v6M98 71v6" stroke={ACCENT} />

      <Connector d="M50 50h10" node={[60, 50]} />

      {/* itemised readback: lines, rule, late fee added after the total */}
      <path d="M108 18h34v56l-6 5-6-5-6 5-6-5-6 5-4-3z" stroke="currentColor" />
      <g stroke="currentColor" strokeOpacity="0.55">
        <path d="M113 26h18M113 32h24M113 38h18M113 44h22" />
      </g>
      <path d="M113 50h24" stroke="currentColor" />
      <path d="M113 57h16" stroke={MARK} />
      <path d="M113 64h24" stroke={MARK} />
      <path d="M134 60l3 3-3 3" stroke={MARK} />
      <Connector d="M98 30q6 -8 12 -8" node={[104, 24]} dashed marked />
    </g>
  );
}

/* --------------------------------------------------------------------- */
/* TW: branch selection, messaging commerce, digital invoice carrier */

function Taiwan() {
  return (
    <g>
      {/* map plate with candidate branches, one selected */}
      <rect x="10" y="18" width="42" height="46" stroke="currentColor" />
      <g stroke="currentColor" strokeOpacity="0.35">
        <path d="M10 32h42M10 46h42M24 18v46M38 18v46" />
      </g>
      <path d="M20 27a3 3 0 1 1 6 0c0 2.4-3 5-3 5s-3-2.6-3-5z" stroke="currentColor" />
      <path d="M40 43a3 3 0 1 1 6 0c0 2.4-3 5-3 5s-3-2.6-3-5z" stroke="currentColor" />
      <path
        d="M27 51a4 4 0 1 1 8 0c0 3.2-4 6.5-4 6.5S27 54.2 27 51z"
        stroke={MARK}
        fill={MARK}
        fillOpacity="0.18"
      />
      <path d="M10 70h42" stroke={ACCENT} strokeOpacity="0.6" />
      <path d="M10 67v6M31 67v6M52 67v6" stroke={ACCENT} strokeOpacity="0.6" />

      {/* messaging channel: free-text bubbles, no structured endpoint */}
      <path d="M62 20h34v16H74l-6 6v-6h-6z" stroke={ACCENT} />
      <path d="M68 26h20M68 31h13" stroke={ACCENT} strokeOpacity="0.65" />
      <path d="M96 46H66v16h20l6 6v-6h4z" stroke="currentColor" />
      <path d="M72 52h18M72 57h11" stroke="currentColor" strokeOpacity="0.55" />
      <path d="M70 74h20" stroke={MARK} strokeDasharray="3 2" />
      <path d="M70 71v6M90 71v6" stroke={MARK} />

      <Connector d="M52 40h8" node={[60, 40]} />
      <Connector d="M96 54h10" node={[106, 54]} dashed />

      {/* digital invoice carrier: slip with an abstract carrier code block */}
      <path d="M112 16h36v62l-5 4-5-4-5 4-5-4-5 4-5-4-5 4z" stroke="currentColor" />
      <g stroke="currentColor" strokeOpacity="0.5">
        <path d="M117 24h26M117 30h18" />
      </g>
      <rect x="117" y="38" width="26" height="16" stroke={MARK} />
      <g stroke={MARK}>
        <path d="M120 41v10M123 41v10M127 41v10M132 41v10M134 41v10M139 41v10" />
      </g>
      <path d="M117 62h26M117 68h16" stroke={ACCENT} strokeOpacity="0.7" />
    </g>
  );
}

/* --------------------------------------------------------------------- */
/* TH: national QR device handoff, soi/landmark address, script vs romanisation */

function Thailand() {
  return (
    <g>
      {/* payment intent prepared, then scanned on the user's own device */}
      <rect x="10" y="20" width="28" height="28" stroke={ACCENT} />
      <path d="M10 26V20h6M32 20h6v6M38 42v6h-6M16 48h-6v-6" stroke={ACCENT} />
      <g stroke="currentColor" strokeOpacity="0.7">
        <path d="M16 27h5v5h-5zM27 27h5v5h-5zM16 37h5v5h-5zM27 38h4v4h-4z" />
      </g>
      <rect x="18" y="58" width="20" height="30" rx="3" stroke="currentColor" />
      <path d="M18 64h20" stroke="currentColor" strokeOpacity="0.5" />
      <path d="M25 82h6" stroke="currentColor" strokeOpacity="0.5" />
      <Connector d="M28 48v8" node={[28, 53]} marked />

      {/* main road, branching lane, landmark, relative hop to the door, note */}
      <path d="M58 24h44" stroke="currentColor" />
      <path d="M58 30h44" stroke="currentColor" strokeOpacity="0.4" />
      <path d="M74 30v26" stroke="currentColor" />
      <path d="M80 30v26" stroke="currentColor" strokeOpacity="0.4" />
      <path d="M88 34l5 8h-10z" stroke={ACCENT} />
      <path d="M88 42v6" stroke={ACCENT} strokeOpacity="0.6" />
      <path d="M84 52h14" stroke={MARK} strokeDasharray="3 2" />
      <path d="M84 49v6M98 49v6" stroke={MARK} />
      <rect x="94" y="58" width="8" height="8" stroke={MARK} fill={MARK} fillOpacity="0.18" />
      <rect x="58" y="66" width="44" height="18" rx="1" stroke="currentColor" strokeDasharray="4 2" />
      <path d="M63 72h30M63 77h22" stroke="currentColor" strokeOpacity="0.55" />

      {/* the same venue as an unsegmented script line and as a romanisation */}
      <rect x="110" y="20" width="40" height="12" rx="1" stroke="currentColor" />
      <path d="M114 26h4" stroke="currentColor" strokeOpacity="0.6" />
      <path d="M145 22l4 4-4 4" stroke={ACCENT} />
      <path
        d="M112 46c0-5 5-5 5 0s5 5 5 0 4-6 6-2 0 6 3 6M130 46c2-6 6-4 6 0s4 4 5 0 3-4 5 1"
        stroke={ACCENT}
      />
      <path d="M112 38v4M120 38v4M136 38v4" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M118 54v8M132 54v8" stroke={MARK} strokeDasharray="2 2" />
      <g stroke="currentColor" strokeOpacity="0.7">
        <path d="M112 68h6M121 68h9M133 68h8M112 74h11M126 74h15" />
      </g>
      <path d="M110 82h40" stroke={MARK} />
      <path d="M110 79v6M150 79v6" stroke={MARK} />
    </g>
  );
}

/* --------------------------------------------------------------------- */
/* AE: identity app + OTP, public web vs signed-in app divergence, tower address */

function Emirates() {
  return (
    <g>
      {/* identity app on the user's device, with the code they hold */}
      <rect x="12" y="18" width="26" height="42" rx="3" stroke="currentColor" />
      <path d="M12 25h26M12 54h26" stroke="currentColor" strokeOpacity="0.5" />
      <path d="M25 30l8 3v6c0 5-5 8-8 9-3-1-8-4-8-9v-6z" stroke={ACCENT} />
      <path d="M22 39.5l2.5 2.5 4.5-5" stroke={ACCENT} />
      <g stroke={MARK}>
        <rect x="12" y="68" width="6" height="8" rx="1" />
        <rect x="19" y="68" width="6" height="8" rx="1" />
        <rect x="26" y="68" width="6" height="8" rx="1" />
        <rect x="33" y="68" width="6" height="8" rx="1" />
      </g>
      <Connector d="M25 60v6" node={[25, 63]} marked />

      {/* two inventories over the same query: one row exists on only one side */}
      <path d="M52 20h22" stroke={ACCENT} />
      <path d="M52 20v54" stroke="currentColor" strokeOpacity="0.4" />
      <g stroke="currentColor" strokeOpacity="0.6">
        <rect x="52" y="26" width="22" height="7" />
        <rect x="52" y="37" width="22" height="7" />
        <rect x="52" y="48" width="22" height="7" />
      </g>
      <rect x="52" y="59" width="22" height="7" stroke="currentColor" strokeDasharray="3 2" strokeOpacity="0.5" />

      <path d="M80 20h22" stroke={ACCENT} />
      <path d="M102 20v54" stroke="currentColor" strokeOpacity="0.4" />
      <g stroke="currentColor" strokeOpacity="0.6">
        <rect x="80" y="26" width="22" height="7" />
        <rect x="80" y="37" width="22" height="7" />
        <rect x="80" y="48" width="22" height="7" />
      </g>
      <rect x="80" y="59" width="22" height="7" stroke={MARK} fill={MARK} fillOpacity="0.16" />
      <path d="M74 62.5h6" stroke={MARK} strokeDasharray="2 2" />
      <Connector d="M77 14v6m0 0-3 6m3-6 3 6" node={[77, 14]} />

      {/* tower with the unit, low community blocks, access note tag */}
      <rect x="112" y="14" width="18" height="56" stroke="currentColor" />
      <g stroke="currentColor" strokeOpacity="0.5">
        <path d="M112 22h18M112 30h18M112 38h18M112 46h18M112 54h18M112 62h18M121 14v56" />
      </g>
      <rect x="121" y="38" width="9" height="8" fill={MARK} stroke={MARK} />
      <g stroke="currentColor" strokeOpacity="0.7">
        <rect x="134" y="52" width="7" height="18" />
        <rect x="143" y="58" width="7" height="12" />
      </g>
      <path d="M134 76h16v8h-16z" stroke={ACCENT} />
      <path d="M138 76v8M142 76v8M146 76v8" stroke={ACCENT} strokeOpacity="0.6" />
      <Connector d="M130 42h6" node={[136, 42]} dashed marked />
    </g>
  );
}

const VIGNETTES: Record<CountryCode, () => JSX.Element> = {
  kr: Korea,
  jp: Japan,
  sg: Singapore,
  tw: Taiwan,
  th: Thailand,
  ae: Emirates,
};

export function CountryIntegrationIllustration({
  code,
  size = "card",
  className,
}: {
  code: CountryCode;
  size?: "card" | "detail";
  className?: string;
}) {
  const Vignette = VIGNETTES[code];

  return (
    <svg
      viewBox={VIEW_BOX}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      data-country-illustration={code}
      data-illustration-size={size}
      className={[
        "mica-country-illustration",
        `mica-country-illustration--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      >
        <Plate />
        <Vignette />
      </g>
    </svg>
  );
}
