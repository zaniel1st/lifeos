import { Routes, Route } from 'react-router-dom'
import Shell from '@/components/layout/Shell'
import Dashboard from '@/pages/Dashboard'
import Tasks from '@/pages/Tasks'
import Habits from '@/pages/Habits'
import Journal from '@/pages/Journal'
import Goals from '@/pages/Goals'
import Finance from '@/pages/Finance'
import Learning from '@/pages/Learning'
import Growth from '@/pages/Growth'
import Settings from '@/pages/Settings'
import { useThemeStore } from '@/store/themeStore'

export default function App() {
  // Touch the store so the theme class stays reactive if changed elsewhere.
  useThemeStore((s) => s.resolved)

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Shell>
  )
}
