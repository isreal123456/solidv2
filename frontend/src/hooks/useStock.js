import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import * as api from '../services/api'

export function useStock(initialFilters = {}) {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async (overrideFilters = initialFilters) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getStock(overrideFilters)
      setStock(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load stock'
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

  return { stock, loading, error, refresh, setStock }
}
