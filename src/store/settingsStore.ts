import { create } from 'zustand'
import { storage } from '@/services/storage'
import type { AppSettings } from '@/types'

const KEY = 'settings'

const DEFAULTS: AppSettings = {
  displayName: 'there',
  themeOverride: 'system',
  visibleDashboardCards: ['tasks', 'habits', 'finance', 'trend'],
}

interface SettingsState {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => void
  toggleCard: (card: string) => void
}

function persist(settings: AppSettings) {
  storage.set(KEY, settings)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: storage.get<AppSettings>(KEY) ?? DEFAULTS,

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch }
    set({ settings })
    persist(settings)
  },

  toggleCard: (card) => {
    const current = get().settings.visibleDashboardCards
    const visibleDashboardCards = current.includes(card) ? current.filter((c) => c !== card) : [...current, card]
    const settings = { ...get().settings, visibleDashboardCards }
    set({ settings })
    persist(settings)
  },
}))
