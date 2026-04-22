import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import * as api from '../services/api'

export function useLogs(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async (overrideFilters = filters) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getLogs(overrideFilters)
      setLogs(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load logs'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh(initialFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilters)])

  useEffect(() => {
    void refresh(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return { logs, loading, error, refresh, filters, setFilters }
}
