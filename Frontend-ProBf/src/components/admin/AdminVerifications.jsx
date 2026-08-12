import { useEffect, useState } from 'react'
import {
  Stack,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import api from '../../api/client'

function DocumentImage({ userId, cote, label }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let objectUrl
    api.get(`/admin/verifications/${userId}/document/${cote}`, { responseType: 'blob' }).then(({ data }) => {
      objectUrl = URL.createObjectURL(data)
      setUrl(objectUrl)
    })
    return () => objectUrl && URL.revokeObjectURL(objectUrl)
  }, [userId, cote])

  if (!url) {
    return (
      <Box sx={{ width: 160, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
        <CircularProgress size={20} />
      </Box>
    )
  }

  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noreferrer"
      sx={{ display: 'block', textDecoration: 'none' }}
    >
      <Box
        component="img"
        src={url}
        alt={label}
        sx={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
      />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}

export default function AdminVerifications() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [aRejeter, setARejeter] = useState(null)
  const [raison, setRaison] = useState('')
  const [erreur, setErreur] = useState(null)

  const charger = () => {
    setLoading(true)
    api.get('/admin/verifications').then(({ data }) => {
      setDemandes(data)
      setLoading(false)
    })
  }

  useEffect(charger, [])

  const approuver = async (user) => {
    await api.patch(`/admin/verifications/${user.id}/approuver`)
    setDemandes((prev) => prev.filter((u) => u.id !== user.id))
  }

  const confirmerRejet = async () => {
    setErreur(null)
    try {
      await api.patch(`/admin/verifications/${aRejeter.id}/rejeter`, { raison })
      setDemandes((prev) => prev.filter((u) => u.id !== aRejeter.id))
      setARejeter(null)
      setRaison('')
    } catch (err) {
      setErreur(err.response?.data?.message ?? 'Impossible de rejeter.')
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
        Demandes de vérification d'identité (CNIB) en attente.
      </Typography>

      {demandes.length === 0 ? (
        <Typography color="text.secondary">Aucune demande en attente.</Typography>
      ) : (
        <Stack spacing={2}>
          {demandes.map((u) => (
            <Card key={u.id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                    <Typography fontWeight={600}>{u.nom}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {u.telephone} — {u.email}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {u.roles?.map((r) => (
                        <Chip key={r.id} size="small" label={r.nom} />
                      ))}
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <DocumentImage userId={u.id} cote="recto" label="Recto" />
                    <DocumentImage userId={u.id} cote="verso" label="Verso" />
                  </Stack>

                  <Stack spacing={1}>
                    <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />} onClick={() => approuver(u)}>
                      Approuver
                    </Button>
                    <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => setARejeter(u)}>
                      Rejeter
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(aRejeter)} onClose={() => setARejeter(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Rejeter la vérification de {aRejeter?.nom}</DialogTitle>
        <DialogContent>
          {erreur && <Alert severity="error" sx={{ mb: 2 }}>{erreur}</Alert>}
          <TextField
            label="Raison du rejet"
            fullWidth
            multiline
            minRows={2}
            value={raison}
            onChange={(e) => setRaison(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setARejeter(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={confirmerRejet} disabled={!raison.trim()}>
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
