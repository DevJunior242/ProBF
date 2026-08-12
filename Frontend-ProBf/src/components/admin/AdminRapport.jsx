import { useEffect, useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import api from '../../api/client'

const LABELS_CONTEXTE = {
  abonnement: 'Abonnements',
  boost: 'Boosts',
  promo: 'Promos',
  devis_express: 'Devis express',
}

function Variation({ pct }) {
  if (pct === null || pct === undefined) return null
  const positif = pct >= 0
  const Icon = positif ? TrendingUpIcon : TrendingDownIcon
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
      <Icon fontSize="small" sx={{ color: positif ? 'success.main' : 'error.main' }} />
      <Typography variant="caption" sx={{ color: positif ? 'success.main' : 'error.main' }} fontWeight={600}>
        {positif ? '+' : ''}
        {pct}% vs période précédente
      </Typography>
    </Stack>
  )
}

function StatCard({ label, value, variation }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
        <Variation pct={variation} />
      </CardContent>
    </Card>
  )
}

function TopListe({ titre, items }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {titre}
      </Typography>
      {items.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          Aucune donnée sur cette période.
        </Typography>
      ) : (
        <List dense disablePadding>
          {items.map((item, i) => (
            <ListItem key={item.nom} disableGutters>
              <ListItemText primary={`${i + 1}. ${item.nom}`} />
              <Chip size="small" label={item.total} />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
}

export default function AdminRapport() {
  const [periode, setPeriode] = useState('mois')
  const [valeur, setValeur] = useState(new Date().toISOString().slice(0, 7))
  const [rapport, setRapport] = useState(null)

  useEffect(() => {
    setRapport(null)
    api.get('/admin/rapport', { params: { periode, valeur } }).then(({ data }) => setRapport(data))
  }, [periode, valeur])

  const changerPeriode = (_, v) => {
    if (!v) return
    setPeriode(v)
    setValeur(v === 'annee' ? new Date().getFullYear().toString() : new Date().toISOString().slice(0, 7))
  }

  const exporterCsv = () => {
    if (!rapport) return
    const lignes = [
      ['Rapport', rapport.label],
      ['Revenu total (FCFA)', rapport.revenu_total],
      ['Nouveaux utilisateurs', rapport.nouveaux_utilisateurs.total],
      ['  dont clients', rapport.nouveaux_utilisateurs.clients],
      ['  dont pros', rapport.nouveaux_utilisateurs.pros],
      ['  dont fournisseurs', rapport.nouveaux_utilisateurs.fournisseurs],
      ['Demandes postées', rapport.demandes_total],
      ['Avis laissés', rapport.avis_total],
      ['Clics WhatsApp', rapport.whatsapp_clicks_total],
      ['Abonnements actifs', rapport.abonnements_actifs],
      [],
      ['Revenu par contexte'],
      ...Object.entries(rapport.revenu_par_contexte).map(([k, v]) => [LABELS_CONTEXTE[k] ?? k, v]),
      [],
      ['Top métiers'],
      ...rapport.top_metiers.map((m) => [m.nom, m.total]),
      [],
      ['Top quartiers'],
      ...rapport.top_quartiers.map((q) => [q.nom, q.total]),
    ]
    const csv = lignes.map((l) => l.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-probf-${rapport.label.replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <ToggleButtonGroup size="small" value={periode} exclusive onChange={changerPeriode}>
            <ToggleButton value="mois">Mensuel</ToggleButton>
            <ToggleButton value="annee">Annuel</ToggleButton>
          </ToggleButtonGroup>

          {periode === 'mois' ? (
            <TextField
              type="month"
              size="small"
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
            />
          ) : (
            <TextField
              type="number"
              size="small"
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              sx={{ width: 120 }}
            />
          )}
        </Stack>

        <Button startIcon={<FileDownloadIcon />} variant="outlined" size="small" onClick={exporterCsv} disabled={!rapport}>
          Exporter CSV
        </Button>
      </Stack>

      {!rapport ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
            {rapport.label}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Revenu (FCFA)"
                value={rapport.revenu_total.toLocaleString('fr-FR')}
                variation={rapport.revenu_variation_pct}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Nouveaux utilisateurs"
                value={rapport.nouveaux_utilisateurs.total}
                variation={rapport.nouveaux_utilisateurs.variation_pct}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Demandes postées" value={rapport.demandes_total} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Abonnements actifs" value={rapport.abonnements_actifs} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Avis laissés" value={rapport.avis_total} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Clics WhatsApp" value={rapport.whatsapp_clicks_total} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Nouveaux clients" value={rapport.nouveaux_utilisateurs.clients} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Nouveaux pros" value={rapport.nouveaux_utilisateurs.pros} />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Revenu par type
            </Typography>
            {Object.keys(rapport.revenu_par_contexte).length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                Aucun paiement validé sur cette période.
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {Object.entries(rapport.revenu_par_contexte).map(([contexte, montant]) => (
                  <Chip
                    key={contexte}
                    label={`${LABELS_CONTEXTE[contexte] ?? contexte} : ${Number(montant).toLocaleString('fr-FR')} FCFA`}
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Paper>

          <Divider />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TopListe titre="Top 5 métiers demandés" items={rapport.top_metiers} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TopListe titre="Top 5 quartiers demandés" items={rapport.top_quartiers} />
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  )
}
