"use client";

import { AppWindow, FileText, Folder, Search } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { notes, projects } from "@/data/content";
import { cx } from "@/lib/cx";
import { useDesktop } from "./DesktopContext";
import type { AppId } from "./types";

type Result = {
  title: string;
  kind: "App" | "Note" | "Project";
  app: AppId;
  payload?: string;
  keywords?: string;
};

const RESULTS: Result[] = [
  { title: "Finder", kind: "App", app: "finder", keywords: "files folders projects" },
  { title: "Notes", kind: "App", app: "notes" },
  { title: "Mail", kind: "App", app: "mail", keywords: "email contact" },
  { title: "Résumé.pdf", kind: "App", app: "preview", keywords: "preview resume" },
  { title: "Photos", kind: "App", app: "photos", keywords: "images photo library wallpaper" },
  { title: "Terminal", kind: "App", app: "terminal", keywords: "shell commands" },
  { title: "Trash", kind: "App", app: "trash" },
  ...projects.map((project): Result => ({
    title: project.name, kind: "Project", app: "finder", payload: project.id,
    keywords: `${project.role} ${project.tags.join(" ")}`,
  })),
  ...notes.map((note): Result => ({
    title: note.title, kind: "Note", app: "notes", payload: note.id, keywords: note.body.join(" "),
  })),
];

export function DesktopSearch({ onDone }: { onDone: () => void }) {
  const { openApp } = useDesktop();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const focusField = useCallback((field: HTMLInputElement | null) => { field?.focus(); }, []);
  const search = query.trim().toLowerCase();
  const results = (search
    ? RESULTS.filter((result) => `${result.title} ${result.keywords ?? ""}`.toLowerCase().includes(search))
    : RESULTS.filter((result) => result.kind === "App")).slice(0, 7);

  const open = (result: Result) => {
    openApp(result.app, result.payload);
    onDone();
  };

  return (
    <div className="fixed top-18 left-1/2 w-[min(520px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border border-white/70 bg-[#edf2fa]/95 text-[#233149] shadow-[0_22px_64px_rgba(5,13,25,.44)] backdrop-blur-2xl animate-menu-in">
      <label className="flex items-center gap-3 px-4 py-3">
        <Search aria-hidden="true" className="size-5 text-[#536886]" />
        <input
          ref={focusField}
          type="search"
          role="combobox"
          aria-label="Search this desktop"
          aria-controls={listId}
          aria-expanded="true"
          aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const step = e.key === "ArrowDown" ? 1 : -1;
              setActive(Math.min(Math.max(0, results.length - 1), Math.max(0, active + step)));
            } else if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              open(results[active]);
            }
          }}
          placeholder="Search this desktop"
          className="min-w-0 flex-1 bg-transparent text-[18px] outline-none placeholder:text-[#536886]"
        />
      </label>
      <div id={listId} role="listbox" aria-label="Search results" className="border-t border-black/10 p-1.5">
        {results.map((result, index) => {
          const Icon = result.kind === "Project" ? Folder : result.kind === "Note" ? FileText : AppWindow;
          return (
            <button
              type="button"
              role="option"
              aria-selected={index === active}
              id={`${listId}-${index}`}
              key={`${result.app}-${result.payload ?? result.title}`}
              onPointerEnter={() => setActive(index)}
              onClick={() => open(result)}
              className={cx(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px]",
                index === active ? "bg-[#2b61bb] text-white" : "text-[#233149]",
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span className="min-w-0 flex-1 truncate">{result.title}</span>
              <span className="text-[11px] opacity-80">{result.kind}</span>
            </button>
          );
        })}
        {results.length === 0 && <p className="px-3 py-2.5 text-[13px] text-[#536886]">No results</p>}
      </div>
    </div>
  );
}
