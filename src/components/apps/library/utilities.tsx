"use client";

import { Activity, HardDrive, Image as ImageIcon, LayoutPanelTop, RefreshCw, Type } from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { APPS } from "@/components/desktop/apps";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useNowSeconds } from "@/components/desktop/hooks";
import type { AppId } from "@/components/desktop/types";
import { cx } from "@/lib/cx";
import { useDesktopPreferences } from "./storage";
import { Action, Empty, field, label, LibraryFrame, SourceHeading, SourceItem, SourceRail } from "./ui";

type Operator = "+" | "−" | "×" | "÷";
type Calculation = { value: string; left: number | null; op: Operator | null; fresh: boolean };
const clear: Calculation = { value: "0", left: null, op: null, fresh: true };
const operators: Operator[] = ["+", "−", "×", "÷"];
const keys = ["AC", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "="];
const aliases: Record<string, string> = { Enter: "=", Escape: "AC", "/": "÷", "*": "×", "-": "−" };

function result(left: number, right: number, operator: Operator) {
  const number = operator === "+" ? left + right : operator === "−" ? left - right : operator === "×" ? left * right : left / right;
  return Number.isFinite(number) ? String(Number(number.toPrecision(12))) : "Error";
}

function calculate(state: Calculation, key: string): Calculation {
  const { value, left, op, fresh } = state;
  if (key === "AC") return clear;
  if (key === "Backspace") return fresh ? state : { ...state, value: value.slice(0, -1).replace(/^-$/, "") || "0" };
  if (operators.includes(key as Operator)) {
    const next = !fresh && op && left !== null ? result(left, Number(value), op) : value;
    return next === "Error" ? { ...clear, value: next } : { value: next, left: Number(next), op: key as Operator, fresh: true };
  }
  if (key === "=") {
    return op && left !== null ? { ...clear, value: result(left, Number(value), op) } : state;
  }
  if (key === "±" || key === "%") {
    const next = key === "±" ? -Number(value) : Number(value) / 100;
    return Number.isFinite(next) ? { ...state, value: String(next), fresh: false } : state;
  }
  if (fresh || value === "Error") return { ...state, value: key === "." ? "0." : key, fresh: false };
  if (key === "." && value.includes(".")) return state;
  if (value.length > 15) return state;
  return { ...state, value: key !== "." && value === "0" ? key : value + key };
}

export function Calculator() {
  const [calc, setCalc] = useState(clear);
  const press = (key: string) => setCalc((current) => calculate(current, key));
  return (
    <LibraryFrame title="Calculator" className="calculator-app">
      <div className="mx-auto flex w-full max-w-sm min-h-0 flex-1 flex-col gap-3 overflow-auto p-3 @min-[350px]:p-5" onKeyDown={(event) => {
        const key = aliases[event.key] ?? event.key;
        if (event.key === "Enter" && event.target instanceof HTMLButtonElement) return;
        if (!keys.includes(key) && key !== "Backspace") return;
        event.preventDefault();
        press(key);
      }}>
        <div className="flex min-h-20 flex-[1_0_auto] flex-col items-end justify-end px-2">
          {calc.op && <span className="mb-1 text-sm text-white/65">{calc.left} {calc.op}</span>}
          <output tabIndex={0} aria-label="Calculator display" aria-live="polite" className="max-w-full overflow-x-auto pb-1 text-right text-[clamp(1.65rem,12cqw,3.75rem)] leading-none font-light tabular-nums">{calc.value}</output>
        </div>
        <div className="grid flex-[4_0_auto] auto-rows-fr grid-cols-4 gap-2">
          {keys.map((key) => <button type="button" key={key} onClick={() => press(key)} className={cx(
            "calculator-key min-h-8 rounded-[18px] text-xl font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
            key === "0" && "col-span-2",
            operators.includes(key as Operator) || key === "=" ? "calculator-operator" : ["AC", "±", "%"].includes(key) && "calculator-function",
          )}>{key}</button>)}
        </div>
      </div>
    </LibraryFrame>
  );
}

