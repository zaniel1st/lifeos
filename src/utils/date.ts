export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10)
}

export function daysBetween(a: Date, b: Date): number {
  const ms = 1000 * 60 * 60 * 24
  return Math.round((b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0)) / ms)
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'No date'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  return daysBetween(new Date(), new Date(iso))
}
