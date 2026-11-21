"use client";

import { AudioLines, Compass, Download, ExternalLink, Film, Grid2X2, Headphones, Library, Mic, Music2, Pause, Play, Square, Video, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { appCatalog, libraryAppIds } from "@/components/desktop/appCatalog";
import { APPS } from "@/components/desktop/apps";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { cx } from "@/lib/cx";
import { useLibraryStorage } from "./storage";
import { Action, downloadFile, Empty, externalAction, field, LibraryFrame, SourceHeading, SourceItem, SourceRail } from "./ui";

const songs = [
  { name: "Low Tide", length: 0.38, notes: [57, 60, 64, 69, 64, 60, 55, 60], color: "#507391" },
  { name: "Night Window", length: 0.5, notes: [50, 57, 60, 65, 58, 53, 57, 60], color: "#69579a" },
  { name: "Early Light", length: 0.31, notes: [65, 69, 72, 74, 72, 69, 67, 64], color: "#a15378" },
];

export function Music() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [error, setError] = useState("");
  const ctx = useRef<AudioContext | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const gain = useRef<GainNode | null>(null);
  const song = songs[selected];

  useEffect(() => () => { void ctx.current?.close(); ctx.current = null; }, []);

  const pause = () => {
    source.current?.stop();
    source.current = null;
    setPlaying(false);
  };
  const play = async () => {
    try {
      const context = ctx.current ?? new AudioContext();
      ctx.current = context;
      await context.resume();
      if (ctx.current !== context || source.current) return;
      const step = Math.round(song.length * context.sampleRate);
      const buffer = context.createBuffer(1, song.notes.length * step, context.sampleRate);
      const samples = buffer.getChannelData(0);
      song.notes.forEach((note, index) => {
        const frequency = 440 * 2 ** ((note - 69) / 12);
        for (let i = 0; i < step; i += 1) {
          const t = i / context.sampleRate;
          const phase = 2 * Math.PI * t * frequency;
          const envelope = Math.min(1, i / (step * 0.045), (step - i) / (step * 0.28)) * Math.exp(-t * 4);
          samples[index * step + i] = envelope * (Math.sin(phase) * 0.45 + Math.sin(phase / 2) * 0.22 + Math.sin(phase * 2) * 0.08);
        }
      });
      const player = context.createBufferSource();
      const level = context.createGain();
      player.buffer = buffer;
      player.loop = true;
      level.gain.value = volume;
      player.connect(level).connect(context.destination);
      player.start();
      source.current = player;
      gain.current = level;
      setPlaying(true);
      setError("");
    } catch {
      setError("Audio playback could not start.");
    }
  };

  return (
    <LibraryFrame title="Music" className="[--app-accent:#a13e62] [--app-rail:#f5eaf1]">
      <div className="flex min-h-0 flex-1">
        <SourceRail label="Music library" className="hidden @min-[530px]:flex">
          <SourceHeading>Library</SourceHeading>
          <span className="app-ref-row bg-[var(--app-selection)]"><Music2 className="size-4" />Synth Sessions</span>
        </SourceRail>
        <section className="min-h-0 min-w-0 flex-1 overflow-auto">
          <div className="flex items-center gap-4 border-b border-[var(--app-line)] bg-linear-to-br from-[#f8e8ee] to-white px-4 py-5 @min-[600px]:px-6">
            <div className="album-art size-[88px] shrink-0 @min-[600px]:size-[116px]" style={{ backgroundColor: song.color }}><AudioLines className="size-9" aria-hidden="true" /></div>
            <div className="min-w-0">
              <h2 className="text-2xl leading-tight font-bold tracking-tight @min-[600px]:text-3xl">Synth Sessions</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">{songs.length} tracks</p>
            </div>
          </div>
          <ol className="divide-y divide-[var(--app-line)] p-2 @min-[600px]:p-3">
            {songs.map((entry, index) => <li key={entry.name}>
              <button type="button" aria-pressed={index === selected} onClick={() => { if (index !== selected) { pause(); setSelected(index); } }}
                className="app-ref-row grid min-h-10 grid-cols-[20px_1fr_auto]">
                <span className="text-xs text-[var(--app-muted)]">{index + 1}</span>
                <span>{entry.name}</span><span className="text-xs text-[var(--app-muted)]">Loop</span>
              </button>
            </li>)}
          </ol>
          {error && <p role="status" className="px-4 py-2 text-sm">{error}</p>}
        </section>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[var(--app-line)] bg-[var(--app-chrome)] px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="album-art size-8 shrink-0" style={{ backgroundColor: song.color }}><Music2 className="size-3.5" aria-hidden="true" /></span>
          <strong className="truncate text-sm">{song.name}</strong>
        </div>
        <Action primary aria-label={playing ? "Pause" : "Play"} className="size-9 rounded-full p-0" onClick={playing ? pause : play}>{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</Action>
        <label className="flex flex-1 items-center justify-end gap-1.5"><Volume2 aria-hidden="true" className="size-4 text-[var(--app-muted)]" />
          <input aria-label="Volume" type="range" className="w-[min(13cqw,92px)] accent-[var(--app-accent)]" min="0" max="1" step="0.01" value={volume} onChange={(event) => {
              const next = Number(event.target.value);
              if (gain.current) gain.current.gain.value = next;
              setVolume(next);
          }} />
        </label>
      </div>
    </LibraryFrame>
  );
}

const shows = [
  { title: "Design Details", detail: "Design and building products", link: "https://designdetails.fm/", color: "#67509a" },
  { title: "Syntax", detail: "Frontend and web development", link: "https://syntax.fm/", color: "#27455f" },
  { title: "ShopTalk Show", detail: "Web design and UX", link: "https://shoptalkshow.com/", color: "#a34866" },
];
const noFollows: string[] = [];

export function Podcasts() {
  const [follows, setFollows] = useLibraryStorage("podcasts", noFollows);
  const [savedOnly, setSavedOnly] = useState(false);
  const [playing, setPlaying] = useState(false);
  const visible = savedOnly ? shows.filter((show) => follows.includes(show.title)) : shows;
  return (
    <LibraryFrame title="Podcasts" className="[--app-accent:#70489c] [--app-rail:#f0eaf8]">
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="Podcasts sections">
          <SourceItem icon={<Compass className="size-4" />} selected={!savedOnly} onClick={() => setSavedOnly(false)}>Discover</SourceItem>
          <SourceItem icon={<Library className="size-4" />} selected={savedOnly} onClick={() => setSavedOnly(true)}>Following</SourceItem>
        </SourceRail>
        <section className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto px-4 py-5 @min-[650px]:px-5">
          <h2 className="text-2xl font-bold tracking-tight">{savedOnly ? "Following" : "Discover"}</h2>
          {!visible.length && <Empty>Follow a show to find it here.</Empty>}
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 @min-[720px]:grid-cols-3">
          {visible.map((show) => <article key={show.title} className="min-w-0 space-y-2">
            <div className="album-art aspect-square" style={{ backgroundColor: show.color }}><Headphones aria-hidden="true" className="size-9" /></div>
            <h2 className="font-semibold">{show.title}</h2>
            <p className="text-xs text-[#50627b]">{show.detail}</p>
            <div className="flex flex-wrap gap-2">
              {show.title === "Design Details" ? <Action primary onClick={() => setPlaying(!playing)}>{playing ? "Close player" : "Listen"}</Action> : <a className={externalAction} href={show.link} target="_blank" rel="noopener noreferrer">Listen <ExternalLink className="size-3" /></a>}
              <Action aria-pressed={follows.includes(show.title)} onClick={() => setFollows((current) => current.includes(show.title) ? current.filter((item) => item !== show.title) : [...current, show.title])}>{follows.includes(show.title) ? "Following" : "Follow"}</Action>
            </div>
          </article>)}
          </div>
          {playing && <iframe title="Design Details episode" className="h-52 w-full rounded-xl border-0" src="https://player.simplecast.com/d61307a2-7530-463b-bbdb-90036842edae?dark=false" />}
        </section>
      </div>
    </LibraryFrame>
  );
}

const flowerVideo = "https://developer.mozilla.org/shared-assets/videos/flower.mp4";

export function TV() {
  const [clip, setClip] = useState<{ title: string; url: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (clip?.url.startsWith("blob:")) URL.revokeObjectURL(clip.url); }, [clip]);
  return (
    <LibraryFrame title="TV" controls={<>
      <Action onClick={() => input.current?.click()}>Open video file</Action>
      {clip && <Action onClick={() => setClip(null)}>Close video</Action>}
      <input hidden ref={input} type="file" accept="video/*" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) setClip({ title: file.name, url: URL.createObjectURL(file) });
        event.target.value = "";
      }} />
    </>}>
      <div className="tv-stage flex min-h-0 flex-1 flex-col justify-center overflow-auto text-white">
        {clip ? <div className="flex min-h-0 flex-1 flex-col">
          <h2 className="px-4 py-3 text-sm font-semibold">{clip.title}</h2>
          <video key={clip.url} controls playsInline aria-label={clip.title} src={clip.url} className="min-h-0 w-full flex-1 bg-[#131820] object-contain" />
        </div> : <section className="p-6 @min-[570px]:p-10">
          <Film aria-hidden="true" className="mb-3 size-7 text-[#b5e2dc]" />
          <h2 className="text-3xl leading-tight font-bold tracking-tight @min-[570px]:text-5xl">Flower and Bee</h2>
          <p className="mt-2 text-sm text-white/75">Sample clip from MDN</p>
          <Action className="mt-6 rounded-full" onClick={() => setClip({ title: "Flower and Bee", url: flowerVideo })}><Play className="size-4" />Watch sample</Action>
        </section>}
      </div>
    </LibraryFrame>
  );
}

