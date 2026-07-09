import { create } from 'zustand'
import { storage, onExternalStorageChange } from '@/services/storage'
import { makeId } from '@/utils/id'
import type { Goal, Milestone } from '@/types'

const KEY = 'goals'

function computeProgress(goal: Pick<Goal, 'milestones' | 'progress'>): number {
  if (goal.milestones.length === 0) return goal.progress
  const done = goal.milestones.filter((m) => m.completed).length
  return Math.round((done / goal.milestones.length) * 100)
}

interface GoalState {
  goals: Goal[]
  addGoal: (input: { title: string; description: string; category: string; deadline: string | null }) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addMilestone: (goalId: string, title: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
  removeMilestone: (goalId: string, milestoneId: string) => void
  setProgress: (goalId: string, progress: number) => void
  toggleArchived: (goalId: string) => void
  hydrate: () => void
}

function persist(goals: Goal[]) {
  storage.set(KEY, goals)
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: storage.get<Goal[]>(KEY) ?? [],

  addGoal: (input) => {
    const goal: Goal = {
      id: makeId(),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      deadline: input.deadline,
      progress: 0,
      milestones: [],
      archived: false,
      createdAt: new Date().toISOString(),
    }
    const goals = [goal, ...get().goals]
    set({ goals })
    persist(goals)
  },

  updateGoal: (id, patch) => {
    const goals = get().goals.map((g) => (g.id === id ? { ...g, ...patch } : g))
    set({ goals })
    persist(goals)
  },

  deleteGoal: (id) => {
    const goals = get().goals.filter((g) => g.id !== id)
    set({ goals })
    persist(goals)
  },

  addMilestone: (goalId, title) => {
    const goals = get().goals.map((g) => {
      if (g.id !== goalId) return g
      const milestone: Milestone = { id: makeId(), title: title.trim(), completed: false }
      const milestones = [...g.milestones, milestone]
      return { ...g, milestones, progress: computeProgress({ milestones, progress: g.progress }) }
    })
    set({ goals })
    persist(goals)
  },

  toggleMilestone: (goalId, milestoneId) => {
    const goals = get().goals.map((g) => {
      if (g.id !== goalId) return g
      const milestones = g.milestones.map((m) => (m.id === milestoneId ? { ...m, completed: !m.completed } : m))
      return { ...g, milestones, progress: computeProgress({ milestones, progress: g.progress }) }
    })
    set({ goals })
    persist(goals)
  },

  removeMilestone: (goalId, milestoneId) => {
    const goals = get().goals.map((g) => {
      if (g.id !== goalId) return g
      const milestones = g.milestones.filter((m) => m.id !== milestoneId)
      return { ...g, milestones, progress: computeProgress({ milestones, progress: g.progress }) }
    })
    set({ goals })
    persist(goals)
  },

  setProgress: (goalId, progress) => {
    const goals = get().goals.map((g) => (g.id === goalId ? { ...g, progress: Math.max(0, Math.min(100, progress)) } : g))
    set({ goals })
    persist(goals)
  },

  toggleArchived: (goalId) => {
    const goals = get().goals.map((g) => (g.id === goalId ? { ...g, archived: !g.archived } : g))
    set({ goals })
    persist(goals)
  },

  hydrate: () => set({ goals: storage.get<Goal[]>(KEY) ?? [] }),
}))

onExternalStorageChange((key) => {
  if (key === KEY) useGoalStore.getState().hydrate()
})
