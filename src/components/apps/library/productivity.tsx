"use client";

import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Circle, Download, ListChecks, MessageSquare, Plus, Send, Trash2, Type, Undo2 } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { linkedinLink, profile } from "@/data/content";
import { cx } from "@/lib/cx";
import { useLibraryStorage } from "./storage";
import { Action, downloadFile, Empty, field, label, LibraryFrame, Panel, SourceHeading, SourceItem, SourceRail } from "./ui";

type Message = { id: string; text: string; time: number };
const conversations = ["Personal", "Studio"] as const;
const emptyMessages: Record<(typeof conversations)[number], Message[]> = { Personal: [], Studio: [] };

export function Messages() {
  const [threads, setThreads] = useLibraryStorage("messages", emptyMessages);
  const [active, setActive] = useState<(typeof conversations)[number]>("Personal");
  const [draft, setDraft] = useState("");

  return (
    <LibraryFrame title="Messages">
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
        <SourceRail label="Conversations" className="@min-[530px]:w-48">
          <SourceHeading>Conversations</SourceHeading>
          {conversations.map((name) => <SourceItem key={name} selected={active === name} icon={<MessageSquare className="size-4" />} onClick={() => setActive(name)}>{name}</SourceItem>)}
        </SourceRail>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2.5 border-b border-[var(--app-line)] px-4 py-2.5">
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-[#dfeaf9] text-xs font-bold text-[#41699d]">{active[0]}</span>
            <div><h2 className="text-sm font-semibold">{active}</h2><p className="text-[11px] text-[#50627b]">Local conversation</p></div>
          </div>
          <ol aria-label={`${active} messages`} className="flex min-h-0 flex-1 flex-col items-end gap-3 overflow-auto p-4">
            {threads[active].map((message) => (
              <li key={message.id} className="max-w-[85%]">
                <time dateTime={new Date(message.time).toISOString()} className="mb-1 block text-right text-xs text-[#50627b]">{new Date(message.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
                <p className="rounded-2xl rounded-br-sm bg-[#315f9e] px-4 py-2 text-sm break-words text-white">{message.text}</p>
              </li>
            ))}
            {!threads[active].length && <li className="w-full"><Empty>No messages yet.</Empty></li>}
          </ol>
          <form className="flex items-center gap-2 border-t border-[var(--app-line)] p-3" onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            const message = { id: crypto.randomUUID(), text: draft.trim(), time: Date.now() };
            setThreads((current) => ({ ...current, [active]: [...current[active], message] }));
            setDraft("");
          }}>
            <input aria-label="Message" className={cx(field, "rounded-full bg-white")} placeholder="Write a message" value={draft} onChange={(event) => setDraft(event.target.value)} />
            <Action primary type="submit" className="size-8 rounded-full p-0" disabled={!draft.trim()} aria-label="Add message"><Send className="size-3.5" /></Action>
          </form>
        </div>
      </div>
    </LibraryFrame>
  );
}

type CalendarEvent = { id: string; date: string; title: string; time: string };
const noEvents: CalendarEvent[] = [];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calendarViews = ["Day", "Week", "Month"] as const;
const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function Calendar() {
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [calendarView, setCalendarView] = useState<(typeof calendarViews)[number]>("Month");
  const [events, setEvents] = useLibraryStorage("calendar", noEvents);
  const [editId, setEditId] = useState("");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const selectedKey = dayKey(selected);
  const selectedEvents = events.filter((event) => event.date === selectedKey).sort((a, b) => a.time.localeCompare(b.time));
  const clearForm = () => { setEditId(""); setTitle(""); setTime(""); };
  const chooseDay = (date: Date) => { setSelected(date); clearForm(); };
  const shiftPeriod = (offset: number) => {
    const next = calendarView === "Month"
      ? new Date(month.getFullYear(), month.getMonth() + offset, 1)
      : new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + offset * (calendarView === "Week" ? 7 : 1));
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    chooseDay(next);
  };
  const cells = calendarView === "Month"
    ? Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1 - month.getDay()))
    : Array.from({ length: calendarView === "Week" ? 7 : 1 }, (_, index) => new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + index - (calendarView === "Week" ? selected.getDay() : 0)));

  return (
    <LibraryFrame controls={<>
      <Action aria-label={`Previous ${calendarView.toLowerCase()}`} onClick={() => shiftPeriod(-1)}><ChevronLeft className="size-4" /></Action>
      <Action aria-label={`Next ${calendarView.toLowerCase()}`} onClick={() => shiftPeriod(1)}><ChevronRight className="size-4" /></Action>
      <Action onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); chooseDay(today); }}>Today</Action>
      <div className="ml-auto flex gap-1" aria-label="Calendar view">
        {calendarViews.map((view) => <Action key={view} primary={calendarView === view} aria-pressed={calendarView === view} onClick={() => {
          setCalendarView(view);
          setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
        }}>{view}</Action>)}
      </div>
    </>}>
      <div className="grid min-h-0 flex-1 content-start overflow-auto @min-[650px]:grid-cols-[205px_minmax(0,1fr)]">
        <section className="order-2 p-3 @min-[650px]:order-none @min-[650px]:col-start-2 @min-[650px]:row-start-1">
          <h2 className="mb-3 px-1 text-2xl font-semibold tracking-tight">{(calendarView === "Month" ? month : selected).toLocaleDateString([], { month: "long", year: "numeric", ...(calendarView === "Day" ? { day: "numeric" } : {}) })}</h2>
          {calendarView !== "Day" && <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#50627b]">{weekdays.map((day) => <span key={day} className="py-2">{day}</span>)}</div>}
          <div className={cx("grid overflow-hidden border border-[var(--app-line)]", calendarView === "Day" ? "grid-cols-1" : "grid-cols-7")}>
            {cells.map((date) => {
              const key = dayKey(date);
              const dayEvents = events.filter((event) => event.date === key);
              return (
                <button type="button" key={key} aria-label={date.toLocaleDateString([], { dateStyle: "full" })} aria-pressed={key === selectedKey} onClick={() => chooseDay(date)}
                  className={cx("relative min-h-[43px] min-w-0 border-r border-b border-[var(--app-line)] p-1 text-left text-xs focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#315f9e] @min-[650px]:min-h-[53px]", key === selectedKey ? "bg-[#e4eef9]" : "hover:bg-[#f1f5fa]", date.getMonth() !== month.getMonth() && key !== selectedKey && "text-[#788294]")}>
                  <span className={cx("inline-grid size-5 place-items-center rounded-full", key === dayKey(today) && "bg-[#bf4b60] text-white")}>{date.getDate()}</span>
                  {dayEvents.slice(0, calendarView === "Day" ? 6 : 1).map((entry) => <span key={entry.id} className="mt-1 block truncate rounded bg-[#c9dbf2] px-1 text-[10px] text-[#244a7e]">{entry.title}</span>)}
                </button>
              );
            })}
          </div>
        </section>
        <aside className="app-ref-rail order-3 space-y-3 border-t p-3 @min-[650px]:order-none @min-[650px]:col-start-1 @min-[650px]:row-start-1 @min-[650px]:border-t-0 @min-[650px]:border-r">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4 text-[#315f9e]" />{selected.toLocaleDateString([], { month: "short", day: "numeric" })}</h3>
          <ul className="space-y-2">
            {selectedEvents.map((entry) => <li key={entry.id} className="flex items-center justify-between gap-1 rounded-md bg-[#eef3fa] p-2">
              <button type="button" className="min-w-0 flex-1 truncate text-left text-sm font-medium" onClick={() => { setEditId(entry.id); setTitle(entry.title); setTime(entry.time); }}>{entry.time ? `${entry.time} · ` : ""}{entry.title}</button>
              <button type="button" aria-label={`Delete ${entry.title}`} onClick={() => { setEvents((current) => current.filter((event) => event.id !== entry.id)); if (editId === entry.id) clearForm(); }}><Trash2 className="size-4 text-[#6c4b59]" /></button>
            </li>)}
          </ul>
          <form className="grid gap-2" onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            const entry = { id: editId || crypto.randomUUID(), date: selectedKey, title: title.trim(), time };
            setEvents((current) => editId ? current.map((item) => item.id === editId ? entry : item) : [...current, entry]);
            clearForm();
          }}>
            <label className={label}>Event title<input className={field} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label className={label}>Time<input type="time" className={field} value={time} onChange={(event) => setTime(event.target.value)} /></label>
            <Action primary type="submit" disabled={!title.trim()}>{editId ? "Save event" : "Add event"}</Action>
            {editId && <Action onClick={clearForm}>Cancel</Action>}
          </form>
        </aside>
      </div>
    </LibraryFrame>
  );
}

