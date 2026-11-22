"use client";

import { BatteryFull, Search, SlidersHorizontal, Sparkle, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { socials } from "@/data/content";
import { cx } from "@/lib/cx";
import { APPS } from "./apps";
import { useDesktop } from "./DesktopContext";
import { DesktopSearch } from "./DesktopSearch";
import { useNowSeconds } from "./hooks";
import { MENU_BAR_H, type AppId } from "./types";
import { sendWindowCommand, type WindowCommand } from "./windowCommands";

type Item =
  | { separator: true }
  | { label: string; action?: () => void; checked?: boolean; disabled?: boolean; hint?: string };

type Menu = { id: string; label: React.ReactNode; bold?: boolean; items: Item[]; mobile?: boolean };

const SEP: Item = { separator: true };
const STATUS_BUTTON = "flex h-full items-center rounded-[4px] px-2 hover:bg-white/20 aria-expanded:bg-white/25 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/80";

export function MenuBar() {
  const { state, dispatch, openApp, closeApp, isMobile } = useDesktop();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLElement>(null);

  const focused = state.focused;
  const app = focused ?? "finder";
  const appName = APPS[app].name;
  const command = (value: WindowCommand) => () => sendWindowCommand(app, value);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      barRef.current?.querySelector<HTMLElement>('[aria-expanded="true"][data-menu-trigger]')?.focus();
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const openWindows = (Object.keys(state.wins) as AppId[])
    .filter((id) => state.wins[id].open)
    .sort((a, b) => state.wins[a].z - state.wins[b].z);

  const enterFullScreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  const desktopItems: Item[] = [
    { label: "Show Desktop", action: () => dispatch({ type: "showDesktop" }) },
    { label: "Toggle Full Screen", action: enterFullScreen },
  ];
  const fileActions: Item[] = [
    ...(app === "notes" ? [{ label: "New Note", action: command("new-note") }] : []),
    ...(app === "mail" ? [{ label: "New Message", action: command("new-message") }] : []),
    ...(app === "photos" ? [{ label: "Import Photos…", action: command("import-photos") }] : []),
    ...(appName === "Finder" ? [{ label: "Open Projects", action: () => openApp("finder", "projects") }] : []),
    ...(app === "preview" ? [{ label: "Open Résumé", action: () => openApp("preview", "resume") }] : []),
    { label: "Close Window", disabled: !focused, action: () => focused && closeApp(focused) },
  ];
  const viewActions: Item[] = app === "finder" && focused ? [
    { label: "as Icons", action: command("icons") },
    { label: "as List", action: command("list") },
    { label: "as Gallery", action: command("gallery") },
    SEP,
    { label: "Quick Look", action: command("quick-look") },
  ] : app === "notes" ? [
    { label: "Toggle Note List", action: command("sidebar") },
  ] : app === "photos" ? [
    { label: "Photo Library", action: command("show-library") },
  ] : app === "preview" ? [
    { label: "Toggle Thumbnails", action: command("sidebar") },
    SEP,
    { label: "Zoom In", action: command("zoom-in") },
    { label: "Zoom Out", action: command("zoom-out") },
    { label: "Actual Size", action: command("actual-size") },
    { label: "Fit Width", action: command("fit") },
  ] : [];

  const menus: Menu[] = [
    {
      id: "logo",
      mobile: true,
      label: <Sparkle aria-hidden="true" className="size-[15px] fill-current" />,
      items: [
        { label: "About This Site", action: () => openApp("about") },
        { label: "Apps", action: () => openApp("launchpad") },
        { label: "System Settings", action: () => openApp("settings") },
        SEP,
        ...desktopItems,
        SEP,
        { label: "Lock Screen", action: () => dispatch({ type: "setLocked", locked: true }) },
        { label: "Restart…", action: () => window.location.reload() },
        { label: "Shut Down…", action: () => dispatch({ type: "power", power: "off" }) },
      ],
    },
    {
      id: "app",
      bold: true,
      mobile: true,
      label: appName,
      items: [
        { label: "About This Site", action: () => openApp("about") },
        SEP,
        { label: `Hide ${appName}`, disabled: !focused, action: () => focused && dispatch({ type: "minimize", id: focused }) },
        SEP,
        { label: `Quit ${appName}`, disabled: !focused, action: () => focused && closeApp(focused) },
      ],
    },
    {
      id: "file",
      label: "File",
      items: fileActions,
    },
    ...(app === "notes" || app === "finder" ? [{
      id: "edit",
      label: "Edit",
      items: [{ label: "Find…", action: focused ? command("find") : () => setOpenMenu("search") }],
    }] : []),
    {
      id: "view",
      label: "View",
      items: [...viewActions, ...(viewActions.length ? [SEP] : []), { label: "Toggle Full Screen", action: enterFullScreen }],
    },
    ...(appName === "Finder" ? [{
      id: "go",
      label: "Go",
      items: [
        ...(focused === "finder" ? [
          { label: "Back", action: command("back") },
          { label: "Forward", action: command("forward") },
          SEP,
        ] : []),
        { label: "Projects", action: () => openApp("finder", "projects") },
        { label: "About Me", action: () => openApp("notes", "about") },
        { label: "Résumé", action: () => openApp("preview") },
        { label: "Contact", action: () => openApp("mail") },
        SEP,
        ...socials.map((s) => ({ label: s.label, hint: "↗", action: () => window.open(s.href, "_blank", "noopener") })),
      ],
    }] : []),
    ...(app === "terminal" ? [{
      id: "shell",
      label: "Shell",
      items: [{ label: "Clear Screen", action: command("clear") }],
    }] : []),
    {
      id: "window",
      label: "Window",
      items: [
        { label: "Minimize", disabled: !focused || APPS[app].resizable === false, action: () => focused && dispatch({ type: "minimize", id: focused }) },
        { label: "Zoom", disabled: !focused || isMobile || APPS[app].resizable === false, action: () => focused && dispatch({ type: "toggleMax", id: focused }) },
        ...(openWindows.length ? [SEP] : []),
        ...openWindows.map((id) => ({
          label: APPS[id].title || "About This Site",
          checked: id === focused,
          action: () => dispatch({ type: "focus", id }),
        })),
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        { label: "Search this Desktop…", action: () => setOpenMenu("search") },
        ...(app === "terminal" ? [{ label: "Terminal Commands", action: command("terminal-help") }] : []),
        { label: "Contact Me", action: () => openApp("mail") },
      ],
    },
  ];

  const visible = isMobile ? menus.filter((m) => m.mobile) : menus;

  return (
    <header
      ref={barRef}
      style={{ height: MENU_BAR_H }}
      className="fixed inset-x-0 top-0 z-[10000] flex items-center justify-between bg-black/20 px-2 text-[13px] text-white shadow-[0_0.5px_0_rgba(0,0,0,0.15)] backdrop-blur-2xl [text-shadow:0_0_6px_rgba(0,0,0,0.25)]"
    >
      <nav aria-label="Desktop menu bar" className="flex h-full items-center">
        {visible.map((m) => (
          <div key={m.id} className="relative h-full">
            <button
              type="button"
              data-menu-trigger
              aria-label={m.id === "logo" ? "Main menu" : undefined}
              aria-haspopup="menu"
              aria-expanded={openMenu === m.id}
              onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
              onPointerEnter={() => openMenu && visible.some((menu) => menu.id === openMenu) && setOpenMenu(m.id)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowDown") return;
                e.preventDefault();
                const group = e.currentTarget.parentElement;
                setOpenMenu(m.id);
                requestAnimationFrame(() => group?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus());
              }}
              className={cx(
                "flex h-full items-center rounded-[4px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/80",
                m.bold && "font-bold",
                m.id === "logo" ? "px-3" : "px-2.5",
                openMenu === m.id && "bg-white/25",
              )}
            >
              {m.label}
            </button>
            {openMenu === m.id && (
              <MenuDropdown items={m.items} onDone={() => setOpenMenu(null)} />
            )}
          </div>
        ))}
      </nav>

      <div className="flex h-full items-center gap-0.5">
        {!isMobile && (
          <>
            <span aria-hidden="true" className="flex h-full items-center px-2">
              <BatteryFull className="size-[19px]" strokeWidth={1.6} />
            </span>
            <span aria-hidden="true" className="flex h-full items-center px-2">
              <Wifi className="size-[15px]" strokeWidth={2.2} />
            </span>
          </>
        )}
        <button
          type="button"
          data-menu-trigger
          aria-label="Search this desktop"
          aria-expanded={openMenu === "search"}
          onClick={() => setOpenMenu(openMenu === "search" ? null : "search")}
          className={STATUS_BUTTON}
        >
          <Search className="size-[14px]" strokeWidth={2.4} />
        </button>
        <div className="relative h-full">
          <button
            type="button"
            data-menu-trigger
            aria-label="Desktop controls"
            aria-haspopup="menu"
            aria-expanded={openMenu === "controls"}
            onClick={() => setOpenMenu(openMenu === "controls" ? null : "controls")}
            className={STATUS_BUTTON}
          >
            <SlidersHorizontal className="size-[14px]" strokeWidth={2.2} />
          </button>
          {openMenu === "controls" && <MenuDropdown items={desktopItems} onDone={() => setOpenMenu(null)} alignRight />}
        </div>
        <Clock compact={isMobile} />
      </div>
      {openMenu === "search" && <DesktopSearch onDone={() => setOpenMenu(null)} />}
    </header>
  );
}

