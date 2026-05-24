# Notes API — FastAPI

A full-stack notes application built with FastAPI. It provides a REST API with full CRUD operations, persistent storage in SQLite, case-insensitive search, and AI-powered note summarization using Google's Gemini model. A simple HTML/JavaScript frontend lets you manage notes directly in the browser.

This project was built to learn full-stack web development with FastAPI, including REST API design, database integration through an ORM, and connecting an application to an external large language model.

## Features

- **CRUD operations** — create, read, update, and delete notes
- **REST API** — clean endpoints following REST conventions, with automatic interactive documentation (Swagger UI)
- **Database persistence** — notes are stored in SQLite via the SQLModel ORM, so they survive server restarts
- **Search** — filter notes by title or content, case-insensitive and works with Polish characters
- **AI summarization** — an endpoint that sends a note's content to the Gemini model and returns a short summary
- **Frontend** — a single-page HTML/JavaScript interface that talks to the API using `fetch`

## Tech stack

- FastAPI (Python web framework)
- SQLModel (ORM, built on SQLAlchemy and Pydantic)
- SQLite (database)
- Google Gemini API (AI summarization)
- HTML + JavaScript (frontend)

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | List all notes (optional `?search=` query) |
| GET | `/notes/{id}` | Get a single note |
| POST | `/notes` | Create a note |
| PUT | `/notes/{id}` | Update a note |
| DELETE | `/notes/{id}` | Delete a note |
| POST | `/notes/{id}/summarize` | Summarize a note using AI |

## Getting started

### Prerequisites

- Python 3.10 or newer
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Setup

1. Clone the repository and enter the folder:

   ```
   git clone https://github.com/AmeRonka/FastAPI.git
   cd FastAPI
   ```

2. Create and activate a virtual environment:

   ```
   python -m venv .venv
   .venv\Scripts\activate        # Windows
   source .venv/bin/activate      # macOS / Linux
   ```

3. Install the dependencies:

   ```
   pip install fastapi uvicorn sqlmodel google-genai python-dotenv
   ```

4. Create a `.env` file in the project root and add your Gemini API key:

   ```
   GEMINI_API_KEY=your_key_here
   ```

   The `.env` file is excluded from version control, so the key never gets committed.

5. Run the server:

   ```
   uvicorn main:app --reload
   ```

6. Open the app in your browser:

   - Frontend: `http://127.0.0.1:8000`
   - Interactive API docs: `http://127.0.0.1:8000/docs`

## What I learned

- Designing a REST API with proper HTTP methods and status codes
- Using an ORM to map Python objects to database tables instead of writing raw SQL
- Validating request data automatically with Pydantic models
- Keeping secrets (API keys) out of source control with environment variables
- Connecting a web application to an external LLM and handling its responses
- How a frontend communicates with a backend over HTTP using JSON