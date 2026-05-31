# Notes — FastAPI + React

A full-stack notes application: a Python REST API powered by FastAPI on the backend, a React + TypeScript single-page app on the frontend, and Google's Gemini model for AI-powered note summarization.

This project was built to learn full-stack web development end-to-end: REST API design, ORM-backed persistence, integrating an external large language model, and consuming the API from a modern, typed React frontend.

## Features

- **CRUD operations** — create, read, update, and delete notes
- **REST API** — clean endpoints with automatic interactive documentation (Swagger UI)
- **Database persistence** — notes are stored in SQLite via the SQLModel ORM
- **Search** — filter notes by title or content, case-insensitive and Polish-character aware
- **AI summarization** — an endpoint sends a note's content to Gemini and returns a short summary
- **Typed frontend** — React + TypeScript SPA with debounced search, inline editing, and dark-mode-aware Tailwind styling
- **Symmetric typing** — Pydantic models on the backend mirror TypeScript types on the frontend

## Tech stack

**Backend:** FastAPI · SQLModel · SQLite · Google Gemini API · python-dotenv · truststore
**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4

## Architecture

Two independent apps connected by HTTP/JSON. In development they run on separate ports (Vite on 5173, FastAPI on 8000) with CORS enabled. For a single-server deployment, the frontend can be built to static files and served by FastAPI.

```
frontend/   React + TypeScript SPA (Vite)
   │
   │  fetch + JSON
   ▼
backend/    FastAPI REST API
   │
   ▼   SQLite + Gemini API
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | List all notes (optional `?search=` query) |
| GET | `/notes/{id}` | Get a single note |
| POST | `/notes` | Create a note |
| PUT | `/notes/{id}` | Update a note |
| DELETE | `/notes/{id}` | Delete a note |
| POST | `/notes/{id}/summarize` | Summarize a note using AI |

Interactive docs at `http://127.0.0.1:8000/docs` while the backend is running.

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 20+
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Setup

1. Clone the repository:

   ```
   git clone https://github.com/AmeRonka/FastAPI.git
   cd FastAPI
   ```

2. Set up the backend:

   ```
   python -m venv .venv
   .venv\Scripts\activate            # Windows
   source .venv/bin/activate         # macOS / Linux
   pip install fastapi uvicorn sqlmodel google-genai python-dotenv truststore
   ```

3. Create `backend/.env` with your Gemini API key:

   ```
   GEMINI_API_KEY=your_key_here
   ```

4. Install frontend dependencies:

   ```
   cd frontend
   npm install
   cd ..
   ```

### Running

Open two terminals.

**Terminal 1 — backend** (`http://127.0.0.1:8000`):

```
cd backend
uvicorn main:app --reload
```

**Terminal 2 — frontend** (`http://localhost:5173`):

```
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

### Why `truststore`?

The backend uses `truststore.inject_into_ssl()` at the top of `main.py`. This tells Python to verify HTTPS certificates against the operating system's trust store instead of Python's bundled `certifi` bundle. It's needed on machines where antivirus software or a corporate proxy performs SSL inspection — without it, the Gemini API call fails with `CERTIFICATE_VERIFY_FAILED`. On a clean machine it's a no-op.

## What I learned

- Designing a REST API with proper HTTP methods and status codes
- Using an ORM to map Python objects to database tables instead of writing raw SQL
- Validating request data automatically with Pydantic models
- Keeping API keys out of source control with environment variables
- Connecting a web application to an external LLM and handling its responses
- Building a React SPA with TypeScript, including custom hooks, state lifting, and prop typing
- Configuring Vite as a dev tool with hot module reload and a production build step
- Mirroring backend Pydantic schemas as TypeScript types for end-to-end type safety
- Configuring CORS to allow a separate-origin frontend to call the API in development
- Diagnosing SSL certificate-verification errors in Python and using `truststore` to bridge the OS trust store
