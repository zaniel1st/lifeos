import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { CheckSquare, Flame, Wallet, TrendingUp } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { useHabitStore } from '@/store/habitStore'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { greetingForHour, todayISO } from '@/utils/date'
import EmptyState from '@/components/common/EmptyState'

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof CheckSquare; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgb(var(--accent) / 0.12)' }}
      >
        <Icon size={17} style={{ color: 'rgb(var(--accent))' }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
          {label}
        </p>
        <p className="font-display font-semibold text-lg leading-tight">{value}</p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const tasks = useTaskStore((s) => s.tasks)
  const habits = useHabitStore((s) => s.habits)
  const transactions = useFinanceStore((s) => s.transactions)
  const settings = useSettingsStore((s) => s.settings)

  const greeting = useMemo(() => greetingForHour(new Date().getHours()), [])

  const taskCompletionRate = useMemo(() => {
    if (tasks.length === 0) return 0
    return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
  }, [tasks])

  const bestStreak = useMemo(() => habits.reduce((max, h) => Math.max(max, h.streak), 0), [habits])

  const monthBudget = useMemo(() => {
    const now = new Date()
    const inMonth = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const income = inMonth.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0)
    const expense = inMonth.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense, net: income - expense }
  }, [transactions])

  const trendData = useMemo(() => {
    const days: { date: string; completed: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const completed = tasks.filter((t) => t.completed && t.createdAt.slice(0, 10) <= iso).length
      days.push({ date: label, completed })
    }
    return days
  }, [tasks])

  const cards = settings.visibleDashboardCards
  const hasAnyData = tasks.length > 0 || habits.length > 0 || transactions.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl">
          {greeting}, {settings.displayName}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Here's your command center for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.
        </p>
      </div>

      {!hasAnyData ? (
        <EmptyState
          icon={TrendingUp}
          title="Nothing tracked yet"
          description="Add a task, habit, or transaction and your dashboard will fill in automatically."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.includes('tasks') && (
              <StatCard icon={CheckSquare} label="Task completion" value={`${taskCompletionRate}%`} sub={`${tasks.filter((t) => !t.completed).length} open`} />
            )}
            {cards.includes('habits') && (
              <StatCard icon={Flame} label="Best active streak" value={`${bestStreak} day${bestStreak === 1 ? '' : 's'}`} sub={`${habits.length} habits tracked`} />
            )}
            {cards.includes('finance') && (
              <StatCard
                icon={Wallet}
                label="This month"
                value={`${monthBudget.net >= 0 ? '+' : ''}$${monthBudget.net.toFixed(0)}`}
                sub={`$${monthBudget.income.toFixed(0)} in · $${monthBudget.expense.toFixed(0)} out`}
              />
            )}
            <StatCard icon={TrendingUp} label="Tasks due today" value={String(tasks.filter((t) => !t.completed && t.deadline?.slice(0, 10) === todayISO()).length)} />
          </div>

          {cards.includes('trend') && tasks.length > 0 && (
            <div className="card p-4">
              <h3 className="font-display font-semibold text-sm mb-4">Task completion trend, last 14 days</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="completed" stroke="rgb(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
