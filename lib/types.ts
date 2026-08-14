export type ListItem = {
  id: string
  text: string
  /** cooldown duration in ms */
  durationMs: number
  /** timestamp (ms) the cooldown was started, or null when active/idle */
  startedAt: number | null
}

export type TodoList = {
  id: string
  title: string
  items: ListItem[]
}

export type ClockFormat = '24h' | '12h'

export type AppState = {
  version: number
  defaultDurationMs: number
  /** wall-clock display preference for cooldown end times */
  clock: ClockFormat
  lists: TodoList[]
}

export type FilterMode = 'all' | 'active' | 'disabled'

/** An item is "disabled" (on cooldown) while its timer has not elapsed. */
export function isDisabled(item: ListItem, now: number): boolean {
  return item.startedAt !== null && item.startedAt + item.durationMs > now
}

export function remainingMs(item: ListItem, now: number): number {
  if (item.startedAt === null) return 0
  return Math.max(0, item.startedAt + item.durationMs - now)
}

/** Absolute timestamp (ms) when the cooldown ends, or null when idle. */
export function endAtMs(item: ListItem): number | null {
  if (item.startedAt === null) return null
  return item.startedAt + item.durationMs
}
