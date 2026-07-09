import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, CheckSquare, Search } from 'lucide-react'
import { useTaskStore, TASK_CATEGORIES, TASK_PRIORITIES } from '@/store/taskStore'
import type { Task, TaskCategory, TaskPriority } from '@/types'
import Modal from '@/components/common/Modal'
import EmptyState from '@/components/common/EmptyState'
import { fuzzyFilter } from '@/utils/fuzzySearch'
import { formatDate, todayISO } from '@/utils/date'

type ViewFilter = 'All' | 'Today' | 'Completed' | 'Priority'

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  Low: '148 163 184',
  Medium: '96 165 250',
  High: '251 146 60',
  Urgent: '239 68 68',
}

function TaskForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Task>
  onSubmit: (input: { title: string; description: string; category: TaskCategory; priority: TaskPriority; deadline: string | null }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState<TaskCategory>(initial?.category ?? 'Personal')
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'Medium')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give the task a title.')
      return
    }
    onSubmit({ title, description, category, priority, deadline: deadline || null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setError('')
          }}
          placeholder="Task title"
          className="w-full px-3 py-2 rounded-lg input-base text-sm"
        />
        {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={3}
        className="w-full px-3 py-2 rounded-lg input-base text-sm resize-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)} className="px-3 py-2 rounded-lg input-base text-sm">
          {TASK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="px-3 py-2 rounded-lg input-base text-sm">
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <input type="date" value={deadline ?? ''} onChange={(e) => setDeadline(e.target.value)} className="w-full px-3 py-2 rounded-lg input-base text-sm" />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}
        >
          {initial?.id ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  )
}

function TaskCard({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <button
        onClick={onToggle}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        className="mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors"
        style={{
          borderColor: task.completed ? 'rgb(var(--accent))' : 'rgb(var(--border))',
          backgroundColor: task.completed ? 'rgb(var(--accent))' : 'transparent',
        }}
      >
        {task.completed && <CheckSquare size={12} color="rgb(var(--accent-contrast))" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
        {task.description && (
          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgb(var(--text-secondary))' }}>
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-secondary))' }}>
            {task.category}
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `rgb(${PRIORITY_COLOR[task.priority]} / 0.15)`, color: `rgb(${PRIORITY_COLOR[task.priority]})` }}
          >
            {task.priority}
          </span>
          {task.deadline && (
            <span className="text-[11px]" style={{ color: 'rgb(var(--text-muted))' }}>
              {formatDate(task.deadline)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} aria-label="Edit task" className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} aria-label="Delete task" className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTaskStore()
  const [view, setView] = useState<ViewFilter>('All')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const filtered = useMemo(() => {
    let list = tasks
    if (view === 'Today') list = list.filter((t) => t.deadline?.slice(0, 10) === todayISO())
    if (view === 'Completed') list = list.filter((t) => t.completed)
    if (view === 'Priority') list = [...list].sort((a, b) => TASK_PRIORITIES.indexOf(b.priority) - TASK_PRIORITIES.indexOf(a.priority))
    return fuzzyFilter(query, list, (t) => `${t.title} ${t.description} ${t.category}`)
  }, [tasks, view, query])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setModalOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl">Tasks</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}
        >
          <Plus size={16} /> New task
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-lg" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
          {(['All', 'Today', 'Completed', 'Priority'] as ViewFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: view === v ? 'rgb(var(--surface))' : 'transparent',
                color: view === v ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))',
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg input-base flex-1 min-w-[160px]">
          <Search size={14} style={{ color: 'rgb(var(--text-muted))' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={tasks.length === 0 ? 'No tasks yet' : 'No matches'}
          description={tasks.length === 0 ? 'Create your first task to get started.' : 'Try a different filter or search term.'}
          action={
            tasks.length === 0 && (
              <button onClick={openCreate} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>
                Add a task
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleComplete(task.id)}
              onEdit={() => openEdit(task)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit task' : 'New task'}>
        <TaskForm
          initial={editing ?? undefined}
          onCancel={() => setModalOpen(false)}
          onSubmit={(input) => {
            if (editing) updateTask(editing.id, input)
            else addTask(input)
            setModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
