/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'grannys-shop-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const login = useCallback(async (name, pin) => {
    const nextUser = await api.login(name, pin)
    setUser(nextUser)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    return nextUser
  }, [])

  const logout = useCallback(async () => {
    if (user?.name) {
      try {
        await api.logout(user.name)
      } catch {
        // Clear the local session even if the mock log write fails.
      }
    }

    setUser(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
    }),
    [login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }

  return context
}
