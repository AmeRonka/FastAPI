# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run the dev server (frontend + API on the same port):

```
uvicorn main:app --reload
```

- Frontend: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`

There is no test suite, linter, or build step configured. Dependencies are installed ad-hoc via `pip install fastapi uvicorn sqlmodel google-genai python-dotenv` (no `requirements.txt`).

A `GEMINI_API_KEY` must be present in `.env` at the project root for the `/notes/{id}/summarize` endpoint to work.

## Architecture

Single-file FastAPI app (`main.py`) that serves both the JSON API and the static HTML frontend:

- `GET /` returns `index.html` via `FileResponse`. The frontend uses `const API = ""` (same-origin) — there is no separate frontend server or CORS layer, so don't add one unless the deployment model changes.
- SQLModel `Note` is both the table model and the response model; `NoteCreate` is the request-body model (no `id`). The DB file `notes.db` is created on app startup via `SQLModel.metadata.create_all` and lives in the working directory.
- The Gemini client is constructed at import time from `GEMINI_API_KEY`. Importing `main` without a key set will still succeed, but `/summarize` calls will fail.

### Search is intentionally in-Python, not SQL

`GET /notes?search=` loads all notes and filters in Python with `s in n.title.lower()`. This is deliberate — it gives case-insensitive matching that works correctly with Polish characters (ą, ę, ł, etc.), which SQLite's default `LIKE` does not. Don't "optimize" this to a SQL `WHERE title LIKE` without preserving the Unicode-aware lowercase behavior.

### Polish-language UX

User-facing strings — HTTP error details, the Gemini prompt, and the entire frontend — are in Polish. Match that language when adding new user-facing messages. The summarization prompt explicitly asks Gemini to respond in Polish (`"...po polsku"`).

## Notes

- This is a learning project (FastAPI + ORM + LLM integration). The README's "What I learned" section describes the pedagogical goals; keep changes aligned with that scope rather than introducing production-grade abstractions (auth, migrations, async DB, etc.) unprompted.
- `main.py` has a duplicate `sqlmodel` import line and a commented-out earlier version of `get_notes` — these reflect the learning history and aren't worth cleaning up unless asked.
