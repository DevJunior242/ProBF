import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Container,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import MenuIcon from '@mui/icons-material/Menu'
import { useThemeMode } from '../context/ThemeModeContext'
import { useAuth } from '../context/AuthContext'
import Footer from './Footer'
import Logo from './Logo'
import MessagingIcon from './MessagingIcon'
import NotificationIcon from './NotificationIcon'

export default function Layout() {
  const { mode, toggleMode } = useThemeMode()
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [menuOuvert, setMenuOuvert] = useState(false)

  const handleLogout = async () => {
    setMenuOuvert(false)
    await logout()
    navigate('/')
  }

  const espaceLink = hasRole('fournisseur') && !hasRole('pro') ? '/fournisseur/dashboard' : '/dashboard'

  const liens = [
    { to: '/pros', label: 'Trouver un pro' },
    { to: '/fournisseurs', label: 'Fournisseurs' },
    { to: '/demandes/nouvelle', label: 'Radar de demande' },
    ...(user ? [{ to: espaceLink, label: 'Mon espace' }] : []),
    ...(hasRole('admin') ? [{ to: '/admin', label: 'Administration' }] : []),
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Box component={Link} to="/" sx={{ textDecoration: 'none', flexGrow: 1, display: 'inline-flex' }}>
              <Logo size={30} />
            </Box>

            {/* Navigation desktop */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' } }}>
              {liens.map((lien) => (
                <Button key={lien.to + lien.label} component={Link} to={lien.to} size="small">
                  {lien.label}
                </Button>
              ))}

              {user ? (
                <Button onClick={handleLogout} size="small" variant="outlined">
                  Déconnexion
                </Button>
              ) : (
                <>
                  <Button component={Link} to="/connexion" size="small">
                    Connexion
                  </Button>
                  <Button component={Link} to="/inscription" size="small" variant="contained">
                    Inscription
                  </Button>
                </>
              )}

              <MessagingIcon />
              <NotificationIcon />

              <IconButton onClick={toggleMode} aria-label="Changer de thème">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Stack>

            {/* Navigation mobile */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: { xs: 'flex', md: 'none' } }}>
              <MessagingIcon />
              <NotificationIcon />
              <IconButton onClick={toggleMode} aria-label="Changer de thème">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton onClick={() => setMenuOuvert(true)} aria-label="Ouvrir le menu">
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={menuOuvert} onClose={() => setMenuOuvert(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <List>
            {liens.map((lien) => (
              <ListItem key={lien.to + lien.label} disablePadding>
                <ListItemButton component={Link} to={lien.to} onClick={() => setMenuOuvert(false)}>
                  <ListItemText primary={lien.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          <List>
            {user ? (
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Déconnexion" />
                </ListItemButton>
              </ListItem>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/connexion" onClick={() => setMenuOuvert(false)}>
                    <ListItemText primary="Connexion" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/inscription" onClick={() => setMenuOuvert(false)}>
                    <ListItemText primary="Inscription" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Footer />
    </Box>
  )
}
