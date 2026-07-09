import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NAV_ENTRIES } from '@/router'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r h-screen sticky top-0 transition-[width] duration-200 ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
      style={{ borderColor: 'rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}
    >
      <div className="flex items-center gap-2 px-4 h-16 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0"
          style={{ backgroundColor: 'rgb(var(--accent))', color: 'rgb(var(--accent-contrast))' }}
        >
          L
        </div>
        {!collapsed && <span className="font-display font-semibold text-sm tracking-tight">LifeOS</span>}
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ENTRIES.map((entry) => (
          <NavLink
            key={entry.path}
            to={entry.path}
            end={entry.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'font-medium' : ''
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'rgb(var(--accent) / 0.12)' : 'transparent',
              color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-secondary))',
            })}
            title={collapsed ? entry.label : undefined}
          >
            <entry.icon size={18} className="shrink-0" />
            {!collapsed && <span>{entry.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-3 text-xs border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        style={{ borderColor: 'rgb(var(--border))', color: 'rgb(var(--text-muted))' }}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
