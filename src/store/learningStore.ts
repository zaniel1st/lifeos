import { create } from 'zustand'
import { storage, onExternalStorageChange } from '@/services/storage'
import { makeId } from '@/utils/id'
import type { LearningItem } from '@/types'

const KEY = 'learning'

interface LearningState {
  items: LearningItem[]
  addItem: (input: { title: string; category: string; description: string; totalLessons: number }) => void
  updateItem: (id: string, patch: Partial<LearningItem>) => void
  deleteItem: (id: string) => void
  incrementLesson: (id: string) => void
  hydrate: () => void
}

function persist(items: LearningItem[]) {
  storage.set(KEY, items)
}

function progressFor(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((Math.min(completed, total) / total) * 100)
}

export const useLearningStore = create<LearningState>((set, get) => ({
  items: storage.get<LearningItem[]>(KEY) ?? [],

  addItem: (input) => {
    const item: LearningItem = {
      id: makeId(),
      title: input.title.trim(),
      category: input.category,
      progress: 0,
      description: input.description.trim(),
      completedLessons: 0,
      totalLessons: input.totalLessons,
      notes: '',
      createdAt: new Date().toISOString(),
    }
    const items = [item, ...get().items]
    set({ items })
    persist(items)
  },

  updateItem: (id, patch) => {
    const items = get().items.map((i) => (i.id === id ? { ...i, ...patch } : i))
    set({ items })
    persist(items)
  },

  deleteItem: (id) => {
    const items = get().items.filter((i) => i.id !== id)
    set({ items })
    persist(items)
  },

  incrementLesson: (id) => {
    const items = get().items.map((i) => {
      if (i.id !== id) return i
      const completedLessons = Math.min(i.completedLessons + 1, i.totalLessons || i.completedLessons + 1)
      return { ...i, completedLessons, progress: progressFor(completedLessons, i.totalLessons) }
    })
    set({ items })
    persist(items)
  },

  hydrate: () => set({ items: storage.get<LearningItem[]>(KEY) ?? [] }),
}))

onExternalStorageChange((key) => {
  if (key === KEY) useLearningStore.getState().hydrate()
})
