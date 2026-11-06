"use client";

import { useCallback, useMemo, useReducer, useState } from "react";
import { DesktopContext, type DesktopApi } from "./DesktopContext";
import { DesktopIcons } from "./DesktopIcons";
import { Dock } from "./Dock";
import { useIsMobile, useMounted } from "./hooks";
import { MenuBar } from "./MenuBar";
import { PowerScreen } from "./PowerScreen";
import { initialState, reducer } from "./reducer";
import type { AppId } from "./types";
import { Window } from "./Window";

export function Desktop() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const mounted = useMounted();

  const openApp = useCallback((id: AppId, payload?: string) => dispatch({ type: "open", id, payload }), []);
  const closeApp = useCallback((id: AppId) => dispatch({ type: "close", id }), []);

  const api = useMemo<DesktopApi>(
    () => ({ state, dispatch, isMobile, openApp, closeApp }),
    [state, isMobile, openApp, closeApp],
  );

  const openIds = (Object.keys(state.wins) as AppId[]).filter((id) => state.wins[id].open);

  return (
    <DesktopContext.Provider value={api}>
      <main
        className="wallpaper fixed inset-0 overflow-hidden select-none"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedIcon(null);
            dispatch({ type: "blur" });
          }
        }}
      >
        <MenuBar />
        <DesktopIcons selected={selectedIcon} onSelect={setSelectedIcon} />
        {/* Windows depend on the viewport size, so they render in the browser only. */}
        {mounted && openIds.map((id) => <Window key={id} id={id} />)}
        <Dock />
      </main>
      <PowerScreen />
    </DesktopContext.Provider>
  );
}
