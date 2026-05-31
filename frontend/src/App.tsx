import { useEffect, useState } from 'react'
import { NoteCard } from './components/NoteCard'
import { NoteForm } from './components/NoteForm'
import { SearchBar } from './components/SearchBar'
import * as api from './api'
import type { Note, NoteCreate } from './types'

export default function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null)
      api
        .listNotes(search || undefined)
        .then(setNotes)
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(timer)
  }, [search])

  async function handleCreate(note: NoteCreate) {
    const created = await api.createNote(note)
    setNotes((prev) => [...prev, created])
  }

  async function handleUpdate(id: number, updated: NoteCreate) {
    const fresh = await api.updateNote(id, updated)
    setNotes((prev) => prev.map((n) => (n.id === id ? fresh : n)))
  }

  async function handleDelete(id: number) {
    await api.deleteNote(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  async function handleSummarize(id: number) {
    const result = await api.summarizeNote(id)
    return result.summary
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Moje notatki</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            FastAPI + React + TypeScript • streszczanie przez Gemini
          </p>
        </header>

        <NoteForm onSubmit={handleCreate} />
        <SearchBar value={search} onChange={setSearch} />

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-slate-500">Ładowanie...</p>
        ) : notes.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            {search ? 'Brak notatek pasujących do wyszukiwania.' : 'Brak notatek. Dodaj pierwszą!'}
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onSummarize={handleSummarize}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
