import { useState } from 'react'
import { Plus, Trash2, Flame, Check } from 'lucide-react'
import { useHabitStore } from '@/store/habitStore'
import type { Habit, HabitFrequency } from '@/types'
import Modal from '@/components/common/Modal'
import EmptyState from '@/components/common/EmptyState'
import { todayISO } from '@/utils/date'

function HabitForm({ onSubmit, onCancel }: { onSubmit: (input: { name: string; description: string; category: string; frequency: HabitFrequency }) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Personal')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Give the habit a name.')
      return
    }
    onSubmit({ name, description, category, frequency })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          placeholder="Habit name, e.g. Read 20 minutes"
          className="w-full px-3 py-2 rounded-lg input-base text-sm"
        />
        {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Why this habit matters (optional)"
        rows={2}
        className="w-full px-3 py-2 rounded-lg input-base text-sm resize-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="px-3 py-2 rounded-lg input-base text-sm" />
        <select value={frequency} onChange={(e) => setFrequency(e.target.value as HabitFrequency)} className="px-3 py-2 rounded-lg input-base text-sm">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>
          Add habit
        </button>
      </div>
    </form>
  )
}

function LookbackGrid({ habit }: { habit: Habit }) {
  const days: { iso: string; done: boolean }[] = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    days.push({ iso, done: habit.completedDates.includes(iso) })
  }
  return (
    <div className="grid grid-cols-14 gap-1 mt-3" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
      {days.map((d) => (
        <div
          key={d.iso}
          title={d.iso}
          className="aspect-square rounded-sm"
          style={{ backgroundColor: d.done ? 'rgb(var(--accent))' : 'rgb(var(--surface-2))' }}
        />
      ))}
    </div>
  )
}

function HabitCard({ habit, onToggle, onDelete }: { habit: Habit; onToggle: () => void; onDelete: () => void }) {
  const doneToday = habit.completedDates.includes(todayISO())
  const last30 = habit.completedDates.filter((d) => {
    const diff = (Date.now() - new Date(d).getTime()) / 86400000
    return diff <= 30
  }).length
  const pace = Math.round((last30 / 30) * 100)

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{habit.name}</p>
          {habit.description && (
            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>
              {habit.description}
            </p>
          )}
          <span className="text-[11px] px-2 py-0.5 rounded-full inline-block mt-2" style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}>
            {habit.category} · {habit.frequency}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggle}
            aria-pressed={doneToday}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: doneToday ? 'rgb(var(--accent))' : 'rgb(var(--surface-2))',
              color: doneToday ? 'rgb(var(--accent-contrast))' : 'rgb(var(--text-primary))',
            }}
          >
            <Check size={13} /> {doneToday ? 'Done today' : 'Log today'}
          </button>
          <button onClick={onDelete} aria-label="Delete habit" className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
        <span className="flex items-center gap-1">
          <Flame size={13} style={{ color: 'rgb(var(--accent))' }} /> {habit.streak}-day streak
        </span>
        <span>Best: {habit.bestStreak}</span>
        <span>Last 30 days: {pace}%</span>
      </div>

      <LookbackGrid habit={habit} />
    </div>
  )
}

export default function Habits() {
  const { habits, addHabit, deleteHabit, toggleToday } = useHabitStore()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl">Habits</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}
        >
          <Plus size={16} /> New habit
        </button>
      </div>

      {habits.length === 0 ? (
        <EmptyState icon={Flame} title="No habits yet" description="Start a habit loop to build a streak worth keeping." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onToggle={() => toggleToday(h.id)} onDelete={() => deleteHabit(h.id)} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New habit">
        <HabitForm
          onCancel={() => setModalOpen(false)}
          onSubmit={(input) => {
            addHabit(input)
            setModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
