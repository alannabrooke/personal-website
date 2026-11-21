"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { portraitPhoto, profile } from "@/data/content";
import { useNowSeconds } from "./hooks";

const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const autoOpenSeconds = 3;
const navigationKeys = new Set(["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock", "Dead", "Unidentified"]);

function LockClock() {
  const now = useNowSeconds();
  const date = now === null ? null : new Date(now * 1000);

  return (
    <time dateTime={date?.toISOString()} className="flex flex-col items-center gap-3 text-center">
      <span className="min-h-[1lh] text-sm font-medium text-white/85 sm:text-lg">
        {date && dateFormat.format(date)}
      </span>
      <span className="min-h-[1lh] text-[clamp(3.75rem,min(17vw,18svh),10.25rem)] leading-none font-semibold tracking-[-0.065em] tabular-nums">
        {date && timeFormat.format(date)}
      </span>
    </time>
  );
}

export function LockScreen({ locked, onOpen }: { locked: boolean; onOpen: () => void }) {
  useEffect(() => {
    if (!locked) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat ||
        event.metaKey || event.ctrlKey || event.altKey ||
        navigationKeys.has(event.key) || /^F\d+$/.test(event.key)) return;

      event.preventDefault();
      onOpen();
    };

    const timeout = window.setTimeout(onOpen, autoOpenSeconds * 1000);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [locked, onOpen]);

  return (
    <section
      aria-label="Portfolio lock screen"
      aria-hidden={!locked || undefined}
      inert={!locked}
      data-locked={locked}
      onClick={onOpen}
      className="wallpaper lock-screen fixed inset-0 z-[10000] isolate cursor-pointer overflow-clip text-[#faf9f6]"
    >
      <div className="mx-auto flex h-full flex-col items-center justify-between gap-8 overflow-y-auto px-5 pt-[clamp(2rem,15svh,9rem)] pb-[max(2rem,env(safe-area-inset-bottom),9svh)]">
        <LockClock />

        <div className="flex max-w-full flex-col items-center gap-3">
          <button
            type="button"
            className="group flex max-w-full items-center gap-3.5 rounded-full border border-white/30 bg-black/25 py-2 pr-4 pl-2 text-left shadow-lg transition-colors hover:bg-black/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span className="size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/35">
              <Image
                src={portraitPhoto.src}
                alt=""
                width={48}
                height={48}
                unoptimized
                draggable={false}
                className="size-full scale-150 object-cover"
              />
            </span>
            <span className="flex min-w-0 flex-col pr-2">
              <span className="text-[15px] font-semibold">{profile.name}</span>
              <span className="text-[13px] leading-5 text-white/85">Open desktop</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-white/85 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
          </button>
          <p className="text-center text-xs leading-5 text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,.7)]">
            Click or press any key to enter
          </p>
        </div>
      </div>
    </section>
  );
}
