// Lightweight subsequence-based fuzzy matcher — no dependency needed for
// the command palette or in-page search boxes.
export function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  if (t.includes(q)) return true
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

export function fuzzyFilter<T>(query: string, items: T[], getText: (item: T) => string): T[] {
  if (!query.trim()) return items
  return items.filter((item) => fuzzyMatch(query, getText(item)))
}
