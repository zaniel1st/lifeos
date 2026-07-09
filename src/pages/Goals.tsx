import { useMemo, useState } from 'react'
import { Plus, Trash2, Target, Archive, ArchiveRestore } from 'lucide-react'
import { useGoalStore } from '@/store/goalStore'
import Modal from '@/components/common/Modal'
import EmptyState from '@/components/common/EmptyState'
import { formatDate, daysUntil } from '@/utils/date'

function GoalForm({ onSubmit, onCancel }: { onSubmit: (input: { title: string; description: string; category: string; deadline: string | null }) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Personal')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give the goal a title.')
      return
    }
    onSubmit({ title, description, category, deadline: deadline || null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setError('') }} placeholder="Goal title" className="w-full px-3 py-2 rounded-lg input-base text-sm" />
        {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why does this matter?" rows={3} className="w-full px-3 py-2 rounded-lg input-base text-sm resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="px-3 py-2 rounded-lg input-base text-sm" />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="px-3 py-2 rounded-lg input-base text-sm" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>Add goal</button>
      </div>
    </form>
  )
}

export default function Goals() {
  const { goals, addGoal, deleteGoal, addMilestone, toggleMilestone, removeMilestone, setProgress, toggleArchived } = useGoalStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [milestoneDrafts, setMilestoneDrafts] = useState<Record<string, string>>({})

  const visible = useMemo(() => goals.filter((g) => g.archived === showArchived), [goals, showArchived])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl">Goals</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived((s) => !s)}
            className="px-3 py-2 rounded-lg text-xs"
            style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}
          >
            {showArchived ? 'Show active' : 'Show archived'}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}
          >
            <Plus size={16} /> New goal
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Target} title={showArchived ? 'No archived goals' : 'No active goals'} description={showArchived ? 'Archived goals will show up here.' : 'Set a long-term objective and break it into milestones.'} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {visible.map((goal) => {
            const remaining = daysUntil(goal.deadline)
            return (
              <div key={goal.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{goal.title}</p>
                    {goal.description && (
                      <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}>{goal.category}</span>
                      {goal.deadline && (
                        <span className="text-[11px]" style={{ color: 'rgb(var(--text-muted))' }}>
                          {formatDate(goal.deadline)}{remaining !== null && remaining >= 0 ? ` · ${remaining}d left` : remaining !== null ? ' · overdue' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleArchived(goal.id)} aria-label={goal.archived ? 'Restore goal' : 'Archive goal'} className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                      {goal.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} aria-label="Delete goal" className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${goal.progress}%`, backgroundColor: 'rgb(var(--accent))' }} />
                  </div>
                  {goal.milestones.length === 0 && (
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={goal.progress}
                      onChange={(e) => setProgress(goal.id, Number(e.target.value))}
                      className="w-full mt-2"
                    />
                  )}
                </div>

                {goal.milestones.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {goal.milestones.map((m) => (
                      <li key={m.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={m.completed} onChange={() => toggleMilestone(goal.id, m.id)} className="accent-current" />
                        <span className={m.completed ? 'line-through opacity-50 flex-1' : 'flex-1'}>{m.title}</span>
                        <button onClick={() => removeMilestone(goal.id, m.id)} aria-label="Remove milestone" className="text-xs opacity-60 hover:opacity-100">
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form
                  className="flex items-center gap-2 mt-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const val = milestoneDrafts[goal.id]?.trim()
                    if (!val) return
                    addMilestone(goal.id, val)
                    setMilestoneDrafts((d) => ({ ...d, [goal.id]: '' }))
                  }}
                >
                  <input
                    value={milestoneDrafts[goal.id] ?? ''}
                    onChange={(e) => setMilestoneDrafts((d) => ({ ...d, [goal.id]: e.target.value }))}
                    placeholder="Add milestone…"
                    className="flex-1 px-2.5 py-1.5 rounded-lg input-base text-xs"
                  />
                  <button type="submit" className="px-2.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
                    Add
                  </button>
                </form>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New goal">
        <GoalForm onCancel={() => setModalOpen(false)} onSubmit={(input) => { addGoal(input); setModalOpen(false) }} />
      </Modal>
    </div>
  )
}
