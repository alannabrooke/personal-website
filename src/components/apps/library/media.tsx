"use client";

import { AudioLines, Download, ExternalLink, Film, Headphones, Mic, Music2, Square, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { appCatalog, libraryAppIds } from "@/components/desktop/appCatalog";
import { APPS } from "@/components/desktop/apps";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { cx } from "@/lib/cx";
import { useLibraryStorage } from "./storage";
import { Action, downloadFile, Empty, externalAction, field, LibraryFrame, Panel } from "./ui";

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
    <LibraryFrame title="Music">
      <div className="grid min-h-0 flex-1 content-start gap-4 overflow-auto p-4 @min-[610px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Panel className="space-y-3">
          <h2 className="font-semibold">Synth Sessions</h2>
          <div className="grid gap-2">
            {songs.map((entry, index) => <Action key={entry.name} primary={index === selected} aria-pressed={index === selected} className="justify-start" onClick={() => { pause(); setSelected(index); }}><Music2 className="size-4" />{entry.name}</Action>)}
          </div>
        </Panel>
        <Panel className="space-y-3">
          <div className="grid aspect-video place-items-center rounded-xl bg-[radial-gradient(ellipse_at_25%_20%,#ffffff40,transparent_70%)] text-white" style={{ backgroundColor: song.color }}>
            <AudioLines className="size-14" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold">{song.name}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Action primary onClick={playing ? pause : play}>{playing ? "Pause" : "Play"}</Action>
            <label className="flex gap-2 text-xs font-semibold">Volume<input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => {
              const next = Number(event.target.value);
              if (gain.current) gain.current.gain.value = next;
              setVolume(next);
            }} /></label>
          </div>
          {error && <p role="status" className="text-sm">{error}</p>}
        </Panel>
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
    <LibraryFrame title="Podcasts" controls={<>
      <Action primary={!savedOnly} aria-pressed={!savedOnly} onClick={() => setSavedOnly(false)}>Discover</Action>
      <Action primary={savedOnly} aria-pressed={savedOnly} onClick={() => setSavedOnly(true)}>Following</Action>
    </>}>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
        {!visible.length && <Empty>Follow a show to find it here.</Empty>}
        <div className="grid gap-3 @min-[510px]:grid-cols-2 @min-[680px]:grid-cols-3">
          {visible.map((show) => <Panel key={show.title} className="space-y-2">
            <span className="grid aspect-[3/2] place-items-center rounded-lg text-white" style={{ backgroundColor: show.color }}><Headphones aria-hidden="true" className="size-9" /></span>
            <h2 className="font-semibold">{show.title}</h2>
            <p className="text-xs text-[#50627b]">{show.detail}</p>
            <div className="flex flex-wrap gap-2">
              {show.title === "Design Details" ? <Action primary onClick={() => setPlaying(!playing)}>{playing ? "Close player" : "Listen"}</Action> : <a className={externalAction} href={show.link} target="_blank" rel="noopener noreferrer">Listen <ExternalLink className="size-3" /></a>}
              <Action aria-pressed={follows.includes(show.title)} onClick={() => setFollows((current) => current.includes(show.title) ? current.filter((item) => item !== show.title) : [...current, show.title])}>{follows.includes(show.title) ? "Following" : "Follow"}</Action>
            </div>
          </Panel>)}
        </div>
        {playing && <iframe title="Design Details episode" className="h-52 w-full rounded-xl border-0" src="https://player.simplecast.com/d61307a2-7530-463b-bbdb-90036842edae?dark=false" />}
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
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        {clip ? <>
          <h2 className="font-semibold">{clip.title}</h2>
          <video key={clip.url} controls playsInline aria-label={clip.title} src={clip.url} className="max-h-[calc(100%_-_2rem)] w-full rounded-xl bg-[#19283c]" />
        </> : <Panel className="space-y-3">
          <div className="grid aspect-[3/1] place-items-center rounded-xl bg-linear-to-br from-[#587770] to-[#254454] text-white"><Film aria-hidden="true" className="size-11" /></div>
          <h2 className="font-semibold">Flower and Bee</h2>
          <p className="text-sm text-[#50627b]">Sample clip from MDN.</p>
          <Action primary onClick={() => setClip({ title: "Flower and Bee", url: flowerVideo })}>Watch sample</Action>
        </Panel>}
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
    <LibraryFrame title="Books" controls={book && <>
      <Action onClick={() => setActive(null)}>Library</Action>
      <Action aria-label="Decrease text size" disabled={size <= 14} onClick={() => setSize((value) => value - 2)}>A−</Action>
      <Action aria-label="Increase text size" disabled={size >= 32} onClick={() => setSize((value) => value + 2)}>A+</Action>
    </>}>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {book ? <article className="mx-auto max-w-lg rounded-xl border border-[#e1dbd2] bg-[#fffaf2] p-6 font-serif">
          <h2 className="mb-4 text-3xl font-semibold">{book.title}</h2>
          <p className="leading-relaxed" style={{ fontSize: size }}>{book.text}</p>
        </article> : <div className="grid grid-cols-2 gap-4 @min-[510px]:grid-cols-3">
          {books.map((item, index) => <button key={item.title} type="button" className="rounded-xl border border-[#dbe4ef] bg-white p-3 text-left hover:border-[#7396c8]" onClick={() => setActive(index)}>
            <span className="grid aspect-[4/5] place-items-center rounded-lg p-2 text-center font-serif text-xl text-white" style={{ backgroundColor: item.color }}>{item.title}</span>
            <span className="mt-2 block text-xs text-[#50627b]">{item.author}</span>
          </button>)}
        </div>}
      </div>
    </LibraryFrame>
  );
}

