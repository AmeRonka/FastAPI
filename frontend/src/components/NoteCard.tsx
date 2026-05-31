import { useState } from 'react'
import type { Note, NoteCreate } from '../types'

type Props = {
  note: Note
  onUpdate: (id: number, updated: NoteCreate) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onSummarize: (id: number) => Promise<string>
}

export function NoteCard({ note, onUpdate, onDelete, onSummarize }: Props) {
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(note.title)
  const [draftContent, setDraftContent] = useState(note.content)
  const [summary, setSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSave() {
    setBusy(true)
    try {
      await onUpdate(note.id, { title: draftTitle, content: draftContent })
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  function handleCancel() {
    setDraftTitle(note.title)
    setDraftContent(note.content)
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm(`Usunąć notatkę „${note.title}"?`)) return
    setBusy(true)
    try {
      await onDelete(note.id)
    } finally {
      setBusy(false)
    }
  }

  async function handleSummarize() {
    setSummarizing(true)
    setSummary(null)
    try {
      const result = await onSummarize(note.id)
      setSummary(result)
    } catch (err) {
      setSummary(err instanceof Error ? err.message : 'Błąd streszczania')
    } finally {
      setSummarizing(false)
    }
  }

  if (editing) {
    return (
      <article className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-indigo-400 dark:border-indigo-500 p-5 space-y-3">
        <input
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-medium transition-colors"
          >
            {busy ? 'Zapisywanie...' : 'Zapisz'}
          </button>
          <button
            onClick={handleCancel}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-sm font-medium transition-colors"
          >
            Anuluj
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 space-y-3 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {note.title}
      </h3>
      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {note.content}
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => setEditing(true)}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-sm font-medium transition-colors"
        >
          Edytuj
        </button>
        <button
          onClick={handleSummarize}
          disabled={summarizing}
          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-200 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {summarizing ? 'Streszczam...' : 'Streść (AI)'}
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-200 text-sm font-medium transition-colors disabled:opacity-60"
        >
          Usuń
        </button>
      </div>
      {summary && (
        <div className="mt-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 italic">
          <span className="font-semibold not-italic">Streszczenie:</span> {summary}
        </div>
      )}
    </article>
  )
}
