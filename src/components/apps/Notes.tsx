"use client";

import { PanelLeft, Search, SquarePen, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import type { AppProps } from "@/components/desktop/apps";
import { createPersonalNote, updatePersonalNote, usePersonalNotes } from "@/components/desktop/personalNotes";
import { useWindowCommands } from "@/components/desktop/windowCommands";
import { notes } from "@/data/content";
import { cx } from "@/lib/cx";
import { ToolButton, Toolbar } from "./ui";

export function Notes({ payload }: AppProps) {
  const { isMobile } = useDesktop();
  const [selected, setSelected] = useState(payload ?? notes[0].id);
  const [desktopList, setDesktopList] = useState(true);
  const [mobileList, setMobileList] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const focusNewTitle = useRef(false);
  const focusSearch = useCallback((input: HTMLInputElement | null) => {
    input?.focus();
  }, []);

  const personalNotes = usePersonalNotes();
  const personal = personalNotes.find((n) => n.id === selected && !n.deleted);
  const note = notes.find((n) => n.id === selected) ?? notes[0];
  const listVisible = isMobile ? mobileList : desktopList;
  const setListVisible = isMobile ? setMobileList : setDesktopList;
  const query = search?.trim().toLowerCase();
  const matches = (text: string) => !query || text.toLowerCase().includes(query);
  const visibleNotes = notes.filter((n) => matches(`${n.title} ${n.body.join(" ")}`));
  const visiblePersonal = personalNotes
    .filter((n) => !n.deleted && matches(`${n.title || "Untitled Note"} ${n.body}`))
    .toSorted((a, b) => b.updated - a.updated);

  const toggleList = () => {
    setListVisible(!listVisible);
    if (listVisible) setSearch(null);
  };
  const showSearch = () => {
    setListVisible(true);
    setSearch("");
  };
  const openNote = (id: string) => {
    setSelected(id);
    if (isMobile) {
      setMobileList(false);
      setSearch(null);
    }
  };
  const newNote = () => {
    const id = createPersonalNote();
    focusNewTitle.current = true;
    setSearch(null);
    openNote(id);
  };

  useWindowCommands("notes", (command) => {
    if (command === "new-note") newNote();
    if (command === "find") showSearch();
    if (command === "sidebar") toggleList();
  });

  const activeId = personal?.id ?? note.id;
  const noteRow = (id: string, title: string) => (
    <li key={id}>
      <button
        type="button"
        aria-current={id === activeId || undefined}
        onClick={() => openNote(id)}
        className={cx(
          "w-full rounded-md px-2.5 py-2 text-left text-[13px] leading-[18px] font-medium break-words text-[#302824] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#336cc0]",
          id === activeId ? "bg-[#f0d39a]" : "hover:bg-black/5",
        )}
      >
        {title}
      </button>
    </li>
  );

  return (
    <div className="flex h-full flex-col">
      <Toolbar inset className="border-b border-[#d1cfd3] bg-[#e7e6e9] pr-3.5">
        <ToolButton
          label={listVisible ? "Hide note list" : "Show note list"}
          pressed={listVisible}
          onClick={toggleList}
        >
          <PanelLeft aria-hidden="true" className="size-[17px]" strokeWidth={1.7} />
        </ToolButton>
        <span className={cx("ml-1 mr-auto min-w-0 truncate border-l border-black/15 pl-3 text-[14px] font-semibold text-[#242329] max-[365px]:hidden", search !== null && "max-sm:hidden")}>
          Notes
        </span>
        {search !== null && (
          <input
            ref={focusSearch}
            type="search"
            aria-label="Search notes"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearch(null);
            }}
            placeholder="Search notes"
            className="ml-auto h-7 w-36 min-w-0 rounded-md border border-black/10 bg-white/80 px-2 text-[13px] text-[#242329] focus-visible:outline-2 focus-visible:outline-[#336cc0]"
          />
        )}
        <ToolButton
          label={search === null ? "Search notes" : "Close search"}
          pressed={search !== null}
          onClick={() => {
            if (search === null) showSearch();
            else setSearch(null);
          }}
        >
          <Search aria-hidden="true" className="size-[17px]" strokeWidth={1.9} />
        </ToolButton>
        {!(isMobile && search !== null) && (
          <>
            <ToolButton label="New Note" onClick={newNote}>
              <SquarePen aria-hidden="true" className="size-[17px]" strokeWidth={1.75} />
            </ToolButton>
            {personal && (
              <ToolButton label="Move Note to Trash" onClick={() => {
                updatePersonalNote(personal.id, { deleted: true });
                setSelected(notes[0].id);
              }}>
                <Trash2 aria-hidden="true" className="size-[17px]" strokeWidth={1.75} />
              </ToolButton>
            )}
          </>
        )}
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        {listVisible && (
          <aside
            aria-label="Note list"
            className={cx(
              "shrink-0 overflow-y-auto bg-[#eae7e5] px-2.5 py-4",
              isMobile ? "w-full" : "w-[24%] min-w-[176px] max-w-[224px] border-r border-black/10",
            )}
          >
            {visibleNotes.length > 0 && (
              <>
                <h2 className="px-2.5 pb-2 text-[13px] font-semibold text-[#55504c]">Portfolio</h2>
                <ul className="space-y-0.5">{visibleNotes.map((n) => noteRow(n.id, n.title))}</ul>
              </>
            )}
            {visiblePersonal.length > 0 && (
              <>
                <h2 className="px-2.5 pt-4 pb-2 text-[13px] font-semibold text-[#55504c]">On This Browser</h2>
                <ul className="space-y-0.5">{visiblePersonal.map((n) => noteRow(n.id, n.title || "Untitled Note"))}</ul>
              </>
            )}
            {visibleNotes.length === 0 && visiblePersonal.length === 0 && (
              <p className="px-2.5 py-2 text-[13px] text-[#615854]">No matching notes</p>
            )}
          </aside>
        )}

        {(!isMobile || !listVisible) && (personal ? (
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[#fdfdfd] px-7 py-5 md:px-8">
            <time className="mb-3 text-[12px] text-[#706c70]" dateTime={new Date(personal.updated).toISOString()}>
              {new Date(personal.updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </time>
            <input
              ref={(input) => {
                if (input && focusNewTitle.current) {
                  focusNewTitle.current = false;
                  input.focus();
                }
              }}
              aria-label="Note title"
              value={personal.title}
              onChange={(e) => updatePersonalNote(personal.id, { title: e.target.value })}
              placeholder="Untitled Note"
              className="mb-4 w-full bg-transparent text-[26px] leading-tight font-bold tracking-tight text-[#1e1e23] outline-none"
            />
            <textarea
              aria-label="Note text"
              value={personal.body}
              onChange={(e) => updatePersonalNote(personal.id, { body: e.target.value })}
              placeholder="Start writing"
              className="min-h-24 w-full flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-[#343239] outline-none"
            />
          </div>
        ) : (
          <article className="min-w-0 flex-1 select-text overflow-y-auto bg-[#fdfdfd] px-7 py-5 md:px-8 md:py-5">
            <p className="mb-4 text-[12px] text-[#706c70]">{note.date}</p>
            <h1 className="mb-4 text-[28px] leading-tight font-bold tracking-[-0.025em] text-[#1e1e23]">
              {note.title}
            </h1>
            <div className="max-w-[62ch] space-y-4 text-[15px] leading-relaxed text-[#343239]">
              {note.body.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
