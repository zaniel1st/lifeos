import { create } from 'zustand'
import { storage, onExternalStorageChange } from '@/services/storage'
import type { GrowthAxis, GrowthStats } from '@/types'

const KEY = 'growth'

const DEFAULT_STATS: GrowthStats = {
  discipline: 50,
  knowledge: 50,
  fitness: 50,
  codingVelocity: 50,
  communication: 50,
  creativity: 50,
  health: 50,
}

interface GrowthState {
  stats: GrowthStats
  setStat: (axis: GrowthAxis, value: number) => void
  hydrate: () => void
}

function persist(stats: GrowthStats) {
  storage.set(KEY, stats)
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
  stats: storage.get<GrowthStats>(KEY) ?? DEFAULT_STATS,

  setStat: (axis, value) => {
    const stats = { ...get().stats, [axis]: Math.max(0, Math.min(100, value)) }
    set({ stats })
    persist(stats)
  },

  hydrate: () => set({ stats: storage.get<GrowthStats>(KEY) ?? DEFAULT_STATS }),
}))

onExternalStorageChange((key) => {
  if (key === KEY) useGrowthStore.getState().hydrate()
})

export function computeLevel(stats: GrowthStats): { level: number; totalXp: number; nextLevelXp: number } {
  const totalXp = Object.values(stats).reduce((sum, v) => sum + v, 0)
  const level = Math.floor(totalXp / 100) + 1
  const nextLevelXp = level * 100
  return { level, totalXp, nextLevelXp }
}

export const GROWTH_AXIS_LABELS: Record<GrowthAxis, string> = {
  discipline: 'Discipline',
  knowledge: 'Knowledge',
  fitness: 'Fitness',
  codingVelocity: 'Coding Velocity',
  communication: 'Communication',
  creativity: 'Creativity',
  health: 'Health',
}
