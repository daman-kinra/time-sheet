export type TaskStatus = 'pending' | 'running' | 'completed'

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  description?: string
  date: string
  tagIds: string[]
  status: TaskStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export type TaskUpdate = Partial<Omit<Task, 'id'>>

export interface CreateTaskInput {
  title: string
  description?: string
  date: string
  tagIds?: string[]
  createdAt?: string
}

export interface CreateTagInput {
  name: string
  color?: string
}

export interface QuickNoteItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export type QuickNotePanelSize = 'collapsed' | 'normal' | 'expanded'
