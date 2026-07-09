import { NavLink } from 'react-router-dom'
import { NAV_ENTRIES } from '@/router'

const MOBILE_ENTRIES = NAV_ENTRIES.slice(0, 5)

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t flex items-stretch"
      style={{ borderColor: 'rgb(var(--border))', backgroundColor: 'rgb(var(--surface))' }}
    >
      {MOBILE_ENTRIES.map((entry) => (
        <NavLink
          key={entry.path}
          to={entry.path}
          end={entry.path === '/'}
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px]"
          style={({ isActive }) => ({
            color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-muted))',
          })}
        >
          <entry.icon size={19} />
          <span>{entry.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
