"use client";

import { useEffect, useEffectEvent } from "react";
import type { AppId } from "./types";

const COMMAND_EVENT = "portfolio:window-command";

export type WindowCommand =
  | "find"
  | "new-note"
  | "new-message"
  | "import-photos"
  | "show-library"
  | "back"
  | "forward"
  | "icons"
  | "list"
  | "gallery"
  | "quick-look"
  | "sidebar"
  | "zoom-in"
  | "zoom-out"
  | "actual-size"
  | "fit"
  | "clear"
  | "terminal-help";

type Request = { app: AppId; command: WindowCommand };

export function sendWindowCommand(app: AppId, command: WindowCommand) {
  window.dispatchEvent(new CustomEvent<Request>(COMMAND_EVENT, { detail: { app, command } }));
}

export function useWindowCommands(app: AppId, onCommand: (command: WindowCommand) => void) {
  const handleCommand = useEffectEvent(onCommand);

  useEffect(() => {
    const listener = (event: Event) => {
      const { app: target, command } = (event as CustomEvent<Request>).detail;
      if (target === app) handleCommand(command);
    };
    window.addEventListener(COMMAND_EVENT, listener);
    return () => window.removeEventListener(COMMAND_EVENT, listener);
  }, [app]);
}
