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

    if (data.two_factor) {
      // Pas de compte connecté pour l'instant : juste le jeton temporaire
      // que verifyTwoFactor() devra échanger contre le vrai token.
      return { twoFactor: true, challengeToken: data.token }
    }

    persist(data.user, data.token)
    return { twoFactor: false }
  }

  const verifyTwoFactor = async (challengeToken, credentials) => {
    const { data } = await api.post('/auth/2fa/challenge', { token: challengeToken, ...credentials })
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

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial }
      localStorage.setItem('probf-user', JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, verifyTwoFactor, register, logout, hasRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