type Reminder = { id: string; title: string; done: boolean };
const noReminders: Reminder[] = [];

export function Reminders() {
  const [items, setItems] = useLibraryStorage("reminders", noReminders);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<"All" | "Open" | "Done">("All");
  const visible = items.filter((item) => filter === "All" || item.done === (filter === "Done"));

  return (
    <LibraryFrame title="Reminders">
      <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
      <SourceRail label="Reminder lists">
        <SourceHeading>My Lists</SourceHeading>
        {([["All", ListChecks], ["Open", Circle], ["Done", CheckCircle2]] as const).map(([name, Icon]) => <SourceItem key={name} selected={filter === name} icon={<Icon className="size-4" />} onClick={() => setFilter(name)}>{name}</SourceItem>)}
      </SourceRail>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        <h2 className="text-[22px] font-semibold tracking-tight">{filter === "All" ? "Reminders" : filter} <span className="ml-1 text-sm font-medium text-[#68768a]">{visible.length}</span></h2>
        <form className="flex gap-2" onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          const item = { id: crypto.randomUUID(), title: draft.trim(), done: false };
          setItems((current) => [...current, item]);
          setFilter("Open");
          setDraft("");
        }}>
          <input aria-label="New reminder" placeholder="New reminder" className={field} value={draft} onChange={(event) => setDraft(event.target.value)} />
          <Action primary type="submit" disabled={!draft.trim()}><Plus className="size-4" />Add</Action>
        </form>
        {visible.length > 0 ? <ul className="divide-y divide-[#e1e8f2] border-y border-[#dbe4ef]">
          {visible.map((item) => <li key={item.id} className="flex items-center gap-2 px-1 py-1.5">
            <label className={cx("flex min-h-8 min-w-0 flex-1 items-center gap-3 text-sm", item.done && "text-[#637489] line-through")}>
              <input type="checkbox" checked={item.done} className="size-4 shrink-0 accent-[#315f9e]" onChange={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry))} />
              {item.title}
            </label>
            <Action aria-label={`Delete ${item.title}`} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}><Trash2 className="size-4" /></Action>
          </li>)}
        </ul> : <Empty>No {filter === "All" ? "" : `${filter.toLowerCase()} `}reminders.</Empty>}
      </div>
      </div>
    </LibraryFrame>
  );
}

