"use client";

import { BatteryFull, Wifi } from "lucide-react";
import { libraryAppIds } from "./appCatalog";
import { APPS } from "./apps";
import { useDesktop } from "./DesktopContext";
import { useNowSeconds } from "./hooks";
import type { AppId } from "./types";

const dockApps: AppId[] = ["safari", "messages", "mail", "photos"];
const homeApps: AppId[] = [
  "calendar", "preview", "finder", "notes", "weather", "maps", "clock", "reminders",
  "contacts", "facetime", "music", "podcasts", "tv", "books", "settings", "launchpad",
  ...libraryAppIds.filter((id) => !["safari", "messages", "calendar", "weather", "maps", "clock", "reminders", "contacts", "facetime", "music", "podcasts", "tv", "books", "settings"].includes(id)),
  "terminal", "linkedin", "trash", "about",
];
const labels: Partial<Record<AppId, string>> = { finder: "Files", settings: "Settings", linkedin: "LinkedIn", about: "About", trash: "Trash" };

function StatusTime() {
  const seconds = useNowSeconds();
  return <span className="tabular-nums">{seconds !== null && new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", hourCycle: "h23" }).format(seconds * 1000)}</span>;
}

function PhoneApp({ id, dock = false }: { id: AppId; dock?: boolean }) {
  const { openApp } = useDesktop();
  const { Icon, name } = APPS[id];
  const label = labels[id] ?? name;
  return (
    <button type="button" aria-label={label} className={dock ? "phone-app phone-dock-app" : "phone-app"} onClick={() => openApp(id)}>
      <span className="phone-app-art"><Icon /></span>
      {!dock && <span className="phone-app-label">{label}</span>}
    </button>
  );
}

export function MobileHome() {
  const { state, dispatch } = useDesktop();
  const hasApp = state.focused !== null && state.wins[state.focused].open && !state.wins[state.focused].minimized;
  return (
    <>
      <div className="phone-status" data-in-app={hasApp}>
        <StatusTime />
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <Wifi className="size-4" strokeWidth={2.2} />
          <BatteryFull className="size-5" strokeWidth={1.8} />
        </div>
      </div>

      <div className="phone-home" inert={hasApp} aria-hidden={hasApp || undefined}>
        <div className="phone-home-grid" aria-label="Home apps">
          {homeApps.map((id) => <PhoneApp key={id} id={id} />)}
        </div>
        <nav className="phone-dock dock-glass" aria-label="Phone Dock">
          {dockApps.map((id) => <PhoneApp key={id} id={id} dock />)}
        </nav>
      </div>

      <div className="phone-home-bottom" data-in-app={hasApp}>
        {hasApp ? (
          <button type="button" aria-label="Go to Home Screen" className="phone-home-control" onClick={() => dispatch({ type: "showDesktop" })}>
            <span />
          </button>
        ) : <span aria-hidden="true" className="phone-home-control"><span /></span>}
      </div>
    </>
  );
}
