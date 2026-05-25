import { useCallback, useEffect, useState } from 'react'
import {
  createQuickNote,
  deleteQuickNote,
  getQuickNotes,
  updateQuickNote,
} from '@/services/quickNotes'
import type { QuickNoteItem } from '@/types'

export function useQuickNotes() {
  const [items, setItems] = useState<QuickNoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await getQuickNotes())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load quick notes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true)
    setError(null)
    try {
      return await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed')
      return undefined
    } finally {
      setBusy(false)
    }
  }, [])

  const add = useCallback(
    async (text: string) => {
      const result = await run(() => createQuickNote(text))
      if (result) await load()
      return result
    },
    [load, run],
  )

  const toggle = useCallback(
    async (id: string, completed: boolean) => {
      const result = await run(() => updateQuickNote(id, { completed }))
      if (result) await load()
      return result
    },
    [load, run],
  )

  const remove = useCallback(
    async (id: string) => {
      await run(() => deleteQuickNote(id))
      await load()
    },
    [load, run],
  )

  return {
    items,
    loading,
    busy,
    error,
    add,
    toggle,
    remove,
    refresh: load,
  }
}
