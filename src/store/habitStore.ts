import { create } from 'zustand'
import { storage, onExternalStorageChange } from '@/services/storage'
import { makeId } from '@/utils/id'
import { todayISO } from '@/utils/date'
import type { Habit, HabitFrequency } from '@/types'

const KEY = 'habits'

function recomputeStreak(dates: string[]): { streak: number; bestStreak: number; prevBest: number } {
  const sorted = [...new Set(dates)].sort()
  if (sorted.length === 0) return { streak: 0, bestStreak: 0, prevBest: 0 }

  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const cur = new Date(sorted[i])
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000)
    run = diffDays === 1 ? run + 1 : 1
    if (run > best) best = run
  }

  // current streak: walk backward from today/yesterday
  const set = new Set(sorted)
  let cursor = new Date()
  let streak = 0
  // allow the streak to still count if today isn't logged yet but yesterday is
  if (!set.has(todayISO())) cursor.setDate(cursor.getDate() - 1)
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return { streak, bestStreak: best, prevBest: best }
}

interface HabitState {
  habits: Habit[]
  addHabit: (input: { name: string; description: string; category: string; frequency: HabitFrequency }) => void
  updateHabit: (id: string, patch: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleToday: (id: string) => void
  hydrate: () => void
}

function persist(habits: Habit[]) {
  storage.set(KEY, habits)
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: storage.get<Habit[]>(KEY) ?? [],

  addHabit: (input) => {
    const habit: Habit = {
      id: makeId(),
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      frequency: input.frequency,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    }
    const habits = [habit, ...get().habits]
    set({ habits })
    persist(habits)
  },

  updateHabit: (id, patch) => {
    const habits = get().habits.map((h) => (h.id === id ? { ...h, ...patch } : h))
    set({ habits })
    persist(habits)
  },

  deleteHabit: (id) => {
    const habits = get().habits.filter((h) => h.id !== id)
    set({ habits })
    persist(habits)
  },

  toggleToday: (id) => {
    const today = todayISO()
    const habits = get().habits.map((h) => {
      if (h.id !== id) return h
      const has = h.completedDates.includes(today)
      const completedDates = has ? h.completedDates.filter((d) => d !== today) : [...h.completedDates, today]
      const { streak, bestStreak } = recomputeStreak(completedDates)
      return { ...h, completedDates, streak, bestStreak: Math.max(bestStreak, h.bestStreak) }
    })
    set({ habits })
    persist(habits)
  },

  hydrate: () => set({ habits: storage.get<Habit[]>(KEY) ?? [] }),
}))

onExternalStorageChange((key) => {
  if (key === KEY) useHabitStore.getState().hydrate()
})
