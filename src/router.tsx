import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  BookOpen,
  Target,
  Wallet,
  GraduationCap,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react'

export interface NavEntry {
  path: string
  label: string
  icon: typeof LayoutDashboard
}

export const NAV_ENTRIES: NavEntry[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/habits', label: 'Habits', icon: Flame },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/finance', label: 'Finance', icon: Wallet },
  { path: '/learning', label: 'Learning', icon: GraduationCap },
  { path: '/growth', label: 'Growth', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]
