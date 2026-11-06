"use client";

import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { profile, resume } from "@/data/content";
import { ToolButton, Toolbar } from "./ui";

// Put your résumé at public/resume.pdf and set this to "/resume.pdf" to enable the download button.
const RESUME_PDF: string | null = null;

export function Preview() {
  const { isMobile } = useDesktop();
  const [zoom, setZoom] = useState(1);
  const scale = isMobile ? 0.62 : zoom;

  return (
    <div className="flex h-full flex-col bg-[#e3e3e6]">
      <Toolbar inset className="border-b border-black/10 bg-[#f6f6f6]">
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[13px] font-bold text-black/80">Résumé.pdf</div>
          <div className="text-[11px] text-black/45">Page 1 of 1</div>
        </div>
        {!isMobile && (
          <>
            <ToolButton label="Zoom out" disabled={zoom <= 0.6} onClick={() => setZoom((z) => +(z - 0.1).toFixed(1))}>
              <ZoomOut className="size-4" />
            </ToolButton>
            <ToolButton label="Zoom in" disabled={zoom >= 1.6} onClick={() => setZoom((z) => +(z + 0.1).toFixed(1))}>
              <ZoomIn className="size-4" />
            </ToolButton>
          </>
        )}
        {RESUME_PDF && (
          <a href={RESUME_PDF} download title="Download PDF" aria-label="Download PDF" className="flex h-7 w-7 items-center justify-center rounded-md text-black/55 hover:bg-black/[0.06]">
            <Download className="size-4" />
          </a>
        )}
      </Toolbar>

      <div className="min-h-0 flex-1 overflow-auto p-6 max-sm:p-3">
        <div style={{ width: 612 * scale, height: 792 * scale }} className="mx-auto">
          <article
            style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
            className="h-[792px] w-[612px] select-text bg-white px-14 py-12 text-[#1d1d1f] shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
          >
            <header className="border-b border-black/15 pb-4">
              <h1 className="text-[26px] font-bold tracking-tight">{profile.name}</h1>
              <p className="text-[13px] text-black/60">
                {profile.title} · {profile.location} · {profile.email}
              </p>
            </header>
            <p className="mt-4 text-[12px] leading-relaxed text-black/75">{resume.summary}</p>

            <Section title="Experience">
              {resume.experience.map((job, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-[12.5px]">
                    <span className="font-semibold">
                      {job.role} — {job.company}
                    </span>
                    <span className="text-black/50">{job.period}</span>
                  </div>
                  <ul className="mt-1 list-disc pl-4 text-[12px] leading-relaxed text-black/75">
                    {job.points.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Section>

            <Section title="Education">
              {resume.education.map((e, i) => (
                <div key={i} className="flex justify-between text-[12.5px]">
                  <span>
                    <span className="font-semibold">{e.school}</span> — {e.degree}
                  </span>
                  <span className="text-black/50">{e.period}</span>
                </div>
              ))}
            </Section>

            <Section title="Skills">
              <p className="text-[12px] text-black/75">{resume.skills.join(" · ")}</p>
            </Section>
          </article>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">{title}</h2>
      {children}
    </section>
  );
}
