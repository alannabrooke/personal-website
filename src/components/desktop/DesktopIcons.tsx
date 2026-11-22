"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { desktopPhotos } from "@/data/content";
import { cx } from "@/lib/cx";
import { useDesktop } from "./DesktopContext";
import { DesktopFolderIcon, DocumentIcon } from "./icons";
import { DOCK_SPACE, MENU_BAR_H, type AppId } from "./types";

type Entry = { key: string; label: string; icon: ReactNode; app: AppId; payload?: string };

const ENTRIES: Entry[] = [
  { key: "projects", label: "Projects", icon: <DesktopFolderIcon />, app: "finder" },
  { key: "resume", label: "Résumé.pdf", icon: <DocumentIcon label="PDF" />, app: "preview" },
  { key: "about", label: "About Me.txt", icon: <DocumentIcon label="TXT" accent="#71717a" />, app: "notes", payload: "about" },
  ...desktopPhotos.map((photo): Entry => ({
    key: photo.id,
    label: photo.title,
    app: "photos",
    payload: photo.id,
    icon: (
      <span className="block h-[54px] w-[42px] overflow-hidden rounded-[3px] border-2 border-white bg-white shadow-[0_2px_6px_rgba(0,0,0,.42)]">
        <Image src={photo.src} alt="" width={38} height={50} unoptimized draggable={false} className="size-full object-cover" />
      </span>
    ),
  })),
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
    <div
      style={{ top: MENU_BAR_H + 12, bottom: DOCK_SPACE }}
      className="pointer-events-none absolute right-2 flex flex-col flex-wrap-reverse content-start items-center gap-x-2 gap-y-3"
    >
      {ENTRIES.map((e, index) => {
        const isSel = selected === e.key;
        const open = () => {
          onSelect(null);
          openApp(e.app, e.payload);
        };
        return (
          <button
            key={e.key}
            type="button"
            style={{ animationDelay: `${100 + index * 46}ms` }}
            onPointerDown={(ev) => {
              ev.stopPropagation();
              onSelect(e.key);
            }}
            onClick={isMobile ? open : undefined}
            onDoubleClick={isMobile ? undefined : open}
            onKeyDown={(ev) => {
              if (!isMobile && (ev.key === "Enter" || ev.key === " ")) {
                ev.preventDefault();
                open();
              }
            }}
            className="desktop-file pointer-events-auto flex w-[96px] shrink-0 flex-col items-center gap-1 rounded-md focus-visible:outline-2 focus-visible:outline-white"
          >
            <span className={cx("flex size-[66px] items-center justify-center rounded-[6px] p-1.5", isSel && "bg-black/25 ring-1 ring-white/20")}>
              {e.icon}
            </span>
            <span
              className={cx(
                "max-w-full truncate rounded-[3px] px-1 text-[12px] font-medium leading-4 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]",
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
