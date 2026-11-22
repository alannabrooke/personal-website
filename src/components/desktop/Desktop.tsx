"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useDesktopPreferences } from "@/components/apps/library/storage";
import { DesktopContext, type DesktopApi } from "./DesktopContext";
import { DesktopIcons } from "./DesktopIcons";
import { Dock } from "./Dock";
import { useIsMobile, useMounted } from "./hooks";
import { LockScreen } from "./LockScreen";
import { MenuBar } from "./MenuBar";
import { MobileHome } from "./MobileHome";
import { PowerScreen } from "./PowerScreen";
import { initialState, reducer } from "./reducer";
import type { AppId } from "./types";
import { Window } from "./Window";

export function Desktop() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [preferences] = useDesktopPreferences();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const desktopRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const mounted = useMounted();
  const desktopAvailable = state.power === "on" && !state.locked;

  useEffect(() => {
    if (desktopAvailable) desktopRef.current?.focus({ preventScroll: true });
  }, [desktopAvailable]);

  const openApp = useCallback((id: AppId, payload?: string) => dispatch({ type: "open", id, payload }), []);
  const closeApp = useCallback((id: AppId) => dispatch({ type: "close", id }), []);
  const unlockDesktop = useCallback(() => dispatch({ type: "setLocked", locked: false }), []);

  const api = useMemo<DesktopApi>(
    () => ({ state, dispatch, isMobile, openApp, closeApp }),
    [state, isMobile, openApp, closeApp],
  );

  const openIds = (Object.keys(state.wins) as AppId[]).filter((id) => state.wins[id].open);

  return (
    <DesktopContext.Provider value={api}>
      <main
        ref={desktopRef}
        tabIndex={-1}
        inert={!desktopAvailable}
        data-revealed={desktopAvailable}
        data-mobile={isMobile}
        data-wallpaper={preferences.wallpaper}
        className="wallpaper fixed inset-0 overflow-clip outline-none select-none"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedIcon(null);
            dispatch({ type: "blur" });
          }
        }}
      >
        {isMobile ? <MobileHome /> : <>
          <MenuBar />
          <DesktopIcons selected={selectedIcon} onSelect={setSelectedIcon} />
          <Dock />
        </>}
        {/* Windows depend on the viewport size, so they render in the browser only. */}
        {mounted && openIds.map((id) => <Window key={id} id={id} />)}
      </main>
      {state.power === "on" && (
        <LockScreen locked={state.locked} onOpen={unlockDesktop} />
      )}
      <PowerScreen />
    </DesktopContext.Provider>
  );
}