type Contact = { id: string; name: string; email: string; phone: string };
const ownerContact = { id: "portfolio", name: profile.name, email: "", phone: "" };
const defaultContacts = [ownerContact];
const blankContact = { id: "", name: "", email: "", phone: "" };

export function Contacts() {
  const [contacts, setContacts] = useLibraryStorage("contacts", defaultContacts);
  const [selected, setSelected] = useState(ownerContact.id);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Contact | null>(null);
  const contact = contacts.find((entry) => entry.id === selected);
  const filtered = contacts.filter((entry) => `${entry.name} ${entry.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <LibraryFrame title="Contacts" controls={<>
      <input aria-label="Search contacts" placeholder="Search contacts" className={cx(field, "max-w-60")} value={query} onChange={(event) => setQuery(event.target.value)} />
      <Action onClick={() => setDraft(blankContact)}><Plus className="size-4" />Add contact</Action>
    </>}>
      <div className="flex min-h-0 flex-1 flex-col @min-[510px]:flex-row">
        <SourceRail label="Saved contacts">
          <SourceHeading>All Contacts</SourceHeading>
          {filtered.map((entry) => <SourceItem key={entry.id} selected={entry.id === selected} onClick={() => { setSelected(entry.id); setDraft(null); }}>{entry.name}</SourceItem>)}
          {!filtered.length && <p className="p-2 text-sm text-[#50627b]">No matching contacts.</p>}
        </SourceRail>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-6">
          {draft ? <Panel className="max-w-sm">
            <form className="grid gap-3" onSubmit={(event) => {
              event.preventDefault();
              if (!draft.name.trim()) return;
              const entry = { ...draft, id: draft.id || crypto.randomUUID(), name: draft.name.trim() };
              setContacts((current) => draft.id ? current.map((item) => item.id === draft.id ? entry : item) : [...current, entry]);
              setSelected(entry.id);
              setDraft(null);
            }}>
              {(["name", "email", "phone"] as const).map((key) => <label key={key} className={cx(label, "capitalize")}>{key}<input type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} className={field} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></label>)}
              <div className="flex gap-2"><Action primary type="submit" disabled={!draft.name.trim()}>Save contact</Action><Action onClick={() => setDraft(null)}>Cancel</Action></div>
            </form>
          </Panel> : contact ? <section className="space-y-3">
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-[#dfeaf8] text-lg font-bold text-[#315f9e]">{contact.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span>
            <h2 className="text-xl font-semibold">{contact.name}</h2>
            {contact.email && <div><a className="text-sm underline" href={`mailto:${contact.email}`}>{contact.email}</a></div>}
            {contact.phone && <div><a className="text-sm underline" href={`tel:${contact.phone}`}>{contact.phone}</a></div>}
            {contact.id === ownerContact.id ? <a className="text-sm underline" href={linkedinLink.href} target="_blank" rel="noreferrer">LinkedIn profile</a> : <div className="flex flex-wrap gap-2">
              <Action onClick={() => setDraft(contact)}>Edit</Action>
              <Action onClick={() => { setContacts((current) => current.filter((entry) => entry.id !== contact.id)); setSelected(ownerContact.id); }}>Delete</Action>
            </div>}
          </section> : <Empty>Select a contact.</Empty>}
        </div>
      </div>
    </LibraryFrame>
  );
}

export function TextEdit() {
  const [draft, setDraft] = useLibraryStorage("textedit", "");
  const [size, setSize] = useLibraryStorage("textedit-font-size", 16);
  return (
    <LibraryFrame title="TextEdit" controls={<>
      <label className="flex items-center gap-1.5"><Type aria-hidden="true" className="size-4" />
        <select aria-label="Text size" value={size} onChange={(event) => setSize(Number(event.target.value))} className={cx(field, "w-auto")}>
          {[12, 14, 16, 18, 20, 24, 28].map((value) => <option key={value} value={value}>{value} pt</option>)}
        </select>
      </label>
      <Action className="ml-auto" onClick={() => downloadFile(new Blob([draft], { type: "text/plain;charset=utf-8" }), "Untitled.txt")} disabled={!draft}><Download className="size-4" />Download text</Action>
    </>}>
      <div className="flex min-h-0 flex-1 justify-center bg-[#e9edf3] p-2 @min-[510px]:p-4">
        <textarea aria-label="Document text" placeholder="Start writing…" className="w-full max-w-[640px] resize-none border border-[#d9e1ea] bg-white p-4 leading-relaxed outline-none focus-visible:border-[#7896bd] @min-[510px]:p-8" style={{ fontSize: size }} value={draft} onChange={(event) => setDraft(event.target.value)} />
      </div>
      <span className="shrink-0 border-t border-[var(--app-line)] px-3 py-1 text-right text-[11px] text-[#50627b]">{draft.trim() ? draft.trim().split(/\s+/).length : 0} words</span>
    </LibraryFrame>
  );
}

type Stroke = { color: string; path: string };
const noStrokes: Stroke[] = [];

export function Freeform() {
  const [strokes, setStrokes] = useLibraryStorage("freeform", noStrokes);
  const [color, setColor] = useState("#315f9e");
  const [draft, setDraft] = useState<Stroke | null>(null);
  const progress = useRef<Stroke | null>(null);
  const pointer = useRef<number | null>(null);
  const board = useRef<SVGSVGElement>(null);

  const point = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return "";
    const value = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return `${value.x.toFixed(1)} ${value.y.toFixed(1)}`;
  };

  const finish = (event: PointerEvent<SVGSVGElement>) => {
    if (pointer.current !== event.pointerId) return;
    const stroke = progress.current;
    pointer.current = null;
    progress.current = null;
    setDraft(null);
    if (stroke) setStrokes((current) => [...current, stroke]);
  };

  return (
    <LibraryFrame title="Freeform" controls={<>
      <label className="flex items-center gap-2 text-sm"><input aria-label="Stroke color" type="color" value={color} onChange={(event) => setColor(event.target.value)} /> Pen</label>
      <Action disabled={!strokes.length} onClick={() => setStrokes((current) => current.slice(0, -1))}><Undo2 className="size-4" />Undo</Action>
      <Action disabled={!strokes.length} onClick={() => setStrokes([])}>Clear</Action>
      <Action disabled={!strokes.length} onClick={() => {
        if (board.current) downloadFile(new Blob([new XMLSerializer().serializeToString(board.current)], { type: "image/svg+xml" }), "Board.svg");
      }}><Download className="size-4" />Export</Action>
    </>}>
      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        <svg ref={board} xmlns="http://www.w3.org/2000/svg" aria-label="Drawing board" viewBox="0 0 800 500" className="size-full touch-none cursor-crosshair bg-[radial-gradient(#dce5f1_1px,transparent_1px)] bg-size-[15px_15px]"
          onPointerDown={(event) => {
            if (event.button !== 0 || pointer.current !== null) return;
            const start = point(event);
            if (!start) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            pointer.current = event.pointerId;
            progress.current = { color, path: `M ${start} l .01 .01` };
            setDraft(progress.current);
          }}
          onPointerMove={(event) => {
            if (pointer.current !== event.pointerId || !progress.current) return;
            const next = point(event);
            if (!next) return;
            progress.current = { ...progress.current, path: `${progress.current.path} L ${next}` };
            setDraft(progress.current);
          }}
          onPointerUp={finish}
          onLostPointerCapture={finish}
        >
          {[...strokes, ...(draft ? [draft] : [])].map((stroke, index) => <path key={index} d={stroke.path} stroke={stroke.color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        </svg>
      </div>
    </LibraryFrame>
  );
}
