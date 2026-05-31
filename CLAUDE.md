# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

The app is split into two services that run independently in development.

**Backend** (FastAPI, port 8000):
```
cd backend
../.venv/Scripts/python.exe -m uvicorn main:app --reload
```

**Frontend** (Vite dev server, port 5173):
```
cd frontend
npm run dev
```

Open `http://localhost:5173`. The frontend hits the backend through `VITE_API_URL` (defaults to `http://127.0.0.1:8000`).

Backend deps are installed ad-hoc (no `requirements.txt`):
`pip install fastapi uvicorn sqlmodel google-genai python-dotenv truststore`.

`truststore` is mandatory on this machine — the Gemini SDK uses `httpx`, which uses Python's bundled `certifi` CAs by default. With corporate/AV SSL inspection in the path, that bundle doesn't include the inspecting CA and outbound HTTPS fails with `CERTIFICATE_VERIFY_FAILED`. `main.py` calls `truststore.inject_into_ssl()` at the very top (before any HTTPS-using import) to switch httpx to the OS trust store. Don't remove or reorder those two lines.

Frontend deps live in `frontend/package.json`. **Note:** `npm` on this Windows machine needs `NODE_OPTIONS="--use-system-ca"` for SSL to work against the npm registry — prepend it to install commands.

A `GEMINI_API_KEY` must be present in `backend/.env` for `/notes/{id}/summarize` to work.

Production-style demo (single server, no Vite): `cd frontend && npm run build`, then mount `frontend/dist` as static files from FastAPI. Not wired up by default — current setup is dev-mode two-server.

## Architecture

**Two independent apps connected by HTTP/JSON:**

```
frontend/  React + TypeScript SPA (Vite)
   │
   │   fetch (CORS allowed for localhost:5173)
   ▼
backend/   FastAPI REST API
   │
   ▼   SQLite (notes.db, auto-created on startup) + Gemini API
```

### Backend (`backend/main.py`)

- Pure REST API — no HTML, no static files (production-mode static mount intentionally not wired by default).
- `CORSMiddleware` allows only `localhost:5173` and `127.0.0.1:5173` (Vite dev origins). Extend the list if you add other dev origins.
- SQLModel `Note` is both the table model and the response model; `NoteCreate` is the request-body model. `notes.db` lives next to `main.py` (so it's at `backend/notes.db` when running from `backend/`).
- Gemini client is constructed at import time from `GEMINI_API_KEY`. Importing without a key still succeeds, but `/summarize` calls fail at runtime.

#### Search is intentionally in-Python, not SQL

`GET /notes?search=` loads all notes and filters in Python with `s in n.title.lower()`. This is deliberate — it gives case-insensitive matching that works correctly with Polish characters (ą, ę, ł, etc.), which SQLite's default `LIKE` does not. Don't "optimize" this to a SQL `WHERE title LIKE` without preserving the Unicode-aware lowercase behavior.

### Frontend (`frontend/src/`)

- `types.ts` — `Note`, `NoteCreate`, `SummaryResponse` mirror the Pydantic models. Keep them in sync when backend models change.
- `api.ts` — typed fetch wrapper. All API calls go through `request<T>()` which throws on non-2xx with the backend's `detail` field as the message.
- `components/` — `NoteCard` (display + inline edit + delete + AI summarize), `NoteForm` (create), `SearchBar` (search input).
- `App.tsx` — owns notes/search state, debounces search by 200ms, applies optimistic-ish list updates after CRUD calls.
- Styling is Tailwind v4 via `@tailwindcss/vite`. Single import in `index.css` (`@import "tailwindcss"`), no `tailwind.config` needed for current usage.

### Polish-language UX

User-facing strings — HTTP error details, the Gemini prompt, all UI copy — are in Polish. Match that language when adding new user-facing messages. The summarization prompt explicitly asks Gemini to respond in Polish (`"...po polsku"`).

## Notes

- This is a learning / interview-demo project (FastAPI + ORM + LLM integration + React + TS). Keep changes aligned with that scope rather than introducing production-grade abstractions (auth, migrations, async DB, Docker, etc.) unprompted.
- `main` branch has the pre-rewrite vanilla-JS version. Current React rewrite lives on `react-rewrite`.
