import { createContext, useContext, useMemo, useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import getTheme from '../theme/getTheme'

const ThemeModeContext = createContext(null)

function getInitialMode() {
  const stored = localStorage.getItem('probf-theme-mode')
  if (stored === 'light' || stored === 'dark') return stored

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode)

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('probf-theme-mode', next)
      return next
    })
  }

  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  return useContext(ThemeModeContext)
}
