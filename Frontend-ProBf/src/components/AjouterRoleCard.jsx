import { useState } from 'react'
import { Paper, Stack, Typography, Button, Alert } from '@mui/material'
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const ROLES_PROPOSABLES = [
  { value: 'pro', label: 'Devenir aussi Pro', icon: HandymanOutlinedIcon },
  { value: 'fournisseur', label: 'Devenir aussi Fournisseur', icon: Inventory2OutlinedIcon },
]

export default function AjouterRoleCard() {
  const { hasRole, updateUser } = useAuth()
  const [loadingRole, setLoadingRole] = useState(null)
  const [erreur, setErreur] = useState(null)

  const manquants = ROLES_PROPOSABLES.filter((r) => !hasRole(r.value))

  if (manquants.length === 0) return null

  const ajouter = async (role) => {
    setErreur(null)
    setLoadingRole(role)
    try {
      const { data } = await api.post('/auth/roles', { role })
      updateUser({ roles: data.roles })
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Impossible d'ajouter ce rôle.")
    } finally {
      setLoadingRole(null)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mt: 3 }}>
      <Typography fontWeight={600} gutterBottom>
        Élargir ton compte
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Un même compte peut être à la fois Pro et Fournisseur — ajoute un profil sans rien recréer.
      </Typography>

      {erreur && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erreur}
        </Alert>
      )}

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
        {manquants.map((r) => (
          <Button
            key={r.value}
            variant="outlined"
            size="small"
            startIcon={<r.icon fontSize="small" />}
            disabled={loadingRole === r.value}
            onClick={() => ajouter(r.value)}
          >
            {r.label}
          </Button>
        ))}
      </Stack>
    </Paper>
  )
}
