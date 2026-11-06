export type AppId =
  | "finder"
  | "notes"
  | "mail"
  | "preview"
  | "terminal"
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
};

export type DesktopState = {
  wins: Record<AppId, WinState>;
  focused: AppId | null;
  topZ: number;
  launches: number;
  power: "on" | "off" | "booting";
};

export type DesktopAction =
  | { type: "open"; id: AppId; payload?: string }
  | { type: "close"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "toggleMax"; id: AppId }
  | { type: "focus"; id: AppId }
  | { type: "blur" }
  | { type: "move"; id: AppId; x: number; y: number }
  | { type: "resize"; id: AppId; x: number; y: number; w: number; h: number }
  | { type: "power"; power: DesktopState["power"] };

export const MENU_BAR_H = 24;
export const DOCK_SPACE = 84;