type ClockMode = "World Clock" | "Timer" | "Stopwatch";
const clockModes: ClockMode[] = ["World Clock", "Timer", "Stopwatch"];
const cities = [["Local time", undefined], ["Ottawa", "America/Toronto"], ["London", "Europe/London"], ["Tokyo", "Asia/Tokyo"]] as const;
const duration = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

function WorldClockFace({ city, timeZone, now }: { city: string; timeZone?: string; now: number | null }) {
  const parts = now === null ? [] : new Intl.DateTimeFormat([], {
    timeZone, hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23", numberingSystem: "latn",
  }).formatToParts(now * 1000);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const second = Number(parts.find((part) => part.type === "second")?.value ?? 0);
  const time = now === null ? null : new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", timeZone }).format(now * 1000);

  return <div className="flex min-w-0 flex-col items-center gap-1.5 py-2">
    <div aria-hidden="true" className="clock-face" data-night={hour < 6 || hour >= 19}>
      {Array.from({ length: 12 }, (_, i) => <span key={i} className="clock-tick" style={{ "--clock-angle": `${i * 30}deg` } as CSSProperties} />)}
      <span className="clock-hand clock-hour" style={{ "--clock-angle": `${hour * 30 + minute / 2}deg` } as CSSProperties} />
      <span className="clock-hand clock-minute" style={{ "--clock-angle": `${minute * 6}deg` } as CSSProperties} />
      <span className="clock-hand clock-second" style={{ "--clock-angle": `${second * 6}deg` } as CSSProperties} />
    </div>
    <h2 className="mt-1 text-sm font-semibold">{city}</h2>
    <span className="text-xs text-[var(--app-muted)] tabular-nums">{time}</span>
  </div>;
}

export function ClockApp() {
  const now = useNowSeconds();
  const [mode, setMode] = useState<ClockMode>("World Clock");
  const [minutes, setMinutes] = useState("1");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [started, setStarted] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const remaining = deadline && now !== null ? Math.max(0, Math.ceil((deadline - now * 1000) / 1000)) : 0;
  const running = deadline !== null && remaining > 0;
  const timerMinutes = Number(minutes);
  const seconds = Math.max(0, Math.floor((elapsed + (started && now !== null ? Math.max(0, now * 1000 - started) : 0)) / 1000));

  return (
    <LibraryFrame title="Clock" className="[--app-accent:#815228] [--app-paper:#faf8f5]" controls={clockModes.map((item) => <Action key={item} primary={item === mode} aria-pressed={item === mode} onClick={() => setMode(item)}>{item}</Action>)}>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {mode === "World Clock" ? (
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
            {cities.map(([city, timeZone]) => <WorldClockFace key={city} city={city} timeZone={timeZone} now={now} />)}
          </div>
        ) : (
          <div className="mx-auto max-w-sm space-y-5 px-4 py-8 text-center">
            <output aria-label={mode} className="block text-7xl leading-none font-light tracking-tight tabular-nums">{duration(mode === "Timer" ? remaining : seconds)}</output>
            {mode === "Timer" ? <>
              <label className={cx(label, "mx-auto max-w-32 text-left")}>Minutes <input className={field} type="number" min="1" max="180" value={minutes} onChange={(event) => setMinutes(event.target.value)} /></label>
              <div className="flex flex-wrap justify-center gap-2">
                <Action primary disabled={!Number.isInteger(timerMinutes) || timerMinutes < 1 || timerMinutes > 180} onClick={() => setDeadline(Date.now() + timerMinutes * 60000)}>{running ? "Restart timer" : "Start timer"}</Action>
                <Action disabled={deadline === null} onClick={() => setDeadline(null)}>Clear</Action>
              </div>
              {deadline !== null && remaining === 0 && <p role="status" className="text-sm font-semibold text-[#315f9e]">Timer complete</p>}
            </> : <div className="flex justify-center gap-2">
              <Action primary onClick={() => {
                if (started === null) setStarted(Date.now());
                else { setElapsed((value) => value + Date.now() - started); setStarted(null); }
              }}>{started === null ? "Start" : "Pause"}</Action>
              <Action onClick={() => { setStarted(null); setElapsed(0); }}>Reset</Action>
            </div>}
          </div>
        )}
      </div>
    </LibraryFrame>
  );
}

