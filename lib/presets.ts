import type { TodoList } from './types'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

export const DEFAULT_DURATION_MS = 24 * HOUR

/** Quick-pick cooldown durations shown as pills. */
export const DURATION_PRESETS: { label: string; ms: number }[] = [
  { label: '1h', ms: 1 * HOUR },
  { label: '4h', ms: 4 * HOUR },
  { label: '8h', ms: 8 * HOUR },
  { label: '12h', ms: 12 * HOUR },
  { label: '24h', ms: 24 * HOUR },
  { label: '48h', ms: 48 * HOUR },
  { label: '7d', ms: 7 * DAY },
]

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function makeItems(texts: string[], durationMs: number) {
  return texts.map((text) => ({
    id: uid(),
    text,
    durationMs,
    startedAt: null,
  }))
}

/** Pre-made list templates the user can drop in. */
export type ListPreset = {
  key: string
  name: string
  description: string
  build: () => TodoList
}

export const LIST_PRESETS: ListPreset[] = [
  {
    key: 'daily',
    name: 'Daily reset',
    description: 'Habits that free up every 24 hours.',
    build: () => ({
      id: uid(),
      title: 'Daily reset',
      items: makeItems(
        ['Deep work block', 'Workout', 'Read 20 pages', 'Inbox zero'],
        24 * HOUR,
      ),
    }),
  },
  {
    key: 'content',
    name: 'Content cooldowns',
    description: 'Re-post windows across channels.',
    build: () => ({
      id: uid(),
      title: 'Content cooldowns',
      items: makeItems(
        ['X / Twitter thread', 'LinkedIn post', 'Newsletter', 'YouTube upload'],
        48 * HOUR,
      ),
    }),
  },
  {
    key: 'gaming',
    name: 'Game timers',
    description: 'Track daily / weekly in-game resets.',
    build: () => ({
      id: uid(),
      title: 'Game timers',
      items: makeItems(
        ['Daily quests', 'Raid lockout', 'Weekly vault', 'Arena tickets'],
        7 * DAY,
      ),
    }),
  },
  {
    key: 'blank',
    name: 'Blank list',
    description: 'Start empty with a single row.',
    build: () => ({
      id: uid(),
      title: 'New list',
      items: makeItems(['New item'], DEFAULT_DURATION_MS),
    }),
  },
]

export function starterState(): TodoList[] {
  return [LIST_PRESETS[0].build()]
}
