import { create } from 'zustand'
import { storage } from '@/services/storage'

type ThemeOverride = 'system' | 'light' | 'dark'

interface ThemeState {
  override: ThemeOverride
  resolved: 'light' | 'dark'
  setOverride: (t: ThemeOverride) => void
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolve(override: ThemeOverride): 'light' | 'dark' {
  if (override === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return override
}

function applyToDocument(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

const initialOverride = storage.get<ThemeOverride>('theme-override') ?? 'system'
const initialResolved = resolve(initialOverride)
if (typeof document !== 'undefined') applyToDocument(initialResolved)

export const useThemeStore = create<ThemeState>((set) => ({
  override: initialOverride,
  resolved: initialResolved,
  setOverride: (override) => {
    const resolved = resolve(override)
    storage.set('theme-override', override)
    applyToDocument(resolved)
    set({ override, resolved })
  },
}))

// Keep in sync if the OS theme changes while override === 'system'.
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { override, setOverride } = useThemeStore.getState()
    if (override === 'system') setOverride('system')
  })
}
