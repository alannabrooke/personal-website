import type { AppId, DesktopAction, DesktopState, WinState } from "./types";

const ALL: AppId[] = ["finder", "notes", "mail", "preview", "terminal", "trash", "about"];

const closed = (): WinState => ({
  open: false,
  minimized: false,
  maximized: false,
  z: 0,
  x: null,
  y: null,
  w: null,
  h: null,
  slot: 0,
  launch: 0,
});

export function initialState(): DesktopState {
  const wins = Object.fromEntries(ALL.map((id) => [id, closed()])) as Record<AppId, WinState>;
  // The "About Me" note greets visitors on load.
  wins.notes = { ...wins.notes, open: true, z: 1, payload: "about" };
  return { wins, focused: "notes", topZ: 1, launches: 0, power: "on" };
}

/** The visible window with the highest z-index, if any. */
function topmost(wins: Record<AppId, WinState>): AppId | null {
  let best: AppId | null = null;
  for (const id of ALL) {
    const w = wins[id];
    if (w.open && !w.minimized && (!best || w.z > wins[best].z)) best = id;
  }
  return best;
}

function patch(state: DesktopState, id: AppId, p: Partial<WinState>): DesktopState["wins"] {
  return { ...state.wins, [id]: { ...state.wins[id], ...p } };
}

export function reducer(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
    case "open": {
      const w = state.wins[action.id];
      const z = state.topZ + 1;
      if (!w.open) {
        const openCount = ALL.filter((id) => state.wins[id].open).length;
        const launches = state.launches + 1;
        return {
          ...state,
          wins: patch(state, action.id, {
            ...closed(),
            open: true,
            z,
            slot: openCount,
            launch: launches,
            payload: action.payload,
          }),
          focused: action.id,
          topZ: z,
          launches,
        };
      }
      return {
        ...state,
        wins: patch(state, action.id, {
          minimized: false,
          z,
          ...(action.payload !== undefined ? { payload: action.payload } : {}),
        }),
        focused: action.id,
        topZ: z,
      };
    }
    case "close": {
      const wins = patch(state, action.id, closed());
      return { ...state, wins, focused: topmost(wins) };
    }
    case "minimize": {
      const wins = patch(state, action.id, { minimized: true });
      return { ...state, wins, focused: topmost(wins) };
    }
    case "toggleMax":
      return {
        ...state,
        wins: patch(state, action.id, { maximized: !state.wins[action.id].maximized }),
      };
    case "focus": {
      if (state.focused === action.id && !state.wins[action.id].minimized) return state;
      const z = state.topZ + 1;
      return {
        ...state,
        wins: patch(state, action.id, { z, minimized: false }),
        focused: action.id,
        topZ: z,
      };
    }
    case "blur":
      return state.focused === null ? state : { ...state, focused: null };
    case "move":
      return { ...state, wins: patch(state, action.id, { x: action.x, y: action.y }) };
    case "resize":
      return {
        ...state,
        wins: patch(state, action.id, { x: action.x, y: action.y, w: action.w, h: action.h }),
      };
    case "power":
      if (action.power === "off") return { ...initialState(), power: "off" };
      return { ...state, power: action.power };
  }
}
