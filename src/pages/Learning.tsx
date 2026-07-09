import { useMemo, useState } from 'react'
import { Plus, Trash2, GraduationCap, PlusCircle } from 'lucide-react'
import { useLearningStore } from '@/store/learningStore'
import Modal from '@/components/common/Modal'
import EmptyState from '@/components/common/EmptyState'

function ItemForm({ onSubmit, onCancel }: { onSubmit: (input: { title: string; category: string; description: string; totalLessons: number }) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Course')
  const [description, setDescription] = useState('')
  const [totalLessons, setTotalLessons] = useState('10')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give it a title.')
      return
    }
    onSubmit({ title, category, description, totalLessons: Math.max(1, Number(totalLessons) || 1) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setError('') }} placeholder="Title, e.g. Advanced TypeScript" className="w-full px-3 py-2 rounded-lg input-base text-sm" />
        {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg input-base text-sm resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (Course, Book, Skill…)" className="px-3 py-2 rounded-lg input-base text-sm" />
        <input value={totalLessons} onChange={(e) => setTotalLessons(e.target.value)} inputMode="numeric" placeholder="Total lessons" className="px-3 py-2 rounded-lg input-base text-sm" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>Add item</button>
      </div>
    </form>
  )
}

export default function Learning() {
  const { items, addItem, updateItem, deleteItem, incrementLesson } = useLearningStore()
  const [modalOpen, setModalOpen] = useState(false)

  const stats = useMemo(() => {
    const active = items.filter((i) => i.progress < 100).length
    const completed = items.filter((i) => i.progress >= 100).length
    return { active, completed, total: items.length }
  }, [items])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl">Learning</h2>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>
          <Plus size={16} /> New item
        </button>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4">
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Active</p>
            <p className="font-display font-semibold text-lg">{stats.active}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Completed</p>
            <p className="font-display font-semibold text-lg">{stats.completed}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Total tracked</p>
            <p className="font-display font-semibold text-lg">{stats.total}</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Nothing being learned yet" description="Add a course, book, or skill you're working through." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>{item.description}</p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full inline-block mt-2" style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}>{item.category}</span>
                </div>
                <button onClick={() => deleteItem(item.id)} aria-label="Delete item" className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                  <span>{item.completedLessons} / {item.totalLessons} lessons</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.progress}%`, backgroundColor: 'rgb(var(--accent))' }} />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => incrementLesson(item.id)}
                  disabled={item.completedLessons >= item.totalLessons}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
                  style={{ backgroundColor: 'rgb(var(--surface-2))' }}
                >
                  <PlusCircle size={13} /> Log lesson
                </button>
              </div>

              <textarea
                value={item.notes}
                onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                placeholder="Notes…"
                rows={2}
                className="w-full mt-3 px-3 py-2 rounded-lg input-base text-xs resize-none"
              />
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New learning item">
        <ItemForm onCancel={() => setModalOpen(false)} onSubmit={(input) => { addItem(input); setModalOpen(false) }} />
      </Modal>
    </div>
  )
}
