import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
        <Icon size={22} className="text-accent-500" style={{ color: 'rgb(var(--accent))' }} />
      </div>
      <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'rgb(var(--text-primary))' }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
