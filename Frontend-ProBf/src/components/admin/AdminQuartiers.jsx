import { useEffect, useState } from 'react'
import {
  Stack,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../api/client'

export default function AdminQuartiers() {
  const [quartiers, setQuartiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [aSupprimer, setASupprimer] = useState(null)
  const [erreur, setErreur] = useState(null)

  const charger = () => {
    setLoading(true)
    api.get('/admin/quartiers').then(({ data }) => {
      setQuartiers(data)
      setLoading(false)
    })
  }

  useEffect(charger, [])

  const confirmerSuppression = async () => {
    setErreur(null)
    try {
      await api.delete(`/admin/quartiers/${aSupprimer.id}`)
      setQuartiers(quartiers.filter((q) => q.id !== aSupprimer.id))
      setASupprimer(null)
    } catch (err) {
      setErreur(err.response?.data?.message ?? 'Impossible de supprimer ce quartier.')
    }
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        Quartiers ajoutés par des utilisateurs (via "+ Autre") — vérifie qu'il n'y a pas de doublon avec un
        quartier déjà existant avant de le laisser.
      </Typography>

      {quartiers.length === 0 ? (
        <Typography color="text.secondary">Aucun quartier ajouté par un utilisateur pour l'instant.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {quartiers.map((q) => (
            <Card key={q.id} variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600}>
                    {q.nom} — {q.ville?.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajouté par {q.cree_par?.nom ?? 'inconnu'} le {new Date(q.created_at).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
                <Chip size="small" label="Ajouté par un utilisateur" color="warning" variant="outlined" />
                <IconButton size="small" onClick={() => setASupprimer(q)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(aSupprimer)} onClose={() => setASupprimer(null)}>
        <DialogTitle>Supprimer ce quartier ?</DialogTitle>
        <DialogContent>
          {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}
          <Typography>
            Tu es sur le point de supprimer <strong>{aSupprimer?.nom}</strong> ({aSupprimer?.ville?.nom}).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setASupprimer(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={confirmerSuppression}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
