"use client";

import { useDesktop } from "@/components/desktop/DesktopContext";
import { AboutIcon } from "@/components/desktop/icons";
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
    <div className="flex h-full flex-col items-center overflow-y-auto bg-[#f8faff] px-6 pt-4 pb-5 text-center">
      <div className="size-20 shrink-0">
        <AboutIcon />
      </div>
      <h1 className="mt-4 text-[20px] font-bold">{profile.name}</h1>
      <p className="text-[12px] text-[#54647d]">Personal Website</p>
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
        className="mt-auto rounded-md border border-[#ccd7e8] bg-white px-3 py-1 text-[13px] shadow-sm hover:bg-[#eef3fa]"
      >
        More Info…
      </button>
    </div>
  );
}
