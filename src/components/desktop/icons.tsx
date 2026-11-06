// Original app-icon artwork drawn with CSS/SVG, in the style of modern desktop icons.
import {
  Briefcase,
  Code2,
  FolderOpen,
  Mail,
  Sparkle,
} from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

function Tile({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={cx(
        "relative flex size-full items-center justify-center overflow-hidden rounded-[23%]",
        "shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_0_0_0.5px_rgba(0,0,0,0.15)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FinderIcon() {
  return (
    <Tile className="bg-gradient-to-b from-[#6ec3ff] to-[#1a6ff2]">
      <FolderOpen className="size-[58%] text-white drop-shadow" strokeWidth={1.8} />
    </Tile>
  );
}

export function NotesIcon() {
  return (
    <Tile className="flex-col justify-start bg-gradient-to-b from-white to-[#f2f2f2]">
      <div className="h-[28%] w-full bg-gradient-to-b from-[#ffe266] to-[#f7c933]" />
      <div className="mt-[8%] flex h-[52%] w-[72%] flex-col justify-around">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-px w-full bg-[#d9d9d9]" />
        ))}
      </div>
      <div className="absolute inset-x-0 top-[28%] h-[3%] bg-[repeating-linear-gradient(90deg,#c9a227_0_6%,transparent_6%_12%)] opacity-40" />
    </Tile>
  );
}

export function MailIcon() {
  return (
    <Tile className="bg-gradient-to-b from-[#58c5ff] to-[#1172f0]">
      <Mail className="size-[60%] text-white drop-shadow" strokeWidth={1.7} />
    </Tile>
  );
}

export function PreviewIcon() {
  return (
    <Tile className="bg-gradient-to-b from-[#f4f4f6] to-[#d8d8de]">
      <div className="absolute left-[22%] top-[16%] h-[66%] w-[50%] rotate-[-8deg] rounded-[6%] bg-white shadow-md ring-1 ring-black/5" />
      <div className="absolute left-[30%] top-[20%] flex h-[62%] w-[48%] rotate-[6deg] flex-col gap-[7%] rounded-[6%] bg-white p-[7%] shadow-md ring-1 ring-black/10">
        <div className="h-[34%] w-full rounded-[4px] bg-gradient-to-br from-[#7cc6ff] via-[#9b8cff] to-[#ff9a8b]" />
        <div className="h-[6%] w-full rounded bg-black/15" />
        <div className="h-[6%] w-3/4 rounded bg-black/15" />
        <div className="h-[6%] w-full rounded bg-black/15" />
      </div>
    </Tile>
  );
}

export function TerminalIcon() {
  return (
    <Tile className="bg-gradient-to-b from-[#4a4a4f] to-[#1d1d20]">
      <div className="absolute inset-[9%] rounded-[16%] bg-[#141416] ring-1 ring-white/10" />
      <svg viewBox="0 0 64 64" className="relative size-full">
        <text x="16" y="34" fontSize="17" fontWeight="700" fill="rgba(255,255,255,0.92)" fontFamily="ui-monospace, Menlo, monospace">
          &gt;_
        </text>
      </svg>
    </Tile>
  );
}

export function GitHubIcon() {
  return (
    <Tile className="bg-gradient-to-b from-[#3b3f46] to-[#16181c]">
      <Code2 className="size-[56%] text-white" strokeWidth={2} />
    </Tile>
  );
}

export function LinkedInIcon() {
  return (
    <Tile className="bg-gradient-to-b from-[#2f8fe0] to-[#0a5aa8]">
      <Briefcase className="size-[54%] text-white" strokeWidth={1.9} />
    </Tile>
  );
}

export function TrashIcon() {
  return (
    <div className="relative flex size-full items-end justify-center">
      <svg viewBox="0 0 64 64" className="size-full drop-shadow-md">
        <defs>
          <linearGradient id="trash-body" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#f4f5f7" stopOpacity="0.95" />
            <stop offset="1" stopColor="#c9ccd3" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="12" rx="21" ry="4.5" fill="#b9bdc6" />
        <path d="M11 12 L15.5 56 Q16 60 20 60 L44 60 Q48 60 48.5 56 L53 12 Z" fill="url(#trash-body)" stroke="#a3a8b2" strokeWidth="0.8" />
        {[20, 26, 32, 38, 44].map((x) => (
          <line key={x} x1={x} y1="17" x2={x + (x - 32) * 0.08} y2="55" stroke="#a9adb7" strokeWidth="1" />
        ))}
        <ellipse cx="32" cy="12" rx="21" ry="4.5" fill="none" stroke="#9ea3ad" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function AboutIcon() {
  return (
    <Tile className="bg-gradient-to-br from-[#7b6cff] via-[#c86dd7] to-[#ff8a65]">
      <Sparkle className="size-[52%] fill-white text-white" />
    </Tile>
  );
}

/** A desktop folder icon, tinted with any colour. */
export function FolderIcon({ color = "#5aa9f6" }: { color?: string }) {
  return (
    <svg viewBox="0 0 64 52" className="size-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
      <path d="M2 8 Q2 3 7 3 H22 Q25 3 27 6 L29 9 H57 Q62 9 62 14 V18 H2 Z" fill={color} style={{ filter: "brightness(0.88)" }} />
      <path d="M2 14 Q2 11 5 11 H59 Q62 11 62 14 V46 Q62 50 58 50 H6 Q2 50 2 46 Z" fill={color} />
      <path d="M2 14 Q2 11 5 11 H59 Q62 11 62 14 V16 H2 Z" fill="white" opacity="0.25" />
    </svg>
  );
}

/** A paper document icon with a folded corner and a type label. */
export function DocumentIcon({ label, accent = "#e5484d" }: { label: string; accent?: string }) {
  return (
    <svg viewBox="0 0 52 64" className="size-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
      <path d="M4 4 Q4 1 7 1 H34 L48 15 V60 Q48 63 45 63 H7 Q4 63 4 60 Z" fill="#fff" stroke="#d4d4d8" strokeWidth="0.8" />
      <path d="M34 1 V12 Q34 15 37 15 H48 Z" fill="#e4e4e7" />
      {[24, 29, 34, 39].map((y) => (
        <rect key={y} x="10" y={y} width={y === 39 ? 18 : 30} height="2" rx="1" fill="#d4d4d8" />
      ))}
      <rect x="10" y="47" width="32" height="10" rx="2.5" fill={accent} />
      <text x="26" y="54.6" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        {label}
      </text>
    </svg>
  );
}
