"use client";

import { useRef, useState, type ComponentType } from "react";
import { socials } from "@/data/content";
import { cx } from "@/lib/cx";
import { APPS } from "./apps";
import { useDesktop } from "./DesktopContext";
import { GitHubIcon, LinkedInIcon } from "./icons";
import type { AppId } from "./types";

const DOCK_APPS: AppId[] = ["finder", "notes", "mail", "preview", "terminal"];

const LINK_ICONS: Record<string, ComponentType> = {
  GitHub: GitHubIcon,
  LinkedIn: LinkedInIcon,
};

const BASE = 50;
const MAX = 78;
const RANGE = 140;

export function Dock() {
  const { state, openApp, isMobile } = useDesktop();
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
  const base = isMobile ? 44 : BASE;
  const magnify = isMobile ? null : mouseX;

  const links = isMobile ? [] : socials.filter((s) => LINK_ICONS[s.label]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-1.5 z-[9000] flex justify-center">
      <nav
        ref={navRef}
        aria-label="Dock"
        onMouseEnter={measure}
        onMouseMove={(e) => setMouseX(e.clientX)}
        onMouseLeave={() => setMouseX(null)}
        className="pointer-events-auto flex items-end gap-1 rounded-[22px] border border-white/25 bg-white/20 px-1.5 pb-1.5 pt-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.25),inset_0_0_0_0.5px_rgba(255,255,255,0.3)] backdrop-blur-2xl"
      >
        {DOCK_APPS.map((id) => {
          const app = APPS[id];
          const w = state.wins[id];
          return (
            <DockItem
              key={id}
              dockKey={id}
              center={centers[id]}
              label={app.name}
              Icon={app.Icon}
              base={base}
              mouseX={magnify}
              running={w.open}
              bounceKey={w.launch}
              onClick={() => openApp(id)}
            />
          );
        })}

        {links.length > 0 && <Divider />}
        {links.map((s) => (
          <DockItem
            key={s.label}
            dockKey={s.label}
            center={centers[s.label]}
            label={s.label}
            Icon={LINK_ICONS[s.label]}
            base={base}
            mouseX={magnify}
            href={s.href}
          />
        ))}

        <Divider />
        <DockItem
          dockKey="trash"
          center={centers.trash}
          label="Trash"
          Icon={APPS.trash.Icon}
          base={base}
          mouseX={magnify}
          running={state.wins.trash.open}
          onClick={() => openApp("trash")}
        />
      </nav>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 mb-1 h-[42px] w-px self-end bg-black/20 shadow-[1px_0_0_rgba(255,255,255,0.25)]" />;
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
      <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-black/10 bg-[#ececec]/90 px-2.5 py-[3px] text-[13px] text-black/85 shadow-md backdrop-blur group-hover:block">
        {label}
      </span>
      <div key={bounceKey} className={cx("size-full", bounceKey ? "animate-dock-bounce" : "")}>
        <Icon />
      </div>
      {running && <span className="absolute -bottom-[5px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-black/70" />}
    </>
  );

  const common = {
    "aria-label": label,
    className: "group relative block size-full outline-none",
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
