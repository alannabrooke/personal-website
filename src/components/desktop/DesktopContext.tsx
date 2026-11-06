"use client";

import { createContext, useContext, type Dispatch } from "react";
import type { AppId, DesktopAction, DesktopState } from "./types";

export type DesktopApi = {
  state: DesktopState;
  dispatch: Dispatch<DesktopAction>;
  isMobile: boolean;
  openApp: (id: AppId, payload?: string) => void;
  closeApp: (id: AppId) => void;
};

export const DesktopContext = createContext<DesktopApi | null>(null);

export function useDesktop() {
  const ctx = useContext(DesktopContext);
  if (!ctx) throw new Error("useDesktop must be used inside <Desktop>");
  return ctx;
}
