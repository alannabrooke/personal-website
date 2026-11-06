"use client";

import { BatteryFull, Search, SlidersHorizontal, Sparkle, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { socials } from "@/data/content";
import { cx } from "@/lib/cx";
import { APPS } from "./apps";
import { useDesktop } from "./DesktopContext";
import { useNowSeconds } from "./hooks";
import type { AppId } from "./types";

type Item =
  | { separator: true }
  | { label: string; action?: () => void; checked?: boolean; disabled?: boolean; hint?: string };

type Menu = { id: string; label: React.ReactNode; bold?: boolean; items: Item[]; mobile?: boolean };

const SEP: Item = { separator: true };

export function MenuBar() {
  const { state, dispatch, openApp, closeApp, isMobile } = useDesktop();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const focused = state.focused;
  const appName = focused ? APPS[focused].name : "Finder";

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
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
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const menus: Menu[] = [
    {
      id: "logo",
      mobile: true,
      label: <Sparkle aria-label="Main menu" className="size-[15px] fill-current" />,
      items: [
        { label: "About This Site", action: () => openApp("about") },
        SEP,
        { label: "Open Finder", action: () => openApp("finder") },
        { label: "Open Terminal", action: () => openApp("terminal") },
        SEP,
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
        { label: `About ${appName}`, action: () => openApp("about") },
        SEP,
        { label: `Hide ${appName}`, disabled: !focused, action: () => focused && dispatch({ type: "minimize", id: focused }) },
        SEP,
        { label: `Quit ${appName}`, disabled: !focused, action: () => focused && closeApp(focused) },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        { label: "New Finder Window", action: () => openApp("finder") },
        { label: "New Message", action: () => openApp("mail") },
        { label: "Open Résumé", action: () => openApp("preview") },
        SEP,
        { label: "Close Window", disabled: !focused, action: () => focused && closeApp(focused) },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { label: "Undo", disabled: true },
        { label: "Redo", disabled: true },
        SEP,
        { label: "Cut", disabled: true },
        { label: "Copy", disabled: true },
        { label: "Paste", disabled: true },
        { label: "Select All", disabled: true },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [{ label: "Enter Full Screen", action: enterFullScreen }],
    },
    {
      id: "go",
      label: "Go",
      items: [
        { label: "Projects", action: () => openApp("finder") },
        { label: "About Me", action: () => openApp("notes", "about") },
        { label: "Résumé", action: () => openApp("preview") },
        { label: "Contact", action: () => openApp("mail") },
        SEP,
        ...socials.map((s) => ({ label: s.label, hint: "↗", action: () => window.open(s.href, "_blank", "noopener") })),
      ],
    },
    {
      id: "window",
      label: "Window",
      items: [
        { label: "Minimize", disabled: !focused, action: () => focused && dispatch({ type: "minimize", id: focused }) },
        { label: "Zoom", disabled: !focused, action: () => focused && dispatch({ type: "toggleMax", id: focused }) },
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
        { label: "Contact Me", action: () => openApp("mail") },
        { label: "Terminal Commands", action: () => openApp("terminal") },
      ],
    },
  ];

  const visible = isMobile ? menus.filter((m) => m.mobile) : menus;

  return (
    <header
      ref={barRef}
      className="fixed inset-x-0 top-0 z-[10000] flex h-6 items-center justify-between bg-black/20 px-2 text-[13px] text-white shadow-[0_0.5px_0_rgba(0,0,0,0.15)] backdrop-blur-2xl [text-shadow:0_0_6px_rgba(0,0,0,0.25)]"
    >
      <nav className="flex h-full items-center">
        {visible.map((m) => (
          <div key={m.id} className="relative h-full">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
              onPointerEnter={() => openMenu && setOpenMenu(m.id)}
              className={cx(
                "flex h-full items-center rounded-[4px] px-2.5",
                m.bold && "font-bold",
                m.id === "logo" && "px-3",
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
            <StatusIcon label="Battery">
              <BatteryFull className="size-[19px]" strokeWidth={1.6} />
            </StatusIcon>
            <StatusIcon label="Wi-Fi">
              <Wifi className="size-[15px]" strokeWidth={2.2} />
            </StatusIcon>
            <StatusIcon label="Search" onClick={() => openApp("finder")}>
              <Search className="size-[14px]" strokeWidth={2.4} />
            </StatusIcon>
            <StatusIcon label="Control Center">
              <SlidersHorizontal className="size-[14px]" strokeWidth={2.2} />
            </StatusIcon>
          </>
        )}
        <Clock compact={isMobile} />
      </div>
    </header>
  );
}

function MenuDropdown({ items, onDone }: { items: Item[]; onDone: () => void }) {
  return (
    <div
      role="menu"
      className="absolute left-0 top-[calc(100%+1px)] min-w-[220px] rounded-[8px] border border-black/10 bg-[#f6f6f6]/80 p-[5px] text-[13px] text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl [text-shadow:none] animate-menu-in"
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
              item.action?.();
              onDone();
            }}
            className="flex h-[22px] w-full items-center gap-1 rounded-[4px] pl-1 pr-2.5 text-left enabled:hover:bg-[#2f6ee6] enabled:hover:text-white disabled:text-black/30"
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

function StatusIcon({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-full items-center rounded-[4px] px-2 hover:bg-white/20"
    >
      {children}
    </button>
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