export function SystemSettings() {
  const [prefs, setPrefs] = useDesktopPreferences();
  const [section, setSection] = useState<"Wallpaper" | "Desktop & Dock">("Wallpaper");
  return (
    <LibraryFrame title="System Settings">
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="Settings sections">
          <SourceItem icon={<ImageIcon aria-hidden="true" className="size-4" />} selected={section === "Wallpaper"} onClick={() => setSection("Wallpaper")}>Wallpaper</SourceItem>
          <SourceItem icon={<LayoutPanelTop className="size-4" />} selected={section === "Desktop & Dock"} onClick={() => setSection("Desktop & Dock")}>Desktop &amp; Dock</SourceItem>
        </SourceRail>
        <section className="min-h-0 flex-1 overflow-auto bg-[#f8f9fc] p-5">
          <h2 className="mb-4 text-lg font-semibold">{section}</h2>
          {section === "Wallpaper" ? <div className="grid grid-cols-2 gap-3">
            {(["portrait", "coast"] as const).map((wallpaper) => (
              <button type="button" key={wallpaper} aria-pressed={prefs.wallpaper === wallpaper} onClick={() => setPrefs((current) => ({ ...current, wallpaper }))}
                className="overflow-hidden rounded-lg border border-[var(--app-line)] bg-white text-left text-sm font-semibold aria-pressed:ring-2 aria-pressed:ring-[var(--app-accent)]">
                <span aria-hidden="true" className={cx("block aspect-video bg-cover bg-center", wallpaper === "portrait" ? "bg-[url(/wallpapers/alanna-portrait.webp)]" : "bg-[url(/wallpapers/coastal-dusk.webp)]")} />
                <span className="block px-3 py-2">{wallpaper === "portrait" ? "Alanna Portrait" : "Coastal Dusk"}</span>
              </button>
            ))}
          </div> : <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--app-line)] bg-white p-4 text-sm font-medium">
            Dock magnification
            <span className="app-switch">
              <input type="checkbox" role="switch" checked={prefs.magnification} onChange={(event) => setPrefs((current) => ({ ...current, magnification: event.target.checked }))} />
              <span aria-hidden="true" />
            </span>
          </label>}
        </section>
      </div>
    </LibraryFrame>
  );
}

