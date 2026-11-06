// App icons: original artwork drawn as SVG, in a modern desktop-icon style.
//
// Any icon can be swapped for your own image: add the file to public/icons/ and
// point to it in `customIcons` in src/data/content.ts.
import { useId, type ReactNode } from "react";
import { customIcons, type IconName } from "@/data/content";

/** Renders a custom image for `name` if one is configured, otherwise the drawn icon. */
function Slot({ name, children }: { name: IconName; children: ReactNode }) {
  const src = customIcons[name];
  if (!src) return <>{children}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" draggable={false} className="size-full object-contain" />;
}

/** Unique, URL-safe id prefix so several copies of an icon can share a page. */
function useIds() {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (name: string) => `${raw}-${name}`;
}

const TILE = { x: 4, y: 4, w: 92, h: 92, r: 21 };

/** The rounded-square base shared by app icons: gradient, gloss, edge and shadow. */
function Tile({ from, to, children, edge = "rgba(0,0,0,0.18)" }: { from: string; to: string; children?: ReactNode; edge?: string }) {
  const id = useIds();
  return (
    <svg viewBox="0 0 100 100" className="size-full overflow-visible drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.3)]">
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("clip")}>
          <rect x={TILE.x} y={TILE.y} width={TILE.w} height={TILE.h} rx={TILE.r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id("clip")})`}>
        <rect x="0" y="0" width="100" height="100" fill={`url(#${id("bg")})`} />
        {children}
        <rect x="0" y="0" width="100" height="100" fill={`url(#${id("gloss")})`} />
      </g>
      <rect x={TILE.x + 0.25} y={TILE.y + 0.25} width={TILE.w - 0.5} height={TILE.h - 0.5} rx={TILE.r} fill="none" stroke={edge} strokeWidth="0.5" />
      <rect x={TILE.x + 0.9} y={TILE.y + 0.9} width={TILE.w - 1.8} height={TILE.h - 1.8} rx={TILE.r - 0.8} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.6" />
    </svg>
  );
}

const SPARKLE = "M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10 Z";

function Shadow({ id, dy = 1.2, blur = 1.4, opacity = 0.28 }: { id: string; dy?: number; blur?: number; opacity?: number }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy={dy} stdDeviation={blur} floodColor="#000" floodOpacity={opacity} />
    </filter>
  );
}

