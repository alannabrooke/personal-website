"use client";

import { Search, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import type { AppProps } from "@/components/desktop/apps";
import { notes } from "@/data/content";
import { cx } from "@/lib/cx";
import { ToolButton, Toolbar } from "./ui";

export function Notes({ payload }: AppProps) {
  const { isMobile } = useDesktop();
  const [selected, setSelected] = useState(payload ?? notes[0].id);
  const [lastPayload, setLastPayload] = useState(payload);
  const [showList, setShowList] = useState(false);

  // Opening a specific note from elsewhere (desktop icon, Finder) switches to it.
  if (payload !== lastPayload) {
    setLastPayload(payload);
    if (payload) setSelected(payload);
  }

  const note = notes.find((n) => n.id === selected) ?? notes[0];
  const listVisible = !isMobile || showList;

  return (
    <div className="flex h-full">
      {listVisible && (
        <aside
          className={cx(
            "flex shrink-0 flex-col border-r border-black/10 bg-[#f7f6f3]",
            isMobile ? "absolute inset-0 z-10 w-full" : "w-[250px]",
          )}
        >
          <Toolbar inset className="justify-end">
            <span className="mr-auto text-[13px] font-semibold text-black/50">{notes.length} notes</span>
          </Toolbar>
          <ul className="flex-1 overflow-y-auto px-2.5 pb-3">
            {notes.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(n.id);
                    setShowList(false);
                  }}
                  className={cx(
                    "mb-0.5 w-full rounded-md px-3 py-2 text-left",
                    n.id === note.id ? "bg-[#ffd95c]" : "hover:bg-black/[0.04]",
                  )}
                >
                  <div className="truncate text-[13px] font-semibold text-black/85">{n.title}</div>
                  <div className="truncate text-[12px] text-black/50">
                    <span className="text-black/70">{n.date}</span>&nbsp;&nbsp;{n.body[0]}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <Toolbar inset={isMobile} className="justify-end text-black/50">
          {isMobile && (
            <button type="button" onClick={() => setShowList(true)} className="mr-auto text-[13px] font-medium text-[#c79a00]">
              ‹ Notes
            </button>
          )}
          <ToolButton label="Delete (disabled)" disabled>
            <Trash2 className="size-4" />
          </ToolButton>
          <ToolButton label="New note (disabled)" disabled>
            <SquarePen className="size-4" />
          </ToolButton>
          <ToolButton label="Search" onClick={() => setShowList(true)} className={isMobile ? "" : "hidden"}>
            <Search className="size-4" />
          </ToolButton>
        </Toolbar>
        <article className="min-h-0 flex-1 select-text overflow-y-auto px-10 pb-10 max-sm:px-6">
          <p className="mb-4 text-center text-[11px] text-black/40">{note.date}</p>
          <h1 className="mb-3 text-[24px] font-bold leading-tight text-black/90">{note.title}</h1>
          <div className="space-y-3 text-[14px] leading-relaxed text-black/80">
            {note.body.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
