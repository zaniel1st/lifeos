import { create } from 'zustand'
import { storage, onExternalStorageChange } from '@/services/storage'
import { makeId } from '@/utils/id'
import type { JournalEntry, Mood } from '@/types'

const KEY = 'journal'

interface JournalState {
  entries: JournalEntry[]
  addEntry: (input: { title: string; content: string; mood: Mood; tags: string[] }) => void
  updateEntry: (id: string, patch: Partial<JournalEntry>) => void
  deleteEntry: (id: string) => void
  hydrate: () => void
}

function persist(entries: JournalEntry[]) {
  storage.set(KEY, entries)
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: storage.get<JournalEntry[]>(KEY) ?? [],

  addEntry: (input) => {
    const now = new Date().toISOString()
    const entry: JournalEntry = {
      id: makeId(),
      title: input.title.trim() || 'Untitled entry',
      content: input.content,
      mood: input.mood,
      tags: input.tags,
      createdAt: now,
      updatedAt: now,
    }
    const entries = [entry, ...get().entries]
    set({ entries })
    persist(entries)
  },

  updateEntry: (id, patch) => {
    const entries = get().entries.map((e) =>
      e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e
    )
    set({ entries })
    persist(entries)
  },

  deleteEntry: (id) => {
    const entries = get().entries.filter((e) => e.id !== id)
    set({ entries })
    persist(entries)
  },

  hydrate: () => set({ entries: storage.get<JournalEntry[]>(KEY) ?? [] }),
}))

onExternalStorageChange((key) => {
  if (key === KEY) useJournalStore.getState().hydrate()
})

export const MOODS: Mood[] = ['Happy', 'Calm', 'Focused', 'Sad', 'Angry', 'Tired', 'Excited']
