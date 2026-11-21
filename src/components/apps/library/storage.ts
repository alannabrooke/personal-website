import { useCallback, useMemo, useSyncExternalStore, type SetStateAction } from "react";

const eventName = "portfolio-library-storage";
const volatile = new Map<string, string>();

function read(key: string) {
  if (volatile.has(key)) return volatile.get(key) ?? null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function decode<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useLibraryStorage<T>(name: string, fallback: T) {
  const key = `portfolio-library:${name}`;
  const getSnapshot = useCallback(() => read(key), [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const value = useMemo(() => decode(raw, fallback), [raw, fallback]);
  const setValue = useCallback((change: SetStateAction<T>) => {
    const next = typeof change === "function"
      ? (change as (value: T) => T)(decode(read(key), fallback))
      : change;
    const serialized = JSON.stringify(next);
    try {
      localStorage.setItem(key, serialized);
      volatile.delete(key);
    } catch {
      volatile.set(key, serialized);
    }
    window.dispatchEvent(new Event(eventName));
  }, [key, fallback]);

  return [value, setValue] as const;
}

const preferences = { wallpaper: "portrait" as "portrait" | "coast", magnification: true };

export function useDesktopPreferences() {
  return useLibraryStorage("desktop", preferences);
}
