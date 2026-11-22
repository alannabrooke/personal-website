import { useId, type ReactNode } from "react";
import { customIcons, type IconName } from "@/data/content";
import { cx } from "@/lib/cx";

/** An image in public/icons can replace any bundled Dock icon. */
export function DockIcon({ name }: { name: IconName }) {
  const override = customIcons[name];
  const extension = name === "terminal" || name === "photos" ? "svg" : "webp";

  return (
    <span aria-hidden="true" className={cx("grid size-full place-items-center", !override && name !== "trash" && "dock-icon-tile")}>
      {/* Bundled Dock assets are small and served directly. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={override || `/icons/dock/${name}.${extension}`}
        alt=""
        draggable={false}
        className={cx(
          "block object-contain",
          override
            ? "size-full"
            : name === "trash"
              ? "size-[94%] drop-shadow-[0_1.5px_2px_rgba(5,16,33,.28)]"
              : "size-[92%] rounded-[23%] shadow-[0_1.5px_2px_rgba(5,16,33,.28)]",
        )}
      />
    </span>
  );
}

function useIds() {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (name: string) => `${raw}-${name}`;
}

const TILE = "M50 4C70 4 81 4 89 12C96 19 96 31 96 50S96 81 89 88C81 96 70 96 50 96S19 96 11 88C4 81 4 69 4 50S4 19 11 12C19 4 30 4 50 4Z";
const SPARKLE = "M0-10C1-3 3-1 10 0C3 1 1 3 0 10C-1 3-3 1-10 0C-3-1-1-3 0-10Z";

function Surface({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <linearGradient id={id} x2="0.2" y2="1">
      <stop stopColor={top} />
      <stop offset="1" stopColor={bottom} />
    </linearGradient>
  );
}

function Tile({ from, to, children }: { from: string; to: string; children: ReactNode }) {
  const id = useIds();
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className="size-full overflow-visible drop-shadow-[0_2px_2.5px_rgba(5,16,33,0.35)]">
      <defs>
        <Surface id={id("base")} top={from} bottom={to} />
        <radialGradient id={id("light")} cx="0.25" cy="0.03" r="0.78">
          <stop stopColor="#fff" stopOpacity=".16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("rim")} x2="0" y2="1">
          <stop stopColor="#fff" stopOpacity=".65" />
          <stop offset=".42" stopColor="#fff" stopOpacity=".12" />
          <stop offset=".8" stopColor="#fff" stopOpacity=".04" />
          <stop offset="1" stopColor="#fff" stopOpacity=".32" />
        </linearGradient>
      </defs>
      <path d={TILE} fill={`url(#${id("base")})`} />
      <path d={TILE} fill={`url(#${id("light")})`} />
      {children}
      <path d={TILE} fill="none" stroke={`url(#${id("rim")})`} strokeWidth="1.15" />
    </svg>
  );
}

export function FinderIcon() {
  return <DockIcon name="finder" />;
}

export function NotesIcon() {
  return <DockIcon name="notes" />;
}

export function MailIcon() {
  return <DockIcon name="mail" />;
}

export function PreviewIcon() {
  return <DockIcon name="preview" />;
}

export function PhotosIcon() {
  return <DockIcon name="photos" />;
}

export function TerminalIcon() {
  return <DockIcon name="terminal" />;
}

export function GitHubIcon() {
  return <DockIcon name="github" />;
}

export function LinkedInIcon() {
  return <DockIcon name="linkedin" />;
}

export function TrashIcon() {
  return <DockIcon name="trash" />;
}

export function AboutIcon() {
  return (
    <Tile from="#a59aff" to="#a964ae">
      <path d={SPARKLE} transform="translate(51 52) scale(3.25)" fill="#673d90" opacity=".34" />
      <path d={SPARKLE} transform="translate(50 49) scale(3.25)" fill="#fff7ff" />
      <path d={SPARKLE} transform="translate(50 48) scale(2.2)" fill="#ddd0ff" opacity=".47" />
    </Tile>
  );
}

/** A tinted folder used in Finder. */
export function FolderIcon({ color = "#5aa9f6" }: { color?: string }) {
  const id = useIds();
  const front = "M2 19Q2 14 7 14H57Q62 14 62 19V43Q62 49 56 49H8Q2 49 2 43Z";
  return (
    <svg aria-hidden="true" viewBox="0 0 64 52" className="size-full overflow-visible drop-shadow-[0_1px_2px_rgba(6,20,39,0.34)]">
      <defs>
        <linearGradient id={id("glaze")} x2=".23" y2="1">
          <stop stopColor="#fff" stopOpacity=".45" />
          <stop offset=".28" stopColor="#fff" stopOpacity=".12" />
          <stop offset="1" stopColor="#173d79" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <path d="M4 9Q4 3 10 3H23Q26 3 28 6L30 9H54Q60 9 60 15V36H4Z" fill={color} stroke="#f2fbff" strokeOpacity=".52" strokeWidth=".9" />
      <path d="M4 9Q4 3 10 3H23Q26 3 28 6L30 9H54Q60 9 60 15V36H4Z" fill="#163c79" fillOpacity=".19" />
      <rect x="7" y="11" width="50" height="16" rx="2.4" fill="#f1faff" fillOpacity=".9" />
      <path d={front} fill={color} />
      <path d={front} fill={`url(#${id("glaze")})`} stroke="#edf9ff" strokeOpacity=".74" strokeWidth="1" />
      <path d="M7 16H57" stroke="#fcffff" strokeOpacity=".59" strokeWidth=".9" strokeLinecap="round" />
      <path d="M7 46Q8 47 12 47H52Q56 47 57 46" fill="none" stroke="#edf9ff" strokeOpacity=".37" strokeWidth=".8" />
    </svg>
  );
}

export function DesktopFolderIcon() {
  const id = useIds();
  const back = "M2 8 Q2 3 7 3 H22 Q25 3 27 6 L29 9 H57 Q62 9 62 14 V22 H2 Z";
  const front = "M2 16 Q2 13 5 13 H59 Q62 13 62 16 V46 Q62 50 58 50 H6 Q2 50 2 46 Z";
  return (
    <svg aria-hidden="true" viewBox="0 0 64 52" className="size-full overflow-visible drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.25)]">
      <defs>
        <linearGradient id={id("hi")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={back} fill="#5aa9f6" />
      <path d={back} fill="#000" opacity="0.14" />
      <rect x="5" y="9" width="54" height="10" rx="1.5" fill="#fff" opacity="0.9" />
      <path d={front} fill="#5aa9f6" />
      <path d={front} fill={`url(#${id("hi")})`} />
      <rect x="3" y="13.6" width="58" height="0.9" rx="0.45" fill="#fff" opacity="0.55" />
    </svg>
  );
}

/** A desktop document with a folded corner and a file type. */
export function DocumentIcon({ label, accent = "#e5484d" }: { label: string; accent?: string }) {
  const id = useIds();
  return (
    <svg aria-hidden="true" viewBox="0 0 52 64" className="size-full overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
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
