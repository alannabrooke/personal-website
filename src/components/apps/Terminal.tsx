"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import type { AppId } from "@/components/desktop/types";
import { notes, profile, projects, resume, socials } from "@/data/content";

type Line = { id: number; kind: "in" | "out"; content: ReactNode };

const PROMPT = `${profile.handle}@${profile.host} ~ %`;

const OPENABLE: Record<string, AppId> = {
  finder: "finder",
  projects: "finder",
  notes: "notes",
  mail: "mail",
  preview: "preview",
  resume: "preview",
  trash: "trash",
};

const COMMANDS = ["help", "about", "whoami", "projects", "skills", "contact", "socials", "resume", "open", "ls", "cat", "date", "echo", "clear", "exit"];

let nextId = 0;
const line = (kind: Line["kind"], content: ReactNode): Line => ({ id: nextId++, kind, content });

export function Terminal() {
  const { openApp, closeApp } = useDesktop();
  const [lines, setLines] = useState<Line[]>(() => [
    line(
      "out",
      `Last login: ${new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} on ttys000`,
    ),
    line("out", <>Welcome! Type <Cmd>help</Cmd> to see what you can do.</>),
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const run = (raw: string): ReactNode | "clear" | null => {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (cmd.toLowerCase()) {
      case "":
        return null;
      case "help":
        return (
          <div className="grid grid-cols-[110px_1fr] gap-x-2">
            {[
              ["about", "who I am"],
              ["projects", "things I've made"],
              ["skills", "what I work with"],
              ["contact", "how to reach me"],
              ["socials", "where to find me"],
              ["resume", "open my résumé"],
              ["open <app>", "finder, notes, mail, preview, trash"],
              ["ls / cat", "look around"],
              ["clear", "clear the screen"],
              ["exit", "close Terminal"],
            ].map(([c, d]) => (
              <Row key={c} c={c} d={d} />
            ))}
          </div>
        );
      case "about":
      case "whoami":
        return `${profile.name} · ${profile.title}\n${profile.tagline}`;
      case "projects":
        return (
          <div>
            {projects.map((p) => (
              <div key={p.id}>
                <span className="text-[#7cc4ff]">{p.name.padEnd(18)}</span>
                <span className="text-white/50">{p.year}  </span>
                {p.tags.join(", ")}
              </div>
            ))}
            <div className="mt-1 text-white/50">
              Run <Cmd>open finder</Cmd> to browse them.
            </div>
          </div>
        );
      case "skills":
        return resume.skills.join(" · ");
      case "contact":
        return (
          <>
            Email: <span className="text-[#7cc4ff]">{profile.email}</span>
            {"\n"}Or run <Cmd>open mail</Cmd>.
          </>
        );
      case "socials":
        return (
          <div>
            {socials.map((s) => (
              <div key={s.label}>
                {s.label.padEnd(10)}
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-[#7cc4ff] underline">
                  {s.href}
                </a>
              </div>
            ))}
          </div>
        );
      case "resume":
        openApp("preview");
        return "Opening Résumé.pdf…";
      case "open": {
        const target = OPENABLE[arg.toLowerCase()];
        if (!target) return `open: unknown app "${arg}". Try: finder, notes, mail, preview, trash`;
        openApp(target);
        return null;
      }
      case "ls":
        return (
          <span>
            <span className="text-[#7cc4ff]">Projects/</span>    About Me.txt    Résumé.pdf
          </span>
        );
      case "cat":
        if (/about/i.test(arg)) return notes[0].body.join("\n");
        if (/r[eé]sum[eé]/i.test(arg)) return "cat: binary file. Try: resume";
        if (/projects/i.test(arg)) return "cat: Projects: Is a directory";
        return arg ? `cat: ${arg}: No such file or directory` : "usage: cat <file>";
      case "date":
        return new Date().toString();
      case "echo":
        return arg;
      case "clear":
        return "clear";
      case "exit":
        closeApp("terminal");
        return null;
      case "sudo":
        return `${profile.handle} is not in the sudoers file. This incident will be reported. 😉`;
      default:
        return `zsh: command not found: ${cmd}`;
    }
  };

  const submit = () => {
    const raw = input;
    const out = run(raw);
    setInput("");
    setCursor(null);
    if (raw.trim()) setHistory((h) => [...h, raw]);
    if (out === "clear") {
      setLines([]);
      return;
    }
    setLines((ls) => [...ls, line("in", raw), ...(out !== null ? [line("out", out)] : [])]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(i);
        setInput(history[i]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMANDS.filter((c) => c.startsWith(input.trim()));
      if (input.trim() && match.length === 1) setInput(match[0] + " ");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="h-full select-text overflow-y-auto px-2 py-1.5 font-mono text-[12.5px] leading-[1.45] text-[#e6e6e6]"
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      {lines.map((l) => (
        <div key={l.id} className="whitespace-pre-wrap break-words">
          {l.kind === "in" ? (
            <>
              <span className="text-white/90">{PROMPT}</span> {l.content}
            </>
          ) : (
            l.content
          )}
        </div>
      ))}
      <div className="flex">
        <span className="whitespace-pre text-white/90">{PROMPT} </span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal input"
          className="min-w-0 flex-1 bg-transparent text-[#e6e6e6] caret-[#e6e6e6] outline-none"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}

function Cmd({ children }: { children: ReactNode }) {
  return <span className="text-[#ffd479]">{children}</span>;
}

function Row({ c, d }: { c: string; d: string }) {
  return (
    <>
      <Cmd>{c}</Cmd>
      <span className="text-white/60">{d}</span>
    </>
  );
}
