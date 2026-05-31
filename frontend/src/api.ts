import type { Note, NoteCreate, SummaryResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail.detail ?? 'Błąd zapytania')
  }
  return res.json() as Promise<T>
}

export function listNotes(search?: string): Promise<Note[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<Note[]>(`/notes${query}`)
}

export function createNote(note: NoteCreate): Promise<Note> {
  return request<Note>('/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  })
}

export function updateNote(id: number, note: NoteCreate): Promise<Note> {
  return request<Note>(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  })
}

export function deleteNote(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/notes/${id}`, { method: 'DELETE' })
}

export function summarizeNote(id: number): Promise<SummaryResponse> {
  return request<SummaryResponse>(`/notes/${id}/summarize`, { method: 'POST' })
}
