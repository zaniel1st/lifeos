import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, Monitor, Plus } from 'lucide-react'
import { NAV_ENTRIES } from '@/router'
import { fuzzyFilter } from '@/utils/fuzzySearch'
import { useThemeStore } from '@/store/themeStore'
import { useTaskStore } from '@/store/taskStore'

interface Command {
  id: string
  label: string
  hint?: string
  icon: typeof Search
  run: () => void
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const setThemeOverride = useThemeStore((s) => s.setOverride)
  const addTask = useTaskStore((s) => s.addTask)

  const commands = useMemo<Command[]>(() => {
    const navCommands = NAV_ENTRIES.map((n) => ({
      id: `nav-${n.path}`,
      label: `Go to ${n.label}`,
      icon: n.icon,
      run: () => navigate(n.path),
    }))
    const utilityCommands: Command[] = [
      {
        id: 'quick-task',
        label: 'Quick add task',
        hint: 'Creates an untitled task in Tasks',
        icon: Plus,
        run: () => {
          addTask({ title: 'New task', description: '', category: 'Personal', priority: 'Medium', deadline: null })
          navigate('/tasks')
        },
      },
      { id: 'theme-light', label: 'Switch to light theme', icon: Sun, run: () => setThemeOverride('light') },
      { id: 'theme-dark', label: 'Switch to dark theme', icon: Moon, run: () => setThemeOverride('dark') },
      { id: 'theme-system', label: 'Match system theme', icon: Monitor, run: () => setThemeOverride('system') },
    ]
    return [...navCommands, ...utilityCommands]
  }, [navigate, addTask, setThemeOverride])

  const filtered = useMemo(() => fuzzyFilter(query, commands, (c) => c.label), [query, commands])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  useEffect(() => setActiveIndex(0), [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[activeIndex]
      if (cmd) {
        cmd.run()
        setOpen(false)
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative card w-full max-w-xl shadow-card overflow-hidden"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
              <Search size={18} style={{ color: 'rgb(var(--text-muted))' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, add a task, switch theme…"
                className="flex-1 bg-transparent outline-none text-sm"
                aria-label="Command search"
              />
              <kbd className="text-xs px-1.5 py-0.5 rounded border" style={{ borderColor: 'rgb(var(--border))', color: 'rgb(var(--text-muted))' }}>
                Esc
              </kbd>
            </div>
            <ul role="listbox" className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-sm text-center" style={{ color: 'rgb(var(--text-muted))' }}>
                  No matches for “{query}”
                </li>
              )}
              {filtered.map((cmd, i) => {
                const Icon = cmd.icon
                const active = i === activeIndex
                return (
                  <li key={cmd.id}>
                    <button
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => {
                        cmd.run()
                        setOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ backgroundColor: active ? 'rgb(var(--surface-2))' : 'transparent' }}
                    >
                      <Icon size={16} style={{ color: 'rgb(var(--accent))' }} />
                      <span>{cmd.label}</span>
                      {cmd.hint && (
                        <span className="ml-auto text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                          {cmd.hint}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
