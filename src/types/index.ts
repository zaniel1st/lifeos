// Central data model definitions for every LifeOS module.

export type TaskCategory = 'University' | 'Programming' | 'Health' | 'Personal' | 'Finance' | 'Other'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  deadline: string | null // ISO date
  completed: boolean
  createdAt: string
}

export type HabitFrequency = 'daily' | 'weekly'

export interface Habit {
  id: string
  name: string
  description: string
  category: string
  frequency: HabitFrequency
  completedDates: string[] // ISO date strings, no time
  streak: number
  bestStreak: number
  createdAt: string
}

export type Mood = 'Happy' | 'Calm' | 'Focused' | 'Sad' | 'Angry' | 'Tired' | 'Excited'

export interface JournalEntry {
  id: string
  title: string
  content: string
  mood: Mood
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
}

export interface Goal {
  id: string
  title: string
  description: string
  category: string
  deadline: string | null
  progress: number // 0-100, derived from milestones when present
  milestones: Milestone[]
  archived: boolean
  createdAt: string
}

export type TransactionType = 'Income' | 'Expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
}

export interface LearningItem {
  id: string
  title: string
  category: string
  progress: number // 0-100
  description: string
  completedLessons: number
  totalLessons: number
  notes: string
  createdAt: string
}

export type GrowthAxis =
  | 'discipline'
  | 'knowledge'
  | 'fitness'
  | 'codingVelocity'
  | 'communication'
  | 'creativity'
  | 'health'

export type GrowthStats = Record<GrowthAxis, number> // 0-100 each

export interface AppSettings {
  displayName: string
  themeOverride: 'system' | 'light' | 'dark'
  visibleDashboardCards: string[]
}
