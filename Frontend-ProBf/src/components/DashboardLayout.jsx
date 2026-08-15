import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PersonIcon from '@mui/icons-material/Person'
import ForumIcon from '@mui/icons-material/Forum'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import PaymentIcon from '@mui/icons-material/Payment'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import BadgeIcon from '@mui/icons-material/Badge'
import SecurityIcon from '@mui/icons-material/Security'
import LogoutIcon from '@mui/icons-material/Logout'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useThemeMode } from '../context/ThemeModeContext'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import MessagingIcon from './MessagingIcon'
import NotificationIcon from './NotificationIcon'

const LARGEUR_SIDEBAR = 240
const LARGEUR_SIDEBAR_MINI = 76

export default function DashboardLayout() {
  const { mode, toggleMode } = useThemeMode()
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [reduite, setReduite] = useState(() => localStorage.getItem('probf-sidebar-reduite') === '1')

  const largeurActuelle = reduite ? LARGEUR_SIDEBAR_MINI : LARGEUR_SIDEBAR

  const toggleReduite = () => {
    setReduite((prev) => {
      localStorage.setItem('probf-sidebar-reduite', prev ? '0' : '1')
      return !prev
    })
  }

  const handleLogout = async () => {
    setMenuOuvert(false)
    await logout()
    navigate('/')
  }

  const doubleProFournisseur = hasRole('pro') && hasRole('fournisseur')

  const liens = [
    ...(hasRole('pro') ? [
      { to: '/dashboard', label: doubleProFournisseur ? 'Tableau de bord (Pro)' : 'Tableau de bord', icon: DashboardIcon },
      { to: '/profil', label: 'Mon profil', icon: PersonIcon },
    ] : []),
    ...(hasRole('fournisseur') ? [{ to: '/fournisseur/dashboard', label: doubleProFournisseur ? 'Tableau de bord (Fournisseur)' : 'Tableau de bord', icon: DashboardIcon }] : []),
    ...(!hasRole('pro') && !hasRole('fournisseur') ? [{ to: '/dashboard', label: 'Tableau de bord', icon: DashboardIcon }] : []),
    { to: '/messages', label: 'Messages', icon: ForumIcon },
    {
      to: '/verification',
      label: user?.verification_statut === 3 ? 'Identité vérifiée' : 'Vérifier mon identité',
      icon: BadgeIcon,
      color: user?.verification_statut === 3 ? 'success.main' : 'warning.main',
    },
    ...(hasRole('pro') || hasRole('fournisseur') ? [{ to: '/abonnement', label: 'Abonnement', icon: PaymentIcon }] : []),
    { to: '/parrainage', label: 'Parrainage', icon: CardGiftcardIcon },
    { to: '/securite', label: 'Sécurité', icon: SecurityIcon },
    ...(hasRole('admin') ? [{ to: '/admin', label: 'Administration', icon: AdminPanelSettingsIcon }] : []),
  ]

  const contenuSidebar = (reductible) => {
    const estReduite = reductible && reduite

    return (
      <Box sx={{ width: estReduite ? LARGEUR_SIDEBAR_MINI : LARGEUR_SIDEBAR, transition: 'width 0.2s' }} role="presentation">
        {/* Profil */}
        <Stack
          spacing={1}
          sx={{ alignItems: 'center', px: 2, py: 2.5, textAlign: 'center' }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{user?.nom?.[0]}</Avatar>
          {!estReduite && (
            <Box>
              <Typography fontWeight={700} noWrap sx={{ maxWidth: LARGEUR_SIDEBAR - 32 }}>
                {user?.nom}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: LARGEUR_SIDEBAR - 32 }}>
                {user?.email ?? user?.telephone}
              </Typography>
            </Box>
          )}
        </Stack>
        <Divider />

        <List>
          {liens.map((lien) => {
            const item = (
              <ListItemButton
                component={Link}
                to={lien.to}
                selected={location.pathname === lien.to}
                onClick={() => setMenuOuvert(false)}
                sx={estReduite ? { justifyContent: 'center', px: 2 } : undefined}
              >
                <ListItemIcon sx={{ minWidth: estReduite ? 0 : 40, justifyContent: 'center', color: lien.color }}>
                  <lien.icon fontSize="small" />
                </ListItemIcon>
                {!estReduite && <ListItemText primary={lien.label} sx={lien.color ? { color: lien.color } : undefined} />}
              </ListItemButton>
            )

            return (
              <ListItem key={lien.to + lien.label} disablePadding>
                {estReduite ? (
                  <Tooltip title={lien.label} placement="right">
                    {item}
                  </Tooltip>
                ) : (
                  item
                )}
              </ListItem>
            )
          })}
        </List>

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/"
              onClick={() => setMenuOuvert(false)}
              sx={estReduite ? { justifyContent: 'center', px: 2 } : undefined}
            >
              <ListItemIcon sx={{ minWidth: estReduite ? 0 : 40, justifyContent: 'center' }}>
                <HomeIcon fontSize="small" />
              </ListItemIcon>
              {!estReduite && <ListItemText primary="Retour au site" />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={estReduite ? { justifyContent: 'center', px: 2 } : undefined}>
              <ListItemIcon sx={{ minWidth: estReduite ? 0 : 40, justifyContent: 'center' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {!estReduite && <ListItemText primary="Déconnexion" />}
            </ListItemButton>
          </ListItem>
        </List>

        {reductible && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: estReduite ? 'center' : 'flex-end', p: 1 }}>
              <IconButton onClick={toggleReduite} size="small" aria-label={estReduite ? 'Agrandir le menu' : 'Réduire le menu'}>
                {estReduite ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100svh' }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          width: { md: `calc(100% - ${largeurActuelle}px)` },
          ml: { md: `${largeurActuelle}px` },
          transition: 'width 0.2s, margin-left 0.2s',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            onClick={() => setMenuOuvert(true)}
            aria-label="Ouvrir le menu"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', flexGrow: 1, display: { xs: 'inline-flex', md: 'none' } }}
          >
            <Logo size={26} />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />

          <MessagingIcon />
          <NotificationIcon />
          <IconButton onClick={toggleMode} aria-label="Changer de thème">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar permanente (desktop), rétractable */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: largeurActuelle,
          transition: 'width 0.2s',
          '& .MuiDrawer-paper': { width: largeurActuelle, boxSizing: 'border-box', overflowX: 'hidden', transition: 'width 0.2s' },
        }}
        open
      >
        {contenuSidebar(true)}
      </Drawer>

      {/* Sidebar temporaire (mobile) */}
      <Drawer
        anchor="left"
        open={menuOuvert}
        onClose={() => setMenuOuvert(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {contenuSidebar(false)}
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, width: { md: `calc(100% - ${largeurActuelle}px)` }, transition: 'width 0.2s' }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
