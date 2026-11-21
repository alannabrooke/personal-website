export type AppId =
  | "finder"
  | "notes"
  | "mail"
  | "preview"
  | "photos"
  | "terminal"
  | "linkedin"
  | "trash"
  | "about";

export type WinState = {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  z: number;
  // null = not placed yet; the window centres itself (with a cascade offset).
  x: number | null;
  y: number | null;
  w: number | null;
  h: number | null;
  slot: number; // cascade position
  launch: number; // increments on each launch, used to replay the dock bounce
  payload?: string; // e.g. which note to show
  payloadVersion?: number; // changes on explicit document opens, including repeat opens
};

export type DesktopState = {
  wins: Record<AppId, WinState>;
  focused: AppId | null;
  topZ: number;
  launches: number;
  locked: boolean;
  power: "on" | "off" | "booting";
};

export type DesktopAction =
  | { type: "open"; id: AppId; payload?: string }
  | { type: "close"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "showDesktop" }
  | { type: "toggleMax"; id: AppId }
  | { type: "focus"; id: AppId }
  | { type: "blur" }
  | { type: "move"; id: AppId; x: number; y: number }
  | { type: "resize"; id: AppId; x: number; y: number; w: number; h: number }
  | { type: "setLocked"; locked: boolean }
  | { type: "power"; power: DesktopState["power"] };

export const MENU_BAR_H = 24;
export const DOCK_SPACE = 92;
