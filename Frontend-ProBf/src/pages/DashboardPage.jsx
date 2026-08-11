import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Grid, Card, CardContent, Typography, ToggleButtonGroup, ToggleButton, Stack, CircularProgress, Button } from '@mui/material'
import BoltIcon from '@mui/icons-material/Bolt'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import DashboardTrendChart from '../components/DashboardTrendChart'
import BoostDialog from '../components/BoostDialog'

function StatCard({ label, value }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { hasRole } = useAuth()
  const estPro = hasRole('pro')
  const [stats, setStats] = useState(null)
  const [dispo, setDispo] = useState(1)
  const [loading, setLoading] = useState(true)
  const [boostOuvert, setBoostOuvert] = useState(false)

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => {
      setStats(data)
      setDispo(data.statut_dispo ?? 1)
      setLoading(false)
    })
  }, [])

  const changerDispo = async (_, value) => {
    if (!value) return
    setDispo(value)
    await api.patch('/profile/dispo', { statut_dispo: value })
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 2 }}
      >
        <Typography variant="h4" fontWeight={700}>
          Tableau de bord
        </Typography>

        {estPro && (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <ToggleButtonGroup value={dispo} exclusive onChange={changerDispo}>
              <ToggleButton value={1}>🟢 Disponible</ToggleButton>
              <ToggleButton value={2}>🟡 Sur RDV</ToggleButton>
            </ToggleButtonGroup>
            <Button component={Link} to="/profil" variant="outlined">
              Mon profil
            </Button>
          </Stack>
        )}
      </Stack>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {estPro ? (
          <>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Clics WhatsApp" value={stats.whatsapp_clicks_total} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Clics ce mois" value={stats.whatsapp_clicks_ce_mois} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Note moyenne" value={stats.avis_note_moyenne} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Demandes ouvertes" value={stats.demandes_ouvertes_metier} />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Demandes postées" value={stats.demandes_postees} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Avis donnés" value={stats.avis_donnes} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Pros contactés" value={stats.pros_contactes} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Conversations" value={stats.conversations_actives} />
            </Grid>
          </>
        )}
      </Grid>

      <DashboardTrendChart />

      {estPro && (
        <Stack direction="row" spacing={2} sx={{ mt: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography color="text.secondary">
            Abonnement :{' '}
            {stats.abonnement_actif
              ? `actif jusqu'au ${new Date(stats.abonnement_actif.date_fin).toLocaleDateString('fr-FR')}`
              : 'aucun abonnement actif'}
          </Typography>
          <Button component={Link} to="/abonnement" variant="outlined" size="small">
            Régler mon abonnement
          </Button>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            startIcon={<BoltIcon />}
            onClick={() => setBoostOuvert(true)}
          >
            Booster mon profil (50F/24h)
          </Button>
        </Stack>
      )}

      <BoostDialog open={boostOuvert} onClose={() => setBoostOuvert(false)} type={1} />
    </Container>
  )
}
