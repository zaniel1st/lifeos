# LifeOS

A personal command center — tasks, habits, journal, goals, finances, learning, and a
gamified growth profile — all in one local-first app. Nothing leaves your browser
unless you export it yourself.

## Stack

React 18 + Vite + TypeScript + Tailwind CSS + React Router + Zustand + Framer Motion + Recharts.

## Getting started

This is a source-only handoff — dependencies aren't installed yet, so the first run needs npm:

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## How data is stored

Every module (tasks, habits, journal, goals, finance, learning, growth, settings) goes
through a single storage abstraction in `src/services/storage.ts`. Right now that adapter
writes to `localStorage`, namespaced under `lifeos:`. Because components never touch
`localStorage` directly, swapping in IndexedDB or a remote API later only means writing a
new adapter that implements the same `StorageAdapter` interface — nothing in the UI needs
to change.

Data also stays in sync across tabs: writing a task in one tab updates the store in every
other open tab via the browser's `storage` event.

## Backing up your data

Settings → Data lets you export everything as a single JSON file, and restore from a
previous export. Good practice before clearing browser data or switching machines.

## Project structure

```
src/
  types/          Shared TypeScript data models for every module
  services/       Storage abstraction (localStorage adapter + export/import)
  store/          One Zustand store per module (tasks, habits, journal, goals,
                   finance, learning, growth, settings, theme)
  components/
    layout/       Shell, Sidebar, Header, BottomNav
    common/       CommandPalette, Modal, EmptyState, Skeleton
  pages/          One page per module, routed in App.tsx
  utils/          id generation, date formatting, fuzzy search
```

## Keyboard shortcuts

- `Ctrl/Cmd + K` — open the command palette (jump to any page, quick-add a task, switch theme)
- `Esc` — close any open modal or the command palette

## Deployment

The app is a static build (`npm run build` outputs to `dist/`), so any static host works.

**Vercel:** `vercel.json` is included with a SPA rewrite rule already set up — just
import the repo and deploy.

**Netlify:** `public/_redirects` is included for the same reason — drag-and-drop the
`dist/` folder, or connect the repo (build command `npm run build`, publish directory `dist`).

**GitHub Pages:** run `npm run build`, then publish the `dist/` folder to a `gh-pages`
branch (e.g. with the `gh-pages` npm package), and set `base` in `vite.config.ts` to your
repo name if it's not deployed at the domain root.

## Notes on scope

This covers all 14 phases of the original blueprint as a working, coherent app rather than
14 separate deliverables: storage abstraction, theming, shell/command palette, dashboard,
tasks, habits, journal, goals, finance, learning, growth profile, settings/data export,
motion polish, and deploy-ready config. A few judgment calls were made to keep the app
internally consistent — noted inline in code comments where relevant (e.g. streak math in
`habitStore.ts`, goal progress derived from milestones in `goalStore.ts`).
