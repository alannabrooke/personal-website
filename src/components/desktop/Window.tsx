"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { cx } from "@/lib/cx";
import { APPS, type AppDef } from "./apps";
import { useDesktop } from "./DesktopContext";
import { useViewport } from "./hooks";
import { TrafficLights } from "./TrafficLights";
import { DOCK_SPACE, MENU_BAR_H, type AppId, type WinState } from "./types";

type Rect = { x: number; y: number; w: number; h: number };

function resolveRect(app: AppDef, st: WinState, vw: number, vh: number): Rect {
  const w = st.w ?? Math.min(app.size.w, vw - 24);
  const h = st.h ?? Math.min(app.size.h, vh - MENU_BAR_H - DOCK_SPACE - 16);
  const offset = (st.slot % 6) * 26;
  const x = st.x ?? Math.max(8, Math.round((vw - w) / 2) + offset);
  const y =
    st.y ??
    Math.max(
      MENU_BAR_H + 10,
      Math.round(MENU_BAR_H + (vh - MENU_BAR_H - DOCK_SPACE - h) / 2) + offset,
    );
  return { x, y, w, h };
}

const INTERACTIVE = "button, a, input, textarea, select, [data-no-drag]";

export function Window({ id }: { id: AppId }) {
  const { state, dispatch, isMobile } = useDesktop();
  const { w: vw, h: vh } = useViewport();
  const app = APPS[id];
  const st = state.wins[id];
  const active = state.focused === id;
  const [live, setLive] = useState<Rect | null>(null);

  const rect = live ?? resolveRect(app, st, vw, vh);
  const canResize = app.resizable !== false && !isMobile && !st.maximized;

  const clampPos = (r: Rect): Rect => ({
    ...r,
    x: Math.min(Math.max(r.x, 80 - r.w), vw - 80),
    y: Math.min(Math.max(r.y, MENU_BAR_H), vh - 40),
  });

  const track = (onMove: (dx: number, dy: number) => Rect, commit: (r: Rect) => void) => {
    return (e: ReactPointerEvent) => {
      const sx = e.clientX;
      const sy = e.clientY;
      let current = rect;
      const move = (ev: PointerEvent) => {
        current = onMove(ev.clientX - sx, ev.clientY - sy);
        setLive(current);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        document.body.style.cursor = "";
        commit(current);
        setLive(null);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!active) dispatch({ type: "focus", id });
    const target = e.target as HTMLElement;
    if (
      e.button !== 0 ||
      isMobile ||
      st.maximized ||
      !target.closest("[data-drag-region]") ||
      target.closest(INTERACTIVE)
    )
      return;
    e.preventDefault();
    const start = rect;
    track(
      (dx, dy) => clampPos({ ...start, x: start.x + dx, y: start.y + dy }),
      (r) => dispatch({ type: "move", id, x: r.x, y: r.y }),
    )(e);
  };

  const startResize = (dir: "e" | "s" | "se") => (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (!active) dispatch({ type: "focus", id });
    document.body.style.cursor = dir === "e" ? "ew-resize" : dir === "s" ? "ns-resize" : "nwse-resize";
    const start = rect;
    track(
      (dx, dy) => ({
        ...start,
        w: dir === "s" ? start.w : Math.max(app.minSize.w, Math.min(start.w + dx, vw - start.x)),
        h: dir === "e" ? start.h : Math.max(app.minSize.h, Math.min(start.h + dy, vh - start.y)),
      }),
      (r) => dispatch({ type: "resize", id, ...r }),
    )(e);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (isMobile || app.resizable === false) return;
    if (target.closest("[data-drag-region]") && !target.closest(INTERACTIVE)) {
      dispatch({ type: "toggleMax", id });
    }
  };

  let style: React.CSSProperties;
  if (isMobile) {
    style = { left: 6, right: 6, top: MENU_BAR_H + 6, bottom: 78 };
  } else if (st.maximized) {
    style = { left: 0, top: MENU_BAR_H, width: "100%", height: `calc(100% - ${MENU_BAR_H + DOCK_SPACE}px)` };
  } else {
    style = { left: rect.x, top: rect.y, width: rect.w, height: rect.h };
  }

  // Minimizing shrinks the window down towards the dock.
  const cx0 = isMobile ? vw / 2 : rect.x + rect.w / 2;
  const cy0 = isMobile ? vh / 2 : rect.y + rect.h / 2;
  const minimizedStyle: React.CSSProperties = st.minimized
    ? {
        transform: `translate(${vw / 2 - cx0}px, ${vh - cy0}px) scale(0.06)`,
        opacity: 0,
        pointerEvents: "none",
      }
    : {};

  const Component = app.Component;

  return (
    <div
      role="dialog"
      aria-label={app.title || app.name}
      aria-hidden={st.minimized || undefined}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{
        ...style,
        ...minimizedStyle,
        zIndex: st.z,
        transition: live ? "none" : "transform 380ms cubic-bezier(.4,0,.2,1), opacity 320ms ease",
      }}
      className={cx(
        "absolute flex flex-col overflow-hidden rounded-[10px] animate-window-in",
        app.dark ? "bg-[#1e1e1e] text-white" : "bg-white text-[#1d1d1f]",
        "ring-1 ring-black/25",
        active
          ? "shadow-[0_24px_70px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.15)_inset]"
          : "shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
      )}
    >
      <TrafficLights
        active={active}
        onClose={() => dispatch({ type: "close", id })}
        onMinimize={app.resizable === false ? undefined : () => dispatch({ type: "minimize", id })}
        onZoom={app.resizable === false || isMobile ? undefined : () => dispatch({ type: "toggleMax", id })}
        className={cx("absolute z-20 left-[13px]", app.chrome === "title" ? "top-[8px]" : "top-[19px]")}
      />

      {app.chrome === "title" && (
        <div
          data-drag-region
          className={cx(
            "flex h-7 shrink-0 items-center justify-center px-20 text-[13px] font-semibold",
            app.dark
              ? "border-b border-black/60 bg-[#2c2c2e] text-white/70"
              : "text-black/70",
            !active && "opacity-60",
          )}
        >
          <span className="truncate">{app.title}</span>
        </div>
      )}

      <div className={cx("relative min-h-0 flex-1", !active && "[&_[data-drag-region]]:opacity-90")}>
        <Component payload={st.payload} />
      </div>

      {canResize && (
        <>
          <div onPointerDown={startResize("e")} className="absolute right-0 top-3 bottom-3 w-1.5 cursor-ew-resize" />
          <div onPointerDown={startResize("s")} className="absolute bottom-0 left-3 right-3 h-1.5 cursor-ns-resize" />
          <div onPointerDown={startResize("se")} className="absolute bottom-0 right-0 size-3.5 cursor-nwse-resize" />
        </>
      )}
    </div>
  );
}
