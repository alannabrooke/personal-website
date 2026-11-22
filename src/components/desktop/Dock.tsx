"use client";

import { useRef, useState, type ComponentType } from "react";
import { githubLink } from "@/data/content";
import { cx } from "@/lib/cx";
import { useDesktopPreferences } from "@/components/apps/library/storage";
import { APPS } from "./apps";
import { useDesktop } from "./DesktopContext";
import { useViewport } from "./hooks";
import { GitHubIcon } from "./icons";
import type { AppId } from "./types";

const DOCK_APPS: AppId[] = ["finder", "launchpad", "notes", "mail", "preview", "photos", "terminal"];

const BASE = 57;
const MAX = 78;
const RANGE = 140;

export function Dock() {
  const { state, openApp, isMobile } = useDesktop();
  const [preferences] = useDesktopPreferences();
  const { w: viewportWidth } = useViewport();
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [centers, setCenters] = useState<Record<string, number>>({});
  const navRef = useRef<HTMLElement>(null);
  // Measure every icon's resting centre when the cursor enters (the dock is unmagnified then).
  const measure = () => {
    const next: Record<string, number> = {};
    navRef.current?.querySelectorAll<HTMLElement>("[data-dock-key]").forEach((el) => {
      const r = el.getBoundingClientRect();
      next[el.dataset.dockKey!] = r.left + r.width / 2;
    });
    setCenters(next);
  };
  const base = isMobile ? Math.max(24, Math.min(44, Math.floor((viewportWidth - 78) / (DOCK_APPS.length + 2)))) : BASE;
  const magnify = isMobile || !preferences.magnification ? null : mouseX;

  const appItem = (id: AppId, label = APPS[id].name) => {
    const app = APPS[id];
    const win = state.wins[id];
    return (
      <DockItem
        key={id}
        dockKey={id}
        center={centers[id]}
        label={label}
        Icon={app.Icon}
        base={base}
        mouseX={magnify}
        running={win.open}
        bounceKey={win.launch}
        onClick={() => openApp(id)}
      />
    );
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2.5 z-[9000] flex justify-center">
      <nav
        ref={navRef}
        aria-label="Dock"
        onMouseEnter={measure}
        onMouseMove={(e) => setMouseX(e.clientX)}
        onMouseLeave={() => setMouseX(null)}
        className="dock-glass pointer-events-auto flex items-end gap-1.5 rounded-[23px] px-2.5 pt-2 pb-3"
      >
        {DOCK_APPS.map((id) => appItem(id))}
        {!isMobile && (
          <>
            <Divider />
            <DockItem
              dockKey="github"
              center={centers.github}
              label={githubLink.label}
              Icon={GitHubIcon}
              base={base}
              mouseX={magnify}
              href={githubLink.href}
            />
          </>
        )}
        {appItem("linkedin", "LinkedIn")}
        <Divider />
        {appItem("trash", "Trash")}
      </nav>
    </div>
  );
}

function Divider() {
  return <div className="mx-0.5 mb-1 h-10 w-px shrink-0 self-end bg-white/25" />;
}

type ItemProps = {
  dockKey: string;
  center?: number;
  label: string;
  Icon: ComponentType;
  base: number;
  mouseX: number | null;
  running?: boolean;
  bounceKey?: number;
  onClick?: () => void;
  href?: string;
};

function DockItem({ dockKey, center, label, Icon, base, mouseX, running, bounceKey, onClick, href }: ItemProps) {
  // Magnify based on the cursor's distance from this icon's resting centre.
  let size = base;
  if (mouseX !== null && center !== undefined) {
    const d = Math.abs(mouseX - center);
    const t = Math.max(0, 1 - d / RANGE);
    size = base + (MAX - base) * Math.sin((t * Math.PI) / 2) ** 2;
  }

  const content = (
    <>
      <span className="dock-tooltip pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-[3px] text-[13px] font-medium group-hover:block group-focus-visible:block">
        {label}
      </span>
      <div key={bounceKey} className={cx("size-full", bounceKey ? "animate-dock-bounce" : "")}>
        <Icon />
      </div>
      {running && <span className="absolute -bottom-[6px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-white/90" />}
    </>
  );

  const common = {
    "aria-label": label,
    className: "group relative block size-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
  };

  return (
    <div
      data-dock-key={dockKey}
      style={{ width: size, height: size }}
      className="relative shrink-0 transition-[width,height] duration-100 ease-out"
    >
      {href ? (
        <a {...common} href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        <button {...common} type="button" onClick={onClick}>
          {content}
        </button>
      )}
    </div>
  );
}
