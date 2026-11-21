"use client";

import { Download, Maximize, PanelLeft, Scan, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useWindowCommands } from "@/components/desktop/windowCommands";
import { profile, resume } from "@/data/content";
import { ToolButton, Toolbar } from "./ui";

// Put your résumé at public/resume.pdf and set this to "/resume.pdf" to enable the download button.
const RESUME_PDF: string | null = null;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;

export function Preview() {
  const { isMobile } = useDesktop();
  const [thumbnails, setThumbnails] = useState<boolean | null>(null);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const canvas = useRef<HTMLDivElement>(null);
  const showThumbnails = thumbnails ?? !isMobile;
  const fit = canvasWidth ? Math.min(1, Math.max(MIN_ZOOM, (canvasWidth - 32) / PAGE_WIDTH)) : 0.55;
  const scale = manualZoom ?? fit;
  const applyStep = (direction: 1 | -1) => {
    setManualZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((scale + 0.1 * direction) * 100) / 100)));
  };

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const measure = () => setCanvasWidth(element.clientWidth);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);

  useWindowCommands("preview", (command) => {
    switch (command) {
      case "sidebar": setThumbnails(!showThumbnails); break;
      case "zoom-in": applyStep(1); break;
      case "zoom-out": applyStep(-1); break;
      case "actual-size": setManualZoom(1); break;
      case "fit": setManualZoom(null); break;
    }
  });

  return (
    <div className="flex h-full flex-col bg-[#e1e6ee]">
      <Toolbar inset className="border-b border-[#d8deea] bg-[#f1f4fa]">
        <ToolButton label={showThumbnails ? "Hide Thumbnails" : "Show Thumbnails"} pressed={showThumbnails} onClick={() => setThumbnails(!showThumbnails)}>
          <PanelLeft className="size-4" />
        </ToolButton>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[13px] font-bold text-black/80">Résumé.pdf</div>
          <div className="truncate text-[11px] text-[#52627b]">Page 1 of 1 · {Math.round(scale * 100)}%</div>
        </div>
        <ToolButton label="Zoom Out" disabled={scale <= MIN_ZOOM} onClick={() => applyStep(-1)}><ZoomOut className="size-4" /></ToolButton>
        <ToolButton label="Zoom In" disabled={scale >= MAX_ZOOM} onClick={() => applyStep(1)}><ZoomIn className="size-4" /></ToolButton>
        <ToolButton label="Actual Size" pressed={manualZoom === 1} onClick={() => setManualZoom(1)} className="max-[420px]:hidden"><Scan className="size-4" /></ToolButton>
        <ToolButton label="Fit Width" pressed={manualZoom === null} onClick={() => setManualZoom(null)}><Maximize className="size-4" /></ToolButton>
        {RESUME_PDF && (
          <a href={RESUME_PDF} download title="Download PDF" aria-label="Download PDF" className="flex h-7 w-7 items-center justify-center rounded-md text-black/55 hover:bg-black/[0.06]">
            <Download className="size-4" />
          </a>
        )}
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        {showThumbnails && (
          <aside aria-label="Page thumbnails" className="w-[112px] shrink-0 overflow-y-auto border-r border-[#cbd4e1] bg-[#e9eef7] p-2.5 max-sm:w-[78px]">
            <div className="relative mx-auto flex w-full flex-col items-center gap-1.5 rounded-lg border border-[#9eb5d9] bg-[#d9e6f9] p-1.5 text-[11px] font-medium text-[#2a4777]">
              <div aria-hidden="true" className="h-[91px] w-[70.38px] overflow-hidden bg-white shadow-sm max-sm:h-[65px] max-sm:w-[50.23px]">
                <div className="origin-top-left scale-[.115] max-sm:scale-[.082]"><ResumePage /></div>
              </div>
              <span aria-hidden="true">1</span>
              <button
                type="button"
                aria-label="Page 1"
                aria-current="page"
                onClick={() => canvas.current?.scrollTo({ top: 0, left: 0 })}
                className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-[#2b61bb]"
              />
            </div>
          </aside>
        )}
        <div ref={canvas} className="min-w-0 flex-1 overflow-auto p-4">
          <div style={{ width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale }} className="mx-auto overflow-hidden bg-white shadow-[0_2px_12px_rgba(20,42,72,.22)]">
            <div style={{ transform: `scale(${scale})` }} className="origin-top-left">
              <ResumePage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumePage() {
  return (
    <article className="h-[792px] w-[612px] select-text bg-white px-14 py-12 text-[#1d1d1f]">
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
                {job.role} · {job.company}
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
              <span className="font-semibold">{e.school}</span> · {e.degree}
            </span>
            <span className="text-black/50">{e.period}</span>
          </div>
        ))}
      </Section>

      <Section title="Skills">
        <p className="text-[12px] text-black/75">{resume.skills.join(" · ")}</p>
      </Section>
    </article>
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
