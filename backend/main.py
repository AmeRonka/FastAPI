import truststore
truststore.inject_into_ssl()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
import os
from dotenv import load_dotenv
from google import genai


load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Note(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str


class NoteCreate(SQLModel):
    title: str
    content: str


engine = create_engine("sqlite:///notes.db")


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


@app.post("/notes", response_model=Note)
def create_note(note: NoteCreate):
    with Session(engine) as session:
        new_note = Note(title=note.title, content=note.content)
        session.add(new_note)
        session.commit()
        session.refresh(new_note)
        return new_note


@app.get("/notes", response_model=list[Note])
def get_notes(search: str | None = None):
    with Session(engine) as session:
        notes = session.exec(select(Note)).all()
        if search:
            s = search.lower()
            notes = [
                n for n in notes
                if s in n.title.lower() or s in n.content.lower()
            ]
        return notes


@app.get("/notes/{note_id}", response_model=Note)
def get_note(note_id: int):
    with Session(engine) as session:
        note = session.get(Note, note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Notatka nie znaleziona")
        return note


@app.put("/notes/{note_id}", response_model=Note)
def update_note(note_id: int, updated: NoteCreate):
    with Session(engine) as session:
        note = session.get(Note, note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Notatka nie znaleziona")
        note.title = updated.title
        note.content = updated.content
        session.add(note)
        session.commit()
        session.refresh(note)
        return note


@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    with Session(engine) as session:
        note = session.get(Note, note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Notatka nie znaleziona")
        session.delete(note)
        session.commit()
        return {"message": "Notatka usunięta"}


@app.post("/notes/{note_id}/summarize")
def summarize_note(note_id: int):
    with Session(engine) as session:
        note = session.get(Note, note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Notatka nie znaleziona")

        prompt = f"Streść poniższą notatkę w dwóch, krótkich zdaniach po polsku:\n\n{note.content}"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        return {
            "note_id": note.id,
            "title": note.title,
            "summary": response.text,
        }
