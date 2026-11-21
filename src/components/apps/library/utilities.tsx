"use client";

import { Activity, Clock3, Database, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { APPS } from "@/components/desktop/apps";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useNowSeconds } from "@/components/desktop/hooks";
import type { AppId } from "@/components/desktop/types";
import { cx } from "@/lib/cx";
import { useDesktopPreferences } from "./storage";
import { Action, Empty, field, label, LibraryFrame, Panel } from "./ui";

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
    <LibraryFrame title="Calculator" className="bg-[#172b44] text-white">
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto p-4" onKeyDown={(event) => {
        const key = aliases[event.key] ?? event.key;
        if (event.key === "Enter" && event.target instanceof HTMLButtonElement) return;
        if (!keys.includes(key) && key !== "Backspace") return;
        event.preventDefault();
        press(key);
      }}>
        <output tabIndex={0} aria-label="Calculator display" aria-live="polite" className="flex min-h-[70px] shrink-0 items-end justify-end overflow-x-auto rounded-xl bg-[#0c1d32] px-4 pb-3 text-right font-mono text-3xl tabular-nums">{calc.value}</output>
        <div className="grid flex-1 grid-cols-4 gap-2">
          {keys.map((key) => <button type="button" key={key} onClick={() => press(key)} className={cx(
            "min-h-9 rounded-lg text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
            key === "0" && "col-span-2",
            operators.includes(key as Operator) || key === "=" ? "bg-[#f0b267] text-[#272014] hover:bg-[#ffd490]" : "bg-white/12 hover:bg-white/22",
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
    <LibraryFrame title="Clock" controls={clockModes.map((item) => <Action key={item} primary={item === mode} aria-pressed={item === mode} onClick={() => setMode(item)}>{item}</Action>)}>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {mode === "World Clock" ? (
          <div className="grid grid-cols-2 gap-3">
            {cities.map(([city, timeZone]) => <Panel key={city} className="min-w-0">
              <h2 className="text-sm font-semibold text-[#50627b]">{city}</h2>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{now !== null && new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", timeZone }).format(now * 1000)}</p>
            </Panel>)}
          </div>
        ) : (
          <Panel className="mx-auto max-w-sm space-y-4 text-center">
            <Clock3 aria-hidden="true" className="mx-auto size-7 text-[#315f9e]" />
            <output aria-label={mode} className="block font-mono text-5xl tracking-tight tabular-nums">{duration(mode === "Timer" ? remaining : seconds)}</output>
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
          </Panel>
        )}
      </div>
    </LibraryFrame>
  );
}

export function SystemSettings() {
  const [prefs, setPrefs] = useDesktopPreferences();
  return (
    <LibraryFrame title="System Settings">
      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
        <Panel>
          <h2 className="mb-3 font-semibold">Wallpaper</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["portrait", "coast"] as const).map((wallpaper) => (
              <button type="button" key={wallpaper} aria-pressed={prefs.wallpaper === wallpaper} onClick={() => setPrefs((current) => ({ ...current, wallpaper }))}
                className="overflow-hidden rounded-lg border border-[#dbe4ef] text-left text-sm font-semibold aria-pressed:ring-2 aria-pressed:ring-[#315f9e]">
                <span aria-hidden="true" className={cx("block aspect-video bg-cover bg-center", wallpaper === "portrait" ? "bg-[url(/wallpapers/alanna-portrait.webp)]" : "bg-[url(/wallpapers/coastal-dusk.webp)]")} />
                <span className="block px-3 py-2">{wallpaper === "portrait" ? "Alanna Portrait" : "Coastal Dusk"}</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel>
          <label className="flex items-center justify-between gap-2 font-semibold">
            Dock magnification
            <input type="checkbox" checked={prefs.magnification} onChange={(event) => setPrefs((current) => ({ ...current, magnification: event.target.checked }))} className="size-5 accent-[#315f9e]" />
          </label>
        </Panel>
      </div>
    </LibraryFrame>
  );
}

export function ActivityMonitor() {
  const { state, openApp, closeApp } = useDesktop();
  const windows = (Object.keys(state.wins) as AppId[]).filter((id) => state.wins[id].open).sort((a, b) => state.wins[b].z - state.wins[a].z);
  return (
    <LibraryFrame title="Activity Monitor">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        <Panel className="flex items-center gap-3">
          <Activity aria-hidden="true" className="size-6 text-[#315f9e]" />
          <h2 className="font-semibold">{windows.length} open desktop {windows.length === 1 ? "window" : "windows"}</h2>
        </Panel>
        <ul aria-label="Open desktop windows" className="divide-y divide-[#e1e8f2] overflow-hidden rounded-xl border border-[#dbe4ef] bg-white">
          {windows.map((id) => (
            <li key={id} className="flex flex-wrap items-center gap-2 px-4 py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{APPS[id].title}</div>
                <div className="text-xs text-[#50627b]">{state.wins[id].minimized ? "Minimized" : state.focused === id ? "Focused" : "Open"}</div>
              </div>
              <Action onClick={() => openApp(id)}>Show</Action>
              {id !== "activity" && <Action aria-label={`Close ${APPS[id].title}`} onClick={() => closeApp(id)}>Close</Action>}
            </li>
          ))}
        </ul>
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
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        <Panel>
          <Database aria-hidden="true" className="mb-3 size-7 text-[#315f9e]" />
          <h2 className="text-lg font-semibold">Portfolio browser storage</h2>
          <p className="mt-1 text-sm text-[#50627b]">Browser estimates for the files and data saved by this site.</p>
          {estimate && estimate !== "unavailable" && <>
            <progress aria-label="Storage used" className="mt-4 h-2 w-full accent-[#315f9e]" value={estimate.usage ?? 0} max={estimate.quota || 1} />
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-[#50627b]">Used</dt><dd className="font-semibold">{bytes(estimate.usage ?? 0)}</dd></div>
              <div><dt className="text-[#50627b]">Quota</dt><dd className="font-semibold">{estimate.quota ? bytes(estimate.quota) : "Unavailable"}</dd></div>
            </dl>
          </>}
        </Panel>
        {estimate === "unavailable" && <Empty>This browser did not provide a storage estimate.</Empty>}
        {estimate === null && <p role="status" className="text-sm">Reading storage estimate…</p>}
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
      <div className="flex min-h-0 flex-1 flex-col @min-[510px]:flex-row">
        <aside aria-label="Typefaces" className="max-h-32 shrink-0 space-y-1 overflow-auto border-[#dbe4ef] bg-[#e4edf8] p-3 @min-[510px]:max-h-none @min-[510px]:w-40 @min-[510px]:border-r">
          {fonts.map((font) => <button type="button" key={font.name} aria-pressed={font === selected} onClick={() => setSelected(font)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/65 aria-pressed:bg-white">{font.name}</button>)}
        </aside>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <label className={label}>Preview text<input className={field} value={sample} onChange={(event) => setSample(event.target.value)} /></label>
          <Panel className="mt-3">
            <h2 className="mb-3 text-sm font-semibold text-[#50627b]">{selected.name}</h2>
            <p className="leading-tight break-words" style={{ fontFamily: selected.family, fontSize: size }}>{sample}</p>
            <p className="mt-5 text-lg tracking-wide" style={{ fontFamily: selected.family }}>Aa Bb Cc Dd 0123456789</p>
          </Panel>
        </div>
      </div>
    </LibraryFrame>
  );
}