const books = [
  { title: "On Looking", author: "Design notes", color: "#426882", text: "Give a composition time before deciding what it needs. Look first at the pace of the gaps, the weight of the edges, and where the eye settles. A line of text can feel lost even when its position is technically correct. Try moving it a little, then step back and see whether it feels related to what surrounds it." },
  { title: "Making Room", author: "Studio notes", color: "#88556e", text: "The spaces between objects give each one a way to be seen. Repeat a margin until it feels like a decision. Break it when the thing inside needs a different pace. Start with a small number of distances and let the work tell you when another one is needed." },
  { title: "Starting Small", author: "Prototype notes", color: "#6e6638", text: "A prototype is a question you can touch. Make the action clear, give the choice an honest outcome, and leave the rest quiet. Watch someone try it before giving them your explanation. Their pauses tell you where the next version should begin." },
];

export function Books() {
  const [active, setActive] = useState<number | null>(null);
  const [size, setSize] = useLibraryStorage("book-text-size", 20);
  const book = active === null ? null : books[active];
  return (
    <LibraryFrame title="Books" className="[--app-accent:#895338] [--app-rail:#f4ece4]" controls={book && <>
      <Action onClick={() => setActive(null)}>Library</Action>
      <Action aria-label="Decrease text size" disabled={size <= 14} onClick={() => setSize((value) => value - 2)}>A−</Action>
      <Action aria-label="Increase text size" disabled={size >= 32} onClick={() => setSize((value) => value + 2)}>A+</Action>
    </>}>
      <div className="flex min-h-0 flex-1 bg-[#faf6ef]">
        {!book && <SourceRail label="Books library" className="hidden @min-[530px]:flex">
          <SourceHeading>Library</SourceHeading>
          <span className="app-ref-row bg-[var(--app-selection)]"><Library className="size-4" />All Books</span>
        </SourceRail>}
        <div className="min-h-0 min-w-0 flex-1 overflow-auto px-4 py-5 @min-[600px]:px-7">
        {book ? <article className="mx-auto min-h-full max-w-lg bg-[#fffdf8] p-6 font-serif shadow-[0_0_20px_#6b4c3910] @min-[600px]:p-10">
          <h2 className="mb-4 text-3xl font-semibold">{book.title}</h2>
          <p className="leading-relaxed" style={{ fontSize: size }}>{book.text}</p>
        </article> : <>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">All Books</h2>
          <div className="grid grid-cols-2 gap-5 @min-[650px]:grid-cols-3">
          {books.map((item, index) => <button key={item.title} type="button" className="group rounded-md text-left focus-visible:outline-offset-4 focus-visible:outline-[var(--app-accent)]" onClick={() => setActive(index)}>
            <span className="book-cover grid aspect-[3/4] place-items-center p-3 text-center font-serif text-xl text-white group-hover:brightness-110" style={{ backgroundColor: item.color }}>{item.title}</span>
            <span className="mt-2 block text-xs text-[#50627b]">{item.author}</span>
          </button>)}
          </div>
        </>}
        </div>
      </div>
    </LibraryFrame>
  );
}

