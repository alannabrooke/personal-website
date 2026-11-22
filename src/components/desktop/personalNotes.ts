"use client";

import { useSyncExternalStore } from "react";

export type PersonalNote = {
  id: string;
  title: string;
  body: string;
  updated: number;
  deleted: boolean;
};

const KEY = "portfolio.personal-notes.v1";
const EMPTY: PersonalNote[] = [];
const listeners = new Set<() => void>();
let raw: string | null = null;
let current = EMPTY;

function isPersonalNote(value: unknown): value is PersonalNote {
  if (!value || typeof value !== "object") return false;
  const note = value as Partial<PersonalNote>;
  return typeof note.id === "string" && typeof note.title === "string" &&
    typeof note.body === "string" && typeof note.updated === "number" &&
    Number.isFinite(note.updated) && Math.abs(note.updated) <= 8.64e15 &&
    typeof note.deleted === "boolean";
}

function getSnapshot() {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored !== raw) {
      raw = stored;
      const decoded: unknown = stored ? JSON.parse(stored) : [];
      current = Array.isArray(decoded) ? decoded.filter(isPersonalNote) : EMPTY;
    }
  } catch {
    // Private or restricted browsers can still keep notes for the current page.
  }
  return current;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(notes: PersonalNote[]) {
  current = notes;
  try {
    const serialized = JSON.stringify(notes);
    window.localStorage.setItem(KEY, serialized);
    raw = serialized;
  } catch {
    // The in-memory snapshot is still usable if storage is unavailable or full.
  }
  listeners.forEach((listener) => listener());
}

export function usePersonalNotes() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function createPersonalNote() {
  const id = `note-${crypto.randomUUID()}`;
  write([{ id, title: "", body: "", updated: Date.now(), deleted: false }, ...getSnapshot()]);
  return id;
}

export function updatePersonalNote(id: string, patch: Partial<Pick<PersonalNote, "title" | "body" | "deleted">>) {
  write(getSnapshot().map((note) => note.id === id ? { ...note, ...patch, updated: Date.now() } : note));
}

export function emptyPersonalTrash() {
  write(getSnapshot().filter((note) => !note.deleted));
}
