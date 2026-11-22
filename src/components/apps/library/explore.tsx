"use client";

import { ArrowLeft, ArrowRight, Bookmark, Cloud, CloudRain, CloudSun, Compass, ExternalLink, MapPin, PanelLeft, Plus, Search, Snowflake, Sun, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { githubLink, linkedinLink } from "@/data/content";
import { cx } from "@/lib/cx";
import { useLibraryStorage } from "./storage";
import { Action, Empty, externalAction, field, LibraryFrame, Panel, SourceHeading, SourceItem, SourceRail } from "./ui";

type Page = { kind: "home" } | { kind: "web"; url: string } | { kind: "search"; query: string } | { kind: "article"; title: string };
type Tab = { id: string; pages: Page[]; cursor: number };
const home: Page = { kind: "home" };
const initialTab: Tab = { id: "first", pages: [home], cursor: 0 };
const shortcuts = [
  { title: "GitHub", url: githubLink.href },
  { title: "LinkedIn", url: linkedinLink.href },
  { title: "MDN Web Docs", url: "https://developer.mozilla.org/" },
  { title: "Wikipedia", url: "https://en.wikipedia.org/" },
];

function addressPage(input: string): Page {
  const value = input.trim();
  if (!value) return home;
  if (/^https?:\/\//i.test(value) || /^[^\s/:]+\.[^\s/]+(?:\/\S*)?$/.test(value)) {
    try {
      const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      if (url.hostname && !url.username && !url.password) {
        if (url.hostname === "en.wikipedia.org" && url.pathname.startsWith("/wiki/")) {
          return { kind: "article", title: decodeURIComponent(url.pathname.slice(6)).replaceAll("_", " ") };
        }
        return { kind: "web", url: url.href };
      }
    } catch {
      // Treat malformed addresses as search text.
    }
  }
  return { kind: "search", query: value };
}

function pageLabel(page: Page) {
  if (page.kind === "home") return "Start Page";
  if (page.kind === "search") return page.query;
  if (page.kind === "article") return page.title;
  return new URL(page.url).hostname;
}

function pageAddress(page: Page) {
  if (page.kind === "home") return "";
  if (page.kind === "search") return page.query;
  if (page.kind === "article") return `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`;
  return page.url;
}

type SearchResult = { pageid: number; title: string };
type WikiResponse = { extract?: string; description?: string; query?: { search: SearchResult[] } };

function BrowserPage({ page, navigate }: { page: Page; navigate: (page: Page) => void }) {
  const [data, setData] = useState<WikiResponse | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (page.kind !== "article" && page.kind !== "search") return;
    const controller = new AbortController();
    const endpoint = page.kind === "article"
      ? `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`
      : `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&srnamespace=0&srlimit=8&format=json&srsearch=${encodeURIComponent(page.query)}`;
    fetch(endpoint, { signal: controller.signal, referrerPolicy: "no-referrer" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Wikipedia request failed");
        setData(await response.json());
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [page]);

  if (page.kind === "home") return (
    <div className="mx-auto max-w-[620px] space-y-4 px-5 py-7 @min-[510px]:py-12">
      <h2 className="text-2xl font-semibold tracking-tight">Start Page</h2>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[#50627b]">Favorites</h3>
        <div className="grid grid-cols-2 gap-2 @min-[610px]:grid-cols-4">
          {shortcuts.map((shortcut) => <button type="button" key={shortcut.url} onClick={() => navigate({ kind: "web", url: shortcut.url })}
            className="group grid min-h-20 place-content-center gap-2 rounded-xl border border-[#dbe4ef] bg-white px-2 text-center text-xs font-medium hover:bg-[#eef5ff]">
            <span className="mx-auto grid size-8 place-items-center rounded-lg bg-[#ddeafb] text-[#2f629e]"><Compass aria-hidden="true" className="size-5" /></span>
            {shortcut.title}
          </button>)}
        </div>
      </div>
    </div>
  );
  if (page.kind === "web") {
    const url = new URL(page.url);
    const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : ["www.youtube.com", "youtube.com"].includes(url.hostname) ? url.searchParams.get("v") : null;
    if (id && /^[\w-]{11}$/.test(id)) return <iframe title="YouTube player" className="h-full min-h-56 w-full border-0" src={`https://www.youtube-nocookie.com/embed/${id}`} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
    return <div className="mx-auto max-w-lg p-5"><Panel className="space-y-3">
      <h2 className="text-lg font-semibold break-all">{url.hostname}</h2>
      <p className="text-sm text-[#50627b]">Open this website in your browser.</p>
      <a href={url.href} target="_blank" rel="noopener noreferrer" className={externalAction}>Open in new tab <ExternalLink className="size-4" /></a>
    </Panel></div>;
  }
  return (
    <div className="mx-auto max-w-xl space-y-3 p-4">
      {error ? <Panel className="space-y-3">
        <p role="status" className="text-sm">Wikipedia did not respond. You can open the page directly.</p>
        <a href={page.kind === "article" ? pageAddress(page) : `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(page.query)}`} target="_blank" rel="noopener noreferrer" className={externalAction}>Open Wikipedia <ExternalLink className="size-4" /></a>
      </Panel> : !data ? <p role="status" className="text-sm">Loading Wikipedia…</p> : page.kind === "article" ? <article className="space-y-4 py-6 @min-[610px]:py-10">
        <h2 className="text-3xl leading-tight font-semibold tracking-tight">{page.title}</h2>
        {data.description && <p className="text-sm text-[#50627b]">{data.description}</p>}
        <p className="border-t border-[var(--app-line)] pt-4 text-[15px] leading-7">{data.extract ?? "No summary is available."}</p>
        <a href={pageAddress(page)} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#315f9e] underline">Read on Wikipedia</a>
      </article> : <>
        <h2 className="text-base font-semibold">Wikipedia results</h2>
        {data.query?.search.map((hit) => <Action key={hit.pageid} className="flex w-full justify-between whitespace-normal text-left" onClick={() => navigate({ kind: "article", title: hit.title })}>{hit.title}<ArrowRight className="size-4 shrink-0" /></Action>)}
        {!data.query?.search.length && <Empty>No results for “{page.query}”.</Empty>}
      </>}
    </div>
  );
}

export function SafariApp() {
  const { isMobile } = useDesktop();
  const [tabs, setTabs] = useState([initialTab]);
  const [active, setActive] = useState(initialTab.id);
  const [input, setInput] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const tab = tabs.find((item) => item.id === active) ?? tabs[0];
  const page = tab.pages[tab.cursor];
  const navigate = (next: Page) => {
    setTabs((items) => items.map((item) => item.id === tab.id ? { ...item, pages: [...item.pages.slice(0, item.cursor + 1), next], cursor: item.cursor + 1 } : item));
    setInput(null);
  };
  const move = (step: number) => {
    setTabs((items) => items.map((item) => item.id === tab.id ? { ...item, cursor: item.cursor + step } : item));
    setInput(null);
  };
  const remove = (id: string) => {
    const next = tabs.filter((item) => item.id !== id);
    if (next.length < 1) return;
    setTabs(next);
    if (active === id) { setActive(next[0].id); setInput(null); }
  };

  const address = (
    <form className="relative mx-auto flex w-full min-w-32 max-w-[470px] flex-1" onSubmit={(event) => { event.preventDefault(); navigate(addressPage(input ?? pageAddress(page))); }}>
      <Search aria-hidden="true" className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#63768e]" />
      <input aria-label="Address or search Wikipedia" placeholder="Enter an address or search Wikipedia" className={cx(field, "rounded-full bg-white pl-8")} value={input ?? pageAddress(page)} onChange={(event) => setInput(event.target.value)} />
    </form>
  );
  const controls = (
    <>
      {!isMobile && <Action aria-label="Toggle Favorites sidebar" aria-pressed={showFavorites} onClick={() => setShowFavorites((visible) => !visible)}><PanelLeft className="size-4" /></Action>}
      <Action aria-label="Back" disabled={tab.cursor === 0} onClick={() => move(-1)}><ArrowLeft className="size-4" /></Action>
      <Action aria-label="Forward" disabled={tab.cursor === tab.pages.length - 1} onClick={() => move(1)}><ArrowRight className="size-4" /></Action>
      {isMobile ? <Action aria-label="Toggle Favorites sidebar" aria-pressed={showFavorites} onClick={() => setShowFavorites((visible) => !visible)}><Bookmark className="size-4" /></Action> : address}
      <Action aria-label="New tab" onClick={() => {
        const id = crypto.randomUUID();
        setTabs((current) => [...current, { ...initialTab, id }]);
        setActive(id);
        setInput(null);
      }}><Plus className="size-4" /></Action>
    </>
  );
  const tabStrip = tabs.length > 1 && (
    <div aria-label="Browser tabs" className="flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--app-line)] bg-[var(--app-chrome)] px-3 py-1.5">
        {tabs.map((item) => <div key={item.id} className={cx("flex max-w-48 items-center rounded-lg border border-[#dbe4ef]", item.id === active && "bg-white")}>
          <button type="button" aria-pressed={item.id === active} onClick={() => { setActive(item.id); setInput(null); }} className="truncate px-3 py-2 text-xs font-semibold">{pageLabel(item.pages[item.cursor])}</button>
          <button type="button" aria-label={`Close ${pageLabel(item.pages[item.cursor])} tab`} onClick={() => remove(item.id)} className="mr-1 rounded p-1 hover:bg-[#dee8f6]"><X className="size-3" /></button>
        </div>)}
    </div>
  );
  return (
    <LibraryFrame controls={!isMobile && controls}>
      {!isMobile && tabStrip}
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        {showFavorites && <SourceRail label="Browser favorites">
          <SourceHeading>Favorites</SourceHeading>
          <SourceItem icon={<Compass className="size-4" />} onClick={() => navigate(home)}>Start Page</SourceItem>
          {shortcuts.map((shortcut) => <SourceItem key={shortcut.url} icon={<Bookmark className="size-4" />} onClick={() => navigate({ kind: "web", url: shortcut.url })}>{shortcut.title}</SourceItem>)}
        </SourceRail>}
        <div className={cx("min-h-0 min-w-0 flex-1 overflow-auto", page.kind === "home" && "bg-linear-to-br from-[#f6faff] to-[#eef2fa]")}>
          <BrowserPage key={JSON.stringify(page)} page={page} navigate={navigate} />
        </div>
      </div>
      {isMobile && <div className="shrink-0 border-t border-[var(--app-line)] bg-[var(--app-chrome)]">
        {tabStrip}
        <div className="px-3 pt-2">{address}</div>
        <div aria-label="Browser controls" className="flex justify-around gap-2 px-4 py-1">
          {controls}
        </div>
      </div>}
    </LibraryFrame>
  );
}

type Place = { id: number; name: string; admin1?: string; country?: string; latitude: number; longitude: number };
const ottawa: Place = { id: 6094817, name: "Ottawa", admin1: "Ontario", country: "Canada", latitude: 45.4215, longitude: -75.6972 };
const placeName = (place: Place) => [place.name, place.admin1 && place.admin1 !== place.name ? place.admin1 : "", place.country].filter(Boolean).join(", ");

function PlacePicker({ onChoose }: { onChoose: (place: Place) => void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="min-w-48 flex-1">
      <form className="flex gap-2" onSubmit={async (event) => {
        event.preventDefault();
        if (search.trim().length < 2 || pending) return;
        setPending(true);
        setResults([]);
        setStatus("Finding places…");
        try {
          const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search.trim())}&count=5&language=en`;
          const response = await fetch(endpoint, { referrerPolicy: "no-referrer", signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error("Place lookup failed");
          const data = await response.json() as { results?: Place[] };
          setResults(data.results ?? []);
          setStatus(data.results?.length ? "" : "No matching places.");
        } catch {
          setStatus("Place search is unavailable.");
        } finally {
          setPending(false);
        }
      }}>
        <input aria-label="Search for a city" className={field} placeholder="Search for a city" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Action type="submit" aria-label="Find city" disabled={pending || search.trim().length < 2}><Search className="size-4" /></Action>
      </form>
      {status && <p role="status" className="mt-1 text-xs text-[#50627b]">{status}</p>}
      {results.length > 0 && <ul className="mt-2 space-y-1 rounded-lg border border-[#dbe4ef] bg-white p-1">
        {results.map((place) => <li key={place.id}><button type="button" className="w-full rounded px-3 py-1 text-left text-sm hover:bg-[#eaf1fb]" onClick={() => { onChoose(place); setResults([]); setSearch(""); }}>{placeName(place)}</button></li>)}
      </ul>}
    </div>
  );
}

export function Maps() {
  const [place, setPlace] = useState(ottawa);
  const { latitude: lat, longitude: lng } = place;
  const bbox = [lng - 0.072, lat - 0.043, lng + 0.072, lat + 0.043];
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.join(",")}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <LibraryFrame title="Maps" controls={<PlacePicker onChoose={setPlace} />}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
        <span className="flex items-center gap-2 font-semibold"><MapPin className="size-4" />{placeName(place)}</span>
        <a className="flex items-center gap-1 text-xs text-[#315f9e] underline" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`} target="_blank" rel="noopener noreferrer">OpenStreetMap <ExternalLink aria-hidden="true" className="size-3" /></a>
      </div>
      <iframe src={embed} title={`Map of ${place.name}`} className="min-h-0 w-full flex-1 border-y border-[#dbe4ef]" referrerPolicy="no-referrer" />
      <a className="shrink-0 px-4 py-1.5 text-xs text-[#50627b] underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
    </LibraryFrame>
  );
}

type Forecast = { current: { temperature_2m: number; apparent_temperature: number; weather_code: number }; daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[] } };
function conditions(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 86) return "Showers";
  return "Thunderstorms";
}

function ForecastPanel({ place, celsius }: { place: Place; celsius: boolean }) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const parameters = new URLSearchParams({
      latitude: String(place.latitude), longitude: String(place.longitude), timezone: "auto", forecast_days: "5",
      current: "temperature_2m,apparent_temperature,weather_code", daily: "temperature_2m_max,temperature_2m_min",
    });
    fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]), referrerPolicy: "no-referrer",
    }).then(async (response) => {
      if (!response.ok) throw new Error("Forecast request failed");
      const data = await response.json() as Forecast;
      if (!data.current || !data.daily) throw new Error("Forecast unavailable");
      setForecast(data);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [place]);
  const temp = (value: number) => `${Math.round(celsius ? value : value * 1.8 + 32)}°`;
  const code = forecast?.current.weather_code ?? 1;
  const Sky = code === 0 ? Sun : code <= 3 ? CloudSun : code <= 48 ? Cloud : code >= 71 && code <= 77 ? Snowflake : CloudRain;
  return (
    <>
      <section className="grid justify-items-center gap-1 py-5 text-center">
        <Sky aria-hidden="true" className="size-9 text-[#ffe6a2]" />
        <h2 className="text-xl font-semibold">{placeName(place)}</h2>
        {forecast && <>
          <p className="pr-1 text-[64px] leading-none font-light tracking-tight">{temp(forecast.current.temperature_2m)}</p>
          <p className="text-sm font-semibold">{conditions(forecast.current.weather_code)}</p>
          <p className="text-sm text-white/85">Feels like {temp(forecast.current.apparent_temperature)}</p>
        </>}
      </section>
      {forecast ? <section className="rounded-xl border border-white/20 bg-[#214b77]/55 px-3 pb-1">
        <h3 className="border-b border-white/20 py-2.5 text-xs font-semibold text-white/85">5-day forecast</h3>
        <ul className="divide-y divide-white/20 text-sm">{forecast.daily.time.map((day, index) => <li key={day} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2">
          <span>{new Date(`${day}T12:00:00`).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</span>
          <span className="text-white/75">Low {temp(forecast.daily.temperature_2m_min[index])}</span>
          <span className="font-semibold">High {temp(forecast.daily.temperature_2m_max[index])}</span>
        </li>)}</ul>
      </section> : <p role="status" className="rounded-lg bg-[#214b77]/55 px-3 py-2 text-sm">{failed ? "Live forecast unavailable. Try another city or refresh." : "Loading forecast…"}</p>}
    </>
  );
}

export function Weather() {
  const [place, setPlace] = useState(ottawa);
  const [celsius, setCelsius] = useLibraryStorage("celsius", true);
  const [request, setRequest] = useState(0);
  return (
    <LibraryFrame title="Weather" controls={<>
      <PlacePicker onChoose={setPlace} />
      <Action aria-label={celsius ? "Show Fahrenheit" : "Show Celsius"} onClick={() => setCelsius(!celsius)}>{celsius ? "°C" : "°F"}</Action>
      <Action onClick={() => setRequest((value) => value + 1)}>Refresh</Action>
    </>}>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-linear-to-br from-[#4f93cc] via-[#326da7] to-[#25466e] p-3 text-white">
        <ForecastPanel key={`${place.id}-${request}`} place={place} celsius={celsius} />
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-xs text-white/85 underline">Weather data by Open-Meteo</a>
      </div>
    </LibraryFrame>
  );
}

const tickers = {
  AAPL: { name: "Apple", values: [72, 68, 75, 73, 84, 81, 95, 91, 105, 104, 116, 113] },
  MSFT: { name: "Microsoft", values: [110, 115, 108, 107, 116, 113, 105, 101, 114, 118, 123, 121] },
  NVDA: { name: "NVIDIA", values: [57, 50, 54, 63, 68, 62, 69, 73, 67, 80, 89, 96] },
  GOOGL: { name: "Alphabet", values: [107, 113, 120, 125, 119, 111, 108, 101, 106, 103, 100, 105] },
} as const;
type Ticker = keyof typeof tickers;
const defaultWatchlist: Ticker[] = ["AAPL", "MSFT", "NVDA"];

export function Stocks() {
  const chartId = useId();
  const [watchlist, setWatchlist] = useLibraryStorage("stocks", defaultWatchlist);
  const [selection, setSelection] = useState<Ticker>("AAPL");
  const [range, setRange] = useState<6 | 12>(12);
  const [candidate, setCandidate] = useState<Ticker>("GOOGL");
  const symbol = watchlist.includes(selection) ? selection : watchlist[0];
  const selected = symbol ? tickers[symbol] : null;
  const values = selected?.values.slice(-range) ?? [];
  const min = Math.min(...values), max = Math.max(...values);
  const points = values.map((value, index) => `${8 + index * 304 / (values.length - 1)},${99 - (value - min) * 86 / Math.max(1, max - min)}`).join(" ");
  return (
    <LibraryFrame title="Stocks" controls={<>
      <select aria-label="Add ticker" className={cx(field, "w-auto")} value={candidate} onChange={(event) => setCandidate(event.target.value as Ticker)}>
        {(Object.keys(tickers) as Ticker[]).map((item) => <option key={item}>{item}</option>)}
      </select>
      <Action disabled={watchlist.includes(candidate)} onClick={() => { setWatchlist((items) => [...items, candidate]); setSelection(candidate); }}>Add to watchlist</Action>
      <span className="ml-auto text-xs font-semibold text-[#50627b]">Sample data</span>
    </>}>
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="Watchlist" className="@min-[530px]:w-40">
          <SourceHeading>Watchlist</SourceHeading>
          {watchlist.map((item) => <SourceItem key={item} selected={item === symbol} onClick={() => setSelection(item)}>{item}</SourceItem>)}
        </SourceRail>
        <div className="min-h-0 flex-1 overflow-auto p-4 @min-[610px]:p-6">
          {selected ? <section className="space-y-3">
            <h2 className="text-xl font-semibold">{symbol} <span className="text-sm font-medium text-[#50627b]">{selected.name}</span></h2>
            <div className="flex flex-wrap gap-2">
              <Action aria-pressed={range === 6} primary={range === 6} onClick={() => setRange(6)}>6 periods</Action>
              <Action aria-pressed={range === 12} primary={range === 12} onClick={() => setRange(12)}>12 periods</Action>
            </div>
            <svg role="img" aria-label={`Illustrative price movement for ${symbol}`} viewBox="0 0 320 105" className="w-full rounded-lg bg-[#f0f5fb]">
              <defs><linearGradient id={chartId} x2="0" y2="1"><stop stopColor="#5881be" stopOpacity=".4" /><stop offset="1" stopColor="#5881be" stopOpacity=".02" /></linearGradient></defs>
              <path d="M8 20H312M8 58H312M8 97H312" stroke="#d3dfef" fill="none" />
              <polygon points={`8,104 ${points} 312,104`} fill={`url(#${chartId})`} />
              <polyline points={points} stroke="#315f9e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none" />
            </svg>
            <Action onClick={() => setWatchlist((items) => items.filter((item) => item !== symbol))}>Remove from watchlist</Action>
          </section> : <Empty>Add a ticker to the watchlist.</Empty>}
        </div>
      </div>
    </LibraryFrame>
  );
}