const storeGroups = ["All Apps", ...new Set(libraryAppIds.map((id) => appCatalog[id].group))] as const;

export function AppStore() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<(typeof storeGroups)[number]>("All Apps");
  const { openApp, closeApp } = useDesktop();
  const query = search.trim().toLowerCase();
  const items = libraryAppIds.filter((id) => id !== "appstore"
    && (group === "All Apps" || appCatalog[id].group === group)
    && `${appCatalog[id].title} ${appCatalog[id].keywords}`.toLowerCase().includes(query));
  return (
    <LibraryFrame title="App Store" controls={<input aria-label="Search the App Store" placeholder="Search desktop apps" className={cx(field, "max-w-72")} value={search} onChange={(event) => setSearch(event.target.value)} />}>
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="App Store categories">
          {storeGroups.map((item) => <SourceItem key={item} icon={<Grid2X2 className="size-4" />} selected={item === group} onClick={() => setGroup(item)}>{item}</SourceItem>)}
        </SourceRail>
        <section className="min-h-0 min-w-0 flex-1 overflow-auto px-4 py-5">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">{group}</h2>
          {!items.length ? <Empty>No apps found.</Empty> : <ul className="grid gap-x-4 @min-[740px]:grid-cols-2">
          {items.map((id) => {
            const { Icon } = APPS[id];
            const { title, group } = appCatalog[id];
            return <li key={id} className="flex items-center gap-3 border-b border-[var(--app-line)] px-1 py-2.5">
              <span className="size-11 shrink-0"><Icon /></span>
              <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{title}</h2><p className="text-xs text-[#50627b]">{group}</p></div>
              <Action className="rounded-full" aria-label={`Open ${title}`} onClick={() => { closeApp("appstore"); openApp(id); }}>Open</Action>
            </li>;
          })}
          </ul>}
        </section>
      </div>
    </LibraryFrame>
  );
}

