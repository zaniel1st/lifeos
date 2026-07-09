import { create } from 'zustand'
import { storage, onExternalStorageChange } from '@/services/storage'
import { makeId } from '@/utils/id'
import type { Transaction, TransactionType } from '@/types'

const KEY = 'transactions'

interface FinanceState {
  transactions: Transaction[]
  addTransaction: (input: { type: TransactionType; amount: number; category: string; description: string; date: string }) => void
  deleteTransaction: (id: string) => void
  hydrate: () => void
}

function persist(transactions: Transaction[]) {
  storage.set(KEY, transactions)
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: storage.get<Transaction[]>(KEY) ?? [],

  addTransaction: (input) => {
    const tx: Transaction = { id: makeId(), ...input }
    const transactions = [tx, ...get().transactions]
    set({ transactions })
    persist(transactions)
  },

  deleteTransaction: (id) => {
    const transactions = get().transactions.filter((t) => t.id !== id)
    set({ transactions })
    persist(transactions)
  },

  hydrate: () => set({ transactions: storage.get<Transaction[]>(KEY) ?? [] }),
}))

onExternalStorageChange((key) => {
  if (key === KEY) useFinanceStore.getState().hydrate()
})

export const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Other']
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
