import { createContext, useContext, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('probf-user')
    return stored ? JSON.parse(stored) : null
  })

  const persist = (user, token) => {
    localStorage.setItem('probf-token', token)
    localStorage.setItem('probf-user', JSON.stringify(user))
    setUser(user)
  }

  const login = async (identifiant, password) => {
    const { data } = await api.post('/auth/login', { identifiant, password })
    persist(data.user, data.token)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    persist(data.user, data.token)
    return data.user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('probf-token')
      localStorage.removeItem('probf-user')
      setUser(null)
    }
  }

  const hasRole = (role) => user?.roles?.some((r) => r.nom === role) ?? false

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