export function FaceTime() {
  const video = useRef<HTMLVideoElement>(null);
  const camera = useRef<MediaStream | null>(null);
  const active = useRef(false);
  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; camera.current?.getTracks().forEach((track) => track.stop()); };
  }, []);

  const start = async () => {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (!active.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      camera.current = stream;
      if (video.current) video.current.srcObject = stream;
      setRunning(true);
    } catch {
      if (active.current) setError("Camera preview is unavailable or permission was declined.");
    } finally {
      if (active.current) setPending(false);
    }
  };

  return (
    <LibraryFrame title="FaceTime" className="[--app-accent:#30634c] [--app-rail:#e9f2ed]">
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="FaceTime camera" className="justify-center @min-[530px]:justify-start">
          <SourceHeading>Video</SourceHeading>
          <Action primary disabled={pending} className="grow @min-[530px]:grow-0" onClick={running ? () => {
            camera.current?.getTracks().forEach((track) => track.stop());
            camera.current = null;
            if (video.current) video.current.srcObject = null;
            setRunning(false);
          } : start}><Video className="size-4" />{pending ? "Starting camera…" : running ? "Stop preview" : "Start camera preview"}</Action>
        </SourceRail>
        <section aria-label="Local preview" className="relative grid min-h-0 flex-1 place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#324f52,#192a34_70%)] p-4 text-center text-white">
          <video ref={video} autoPlay muted playsInline aria-label="Camera preview" className={cx("absolute size-full -scale-x-100 object-cover", !running && "invisible")} />
          {!running && <div>
            <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/8"><Video aria-hidden="true" className="size-7 text-[#a6debd]" /></span>
            <h2 className="text-lg font-semibold">Local preview</h2>
            <p className="mt-1 text-sm text-white/80" role="status">{error || "Your camera preview appears here."}</p>
          </div>}
        </section>
      </div>
    </LibraryFrame>
  );
}

type Memo = { id: string; name: string; blob: Blob; created: number };

async function memoStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("portfolio-voice-memos", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("recordings", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction("recordings", mode);
      const request = run(tx.objectStore("recordings"));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

function MemoPlayer({ memo }: { memo: Memo }) {
  const [url, setUrl] = useState("");
  const [peaks, setPeaks] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    let active = true;
    const loadWave = async () => {
      const decoder = new OfflineAudioContext(1, 1, 44100);
      const audio = await decoder.decodeAudioData(await memo.blob.arrayBuffer());
      if (!active) return;
      const data = audio.getChannelData(0);
      const binSize = Math.max(1, Math.ceil(data.length / 64));
      const sampleStep = Math.max(1, Math.floor(binSize / 96));
      const values = Array.from({ length: 64 }, (_, index) => {
        let peak = 0;
        const start = index * binSize;
        const end = Math.min(start + binSize, data.length);
        for (let i = start; i < end; i += sampleStep) peak = Math.max(peak, Math.abs(data[i]));
        return peak;
      });
      const max = Math.max(.05, ...values);
      setPeaks(values.map((peak) => 2 + 30 * peak / max));
    };
    void loadWave().catch(() => { /* The native player can still handle formats the waveform decoder cannot read. */ });
    return () => { active = false; };
  }, [memo.blob]);

  return <div className="grid justify-items-center gap-3">
    {peaks.length > 0 && <svg aria-hidden="true" className="h-20 w-full" viewBox="0 0 320 72">
      {peaks.map((peak, index) => (
        <line key={index} x1={index * 5 + 2.5} x2={index * 5 + 2.5} y1={36 - peak} y2={36 + peak}
          stroke="var(--app-accent)" strokeOpacity={index / peaks.length < progress ? 1 : .55} strokeWidth={2.5} strokeLinecap="round" />
      ))}
    </svg>}
    {url ? <audio autoPlay controls className="w-full" src={url} aria-label={memo.name} onTimeUpdate={(event) => {
      const { currentTime, duration } = event.currentTarget;
      setProgress(Number.isFinite(duration) && duration > 0 ? currentTime / duration : 0);
    }} /> : <Action primary onClick={() => setUrl(URL.createObjectURL(memo.blob))}><Play className="size-4" />Play recording</Action>}
  </div>;
}

