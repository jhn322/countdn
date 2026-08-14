/** Format a duration (ms) into a compact countdown string. */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return days > 0 ? `${days}d ${clock}` : clock
}

const WEEK_HOURS = 24 * 7

/**
 * Human label for a duration used in menus/pills.
 * Durations are shown in hours (e.g. "24h", "48h") right up to a full week,
 * so selecting 24h always reads as "24h" rather than "1d". Only whole weeks
 * collapse to a day label.
 */
export function formatDurationLabel(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = totalMinutes / 60
  if (hours < WEEK_HOURS) {
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`
  }
  const days = hours / 24
  return Number.isInteger(days) ? `${days}d` : `${days.toFixed(1)}d`
}

export type ClockFormat = '24h' | '12h'

/**
 * Format an absolute timestamp as a local wall-clock time.
 * Includes a short weekday when the target is not today so a 3-day
 * cooldown reads clearly (e.g. "Wed 14:05").
 */
export function formatClockTime(ms: number, clock: ClockFormat): string {
  const date = new Date(ms)
  const time = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: clock === '12h',
  })
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (sameDay) return time
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' })
  return `${weekday} ${time}`
}
