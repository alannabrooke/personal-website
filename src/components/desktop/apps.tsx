import type { ComponentType } from "react";
import { About } from "@/components/apps/About";
import { Finder } from "@/components/apps/Finder";
import { MailApp } from "@/components/apps/Mail";
import { Notes } from "@/components/apps/Notes";
import { Preview } from "@/components/apps/Preview";
import { Terminal } from "@/components/apps/Terminal";
import { Trash } from "@/components/apps/Trash";
import { profile } from "@/data/content";
import {
  AboutIcon,
  FinderIcon,
  MailIcon,
  NotesIcon,
  PreviewIcon,
  TerminalIcon,
  TrashIcon,
} from "./icons";
import type { AppId } from "./types";

export type AppProps = { payload?: string };

export type AppDef = {
  id: AppId;
  /** Name in the menu bar and dock tooltip. */
  name: string;
  /** Window title (only shown for "title" chrome). */
  title: string;
  Icon: ComponentType;
  Component: ComponentType<AppProps>;
  size: { w: number; h: number };
  minSize: { w: number; h: number };
  /**
   * "title": the window draws a 28px title bar.
   * "toolbar": the app draws its own taller toolbar and marks it with data-drag-region.
   */
  chrome: "title" | "toolbar";
  dark?: boolean;
  resizable?: boolean;
};

export const APPS: Record<AppId, AppDef> = {
  finder: {
    id: "finder",
    name: "Finder",
    title: "Projects",
    Icon: FinderIcon,
    Component: Finder,
    size: { w: 860, h: 520 },
    minSize: { w: 520, h: 320 },
    chrome: "toolbar",
  },
  notes: {
    id: "notes",
    name: "Notes",
    title: "Notes",
    Icon: NotesIcon,
    Component: Notes,
    size: { w: 780, h: 500 },
    minSize: { w: 480, h: 300 },
    chrome: "toolbar",
  },
  mail: {
    id: "mail",
    name: "Mail",
    title: "New Message",
    Icon: MailIcon,
    Component: MailApp,
    size: { w: 580, h: 500 },
    minSize: { w: 420, h: 340 },
    chrome: "toolbar",
  },
  preview: {
    id: "preview",
    name: "Preview",
    title: "Résumé.pdf",
    Icon: PreviewIcon,
    Component: Preview,
    size: { w: 680, h: 760 },
    minSize: { w: 420, h: 360 },
    chrome: "toolbar",
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    title: `${profile.handle} — -zsh — 80×24`,
    Icon: TerminalIcon,
    Component: Terminal,
    size: { w: 700, h: 440 },
    minSize: { w: 380, h: 220 },
    chrome: "title",
    dark: true,
  },
  trash: {
    id: "trash",
    name: "Finder",
    title: "Trash",
    Icon: TrashIcon,
    Component: Trash,
    size: { w: 640, h: 400 },
    minSize: { w: 420, h: 260 },
    chrome: "toolbar",
  },
  about: {
    id: "about",
    name: "Finder",
    title: "",
    Icon: AboutIcon,
    Component: About,
    size: { w: 300, h: 380 },
    minSize: { w: 300, h: 380 },
    chrome: "title",
    resizable: false,
  },
};
