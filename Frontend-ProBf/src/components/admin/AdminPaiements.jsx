import { useEffect, useState } from 'react'
import { Stack, Card, CardContent, Typography, Button, Box, CircularProgress, Link as MuiLink } from '@mui/material'
import api from '../../api/client'

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState([])
  const [loading, setLoading] = useState(true)

  const charger = () => {
    setLoading(true)
    api.get('/paiements').then(({ data }) => {
      setPaiements(data.data)
      setLoading(false)
    })
  }

  useEffect(charger, [])

  const traiter = async (id, action) => {
    await api.patch(`/paiements/${id}/valider`, { action })
    setPaiements(paiements.filter((p) => p.id !== id))
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (paiements.length === 0) {
    return <Typography color="text.secondary">Aucun paiement en attente.</Typography>
  }

  return (
    <Stack spacing={2}>
      {paiements.map((p) => (
        <Card key={p.id} variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
              <Box>
                <Typography fontWeight={600}>{p.user?.nom}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.user?.telephone} —{' '}
                  {p.contexte === 'boost' && 'Boost 24h'}
                  {p.contexte === 'devis_express' &&
                    `Devis Express — ${p.demande?.metier?.nom ?? '?'} à ${p.demande?.quartier?.nom ?? '?'}`}
                  {p.contexte === 'promo' && `Bon Plan Matos — ${p.promo?.produit?.nom ?? '?'}`}
                  {p.contexte === 'abonnement' && `Abonnement ${p.type === 1 ? 'Pro' : 'Fournisseur'}`}
                  {p.plan_abonnement && ` — Plan ${p.plan_abonnement.nom} (${p.plan_abonnement.duree_jours}j)`}
                </Typography>
                <Typography variant="body2">
                  {p.montant} F CFA via {p.moyen_paiement?.nom ?? 'moyen non précisé'}
                  {p.reference_transaction && ` (réf: ${p.reference_transaction})`}
                </Typography>
                {p.preuve && (
                  <MuiLink href={p.preuve} target="_blank" rel="noopener" variant="body2">
                    Voir la preuve
                  </MuiLink>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" onClick={() => traiter(p.id, 'valider')}>
                  Valider
                </Button>
                <Button variant="outlined" color="error" onClick={() => traiter(p.id, 'rejeter')}>
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