export function AppStore() {
  const [search, setSearch] = useState("");
  const { openApp, closeApp } = useDesktop();
  const items = libraryAppIds.filter((id) => id !== "appstore" && `${appCatalog[id].title} ${appCatalog[id].keywords}`.toLowerCase().includes(search.trim().toLowerCase()));
  return (
    <LibraryFrame title="App Store" controls={<input aria-label="Search the App Store" placeholder="Search desktop apps" className={cx(field, "max-w-72")} value={search} onChange={(event) => setSearch(event.target.value)} />}>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!items.length ? <Empty>No apps found.</Empty> : <ul className="grid gap-2 @min-[510px]:grid-cols-2">
          {items.map((id) => {
            const { Icon } = APPS[id];
            const { title, group } = appCatalog[id];
            return <li key={id} className="flex items-center gap-3 rounded-xl border border-[#dbe4ef] bg-white p-2">
              <span className="size-11 shrink-0"><Icon /></span>
              <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{title}</h2><p className="text-xs text-[#50627b]">{group}</p></div>
              <Action aria-label={`Open ${title}`} onClick={() => { closeApp("appstore"); openApp(id); }}>Open</Action>
            </li>;
          })}
        </ul>}
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
    <LibraryFrame title="FaceTime" controls={<>
      <Action primary disabled={pending} onClick={running ? () => {
        camera.current?.getTracks().forEach((track) => track.stop());
        camera.current = null;
        if (video.current) video.current.srcObject = null;
        setRunning(false);
      } : start}><Video className="size-4" />{pending ? "Starting camera…" : running ? "Stop preview" : "Start camera preview"}</Action>
      <span className="text-xs text-[#50627b]">Local preview</span>
    </>}>
      <div className="relative m-4 grid min-h-0 flex-1 place-items-center overflow-hidden rounded-xl bg-[#182c3f] p-4 text-center text-white">
        <video ref={video} autoPlay muted playsInline aria-label="Camera preview" className={cx("absolute size-full -scale-x-100 object-cover", !running && "invisible")} />
        {!running && <div><Video aria-hidden="true" className="mx-auto mb-3 size-9" /><p className="text-sm" role="status">{error || "Your camera preview appears here."}</p></div>}
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
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url ? <audio autoPlay controls className="w-full" src={url} aria-label={memo.name} /> : <Action onClick={() => setUrl(URL.createObjectURL(memo.blob))}>Play recording</Action>;
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
    <LibraryFrame title="Voice Memos" controls={<>
      <Action primary disabled={pending} onClick={recording ? () => { recorder.current?.stop(); setRecording(false); } : record}>
        {recording ? <Square className="size-4" /> : <Mic className="size-4" />}{pending ? "Starting…" : recording ? "Stop recording" : "Record"}
      </Action>
      {recording && <span role="status" className="text-sm font-semibold text-[#aa4a4a]">Recording</span>}
    </>}>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        {notice && <p role="status" className="text-sm">{notice}</p>}
        {!memo ? <Empty>No recordings yet.</Empty> : <>
          <div className="flex flex-wrap gap-2">{memos.map((item) => <Action key={item.id} primary={item.id === memo.id} onClick={() => setSelected(item.id)}>{item.name}</Action>)}</div>
          <Panel className="space-y-3">
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
          </Panel>
        </>}
      </div>
    </LibraryFrame>
  );
}
