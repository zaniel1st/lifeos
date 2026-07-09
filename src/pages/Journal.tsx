import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, BookOpen, Search } from 'lucide-react'
import { useJournalStore, MOODS } from '@/store/journalStore'
import type { JournalEntry, Mood } from '@/types'
import Modal from '@/components/common/Modal'
import EmptyState from '@/components/common/EmptyState'
import { fuzzyFilter } from '@/utils/fuzzySearch'
import { formatDate } from '@/utils/date'

const MOOD_EMOJI: Record<Mood, string> = {
  Happy: '😄',
  Calm: '😌',
  Focused: '🎯',
  Sad: '😔',
  Angry: '😠',
  Tired: '😴',
  Excited: '🤩',
}

function EntryForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<JournalEntry>
  onSubmit: (input: { title: string; content: string; mood: Mood; tags: string[] }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [mood, setMood] = useState<Mood>(initial?.mood ?? 'Calm')
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    onSubmit({ title, content, mood, tags })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title" autoFocus className="w-full px-3 py-2 rounded-lg input-base text-sm" />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind today?"
        rows={6}
        className="w-full px-3 py-2 rounded-lg input-base text-sm resize-none"
      />
      <div>
        <p className="text-xs mb-1.5" style={{ color: 'rgb(var(--text-secondary))' }}>
          Mood
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"
              style={{
                backgroundColor: mood === m ? 'rgb(var(--accent) / 0.15)' : 'rgb(var(--surface-2))',
                color: mood === m ? 'rgb(var(--accent))' : 'rgb(var(--text-secondary))',
              }}
            >
              {MOOD_EMOJI[m]} {m}
            </button>
          ))}
        </div>
      </div>
      <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags, comma separated" className="w-full px-3 py-2 rounded-lg input-base text-sm" />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>
          {initial?.id ? 'Save changes' : 'Save entry'}
        </button>
      </div>
    </form>
  )
}

export default function Journal() {
  const { entries, addEntry, updateEntry, deleteEntry } = useJournalStore()
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)

  const filtered = useMemo(
    () => fuzzyFilter(query, entries, (e) => `${e.title} ${e.content} ${e.tags.join(' ')}`),
    [entries, query]
  )

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of entries) counts[e.mood] = (counts[e.mood] ?? 0) + 1
    return counts
  }, [entries])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl">Journal</h2>
        <button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}
        >
          <Plus size={16} /> New entry
        </button>
      </div>

      {entries.length > 0 && (
        <div className="card p-4 flex flex-wrap gap-3">
          {Object.entries(moodCounts).map(([mood, count]) => (
            <span key={mood} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
              {MOOD_EMOJI[mood as Mood]} {mood} · {count}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg input-base max-w-sm">
        <Search size={14} style={{ color: 'rgb(var(--text-muted))' }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entries…" className="bg-transparent outline-none text-sm flex-1" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title={entries.length === 0 ? 'No entries yet' : 'No matches'} description={entries.length === 0 ? 'Write your first reflection to start your timeline.' : 'Try a different search term.'} />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((entry) => (
            <div key={entry.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <span>{MOOD_EMOJI[entry.mood]}</span> {entry.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {formatDate(entry.createdAt)}
                  </p>
                  <p className="text-sm mt-2 line-clamp-3 whitespace-pre-wrap" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.tags.map((t) => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgb(var(--surface-2))', color: 'rgb(var(--text-muted))' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditing(entry)
                      setModalOpen(true)
                    }}
                    aria-label="Edit entry"
                    className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteEntry(entry.id)} aria-label="Delete entry" className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit entry' : 'New entry'}>
        <EntryForm
          initial={editing ?? undefined}
          onCancel={() => setModalOpen(false)}
          onSubmit={(input) => {
            if (editing) updateEntry(editing.id, input)
            else addEntry(input)
            setModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
