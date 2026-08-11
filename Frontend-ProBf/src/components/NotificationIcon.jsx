import { useEffect, useState } from 'react'
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Stack,
  Typography,
  Checkbox,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const POLL_INTERVAL_MS = 20000

export default function NotificationIcon() {
  const { user } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [nonLues, setNonLues] = useState(0)
  const [selection, setSelection] = useState([])
  const [loading, setLoading] = useState(false)

  const charger = () => {
    api.get('/notifications').then(({ data }) => {
      setNotifications(data.notifications)
      setNonLues(data.non_lues)
    })
  }

  useEffect(() => {
    if (!user) return
    charger()
    const interval = setInterval(charger, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [user])

  const ouvrir = (e) => {
    setAnchorEl(e.currentTarget)
    if (notifications.length === 0) charger()
  }

  const toggleSelection = (id) => {
    setSelection((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toutSelectionner = () => {
    setSelection(selection.length === notifications.length ? [] : notifications.map((n) => n.id))
  }

  const marquerLues = async () => {
    setLoading(true)
    try {
      await api.patch('/notifications/lues', { ids: selection.length ? selection : undefined })
      setSelection([])
      charger()
    } finally {
      setLoading(false)
    }
  }

  const supprimer = async () => {
    if (selection.length === 0) return
    setLoading(true)
    try {
      await api.delete('/notifications', { data: { ids: selection } })
      setSelection([])
      charger()
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      <IconButton onClick={ouvrir} aria-label="Notifications">
        <Badge badgeContent={nonLues} color="error">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 360, maxHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Checkbox
                size="small"
                checked={notifications.length > 0 && selection.length === notifications.length}
                indeterminate={selection.length > 0 && selection.length < notifications.length}
                onChange={toutSelectionner}
                disabled={notifications.length === 0}
              />
              <Typography variant="subtitle2">Notifications</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={marquerLues} disabled={loading} title="Marquer comme lu">
                <DoneAllIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={supprimer} disabled={loading || selection.length === 0} title="Supprimer la sélection">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          <Divider />

          <Box sx={{ overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                Aucune notification.
              </Typography>
            ) : (
              <List disablePadding>
                {notifications.map((n) => (
                  <ListItem
                    key={n.id}
                    disablePadding
                    sx={{ bgcolor: n.read_at ? 'transparent' : 'action.hover' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', px: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36, mt: 1 }}>
                        <Checkbox
                          size="small"
                          checked={selection.includes(n.id)}
                          onChange={() => toggleSelection(n.id)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ py: 1 }}
                        primary={n.data.title}
                        secondary={
                          <>
                            {n.data.message}
                            <br />
                            <Typography component="span" variant="caption" color="text.secondary">
                              {new Date(n.created_at).toLocaleString('fr-FR')}
                            </Typography>
                          </>
                        }
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            {loading && (
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <CircularProgress size={18} />
              </Box>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  )
}
