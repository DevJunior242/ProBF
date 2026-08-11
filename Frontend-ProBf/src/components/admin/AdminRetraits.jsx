import { useEffect, useState } from 'react'
import { Stack, Card, CardContent, Typography, Button, Box, CircularProgress } from '@mui/material'
import api from '../../api/client'

export default function AdminRetraits() {
  const [retraits, setRetraits] = useState([])
  const [loading, setLoading] = useState(true)

  const charger = () => {
    setLoading(true)
    api.get('/retraits').then(({ data }) => {
      setRetraits(data)
      setLoading(false)
    })
  }

  useEffect(charger, [])

  const traiter = async (id, action) => {
    await api.patch(`/retraits/${id}/valider`, { action })
    setRetraits(retraits.filter((r) => r.id !== id))
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (retraits.length === 0) {
    return <Typography color="text.secondary">Aucune demande de retrait en attente.</Typography>
  }

  return (
    <Stack spacing={2}>
      {retraits.map((r) => (
        <Card key={r.id} variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
              <Box>
                <Typography fontWeight={600}>{r.ambassadeur?.nom}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {r.ambassadeur?.telephone} — demande le {new Date(r.created_at).toLocaleDateString('fr-FR')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {r.montant} F CFA à envoyer
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" onClick={() => traiter(r.id, 'valider')}>
                  Valider
                </Button>
                <Button variant="outlined" color="error" onClick={() => traiter(r.id, 'rejeter')}>
                  Rejeter
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
