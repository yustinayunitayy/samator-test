import { useEffect, useState } from 'react'

export function useQuery(fetcher) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ fetcher: null, attempt: -1, data: null, error: null })

  useEffect(() => {
    let active = true
    fetcher().then(
      (data) => active && setState({ fetcher, attempt, data, error: null }),
      (error) => active && setState((prev) => ({ fetcher, attempt, data: prev.data, error })),
    )
    return () => {
      active = false
    }
  }, [fetcher, attempt])

  const settled = state.fetcher === fetcher && state.attempt === attempt

  return {
    data: state.data,
    loading: !settled,
    error: settled ? state.error : null,
    refresh: () => setAttempt((n) => n + 1),
  }
}