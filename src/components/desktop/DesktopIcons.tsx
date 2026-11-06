"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useDesktop } from "./DesktopContext";
import { DocumentIcon, FolderIcon } from "./icons";
import type { AppId } from "./types";

type Entry = { key: string; label: string; icon: ReactNode; app: AppId; payload?: string };

const ENTRIES: Entry[] = [
  { key: "projects", label: "Projects", icon: <FolderIcon />, app: "finder" },
  { key: "resume", label: "Résumé.pdf", icon: <DocumentIcon label="PDF" />, app: "preview" },
  { key: "about", label: "About Me.txt", icon: <DocumentIcon label="TXT" accent="#71717a" />, app: "notes", payload: "about" },
];

export function DesktopIcons({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  const { openApp, isMobile } = useDesktop();

  return (
    <div className="absolute right-3 top-9 flex flex-col items-center gap-3">
      {ENTRIES.map((e) => {
        const isSel = selected === e.key;
        const open = () => {
          onSelect(null);
          openApp(e.app, e.payload);
        };
        return (
          <button
            key={e.key}
            type="button"
            onPointerDown={(ev) => {
              ev.stopPropagation();
              onSelect(e.key);
            }}
            onClick={isMobile ? open : undefined}
            onDoubleClick={open}
            onKeyDown={(ev) => ev.key === "Enter" && open()}
            className="flex w-[88px] flex-col items-center gap-1 outline-none"
          >
            <span className={cx("flex size-[66px] items-center justify-center rounded-[6px] p-1.5", isSel && "bg-black/25 ring-1 ring-white/20")}>
              {e.icon}
            </span>
            <span
              className={cx(
                "max-w-full truncate rounded-[3px] px-1 text-[12px] font-medium leading-4 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]",
                isSel && "bg-[#2f6ee6] [text-shadow:none]",
              )}
            >
              {e.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
