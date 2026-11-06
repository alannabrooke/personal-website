# personal-website

My personal website, built as a macOS-style desktop in the browser with **Next.js** and **Tailwind CSS**.

Visitors land on a desktop with a menu bar, a dock and draggable windows:

| App | What it shows |
| --- | --- |
| **Notes** | About me, what I'm doing now, skills, fun facts (opens on load) |
| **Finder** | Projects, with icon/list views, search, and tag filters |
| **Preview** | Résumé |
| **Mail** | A contact form that opens the visitor's email app |
| **Terminal** | Type `help` for commands (`about`, `projects`, `open finder`, …) |

Windows can be dragged, resized, minimized to the dock, zoomed and closed. The menu bar has working menus and a live clock. On phones, windows open full screen.

## Edit the content

All the text lives in one file: **`src/data/content.ts`** (name, email, notes, projects, résumé, social links).

To offer a downloadable PDF résumé, add `public/resume.pdf` and set `RESUME_PDF` in `src/components/apps/Preview.tsx` to `"/resume.pdf"`.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project layout

```
src/
  app/                  layout, page, global styles + wallpaper
  data/content.ts       all site text
  components/desktop/   menu bar, dock, windows, desktop icons, window manager
  components/apps/      Finder, Notes, Mail, Preview, Terminal, Trash, About
```

## Deploy

Works on any Next.js host. The simplest option is [Vercel](https://vercel.com/new): import this repo and deploy. Netlify and Cloudflare Pages also work with private repos on their free plans.
