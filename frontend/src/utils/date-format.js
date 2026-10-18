const DAY_MS = 24 * 60 * 60 * 1000

export function daysSince(value) {
  const diff = Date.now() - new Date(value).getTime()
  return Math.max(0, Math.floor(diff / DAY_MS))
}

export function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