/** Projects: a folder with project cards tucked inside. */
export function FinderIcon() {
  const id = useIds();
  return (
    <Slot name="finder">
      <Tile from="#6fcbff" to="#1460e0">
        <defs>
          <linearGradient id={id("front")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#d3e9ff" />
          </linearGradient>
          <Shadow id={id("sh")} />
        </defs>
        <path d="M17 36 Q17 31 22 31 H38 Q41 31 43 34 L45 37 H78 Q83 37 83 42 V80 H17 Z" fill="#a9d4ff" />
        <g filter={`url(#${id("sh")})`}>
          {[
            { x: 25, r: -11, c: "#ffb547" },
            { x: 39, r: 3, c: "#53d07a" },
            { x: 53, r: 13, c: "#b48cff" },
          ].map((card) => (
            <g key={card.c} transform={`rotate(${card.r} ${card.x + 11} 52)`}>
              <rect x={card.x} y="25" width="22" height="30" rx="3" fill={card.c} />
              <rect x={card.x + 4} y="30" width="14" height="2.4" rx="1.2" fill="#fff" opacity="0.8" />
              <rect x={card.x + 4} y="35" width="10" height="2.4" rx="1.2" fill="#fff" opacity="0.6" />
            </g>
          ))}
        </g>
        <g filter={`url(#${id("sh")})`}>
          <rect x="14" y="44" width="72" height="40" rx="6" fill={`url(#${id("front")})`} />
        </g>
        <rect x="14.5" y="44.5" width="71" height="1.2" rx="0.6" fill="#fff" />
        <path d={SPARKLE} transform="translate(50 64) scale(0.95)" fill="#1f6fe6" />
      </Tile>
    </Slot>
  );
}

/** Notes: a ruled notepad with a pencil. */
export function NotesIcon() {
  const id = useIds();
  return (
    <Slot name="notes">
      <Tile from="#ffffff" to="#ececec">
        <defs>
          <linearGradient id={id("band")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe066" />
            <stop offset="1" stopColor="#f4bf1d" />
          </linearGradient>
          <Shadow id={id("sh")} dy={1.5} blur={1.6} />
        </defs>
        <rect x="0" y="0" width="100" height="31" fill={`url(#${id("band")})`} />
        <rect x="0" y="30" width="100" height="1.6" fill="#d39d06" opacity="0.7" />
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={12 + i * 7.6} cy="35" r="1" fill="#d9d9d9" />
        ))}
        {[48, 60, 72, 84].map((y) => (
          <rect key={y} x="13" y={y} width="74" height="1.3" fill="#dcdcdc" />
        ))}
        <rect x="15" y="43.5" width="34" height="3" rx="1.5" fill="#b9b9b9" />
        <rect x="15" y="55.5" width="46" height="3" rx="1.5" fill="#c9c9c9" />
        <g transform="rotate(45 70 70)" filter={`url(#${id("sh")})`}>
          <rect x="66" y="40" width="9" height="34" fill="#ffa93a" />
          <rect x="66" y="40" width="3" height="34" fill="#ffc46b" />
          <rect x="66" y="35" width="9" height="5.5" fill="#c9ced6" />
          <rect x="66" y="30" width="9" height="5.5" rx="2" fill="#ff8aa0" />
          <path d="M66 74 L70.5 85 L75 74 Z" fill="#f2d3a6" />
          <path d="M69 81.5 L70.5 85 L72 81.5 Z" fill="#3a3a3a" />
        </g>
      </Tile>
    </Slot>
  );
}

