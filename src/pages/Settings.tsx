import { useRef, useState } from 'react'
import { Download, Upload, Sun, Moon, Monitor, CheckCircle2, AlertCircle } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useThemeStore } from '@/store/themeStore'
import { exportAllData, importAllData } from '@/services/storage'

const DASHBOARD_CARDS = [
  { id: 'tasks', label: 'Task completion' },
  { id: 'habits', label: 'Habit streaks' },
  { id: 'finance', label: 'Monthly budget' },
  { id: 'trend', label: 'Productivity trend chart' },
]

export default function Settings() {
  const { settings, updateSettings, toggleCard } = useSettingsStore()
  const { override, setOverride } = useThemeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; message: string } | null>(null)

  function handleExport() {
    const blob = new Blob([exportAllData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus({ type: 'ok', message: 'Backup downloaded.' })
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importAllData(String(reader.result))
      if (result.ok) {
        setStatus({ type: 'ok', message: 'Data restored. Reload the app to see it everywhere.' })
      } else {
        setStatus({ type: 'error', message: result.error })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-display font-bold text-xl">Settings</h2>

      <section className="card p-5 space-y-4">
        <h3 className="font-display font-semibold text-sm">Profile</h3>
        <div>
          <label className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>Display name</label>
          <input
            value={settings.displayName}
            onChange={(e) => updateSettings({ displayName: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-lg input-base text-sm"
          />
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h3 className="font-display font-semibold text-sm">Appearance</h3>
        <div className="flex gap-2 p-1 rounded-lg w-fit" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
          {[
            { key: 'system' as const, icon: Monitor, label: 'System' },
            { key: 'light' as const, icon: Sun, label: 'Light' },
            { key: 'dark' as const, icon: Moon, label: 'Dark' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setOverride(opt.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ backgroundColor: override === opt.key ? 'rgb(var(--surface))' : 'transparent' }}
            >
              <opt.icon size={14} /> {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h3 className="font-display font-semibold text-sm">Dashboard cards</h3>
        <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>Choose what shows on your dashboard.</p>
        <div className="space-y-2">
          {DASHBOARD_CARDS.map((card) => (
            <label key={card.id} className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={settings.visibleDashboardCards.includes(card.id)}
                onChange={() => toggleCard(card.id)}
                className="accent-current"
              />
              {card.label}
            </label>
          ))}
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h3 className="font-display font-semibold text-sm">Data</h3>
        <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
          Export everything to a JSON file you can keep safe, or restore from a previous backup.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>
            <Download size={15} /> Export data
          </button>
          <button onClick={handleImportClick} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
            <Upload size={15} /> Import backup
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFile} className="hidden" />
        </div>
        {status && (
          <p className="flex items-center gap-1.5 text-xs" style={{ color: status.type === 'ok' ? '#22c55e' : '#ef4444' }}>
            {status.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {status.message}
          </p>
        )}
      </section>
    </div>
  )
}
