import { migrateStoredTask } from '@/lib/segments'
import type { QuickNoteItem, Tag, Task } from '@/types'

const DB_NAME = 'timesheet-db'
const DB_VERSION = 3
export const TASKS_STORE = 'tasks'
export const TAGS_STORE = 'tags'
export const QUICK_NOTES_STORE = 'quickNotes'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error ?? new Error('Failed to open database'))
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const tx = (event.target as IDBOpenDBRequest).transaction

        if (!db.objectStoreNames.contains(TASKS_STORE)) {
          const taskStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' })
          taskStore.createIndex('date', 'date', { unique: false })
          taskStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(TAGS_STORE)) {
          db.createObjectStore(TAGS_STORE, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(QUICK_NOTES_STORE)) {
          const noteStore = db.createObjectStore(QUICK_NOTES_STORE, {
            keyPath: 'id',
          })
          noteStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        if (event.oldVersion < 3 && tx) {
          const taskStore = tx.objectStore(TASKS_STORE)
          const request = taskStore.openCursor()
          request.onsuccess = () => {
            const cursor = request.result
            if (!cursor) return
            const raw = cursor.value as Task
            cursor.update(migrateStoredTask({ ...raw, segments: raw.segments ?? [] }))
            cursor.continue()
          }
        }
      }
    })
  }

  return dbPromise
}

function withTransaction<T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  fn: (
    stores: Record<string, IDBObjectStore>,
    tx: IDBTransaction,
  ) => Promise<T> | T,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const names = Array.isArray(storeNames) ? storeNames : [storeNames]
        const tx = db.transaction(names, mode)
        const stores = Object.fromEntries(
          names.map((name) => [name, tx.objectStore(name)]),
        ) as Record<string, IDBObjectStore>

        let result: T
        let failed = false

        Promise.resolve(fn(stores, tx))
          .then((value) => {
            result = value
          })
          .catch((error) => {
            failed = true
            reject(error)
          })

        tx.oncomplete = () => {
          if (!failed) resolve(result!)
        }
        tx.onerror = () => reject(tx.error ?? new Error('Transaction failed'))
        tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'))
      }),
  )
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

export async function getAllTags(): Promise<Tag[]> {
  return withTransaction(TAGS_STORE, 'readonly', (stores) =>
    requestToPromise(stores[TAGS_STORE].getAll()),
  )
}

export async function putTag(tag: Tag): Promise<void> {
  await withTransaction(TAGS_STORE, 'readwrite', (stores) => {
    stores[TAGS_STORE].put(tag)
  })
}

export async function deleteTagById(id: string): Promise<void> {
  await withTransaction(TAGS_STORE, 'readwrite', (stores) => {
    stores[TAGS_STORE].delete(id)
  })
}

export async function getAllTasksFromDb(): Promise<Task[]> {
  const tasks = await withTransaction(TASKS_STORE, 'readonly', (stores) =>
    requestToPromise(stores[TASKS_STORE].getAll()),
  )
  return sortTasks(tasks.map(migrateStoredTask))
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const task = await withTransaction(TASKS_STORE, 'readonly', (stores) =>
    requestToPromise(stores[TASKS_STORE].get(id)),
  )
  return task ? migrateStoredTask(task) : undefined
}

export async function putTask(task: Task): Promise<void> {
  await withTransaction(TASKS_STORE, 'readwrite', (stores) => {
    stores[TASKS_STORE].put(task)
  })
}

export async function deleteTaskById(id: string): Promise<void> {
  await withTransaction(TASKS_STORE, 'readwrite', (stores) => {
    stores[TASKS_STORE].delete(id)
  })
}

export async function getTasksByDateRange(
  startDate: string,
  endDate: string,
): Promise<Task[]> {
  const tasks = await withTransaction(TASKS_STORE, 'readonly', (stores) =>
    requestToPromise(
      stores[TASKS_STORE].index('date').getAll(
        IDBKeyRange.bound(startDate, endDate),
      ),
    ),
  )
  return sortTasks(tasks.map(migrateStoredTask))
}

export async function putTasks(tasks: Task[]): Promise<void> {
  await withTransaction(TASKS_STORE, 'readwrite', (stores) => {
    const store = stores[TASKS_STORE]
    for (const task of tasks) {
      store.put(task)
    }
  })
}

export function sortQuickNotes(notes: QuickNoteItem[]): QuickNoteItem[] {
  return [...notes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export async function getAllQuickNotesFromDb(): Promise<QuickNoteItem[]> {
  const notes = await withTransaction(QUICK_NOTES_STORE, 'readonly', (stores) =>
    requestToPromise(stores[QUICK_NOTES_STORE].getAll()),
  )
  return sortQuickNotes(notes)
}

export async function putQuickNote(note: QuickNoteItem): Promise<void> {
  await withTransaction(QUICK_NOTES_STORE, 'readwrite', (stores) => {
    stores[QUICK_NOTES_STORE].put(note)
  })
}

export async function deleteQuickNoteById(id: string): Promise<void> {
  await withTransaction(QUICK_NOTES_STORE, 'readwrite', (stores) => {
    stores[QUICK_NOTES_STORE].delete(id)
  })
}
