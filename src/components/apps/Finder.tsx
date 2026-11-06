"use client";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutGrid,
  List,
  Mail,
  Search,
  StickyNote,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { FolderIcon } from "@/components/desktop/icons";
import { projects, type Project } from "@/data/content";
import { cx } from "@/lib/cx";
import { SidebarHeading, SidebarItem, ToolButton, Toolbar } from "./ui";

type View = { kind: "all" } | { kind: "tag"; tag: string } | { kind: "project"; id: string };

const TAG_COLORS = ["#ff5f57", "#febc2e", "#28c840", "#2f8cff", "#a15ef7", "#8e8e93"];

export function Finder() {
  const { openApp, isMobile } = useDesktop();
  const [history, setHistory] = useState<View[]>([{ kind: "all" }]);
  const [index, setIndex] = useState(0);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const view = history[index];
  const go = (v: View) => {
    setHistory([...history.slice(0, index + 1), v]);
    setIndex(index + 1);
    setSelected(null);
  };

  const tags = useMemo(() => [...new Set(projects.flatMap((p) => p.tags))], []);

  const visible = projects.filter(
    (p) =>
      (view.kind !== "tag" || p.tags.includes(view.tag)) &&
      (!query || `${p.name} ${p.tags.join(" ")} ${p.role}`.toLowerCase().includes(query.toLowerCase())),
  );

  const current = view.kind === "project" ? projects.find((p) => p.id === view.id) : undefined;
  const title = current ? current.name : view.kind === "tag" ? view.tag : "Projects";

  return (
    <div className="flex h-full">
      {!isMobile && (
        <aside className="flex w-[190px] shrink-0 flex-col border-r border-black/10 bg-[#ebe9ef]/90 backdrop-blur-xl">
          <div data-drag-region className="h-[52px] shrink-0" />
          <div className="flex-1 overflow-y-auto px-2.5 pb-3">
            <SidebarHeading>Favorites</SidebarHeading>
            <SidebarItem
              icon={<FolderOpen className="size-4" />}
              selected={view.kind === "all" || view.kind === "project"}
              onClick={() => go({ kind: "all" })}
            >
              Projects
            </SidebarItem>
            <SidebarItem icon={<StickyNote className="size-4" />} onClick={() => openApp("notes", "about")}>
              About Me
            </SidebarItem>
            <SidebarItem icon={<FileText className="size-4" />} onClick={() => openApp("preview")}>
              Résumé
            </SidebarItem>
            <SidebarItem icon={<Mail className="size-4" />} onClick={() => openApp("mail")}>
              Contact
            </SidebarItem>

            <SidebarHeading>Tags</SidebarHeading>
            {tags.map((tag, i) => (
              <SidebarItem
                key={tag}
                selected={view.kind === "tag" && view.tag === tag}
                onClick={() => go({ kind: "tag", tag })}
                icon={<span className="size-2.5 rounded-full" style={{ background: TAG_COLORS[i % TAG_COLORS.length] }} />}
              >
                {tag}
              </SidebarItem>
            ))}
          </div>
        </aside>
      )}

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <Toolbar inset={isMobile} className="border-b border-black/10">
          <ToolButton label="Back" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            <ChevronLeft className="size-5" />
          </ToolButton>
          <ToolButton label="Forward" disabled={index === history.length - 1} onClick={() => setIndex(index + 1)}>
            <ChevronRight className="size-5" />
          </ToolButton>
          <h2 className="ml-1 min-w-0 flex-1 truncate text-[15px] font-bold text-black/85">{title}</h2>
          {view.kind !== "project" && !isMobile && (
            <div className="flex rounded-md bg-black/[0.04]">
              <ToolButton label="Icons" pressed={layout === "grid"} onClick={() => setLayout("grid")}>
                <LayoutGrid className="size-4" />
              </ToolButton>
              <ToolButton label="List" pressed={layout === "list"} onClick={() => setLayout("list")}>
                <List className="size-4" />
              </ToolButton>
            </div>
          )}
          {view.kind !== "project" && (
            <label className="ml-1 flex h-7 w-40 items-center gap-1.5 rounded-md bg-black/[0.05] px-2 text-black/40 max-sm:w-28">
              <Search className="size-3.5 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-[13px] text-black outline-none placeholder:text-black/35"
              />
            </label>
          )}
        </Toolbar>

        <div
          className="min-h-0 flex-1 overflow-y-auto"
          onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          {current ? (
            <ProjectDetail project={current} />
          ) : visible.length === 0 ? (
            <p className="p-10 text-center text-[13px] text-black/40">No items</p>
          ) : layout === "grid" || isMobile ? (
            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] content-start gap-y-4 p-5"
              onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
            >
              {visible.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => (isMobile ? go({ kind: "project", id: p.id }) : setSelected(p.id))}
                  onDoubleClick={() => go({ kind: "project", id: p.id })}
                  className="flex flex-col items-center gap-1.5 outline-none"
                >
                  <span className={cx("flex h-[70px] w-[84px] items-center justify-center rounded-md p-1.5", selected === p.id && "bg-black/[0.08]")}>
                    <FolderIcon color={p.color} />
                  </span>
                  <span
                    className={cx(
                      "max-w-[104px] truncate rounded px-1.5 text-[12px] leading-[18px]",
                      selected === p.id ? "bg-[#2f6ee6] text-white" : "text-black/85",
                    )}
                  >
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-white text-[11px] text-black/45">
                <tr className="border-b border-black/10">
                  <th className="py-1.5 pl-5 font-normal">Name</th>
                  <th className="py-1.5 font-normal">Year</th>
                  <th className="py-1.5 pr-5 font-normal">Kind</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    onDoubleClick={() => go({ kind: "project", id: p.id })}
                    className={cx(
                      "cursor-default",
                      selected === p.id ? "bg-[#2f6ee6] text-white" : i % 2 ? "bg-[#f4f4f6]" : "",
                    )}
                  >
                    <td className="flex items-center gap-2 py-1 pl-5">
                      <span className="block h-3.5 w-[18px]">
                        <FolderIcon color={p.color} />
                      </span>
                      {p.name}
                    </td>
                    <td className={cx("py-1", selected !== p.id && "text-black/50")}>{p.year}</td>
                    <td className={cx("py-1 pr-5", selected !== p.id && "text-black/50")}>Folder</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!current && (
          <footer className="shrink-0 border-t border-black/10 py-1 text-center text-[11px] text-black/45">
            {visible.length} {visible.length === 1 ? "item" : "items"}
          </footer>
        )}
      </section>
    </div>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  return (
    <article className="mx-auto max-w-xl select-text px-8 py-8">
      <div className="flex items-center gap-5">
        <div className="h-[72px] w-[88px] shrink-0">
          <FolderIcon color={project.color} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[22px] font-bold leading-tight">{project.name}</h3>
          <p className="text-[13px] text-black/50">
            {project.role} · {project.year}
          </p>
        </div>
      </div>
      <p className="mt-6 text-[14px] leading-relaxed text-black/80">{project.description}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span key={t} className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-[12px] text-black/65">
            {t}
          </span>
        ))}
      </div>
      {project.href && (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-1.5 rounded-md bg-[#2f6ee6] px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm hover:bg-[#2561d1]"
        >
          Open website <ExternalLink className="size-3.5" />
        </a>
      )}
    </article>
  );
}
