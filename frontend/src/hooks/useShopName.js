import { useEffect, useState } from 'react'
import * as api from '../services/api'

export function useShopName(defaultName = "Granny's Shop") {
  const [shopName, setShopName] = useState(defaultName)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings()
        const nextName = String(data?.shopName ?? '').trim()
        if (nextName) {
          setShopName(nextName)
        }
      } catch {
        // Keep default when settings cannot be loaded.
      }
    }

    void loadSettings()
  }, [])

  return shopName
}
