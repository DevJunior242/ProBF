import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  Alert,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import GroupsIcon from '@mui/icons-material/Groups'
import PaidIcon from '@mui/icons-material/Paid'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PaymentsIcon from '@mui/icons-material/Payments'
import api from '../api/client'
import DashboardTrendChart from '../components/DashboardTrendChart'
import { brand } from '../theme/getTheme'

const SEUIL_RETRAIT = 500

const STATUTS_RETRAIT = {
  1: { label: 'En attente', color: 'warning' },
  2: { label: 'Validé', color: 'success' },
  3: { label: 'Rejeté', color: 'error' },
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
          <Icon fontSize="small" color={accent ? 'warning' : 'action'} />
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Stack>
        <Typography variant="h5" fontWeight={700} color={accent ? 'warning.main' : 'text.primary'}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function ParrainagePage() {
  const [invitation, setInvitation] = useState(null)
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [copie, setCopie] = useState(false)
  const [code, setCode] = useState('')
  const [redeemMessage, setRedeemMessage] = useState(null)
  const [stats, setStats] = useState({ solde: 0, total_gagne: 0, total_retire: 0, filleuls_total: 0 })
  const [retraits, setRetraits] = useState([])
  const [messageRetrait, setMessageRetrait] = useState(null)
  const [envoiRetrait, setEnvoiRetrait] = useState(false)

  const charger = () => {
    setLoading(true)
    Promise.all([
      api.post('/invitations/generate'),
      api.get('/invitations'),
      api.get('/invitations/solde'),
      api.get('/retraits/moi'),
    ]).then(([inv, hist, sold, ret]) => {
      setInvitation(inv.data)
      setHistorique(hist.data)
      setStats(sold.data)
      setRetraits(ret.data)
      setLoading(false)
    })
  }

  useEffect(charger, [])

  const lienParrainage = invitation
    ? `${window.location.origin}/inscription?parrain=${invitation.code}`
    : ''

  const copier = async () => {
    await navigator.clipboard.writeText(invitation.code)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  const partagerWhatsApp = () => {
    const texte = `Rejoins ProBF avec mon code de parrainage ${invitation.code} et trouve des artisans de confiance au Burkina Faso : ${lienParrainage}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }

  const soumettreCode = async (e) => {
    e.preventDefault()
    setRedeemMessage(null)
    try {
      await api.post('/invitations/redeem', { code })
      setRedeemMessage({ type: 'success', text: 'Code appliqué, ton compte a été récompensé !' })
      setCode('')
    } catch (err) {
      const message = err.response?.data?.message ?? 'Code invalide ou déjà utilisé.'
      setRedeemMessage({ type: 'error', text: message })
    }
  }

  const demanderRetrait = async () => {
    setMessageRetrait(null)
    setEnvoiRetrait(true)
    try {
      await api.post('/retraits')
      setMessageRetrait({ type: 'success', text: 'Ta demande de retrait a été envoyée, un admin te contacte sous 24h.' })
      charger()
    } catch (err) {
      const message = err.response?.data?.message ?? "Impossible d'envoyer ta demande de retrait."
      setMessageRetrait({ type: 'error', text: message })
    } finally {
      setEnvoiRetrait(false)
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  const filleuls = historique.filter((i) => i.filleul)
  const gains = filleuls.filter((i) => i.commission_montant)

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Programme Ambassadeur
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Partage ton code : toi tu gagnes 1 mois Pro offert, ton filleul gagne 14 jours Prime dès qu'il
        l'utilise. En plus, tu touches une commission : 10% du 1er paiement s'il s'inscrit comme pro ou
        fournisseur, ou 25 F CFA dès sa 1ère demande postée s'il s'inscrit comme client.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ton code
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: 2,
              color: 'primary.main',
            }}
          >
            {invitation.code}
          </Box>
          <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copier}>
            {copie ? 'Copié !' : 'Copier'}
          </Button>
        </Stack>

        <Button
          variant="contained"
          startIcon={<WhatsAppIcon />}
          onClick={partagerWhatsApp}
          fullWidth
          sx={{ bgcolor: brand.whatsapp, color: '#fff', '&:hover': { bgcolor: brand.whatsappDark } }}
        >
          Partager sur WhatsApp
        </Button>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={GroupsIcon} label="Filleuls" value={stats.filleuls_total} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={PaidIcon} label="Total gagné" value={`${stats.total_gagne} F`} accent />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={AccountBalanceWalletIcon} label="Solde disponible" value={`${stats.solde} F`} accent />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={PaymentsIcon} label="Déjà retiré" value={`${stats.total_retire} F`} />
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <DashboardTrendChart endpoint="/invitations/graphiques" color="#F59E0B" />
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <AccountBalanceWalletIcon color="warning" />
          <Typography variant="h6" fontWeight={700}>
            Mon solde
          </Typography>
        </Stack>
        {messageRetrait && (
          <Alert severity={messageRetrait.type} sx={{ mb: 2 }}>
            {messageRetrait.text}
          </Alert>
        )}
        <Button
          variant="contained"
          color="warning"
          disabled={stats.solde < SEUIL_RETRAIT || envoiRetrait}
          onClick={demanderRetrait}
        >
          {envoiRetrait ? 'Envoi...' : 'Demander mon retrait'}
        </Button>
        {stats.solde < SEUIL_RETRAIT && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Retrait possible à partir de {SEUIL_RETRAIT} F CFA.
          </Typography>
        )}
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Historique de mes gains
          </Typography>
          <Paper variant="outlined">
            {gains.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                Aucun gain pour l'instant.
              </Typography>
            ) : (
              <List dense>
                {gains.map((i, idx) => (
                  <ListItem key={i.id} divider={idx < gains.length - 1}>
                    <ListItemText
                      primary={`+${i.commission_montant} F CFA`}
                      secondary={`${i.filleul.nom} — ${new Date(i.updated_at).toLocaleDateString('fr-FR')}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Historique de mes retraits
          </Typography>
          <Paper variant="outlined">
            {retraits.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                Aucun retrait pour l'instant.
              </Typography>
            ) : (
              <List dense>
                {retraits.map((r, idx) => (
                  <ListItem key={r.id} divider={idx < retraits.length - 1}>
                    <ListItemText
                      primary={`${r.montant} F CFA`}
                      secondary={new Date(r.created_at).toLocaleDateString('fr-FR')}
                    />
                    <Chip
                      size="small"
                      color={STATUTS_RETRAIT[r.statut]?.color ?? 'default'}
                      label={STATUTS_RETRAIT[r.statut]?.label ?? r.statut}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} gutterBottom>
        Mes filleuls
      </Typography>
      <Paper variant="outlined" sx={{ mb: 3 }}>
        {filleuls.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            Aucun filleul pour l'instant.
          </Typography>
        ) : (
          <List dense>
            {filleuls.map((i, idx) => (
              <ListItem key={i.id} divider={idx < filleuls.length - 1}>
                <ListItemText primary={i.filleul.nom} secondary={new Date(i.updated_at).toLocaleDateString('fr-FR')} />
                <Stack direction="row" spacing={1}>
                  {i.commission_montant ? (
                    <Chip size="small" color="warning" label={`Commission ${i.commission_montant} F`} />
                  ) : (
                    <Chip size="small" variant="outlined" label="En attente de 1er paiement" />
                  )}
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Typography variant="h6" fontWeight={700} gutterBottom>
        Tu as reçu un code ?
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack component="form" direction="row" spacing={2} onSubmit={soumettreCode}>
          <TextField
            label="Code de parrainage"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            fullWidth
            required
          />
          <Button type="submit" variant="outlined" sx={{ whiteSpace: 'nowrap' }}>
            Valider
          </Button>
        </Stack>
        {redeemMessage && (
          <Alert severity={redeemMessage.type} sx={{ mt: 2 }}>
            {redeemMessage.text}
          </Alert>
        )}
      </Paper>
    </Container>
  )
}
