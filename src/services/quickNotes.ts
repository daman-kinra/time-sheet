import {
  deleteQuickNoteById,
  getAllQuickNotesFromDb,
  putQuickNote,
} from '@/services/idb'
import type { QuickNoteItem } from '@/types'

function delay(ms = 80): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateId(): string {
  return crypto.randomUUID()
}

export async function getQuickNotes(): Promise<QuickNoteItem[]> {
  await delay()
  return getAllQuickNotesFromDb()
}

export async function createQuickNote(text: string): Promise<QuickNoteItem> {
  await delay()
  const note: QuickNoteItem = {
    id: generateId(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  }
  await putQuickNote(note)
  return note
}

export async function updateQuickNote(
  id: string,
  updates: Partial<Pick<QuickNoteItem, 'text' | 'completed'>>,
): Promise<QuickNoteItem> {
  await delay()
  const notes = await getAllQuickNotesFromDb()
  const current = notes.find((n) => n.id === id)
  if (!current) throw new Error('Note not found')

  const next: QuickNoteItem = {
    ...current,
    ...updates,
    text: updates.text !== undefined ? updates.text.trim() : current.text,
  }
  await putQuickNote(next)
  return next
}

export async function deleteQuickNote(id: string): Promise<void> {
  await delay()
  await deleteQuickNoteById(id)
}
