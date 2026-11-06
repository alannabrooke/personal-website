"use client";

import { useDesktop } from "@/components/desktop/DesktopContext";
import { profile } from "@/data/content";

export function About() {
  const { openApp } = useDesktop();
  const rows: [string, string][] = [
    ["Role", profile.title],
    ["Location", profile.location],
    ["Email", profile.email],
    ["Built with", "Next.js & Tailwind CSS"],
  ];

  return (
    <div className="flex h-full flex-col items-center px-6 pb-5 pt-2 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#7b6cff] via-[#c86dd7] to-[#ff8a65] text-[34px] font-bold text-white shadow-lg">
        {profile.initials}
      </div>
      <h1 className="mt-4 text-[20px] font-bold">{profile.name}</h1>
      <p className="text-[12px] text-black/45">Personal Website · {new Date().getFullYear()}</p>
      <dl className="mt-4 grid w-full grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left text-[11px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-right font-semibold text-black/70">{k}</dt>
            <dd className="truncate text-black/55">{v}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={() => openApp("notes", "about")}
        className="mt-auto rounded-md border border-black/10 bg-white px-3 py-[3px] text-[13px] shadow-[0_0.5px_1px_rgba(0,0,0,0.2)] hover:bg-black/[0.03]"
      >
        More Info…
      </button>
    </div>
  );
}