function MenuDropdown({ items, onDone, alignRight }: { items: Item[]; onDone: () => void; alignRight?: boolean }) {
  return (
    <div
      role="menu"
      onKeyDown={(e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        const step = e.key === "ArrowDown" ? 1 : -1;
        if (items.length) items[(index + step + items.length) % items.length]?.focus();
      }}
      className={cx(
        "absolute top-[calc(100%+1px)] min-w-[220px] rounded-[8px] border border-black/10 bg-[#f6f6f6]/80 p-[5px] text-[13px] text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl [text-shadow:none] animate-menu-in",
        alignRight ? "right-0" : "left-0",
      )}
    >
      {items.map((item, i) =>
        "separator" in item ? (
          <div key={i} className="mx-2.5 my-[5px] h-px bg-black/10" />
        ) : (
          <button
            key={i}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              onDone();
              item.action?.();
            }}
            className="flex h-[22px] w-full items-center gap-1 rounded-[4px] pl-1 pr-2.5 text-left enabled:hover:bg-[#2f6ee6] enabled:hover:text-white focus-visible:bg-[#2f6ee6] focus-visible:text-white focus-visible:outline-none disabled:text-black/30"
          >
            <span className="w-4 text-center text-[11px]">{item.checked ? "✓" : ""}</span>
            <span className="flex-1">{item.label}</span>
            {item.hint && <span className="text-black/40">{item.hint}</span>}
          </button>
        ),
      )}
    </div>
  );
}

function Clock({ compact }: { compact?: boolean }) {
  const now = useNowSeconds();
  if (now === null) return <span className="px-2" />;
  const d = new Date(now * 1000);
  const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <span className="flex gap-2 whitespace-nowrap px-2 tabular-nums">
      {!compact && <span>{date.replace(",", "")}</span>}
      <span>{time}</span>
    </span>
  );
}