export function ActivityMonitor() {
  const { state, openApp, closeApp } = useDesktop();
  const windows = (Object.keys(state.wins) as AppId[]).filter((id) => state.wins[id].open).sort((a, b) => state.wins[b].z - state.wins[a].z);
  return (
    <LibraryFrame title="Activity Monitor">
      <div className="min-h-0 flex-1 overflow-auto">
        <table aria-label="Open windows" className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 border-b border-[var(--app-line)] bg-[var(--app-chrome)] text-xs text-[var(--app-muted)]">
            <tr><th scope="col" className="px-3 py-2.5 font-semibold">Window</th><th scope="col" className="px-2 py-2.5 font-semibold">State</th><th scope="col" className="px-3 py-2.5 text-right font-semibold">Actions</th></tr>
          </thead>
          <tbody>
          {windows.map((id) => (
            <tr key={id} className="even:bg-[#f1f5fa]">
              <th scope="row" className="px-3 py-2 font-medium">{APPS[id].title}</th>
              <td className="px-2 py-2 text-xs text-[var(--app-muted)]">{state.wins[id].minimized ? "Minimized" : state.focused === id ? "Focused" : "Open"}</td>
              <td className="px-3 py-1.5"><div className="flex flex-wrap justify-end gap-1.5">
                <Action aria-label={`Show ${APPS[id].title}`} onClick={() => openApp(id)}>Show</Action>
                {id !== "activity" && <Action aria-label={`Close ${APPS[id].title}`} onClick={() => closeApp(id)}>Close</Action>}
              </div></td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 border-t border-[var(--app-line)] bg-[var(--app-chrome)] px-3 py-2 text-xs text-[var(--app-muted)]">
        <Activity aria-hidden="true" className="size-4 text-[var(--app-accent)]" />
        {windows.length} open {windows.length === 1 ? "window" : "windows"}
      </div>
    </LibraryFrame>
  );
}

const bytes = (value: number) => new Intl.NumberFormat([], { style: "unit", unit: value >= 1e9 ? "gigabyte" : "megabyte", maximumFractionDigits: 2 }).format(value >= 1e9 ? value / 1e9 : value / 1e6);

export function DiskUtility() {
  const [estimate, setEstimate] = useState<StorageEstimate | "unavailable" | null>(null);
  const [request, setRequest] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const next = await navigator.storage?.estimate();
        if (active) setEstimate(next ?? "unavailable");
      } catch {
        if (active) setEstimate("unavailable");
      }
    };
    void load();
    return () => { active = false; };
  }, [request]);
  return (
    <LibraryFrame title="Disk Utility" controls={<Action onClick={() => setRequest((value) => value + 1)}><RefreshCw className="size-4" />Refresh</Action>}>
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="Storage volumes" className="hidden @min-[530px]:flex">
          <SourceHeading>Volumes</SourceHeading>
          <span className="app-ref-row bg-[var(--app-selection)]"><HardDrive className="size-4" />Browser Storage</span>
        </SourceRail>
        <section className="min-h-0 min-w-0 flex-1 overflow-auto p-5">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#b9c6d7] bg-linear-to-br from-white to-[#bccadd]"><HardDrive aria-hidden="true" className="size-6 text-[#37536f]" /></span>
            <div><h2 className="text-lg font-semibold">Browser Storage</h2><p className="text-xs text-[var(--app-muted)]">Files and data saved by this site</p></div>
          </div>
          {estimate && estimate !== "unavailable" && <>
            <progress aria-label="Storage used" className="storage-meter w-full" value={estimate.usage ?? 0} max={estimate.quota || 1} />
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--app-line)] pt-4 text-sm">
              <div><dt className="text-[#50627b]">Used</dt><dd className="font-semibold">{bytes(estimate.usage ?? 0)}</dd></div>
              <div><dt className="text-[#50627b]">Quota</dt><dd className="font-semibold">{estimate.quota ? bytes(estimate.quota) : "Unavailable"}</dd></div>
            </dl>
          </>}
          {estimate === "unavailable" && <Empty>This browser did not provide a storage estimate.</Empty>}
          {estimate === null && <p role="status" className="text-sm">Reading storage estimate…</p>}
        </section>
      </div>
    </LibraryFrame>
  );
}

const fonts = [
  { name: "System Sans", family: "system-ui, sans-serif" },
  { name: "Georgia", family: "Georgia, serif" },
  { name: "Helvetica", family: "Helvetica, Arial, sans-serif" },
  { name: "Courier New", family: '"Courier New", monospace' },
  { name: "Verdana", family: "Verdana, sans-serif" },
  { name: "Trebuchet", family: '"Trebuchet MS", sans-serif' },
];

export function FontBook() {
  const [selected, setSelected] = useState(fonts[0]);
  const [sample, setSample] = useState("The quick brown fox jumps over the lazy dog.");
  const [size, setSize] = useState(42);
  return (
    <LibraryFrame title="Font Book" controls={<label className="flex items-center gap-2 text-sm font-semibold">
      Size <input type="range" aria-label="Font size" min="16" max="72" value={size} onChange={(event) => setSize(Number(event.target.value))} /> {size}px
    </label>}>
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="Typefaces">
          <SourceHeading>All Fonts</SourceHeading>
          {fonts.map((font) => <SourceItem key={font.name} icon={<Type className="size-4" />} selected={font === selected} onClick={() => setSelected(font)}>{font.name}</SourceItem>)}
        </SourceRail>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <label className={label}>Preview text<input className={field} value={sample} onChange={(event) => setSample(event.target.value)} /></label>
          <section className="mt-6 border-t border-[var(--app-line)] pt-4">
            <h2 className="mb-3 text-xs font-semibold text-[var(--app-muted)]">{selected.name}</h2>
            <p className="leading-tight break-words" style={{ fontFamily: selected.family, fontSize: size }}>{sample}</p>
            <p className="mt-5 text-lg tracking-wide" style={{ fontFamily: selected.family }}>Aa Bb Cc Dd 0123456789</p>
          </section>
        </div>
      </div>
    </LibraryFrame>
  );
}
