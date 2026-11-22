"use client";

import { FileText, PanelLeft, Send, SquarePen } from "lucide-react";
import { useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useWindowCommands } from "@/components/desktop/windowCommands";
import { profile } from "@/data/content";
import { cx } from "@/lib/cx";
import { ToolButton, Toolbar } from "./ui";

type Draft = { id: string; subject: string; body: string };
const DRAFT_KEY = "portfolio.mail-drafts.v1";
let inMemoryDrafts: Draft[] = [];
let memoryOnly = false;

function readDrafts(): Draft[] {
  if (memoryOnly) return inMemoryDrafts;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((draft): draft is Draft =>
      draft && typeof draft.id === "string" && typeof draft.subject === "string" && typeof draft.body === "string",
    ) : [];
  } catch {
    return inMemoryDrafts;
  }
}

export function MailApp() {
  const { isMobile } = useDesktop();
  const [drafts, setDrafts] = useState(readDrafts);
  const [activeId, setActiveId] = useState(() => drafts[0]?.id ?? crypto.randomUUID());
  const [showDrafts, setShowDrafts] = useState(false);
  const current = drafts.find((draft) => draft.id === activeId) ?? { id: activeId, subject: "", body: "" };

  const compose = () => {
    setActiveId(crypto.randomUUID());
    if (isMobile) setShowDrafts(false);
  };
  useWindowCommands("mail", (command) => {
    if (command === "new-message") compose();
  });

  const updateDraft = (changes: Partial<Pick<Draft, "subject" | "body">>) => {
    const stored = readDrafts();
    const edited = { ...(stored.find((draft) => draft.id === activeId) ?? current), ...changes };
    const remaining = stored.filter((draft) => draft.id !== activeId);
    const next = edited.subject || edited.body ? [edited, ...remaining] : remaining;
    inMemoryDrafts = next;
    setDrafts(next);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      memoryOnly = false;
    } catch {
      memoryOnly = true;
    }
  };

  const send = () => {
    const params = new URLSearchParams({ subject: current.subject || "Hello!", body: current.body });
    window.location.href = `mailto:${profile.email}?${params.toString().replace(/\+/g, "%20")}`;
  };

  return (
    <form className="flex h-full flex-col bg-white" onSubmit={(e) => { e.preventDefault(); send(); }}>
      <Toolbar inset className="border-b border-[#d8deea] bg-[#f1f4fa]">
        <ToolButton label={showDrafts ? "Hide Drafts" : "Show Drafts"} pressed={showDrafts} onClick={() => setShowDrafts(!showDrafts)}>
          <PanelLeft className="size-4" />
        </ToolButton>
        <div className="mr-auto min-w-0 flex-1 truncate text-[13px] font-semibold text-[#263449]">
          {current.subject || "New Message"}
        </div>
        <ToolButton label="New Message" onClick={compose}><SquarePen className="size-4" /></ToolButton>
        <button type="submit" aria-label="Open in Email App" title="Open in Email App" className="flex h-7 shrink-0 items-center gap-1.5 rounded-md bg-[#2c64bf] px-2 text-[12px] font-medium text-white hover:bg-[#2457a9]">
          <Send className="size-3.5" />
          <span className="max-sm:hidden">Open in Mail</span>
        </button>
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        {showDrafts && (
          <aside aria-label="Drafts" className={cx("shrink-0 overflow-y-auto bg-[#e9eef7] p-2.5", isMobile ? "w-full" : "w-40 border-r border-[#d8deea]")}>
            <h2 className="px-2 py-1 text-[13px] font-semibold text-[#34445d]">Drafts</h2>
            {drafts.length === 0 && <p className="px-2 py-3 text-[12px] text-[#576983]">No saved drafts</p>}
            {drafts.map((draft) => (
              <button
                type="button"
                key={draft.id}
                aria-current={activeId === draft.id || undefined}
                onClick={() => {
                  setActiveId(draft.id);
                  if (isMobile) setShowDrafts(false);
                }}
                className={cx("flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[12px]", activeId === draft.id ? "bg-[#d7e4f7] text-[#1d427e]" : "hover:bg-[#e1e9f6]")}
              >
                <FileText aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">{draft.subject || "No subject"}</span>
              </button>
            ))}
          </aside>
        )}
        {(!isMobile || !showDrafts) && (
          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <div className="mx-5 flex shrink-0 items-center gap-2 border-b border-[#e2e7ee] py-2.5">
              <span className="text-[13px] text-[#596981]">To</span>
              <span title={profile.email} className="max-w-full truncate rounded-md bg-[#e0ecfd] px-2 py-0.5 text-[12px] font-medium text-[#28569c]">
                {profile.name}
              </span>
            </div>
            <label className="mx-5 flex shrink-0 items-center gap-2 border-b border-[#e2e7ee] py-2.5">
              <span className="text-[13px] text-[#596981]">Subject</span>
              <input
                value={current.subject}
                onChange={(e) => updateDraft({ subject: e.target.value })}
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
              />
            </label>
            <textarea
              aria-label="Message"
              value={current.body}
              onChange={(e) => updateDraft({ body: e.target.value })}
              placeholder={`Hi ${profile.name.split(" ")[0]},`}
              className="min-h-0 flex-1 resize-none bg-transparent px-5 py-4 text-[14px] leading-relaxed outline-none placeholder:text-[#738098]"
            />
            <p className="shrink-0 border-t border-[#e2e7ee] px-5 py-2 text-[11px] text-[#52627b]">
              Drafts are saved in this browser. Use your email app to send.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