/** Mail: an envelope closed with a sparkle seal. */
export function MailIcon() {
  const id = useIds();
  return (
    <Slot name="mail">
      <Tile from="#6ad2ff" to="#0b66f2">
        <defs>
          <linearGradient id={id("paper")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e3ecf7" />
          </linearGradient>
          <linearGradient id={id("flap")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f9fbff" />
            <stop offset="1" stopColor="#d6e3f3" />
          </linearGradient>
          <radialGradient id={id("seal")} cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#ff8aa6" />
            <stop offset="1" stopColor="#e3335f" />
          </radialGradient>
          <Shadow id={id("sh")} dy={1.6} blur={1.8} opacity={0.3} />
        </defs>
        <g filter={`url(#${id("sh")})`}>
          <rect x="15" y="28" width="70" height="46" rx="6" fill={`url(#${id("paper")})`} />
        </g>
        <path d="M17 72 L42 52 M83 72 L58 52" stroke="#c5d4e6" strokeWidth="1.2" strokeLinecap="round" />
        <g filter={`url(#${id("sh")})`}>
          <path d="M16.5 31 Q16 29 18.5 29 H81.5 Q84 29 83.5 31 L53 55 Q50 57.5 47 55 Z" fill={`url(#${id("flap")})`} />
        </g>
        <circle cx="50" cy="54" r="8" fill={`url(#${id("seal")})`} stroke="#c22650" strokeWidth="0.6" />
        <path d={SPARKLE} transform="translate(50 54) scale(0.45)" fill="#fff" />
      </Tile>
    </Slot>
  );
}

/** Résumé: a printed page in front of a photo. */
export function PreviewIcon() {
  const id = useIds();
  return (
    <Slot name="preview">
      <Tile from="#f7f7f9" to="#cfd0d8">
        <defs>
          <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7cc8ff" />
            <stop offset="1" stopColor="#c9a8ff" />
          </linearGradient>
          <Shadow id={id("sh")} dy={1.5} blur={1.8} opacity={0.25} />
        </defs>
        <g transform="rotate(-11 36 50)" filter={`url(#${id("sh")})`}>
          <rect x="14" y="22" width="44" height="52" rx="3" fill="#fff" />
          <rect x="18" y="26" width="36" height="34" rx="1.5" fill={`url(#${id("sky")})`} />
          <circle cx="45" cy="34" r="4.5" fill="#ffd66b" />
          <path d="M18 60 L30 44 L38 53 L44 47 L54 60 Z" fill="#5767d4" />
          <path d="M18 60 L26 52 L34 60 Z" fill="#7c8be6" />
        </g>
        <g transform="rotate(7 62 52)" filter={`url(#${id("sh")})`}>
          <rect x="40" y="20" width="44" height="60" rx="3" fill="#fff" />
          <rect x="46" y="27" width="18" height="4" rx="1.5" fill="#2f6ee6" />
          <rect x="46" y="34" width="26" height="2" rx="1" fill="#c4c4cc" />
          {[42, 47, 52, 60, 65, 70].map((y, i) => (
            <rect key={y} x="46" y={y} width={i % 3 === 2 ? 20 : 32} height="2" rx="1" fill="#dadae0" />
          ))}
          <rect x="46" y="56" width="12" height="2.4" rx="1" fill="#8e8e98" />
        </g>
      </Tile>
    </Slot>
  );
}

/** Terminal: a dark screen with a glowing prompt. */
export function TerminalIcon() {
  const id = useIds();
  return (
    <Slot name="terminal">
      <Tile from="#5d5e65" to="#1e1f23">
        <defs>
          <radialGradient id={id("glow")} cx="0.3" cy="0.4" r="0.8">
            <stop offset="0" stopColor="#3cff9e" stopOpacity="0.16" />
            <stop offset="1" stopColor="#3cff9e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="11" y="12" width="78" height="72" rx="11" fill="#111214" stroke="#fff" strokeOpacity="0.1" strokeWidth="0.8" />
        <rect x="11" y="12" width="78" height="72" rx="11" fill={`url(#${id("glow")})`} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={20 + i * 5.5} cy="20" r="1.7" fill="#fff" opacity="0.18" />
        ))}
        <path d="M21 36 L31 44 L21 52" fill="none" stroke="#bfffd9" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="35" y="49" width="15" height="4.2" rx="2.1" fill="#bfffd9" />
        <rect x="21" y="62" width="40" height="2.6" rx="1.3" fill="#fff" opacity="0.14" />
        <rect x="21" y="69" width="28" height="2.6" rx="1.3" fill="#fff" opacity="0.1" />
      </Tile>
    </Slot>
  );
}

