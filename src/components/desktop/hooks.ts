"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True once running in the browser (false during server render / prerender). */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

/** Current time in whole seconds, ticking every second. Null on the server. */
export function useNowSeconds() {
  return useSyncExternalStore(
    (onChange) => {
      const id = setInterval(onChange, 1000);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / 1000),
    () => null,
  );
}

/** Viewport size, kept in sync on resize. Zero on the server. */
let cachedSize = { w: 0, h: 0 };
export function useViewport() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange);
      return () => window.removeEventListener("resize", onChange);
    },
    () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w !== cachedSize.w || h !== cachedSize.h) cachedSize = { w, h };
      return cachedSize;
    },
    () => cachedSize,
  );
}
