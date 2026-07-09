import { create } from 'zustand'
import { storage, onExternalStorageChange } from '@/services/storage'
import { makeId } from '@/utils/id'
import type { Task, TaskCategory, TaskPriority } from '@/types'

const KEY = 'tasks'

interface TaskState {
  tasks: Task[]
  addTask: (input: { title: string; description: string; category: TaskCategory; priority: TaskPriority; deadline: string | null }) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleComplete: (id: string) => void
  hydrate: () => void
}

function persist(tasks: Task[]) {
  storage.set(KEY, tasks)
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: storage.get<Task[]>(KEY) ?? [],

  addTask: (input) => {
    const task: Task = {
      id: makeId(),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      priority: input.priority,
      deadline: input.deadline,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    const tasks = [task, ...get().tasks]
    set({ tasks })
    persist(tasks)
  },

  updateTask: (id, patch) => {
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
    set({ tasks })
    persist(tasks)
  },

  deleteTask: (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id)
    set({ tasks })
    persist(tasks)
  },

  toggleComplete: (id) => {
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    set({ tasks })
    persist(tasks)
  },

  hydrate: () => set({ tasks: storage.get<Task[]>(KEY) ?? [] }),
}))

onExternalStorageChange((key) => {
  if (key === KEY) useTaskStore.getState().hydrate()
})

export const TASK_CATEGORIES: TaskCategory[] = ['University', 'Programming', 'Health', 'Personal', 'Finance', 'Other']
export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent']