/** Code (links to GitHub): angle brackets in a gradient. */
export function GitHubIcon() {
  const id = useIds();
  return (
    <Slot name="github">
      <Tile from="#41464f" to="#14161a">
        <defs>
          <linearGradient id={id("ink")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7cd0ff" />
            <stop offset="1" stopColor="#c58af9" />
          </linearGradient>
        </defs>
        <g fill="none" stroke={`url(#${id("ink")})`} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M37 33 L21 50 L37 67" />
          <path d="M63 33 L79 50 L63 67" />
          <path d="M55 27 L45 73" />
        </g>
      </Tile>
    </Slot>
  );
}

/** Work (links to LinkedIn): a briefcase. */
export function LinkedInIcon() {
  const id = useIds();
  return (
    <Slot name="linkedin">
      <Tile from="#43a6f5" to="#0a52a4">
        <defs>
          <linearGradient id={id("case")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#d4e5f8" />
          </linearGradient>
          <Shadow id={id("sh")} dy={1.6} blur={1.6} opacity={0.3} />
        </defs>
        <g filter={`url(#${id("sh")})`}>
          <path d="M38 37 V31 Q38 26 43 26 H57 Q62 26 62 31 V37" fill="none" stroke="#e8f1fb" strokeWidth="4.5" />
          <rect x="18" y="36" width="64" height="42" rx="8" fill={`url(#${id("case")})`} />
        </g>
        <rect x="18" y="53" width="64" height="1.6" fill="#a9c3e0" />
        <rect x="44" y="49" width="12" height="10" rx="2.5" fill="#0d5fb8" />
      </Tile>
    </Slot>
  );
}

/** Trash: a frosted bin. */
export function TrashIcon() {
  const id = useIds();
  return (
    <Slot name="trash">
      <svg viewBox="0 0 100 100" className="size-full overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]">
        <defs>
          <linearGradient id={id("body")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e9ebef" stopOpacity="0.92" />
            <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#c9cdd5" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id={id("rim")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4f5f8" />
            <stop offset="1" stopColor="#aeb3bd" />
          </linearGradient>
        </defs>
        <path d="M21 22 L28 89 Q29 95 35 95 H65 Q71 95 72 89 L79 22 Z" fill={`url(#${id("body")})`} stroke="#9ea4ae" strokeWidth="0.8" />
        {[33, 41.5, 50, 58.5, 67].map((x) => (
          <path key={x} d={`M${x} 30 L${50 + (x - 50) * 0.82} 88`} stroke="#a7acb6" strokeWidth="1.1" strokeLinecap="round" />
        ))}
        <path d="M27 28 L32 86" stroke="#fff" strokeOpacity="0.8" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="50" cy="22" rx="30" ry="6.5" fill={`url(#${id("rim")})`} stroke="#979ca6" strokeWidth="0.8" />
        <ellipse cx="50" cy="22.6" rx="25.5" ry="4.2" fill="#8e939c" opacity="0.55" />
      </svg>
    </Slot>
  );
}

/** About This Site. */
export function AboutIcon() {
  return (
    <Tile from="#8b7bff" to="#ff8a65">
      <path d={SPARKLE} transform="translate(50 50) scale(2.6)" fill="#fff" />
    </Tile>
  );
}

/** A desktop folder icon, tinted with any colour. */
export function FolderIcon({ color = "#5aa9f6" }: { color?: string }) {
  const id = useIds();
  return (
    <svg viewBox="0 0 64 52" className="size-full overflow-visible drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.25)]">
      <defs>
        <linearGradient id={id("hi")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M2 8 Q2 3 7 3 H22 Q25 3 27 6 L29 9 H57 Q62 9 62 14 V22 H2 Z" fill={color} />
      <path d="M2 8 Q2 3 7 3 H22 Q25 3 27 6 L29 9 H57 Q62 9 62 14 V22 H2 Z" fill="#000" opacity="0.14" />
      <rect x="5" y="9" width="54" height="10" rx="1.5" fill="#fff" opacity="0.9" />
      <path d="M2 16 Q2 13 5 13 H59 Q62 13 62 16 V46 Q62 50 58 50 H6 Q2 50 2 46 Z" fill={color} />
      <path d="M2 16 Q2 13 5 13 H59 Q62 13 62 16 V46 Q62 50 58 50 H6 Q2 50 2 46 Z" fill={`url(#${id("hi")})`} />
      <rect x="3" y="13.6" width="58" height="0.9" rx="0.45" fill="#fff" opacity="0.55" />
    </svg>
  );
}

/** A paper document icon with a folded corner and a type label. */
export function DocumentIcon({ label, accent = "#e5484d" }: { label: string; accent?: string }) {
  const id = useIds();
  return (
    <svg viewBox="0 0 52 64" className="size-full overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
      <defs>
        <linearGradient id={id("page")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f1f1f4" />
        </linearGradient>
      </defs>
      <path d="M4 4 Q4 1 7 1 H34 L48 15 V60 Q48 63 45 63 H7 Q4 63 4 60 Z" fill={`url(#${id("page")})`} stroke="#d4d4d8" strokeWidth="0.8" />
      <path d="M34 1 V12 Q34 15 37 15 H48 Z" fill="#e1e1e6" stroke="#d4d4d8" strokeWidth="0.6" />
      {[22, 27, 32, 37].map((y) => (
        <rect key={y} x="10" y={y} width={y === 37 ? 18 : 30} height="2" rx="1" fill="#d4d4d8" />
      ))}
      <rect x="10" y="46" width="32" height="11" rx="3" fill={accent} />
      <text x="26" y="54" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        {label}
      </text>
    </svg>
  );
}
