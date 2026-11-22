"use client";

import { ChevronLeft, ChevronRight, FolderOpen, Heart, Images, LayoutGrid, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import type { AppProps } from "@/components/desktop/apps";
import { useWindowCommands } from "@/components/desktop/windowCommands";
import { portfolioPhotos } from "@/data/content";
import { useLibraryStorage } from "./library/storage";
import { Empty, field, SourceHeading, SourceItem, SourceRail } from "./library/ui";
import { ToolButton, Toolbar } from "./ui";

type Photo = { id: string; title: string; src: string; alt?: string };
type LibraryImage = { id: string; title: string; file: File; addedAt: number };
const noFavorites: string[] = [];
const views = [
  { id: "library", title: "Library", Icon: Images },
  { id: "favorites", title: "Favorites", Icon: Heart },
  { id: "imports", title: "Imports", Icon: FolderOpen },
] as const;

function openLibrary() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("portfolio-photos", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("photos", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withPhotoStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | void,
) {
  const db = await openLibrary();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction("photos", mode);
      const request = operation(transaction.objectStore("photos"));
      transaction.oncomplete = () => resolve(request?.result);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export function Photos({ payload }: AppProps) {
  const [imports, setImports] = useState<Photo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(payload ?? null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [favourites, setFavourites] = useLibraryStorage("photo-favourites", noFavorites);
  const [view, setView] = useState<(typeof views)[number]["id"]>("library");
  const [query, setQuery] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const urls = useRef(new Map<string, string>());
  const mounted = useRef(false);
  const gallery: Photo[] = [...portfolioPhotos, ...imports];
  const source = view === "imports" ? imports : view === "favorites" ? gallery.filter((photo) => favourites.includes(photo.id)) : gallery;
  const results = source.filter((photo) => photo.title.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = gallery.find((photo) => photo.id === selectedId);
  const pages = selected && results.includes(selected) ? results : gallery;
  const index = pages.findIndex((photo) => photo.id === selectedId);
  const focusViewer = useCallback((element: HTMLDivElement | null) => {
    element?.focus();
  }, []);

  const addToGallery = useCallback((saved: LibraryImage[]) => {
    const added = saved.map(({ id, title, file }) => {
      let src = urls.current.get(id);
      if (!src) {
        src = URL.createObjectURL(file);
        urls.current.set(id, src);
      }
      return { id, title, src };
    });
    setImports((current) => [...new Map([...current, ...added].map((photo) => [photo.id, photo])).values()]);
  }, []);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    const urlsToRelease = urls.current;
    void withPhotoStore<LibraryImage[]>("readonly", (store) => store.getAll()).then((saved) => {
      if (active && saved?.length) addToGallery(saved.toSorted((a, b) => a.addedAt - b.addedAt));
    }).catch(() => {});
    return () => {
      active = false;
      mounted.current = false;
      urlsToRelease.forEach((url) => URL.revokeObjectURL(url));
      urlsToRelease.clear();
    };
  }, [addToGallery]);

  const importPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setImportError("Choose image files to add to Photos.");
      return;
    }

    setImporting(true);
    setImportError("");
    const addedAt = Date.now();
    const images = files.map((file, i): LibraryImage => ({
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^.]+$/, "") || file.name,
      addedAt: addedAt + i,
      file,
    }));

    try {
      await withPhotoStore("readwrite", (store) => {
        for (const image of images) store.add(image);
      });
      if (mounted.current) {
        addToGallery(images);
        setSelectedId(null);
      }
    } catch {
      if (mounted.current) setImportError("Photos could not save these files in this browser.");
    } finally {
      if (mounted.current) setImporting(false);
    }
  };

  const showFilePicker = () => {
    if (!importing) fileInput.current?.click();
  };
  const move = (delta: number) => {
    const next = pages[index + delta];
    if (index >= 0 && next) setSelectedId(next.id);
  };

  useWindowCommands("photos", (command) => {
    if (command === "import-photos") showFilePicker();
    if (command === "show-library") setSelectedId(null);
  });

  return (
    <div
      className="app-ref @container flex h-full min-h-0 flex-col"
      onKeyDown={(event) => {
        if (!selected || event.target === fileInput.current) return;
        if (event.key === "Escape") setSelectedId(null);
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <Toolbar inset className="border-b border-[var(--app-line)] bg-[var(--app-chrome)]">
        {selected && <ToolButton label="Photo Library" onClick={() => setSelectedId(null)}><LayoutGrid className="size-4" /></ToolButton>}
        <h1 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#263449]">
          {selected?.title ?? views.find((item) => item.id === view)?.title}
        </h1>
        {selected && (
          <div className="flex">
            <ToolButton label="Previous Photo" disabled={index <= 0} onClick={() => move(-1)}><ChevronLeft className="size-4" /></ToolButton>
            <ToolButton label="Next Photo" disabled={index === pages.length - 1} onClick={() => move(1)}><ChevronRight className="size-4" /></ToolButton>
            <ToolButton label="Favorite" pressed={favourites.includes(selected.id)} onClick={() => setFavourites((ids) => ids.includes(selected.id) ? ids.filter((id) => id !== selected.id) : [...ids, selected.id])}>
              <Heart className={favourites.includes(selected.id) ? "size-4 fill-[#e25975] text-[#e25975]" : "size-4"} />
            </ToolButton>
          </div>
        )}
        {!selected && <label className="relative hidden w-40 @min-[610px]:block">
          <Search aria-hidden="true" className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-[#697789]" />
          <input className={`${field} pl-7`} aria-label="Search photos" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>}
        <button
          type="button"
          aria-label="Import Photos"
          title="Import Photos"
          disabled={importing}
          onClick={showFilePicker}
          className="flex h-7 shrink-0 items-center gap-1 rounded-md bg-[#dce8fb] px-2 text-[12px] font-medium text-[#2b5ca5] enabled:hover:bg-[#cddff8] disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          <span className="max-[360px]:hidden">{importing ? "Importing…" : "Import"}</span>
        </button>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={importPhotos} />
      </Toolbar>
      {importError && <p role="alert" className="border-b border-[#ead3cc] bg-[#fff4ef] px-4 py-2 text-[12px] text-[#7c342b]">{importError}</p>}
      {selected ? (
        <div ref={focusViewer} tabIndex={0} className="flex min-h-0 flex-1 flex-col bg-[#171f2c] outline-none">
          <figure className="flex min-h-0 flex-1 items-center justify-center p-4">
            <PhotoImage photo={selected} className="max-h-full max-w-full object-contain" />
          </figure>
          <p className="shrink-0 border-t border-white/10 px-4 py-2 text-center text-[12px] text-[#c8d3e7]">
            {index + 1} of {pages.length}
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col @min-[530px]:flex-row">
          <SourceRail label="Photo collections" className="phone-photo-tabs">
            <SourceHeading>Photos</SourceHeading>
            {views.map(({ id, title, Icon }) => (
              <SourceItem key={id} selected={view === id} icon={<Icon className="size-4" />} onClick={() => { setView(id); setQuery(""); }}>{title}</SourceItem>
            ))}
          </SourceRail>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {!results.length && <Empty>{query ? "No matching photos." : view === "favorites" ? "Open a photo and add it to Favorites." : "No imported photos."}</Empty>}
            <ul className="grid min-h-0 flex-1 grid-cols-3 content-start gap-1 overflow-y-auto p-1 @min-[650px]:grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
              {results.map((photo) => (
              <li key={photo.id}>
                <button
                  type="button"
                  aria-label={photo.title}
                  onClick={() => setSelectedId(photo.id)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-sm text-left focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2b61bb]"
                >
                  <PhotoImage photo={photo} className="size-full bg-[#e5ebf4] object-cover" decorative />
                  {favourites.includes(photo.id) && <Heart aria-hidden="true" className="absolute right-1.5 bottom-1.5 size-3.5 fill-white text-white drop-shadow" />}
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 truncate bg-black/60 p-1.5 text-[11px] text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">{photo.title}</span>
                </button>
              </li>
              ))}
            </ul>
            <footer className="shrink-0 border-t border-[#e0e6ef] py-1.5 text-center text-[11px] text-[#52627b]">
              {results.length} {results.length === 1 ? "photo" : "photos"}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoImage({ photo, className, decorative }: { photo: Photo; className: string; decorative?: boolean }) {
  // Browser-local blobs and the bundled image are displayed directly.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={photo.src} alt={decorative ? "" : photo.alt ?? photo.title} draggable={false} className={className} />;
}
