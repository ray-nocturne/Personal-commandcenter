# Personal Command Center

Ray's ops deck — daily time-block tracker, per-venture status board, and work-location log. Built as a real app (Vite + React + Supabase) after prototyping in an artifact.

## Stack

- **Vite + React** — same approach as Pocket Master
- **Supabase** — database + auth (so data persists properly, not just in one browser's local storage)

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your Supabase project's URL and anon key (Settings → API in the Supabase dashboard). Never commit `.env` — it's already in `.gitignore`.

```bash
npm run dev
```

## Project structure

```
src/
  lib/
    supabase.js   # Supabase client — reads env vars, don't hardcode keys here
  App.jsx         # main app (dashboard UI goes here)
```

## Status

Scaffold stage — Supabase client wired up, UI not yet ported from the prototype artifact. Next: define the database schema (blocks, notes, locations, sessions tables) and port the dashboard UI.
