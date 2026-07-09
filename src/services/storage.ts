// Storage service abstraction layer.
// Components never touch localStorage directly — they go through this interface.
// Swapping to IndexedDB, a remote API, etc. only requires a new adapter here.

export interface StorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  keys(): string[]
}

const PREFIX = 'lifeos:'

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(PREFIX + key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch (err) {
      console.error(`[storage] failed to read "${key}"`, err)
      return null
    }
  }

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (err) {
      console.error(`[storage] failed to write "${key}"`, err)
    }
  }

  remove(key: string): void {
    window.localStorage.removeItem(PREFIX + key)
  }

  keys(): string[] {
    const out: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k?.startsWith(PREFIX)) out.push(k.slice(PREFIX.length))
    }
    return out
  }
}

// Cross-tab sync: broadcast storage events so every open tab reflects writes
// made in another tab (Phase 5 requirement: "stay fully intact over multi-tab reloads").
export function onExternalStorageChange(callback: (key: string) => void) {
  const handler = (e: StorageEvent) => {
    if (e.key?.startsWith(PREFIX)) callback(e.key.slice(PREFIX.length))
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

export const storage: StorageAdapter = new LocalStorageAdapter()

// Exports the entire lifeos:* namespace as a single JSON blob (Phase 12).
export function exportAllData(): string {
  const bundle: Record<string, unknown> = {}
  for (const key of storage.keys()) {
    bundle[key] = storage.get(key)
  }
  return JSON.stringify({ exportedAt: new Date().toISOString(), data: bundle }, null, 2)
}

// Imports a previously exported JSON blob, validating shape before writing.
export function importAllData(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object' || typeof parsed.data !== 'object') {
      return { ok: false, error: 'File is not a valid LifeOS export.' }
    }
    for (const [key, value] of Object.entries(parsed.data)) {
      storage.set(key, value)
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not parse that file as JSON.' }
  }
}
