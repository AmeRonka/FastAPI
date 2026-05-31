export type Note = {
  id: number
  title: string
  content: string
}

export type NoteCreate = {
  title: string
  content: string
}

export type SummaryResponse = {
  note_id: number
  title: string
  summary: string
}
