import { Search, Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { useLocation } from 'react-router-dom'
import { NAV_ENTRIES } from '@/router'

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const

export default function Header() {
  const { override, setOverride } = useThemeStore()
  const location = useLocation()
  const current = NAV_ENTRIES.find((n) => (n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)))

  function cycleTheme() {
    const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark']
    const next = order[(order.indexOf(override) + 1) % order.length]
    setOverride(next)
  }

  const ThemeIcon = THEME_ICONS[override]

  return (
    <header
      className="h-16 shrink-0 border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 backdrop-blur"
      style={{ borderColor: 'rgb(var(--border))', backgroundColor: 'rgb(var(--surface) / 0.85)' }}
    >
      <h1 className="font-display font-semibold text-base">{current?.label ?? 'LifeOS'}</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs input-base"
          style={{ color: 'rgb(var(--text-muted))' }}
        >
          <Search size={14} />
          <span>Search…</span>
          <kbd className="ml-2 px-1 rounded border text-[10px]" style={{ borderColor: 'rgb(var(--border))' }}>
            ⌘K
          </kbd>
        </button>
        <button
          onClick={cycleTheme}
          aria-label={`Theme: ${override}`}
          title={`Theme: ${override}`}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ThemeIcon size={17} />
        </button>
      </div>
    </header>
  )
}
