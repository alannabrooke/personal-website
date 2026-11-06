"use client";

import { Power, Sparkle } from "lucide-react";
import { useEffect } from "react";
import { useDesktop } from "./DesktopContext";

/** Shown after "Shut Down…": a black screen, then a short boot animation. */
export function PowerScreen() {
  const { state, dispatch } = useDesktop();

  useEffect(() => {
    if (state.power !== "booting") return;
    const t = setTimeout(() => dispatch({ type: "power", power: "on" }), 2200);
    return () => clearTimeout(t);
  }, [state.power, dispatch]);

  if (state.power === "on") return null;

  return (
    <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center bg-black text-white">
      {state.power === "off" ? (
        <button
          type="button"
          onClick={() => dispatch({ type: "power", power: "booting" })}
          className="flex flex-col items-center gap-3 text-white/50 transition hover:text-white"
        >
          <span className="flex size-14 items-center justify-center rounded-full border border-current">
            <Power className="size-6" />
          </span>
          <span className="text-sm">Turn on</span>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-14">
          <Sparkle className="size-20 fill-white" />
          <div className="h-[5px] w-52 overflow-hidden rounded-full bg-white/25">
            <div className="h-full animate-boot-progress rounded-full bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}