export function VoiceMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selected, setSelected] = useState("");
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const active = useRef(false);
  const memo = memos.find((item) => item.id === selected) ?? memos[0];

  useEffect(() => {
    active.current = true;
    void memoStore<Memo[]>("readonly", (store) => store.getAll()).then((items) => {
      if (active.current) {
        setMemos((current) => [...new Map([...items, ...current].map((item) => [item.id, item])).values()].sort((a, b) => b.created - a.created));
      }
    }).catch(() => {});
    return () => {
      active.current = false;
      const current = recorder.current;
      if (current?.state === "recording") current.stop();
      current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const record = async () => {
    let stream: MediaStream | undefined;
    setPending(true);
    setNotice("");
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      const capture = new MediaRecorder(stream);
      const pieces: Blob[] = [];
      capture.ondataavailable = (event) => { if (event.data.size) pieces.push(event.data); };
      capture.onstop = () => {
        capture.stream.getTracks().forEach((track) => track.stop());
        if (!pieces.length) return;
        const item = { id: crypto.randomUUID(), name: new Date().toLocaleString(), blob: new Blob(pieces, { type: capture.mimeType }), created: Date.now() };
        if (active.current) {
          setRecording(false);
          setMemos((current) => [item, ...current]);
          setSelected(item.id);
        }
        void memoStore("readwrite", (store) => store.put(item)).catch(() => { if (active.current) setNotice("Download this recording to keep it."); });
      };
      capture.start();
      recorder.current = capture;
      setRecording(true);
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      if (active.current) setNotice("Recording is unavailable or microphone permission was declined.");
    } finally {
      if (active.current) setPending(false);
    }
  };

  return (
    <LibraryFrame title="Voice Memos" className="[--app-accent:#ac4053] [--app-rail:#f3edf1]">
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="Recordings" className={cx(!memos.length && "hidden @min-[530px]:flex")}>
          <SourceHeading>Recordings</SourceHeading>
          {!memos.length && <p className="px-2 py-2 text-xs text-[var(--app-muted)]">No recordings yet</p>}
          {memos.map((item) => <SourceItem key={item.id} icon={<AudioLines className="size-4" />} selected={item.id === memo?.id} onClick={() => setSelected(item.id)}>{item.name}</SourceItem>)}
        </SourceRail>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#fbf9fc]">
          <section className="grid min-h-0 flex-1 place-items-center overflow-auto p-5">
          {!memo || recording ? <div className="text-center">
            <AudioLines aria-hidden="true" className={cx("mx-auto mb-3 size-10 text-[var(--app-accent)]", recording && "motion-safe:animate-pulse")} />
            <p role="status" className="font-semibold">{recording ? "Recording…" : "No recording selected"}</p>
          </div> : <div className="w-full max-w-md space-y-4">
            <h2 className="font-semibold">{memo.name}</h2>
            <MemoPlayer key={memo.id} memo={memo} />
            <div className="flex flex-wrap gap-2">
              <Action onClick={() => downloadFile(memo.blob, `Recording-${memo.created}.${memo.blob.type.includes("mp4") ? "m4a" : memo.blob.type.includes("ogg") ? "ogg" : "webm"}`)}><Download className="size-4" />Download</Action>
              <Action onClick={async () => {
                try {
                  await memoStore("readwrite", (store) => store.delete(memo.id));
                  setMemos((items) => items.filter((item) => item.id !== memo.id));
                } catch {
                  setNotice("Could not remove the recording.");
                }
              }}>Delete</Action>
            </div>
          </div>}
          </section>
          <footer className="grid shrink-0 justify-items-center gap-2 border-t border-[var(--app-line)] bg-[var(--app-chrome)] p-3">
            {notice && <p role="status" className="text-center text-sm">{notice}</p>}
            <Action primary disabled={pending} onClick={recording ? () => { recorder.current?.stop(); setRecording(false); } : record} className="rounded-full px-4">
              {recording ? <Square className="size-4" /> : <Mic className="size-4" />}{pending ? "Starting…" : recording ? "Stop recording" : "Record"}
            </Action>
          </footer>
        </div>
      </div>
    </LibraryFrame>
  );
}
