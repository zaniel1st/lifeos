import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Plus, Trash2, Wallet } from 'lucide-react'
import { useFinanceStore, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/store/financeStore'
import type { TransactionType } from '@/types'
import Modal from '@/components/common/Modal'
import EmptyState from '@/components/common/EmptyState'
import { formatDate, todayISO } from '@/utils/date'

const COLORS = ['#6a63f0', '#8385fb', '#a5aaff', '#5a4bd6', '#4a3cb0', '#c6ccff', '#3d3390']

function TxForm({ onSubmit, onCancel }: { onSubmit: (input: { type: TransactionType; amount: number; category: string; description: string; date: string }) => void; onCancel: () => void }) {
  const [type, setType] = useState<TransactionType>('Expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  const categories = type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    onSubmit({ type, amount: parsed, category, description, date })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
        {(['Expense', 'Income'] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t)
              setCategory(t === 'Expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
            }}
            className="flex-1 py-1.5 rounded-md text-sm font-medium"
            style={{ backgroundColor: type === t ? 'rgb(var(--surface))' : 'transparent' }}
          >
            {t}
          </button>
        ))}
      </div>
      <div>
        <input
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          placeholder="Amount"
          inputMode="decimal"
          autoFocus
          className="w-full px-3 py-2 rounded-lg input-base text-sm"
        />
        {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-lg input-base text-sm">
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded-lg input-base text-sm" />
      </div>
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg input-base text-sm" />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>Add transaction</button>
      </div>
    </form>
  )
}

export default function Finance() {
  const { transactions, addTransaction, deleteTransaction } = useFinanceStore()
  const [modalOpen, setModalOpen] = useState(false)

  const { balance, income, expense, monthlyAvg } = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)
    const months = new Set(transactions.map((t) => t.date.slice(0, 7))).size || 1
    return { balance: income - expense, income, expense, monthlyAvg: expense / months }
  }, [transactions])

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of transactions.filter((t) => t.type === 'Expense')) {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const balanceLine = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
    let running = 0
    return sorted.map((t) => {
      running += t.type === 'Income' ? t.amount : -t.amount
      return { date: formatDate(t.date), balance: running }
    })
  }, [transactions])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl">Finance</h2>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}>
          <Plus size={16} /> New transaction
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Net balance', value: balance },
          { label: 'Total income', value: income },
          { label: 'Total expenses', value: expense },
          { label: 'Avg monthly spend', value: monthlyAvg },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{s.label}</p>
            <p className="font-display font-semibold text-lg">${s.value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {transactions.length === 0 ? (
        <EmptyState icon={Wallet} title="No transactions yet" description="Log an income or expense to see your breakdown." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-display font-semibold text-sm mb-3">Spending by category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4">
              <h3 className="font-display font-semibold text-sm mb-3">Running balance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={balanceLine} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgb(var(--text-muted))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 10, fontSize: 12 }} />
                  <Line type="monotone" dataKey="balance" stroke="rgb(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            {[...transactions].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
              <div key={t.id} className="card p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t.description || t.category}</p>
                  <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{t.category} · {formatDate(t.date)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium" style={{ color: t.type === 'Income' ? '#22c55e' : 'rgb(var(--text-primary))' }}>
                    {t.type === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>
                  <button onClick={() => deleteTransaction(t.id)} aria-label="Delete transaction" className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New transaction">
        <TxForm onCancel={() => setModalOpen(false)} onSubmit={(input) => { addTransaction(input); setModalOpen(false) }} />
      </Modal>
    </div>
  )
}
