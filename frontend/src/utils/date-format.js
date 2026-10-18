const DAY_MS = 24 * 60 * 60 * 1000

export function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function daysSince(value) {
  const diff = Date.now() - new Date(value).getTime()
  return Math.max(0, Math.floor(diff / DAY_MS))
}