"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { appCatalog, libraryAppIds } from "@/components/desktop/appCatalog";
import { APPS } from "@/components/desktop/apps";
import { useDesktop } from "@/components/desktop/DesktopContext";
import type { AppId } from "@/components/desktop/types";
import { Action, field, LibraryFrame } from "./ui";

const portfolio = {
  Portfolio: ["finder", "notes", "mail", "preview", "photos", "terminal", "about", "linkedin", "trash"],
} satisfies Record<string, AppId[]>;

const launchGroups: Record<string, AppId[]> = { ...portfolio };
for (const id of libraryAppIds) {
  const group = appCatalog[id].group;
  (launchGroups[group] ??= []).push(id);
}

function appName(id: AppId) {
  return id === "trash" || id === "about" ? APPS[id].title : id === "linkedin" ? "LinkedIn" : APPS[id].name;
}

export function Launchpad() {
  const { openApp, closeApp, state } = useDesktop();
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const search = query.trim().toLowerCase();
  const groups = Object.keys(launchGroups);
  const candidates = selectedGroup === "All" ? Object.values(launchGroups).flat() : launchGroups[selectedGroup];
  const apps = candidates.filter((id) => appName(id).toLowerCase().includes(search));
  const launch = (id: AppId) => {
    closeApp("launchpad");
    openApp(id);
  };

  return (
    <LibraryFrame title="Apps" controls={<form className="relative w-full max-w-80" onSubmit={(event) => {
      event.preventDefault();
      if (search && apps.length) launch(apps[0]);
    }}>
      <Search aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#50627b]" />
      <input aria-label="Search apps" placeholder="Search apps" value={query} onChange={(event) => setQuery(event.target.value)} className={`${field} pl-9`} />
    </form>}>
      <div className="min-h-0 flex-1 overflow-auto bg-linear-to-br from-[#edf4ff] to-[#e5eafa] p-4 @min-[510px]:px-6">
        <div aria-label="App categories" className="mb-3 flex flex-wrap gap-1.5">
          {["All", ...groups].map((group) => (
            <Action key={group} primary={selectedGroup === group} aria-pressed={selectedGroup === group}
              className="min-h-8 px-2.5 text-xs" onClick={() => setSelectedGroup(group)}>{group}</Action>
          ))}
        </div>
        {!apps.length && <p role="status" className="rounded-xl bg-white/60 p-4 text-sm">No apps match “{query}”.</p>}
        <ul aria-label="Desktop apps" className="grid grid-cols-[repeat(auto-fill,minmax(75px,1fr))] gap-1.5">
          {apps.map((id) => {
            const { Icon } = APPS[id];
            return (
              <li key={id} className="min-w-0">
                <button type="button" onClick={() => launch(id)}
                  className="flex size-full flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-center text-xs leading-tight hover:bg-white/65 focus-visible:outline-2 focus-visible:outline-[#315f9e]">
                  <span className="relative block size-12 @min-[510px]:size-[52px]">
                    <Icon />
                    {state.wins[id].open && <span aria-hidden="true" className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-[#3a6297]" />}
                  </span>
                  <span className="break-words">{appName(id)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </LibraryFrame>
  );
}
