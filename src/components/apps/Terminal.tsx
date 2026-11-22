"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import type { AppId } from "@/components/desktop/types";
import { useWindowCommands } from "@/components/desktop/windowCommands";
import { notes, profile, projects, resume, socials } from "@/data/content";

type Line = { id: number; content: ReactNode; prompt?: string };
type Directory = "~" | "~/Projects";
const CLEAR = Symbol("clear");

const OPENABLE: Record<string, AppId> = {
  finder: "finder",
  projects: "finder",
  notes: "notes",
  mail: "mail",
  preview: "preview",
  resume: "preview",
  photos: "photos",
  trash: "trash",
};

const COMMANDS = ["help", "about", "whoami", "projects", "skills", "contact", "socials", "resume", "open", "ls", "cat", "pwd", "cd", "date", "echo", "clear", "exit"];

let nextId = 0;
const line = (content: ReactNode, prompt?: string): Line => ({ id: nextId++, content, prompt });

export function Terminal() {
  const { openApp, closeApp } = useDesktop();
  const [directory, setDirectory] = useState<Directory>("~");
  const prompt = `${profile.handle}@${profile.host} ${directory === "~" ? "~" : "Projects"} %`;
  const [lines, setLines] = useState<Line[]>(() => [
    line(<>Portfolio shell. Type <Cmd>help</Cmd> for commands.</>),
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [scratch, setScratch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const run = (raw: string): ReactNode | typeof CLEAR | null => {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    const path = arg.replace(/^(['"])(.*)\1$/, "$2");
    const resolvedPath = path.toLowerCase().replace(/\/$/, "");
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
              ["open <app>", "finder, notes, mail, preview, photos, trash"],
              ["pwd / ls / cd", "browse the portfolio files"],
              ["cat <file>", "read a portfolio file"],
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
        if (!target) return `open: unknown app "${arg}". Try: finder, notes, mail, preview, photos, trash`;
        openApp(target);
        return null;
      }
      case "pwd":
        return directory;
      case "cd":
        if (["", "~", "..", "/"].includes(resolvedPath)) {
          setDirectory("~");
          return null;
        }
        if (["projects", "~/projects", "/projects", "./projects"].includes(resolvedPath)) {
          setDirectory("~/Projects");
          return null;
        }
        if (resolvedPath === ".") return null;
        return `cd: no such directory: ${path}`;
      case "ls": {
        const target = resolvedPath === "" || resolvedPath === "." ? directory
          : ["projects", "~/projects", "/projects", "./projects"].includes(resolvedPath) ? "~/Projects"
          : ["~", "..", "/"].includes(resolvedPath) ? "~" : null;
        if (target === "~/Projects") return projects.map((project) => project.name).join("\n");
        if (!target) return `ls: no such file or directory: ${path}`;
        return (
          <span>
            <span className="text-[#7cc4ff]">Projects/</span>    About Me.txt    Résumé.pdf
          </span>
        );
      }
      case "cat":
        if (["about", "about me.txt", "~/about me.txt"].includes(resolvedPath)) return notes[0].body.join("\n");
        if (/r[eé]sum[eé]/i.test(path)) return "cat: binary file. Try: resume";
        if (["projects", "~/projects"].includes(resolvedPath)) return "cat: Projects: Is a directory";
        if (directory === "~/Projects" || resolvedPath.startsWith("projects/")) {
          const filename = resolvedPath.replace(/^projects\//, "");
          const project = projects.find((item) => item.name.toLowerCase() === filename);
          if (project) return project.description;
        }
        return path ? `cat: ${path}: No such file or directory` : "usage: cat <file>";
      case "date":
        return new Date().toString();
      case "echo":
        return arg;
      case "clear":
        return CLEAR;
      case "exit":
        closeApp("terminal");
        return null;
      case "sudo":
        return `${profile.handle} is not in the sudoers file. This incident will be reported. 😉`;
      default:
        return `zsh: command not found: ${cmd}`;
    }
  };

  useWindowCommands("terminal", (command) => {
    if (command === "clear") setLines([]);
    if (command === "terminal-help") {
      const help = run("help");
      if (help !== CLEAR) setLines((current) => [...current, line(help)]);
    }
    inputRef.current?.focus();
  });

  const submit = () => {
    const raw = input;
    const out = run(raw);
    setInput("");
    setCursor(null);
    if (raw.trim()) setHistory((h) => [...h, raw]);
    if (out === CLEAR) {
      setLines([]);
      return;
    }
    setLines((ls) => [...ls, line(raw, prompt), ...(out !== null ? [line(out)] : [])]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      if (cursor === null) setScratch(input);
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setInput(scratch);
      } else {
        setCursor(i);
        setInput(history[i]);
      }
    } else if (e.key === "Tab") {
      const typed = input.toLowerCase();
      if (!typed.trim()) return;
      const suggestions = typed.startsWith("open ") ? Object.keys(OPENABLE).map((name) => `open ${name}`)
        : typed.startsWith("cd ") ? ["cd Projects"] : COMMANDS;
      const matches = suggestions.filter((name) => name.toLowerCase().startsWith(typed));
      if (matches.length === 1) {
        e.preventDefault();
        setInput(matches[0] + " ");
      }
    } else if (e.key === "c" && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault();
      setLines((current) => [...current, line(input + "^C", prompt)]);
      setInput("");
      setCursor(null);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="h-full select-text overflow-y-auto bg-[#161b26] px-3 py-2.5 font-mono text-[12.5px] leading-[1.55] text-[#e4eaf5]"
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      {lines.map((l) => (
        <div key={l.id} className="whitespace-pre-wrap break-words">
          {l.prompt ? (
            <>
              <span className="text-[#bde8df]">{l.prompt}</span> {l.content}
            </>
          ) : (
            l.content
          )}
        </div>
      ))}
      <div className="flex">
        <span className="whitespace-pre text-[#bde8df]">{prompt} </span>
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
