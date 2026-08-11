import { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Stack, ToggleButtonGroup, ToggleButton, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarChart } from '@mui/x-charts/BarChart'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import CampaignIcon from '@mui/icons-material/Campaign'
import StarIcon from '@mui/icons-material/Star'
import api from '../../api/client'

const ICONES_EVENEMENT = {
  inscription: PersonAddIcon,
  parrainage: CardGiftcardIcon,
  contact: WhatsAppIcon,
  demande: CampaignIcon,
  avis: StarIcon,
}

function StatCard({ label, value, accent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} color={accent ? 'primary' : 'text.primary'}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [periode, setPeriode] = useState('mois')
  const [graphiques, setGraphiques] = useState(null)
  const [activite, setActivite] = useState(null)

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data))
    api.get('/admin/activite', { params: { jours: 1 } }).then(({ data }) => setActivite(data))
  }, [])

  useEffect(() => {
    api.get('/admin/graphiques', { params: { periode } }).then(({ data }) => setGraphiques(data))
  }, [periode])

  if (!stats) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  const labels = graphiques?.inscriptions.map((p) => p.periode) ?? []
  const inscriptionsData = graphiques?.inscriptions.map((p) => p.total) ?? []
  const revenuLabels = graphiques?.revenu.map((p) => p.periode) ?? []
  const revenuData = graphiques?.revenu.map((p) => Number(p.total)) ?? []

  return (
    <Stack spacing={4}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Utilisateurs" value={stats.utilisateurs.total} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Clients" value={stats.utilisateurs.clients} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Pros" value={stats.utilisateurs.pros} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Fournisseurs" value={stats.utilisateurs.fournisseurs} />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Paiements en attente" value={stats.paiements_en_attente} accent />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Abonnements actifs" value={stats.abonnements_actifs} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Revenu ce mois" value={`${stats.revenu_ce_mois} F`} accent />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Profils masqués" value={stats.profils_masques} />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Demandes ouvertes" value={stats.demandes_ouvertes} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Avis total" value={stats.avis_total} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Clics WhatsApp ce mois" value={stats.whatsapp_clicks_ce_mois} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Nouveaux aujourd'hui" value={activite?.nouveaux_users ?? '—'} accent />
        </Grid>
      </Grid>

      <Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Évolution
          </Typography>
          <ToggleButtonGroup size="small" value={periode} exclusive onChange={(_, v) => v && setPeriode(v)}>
            <ToggleButton value="jour">Jour</ToggleButton>
            <ToggleButton value="mois">Mois</ToggleButton>
            <ToggleButton value="annee">Année</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Inscriptions
              </Typography>
              {labels.length === 0 ? (
                <Typography color="text.secondary">Pas encore de données.</Typography>
              ) : (
                <LineChart
                  xAxis={[{ scaleType: 'point', data: labels }]}
                  series={[{ data: inscriptionsData, label: 'Inscriptions', color: '#F3680F', area: true, curve: 'natural' }]}
                  height={260}
                />
              )}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Revenu (F CFA)
              </Typography>
              {revenuLabels.length === 0 ? (
                <Typography color="text.secondary">Pas encore de données.</Typography>
              ) : (
                <BarChart
                  xAxis={[{ scaleType: 'band', data: revenuLabels }]}
                  series={[{ data: revenuData, label: 'Revenu', color: '#25D366' }]}
                  height={260}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Activité d'aujourd'hui {activite && `(${activite.evenements.length} événement${activite.evenements.length > 1 ? 's' : ''})`}
        </Typography>
        <Paper variant="outlined">
          {!activite ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <CircularProgress size={20} />
            </Box>
          ) : activite.evenements.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 3 }}>
              Rien à signaler aujourd'hui.
            </Typography>
          ) : (
            <List dense>
              {activite.evenements.map((e, i) => {
                const Icone = ICONES_EVENEMENT[e.type] ?? PersonAddIcon
                return (
                  <ListItem key={i} divider={i < activite.evenements.length - 1}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Icone fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={e.texte}
                      secondary={new Date(e.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    />
                  </ListItem>
                )
              })}
            </List>
          )}
        </Paper>
      </Box>
    </Stack>
  )
}
