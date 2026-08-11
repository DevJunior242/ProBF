import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Box,
  Grid,
} from '@mui/material'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PhotoUpload from '../components/PhotoUpload'

const LABEL_TYPE = { 1: 'Pro', 2: 'Fournisseur' }

const STATUTS = {
  1: { label: 'En attente', color: 'warning' },
  2: { label: 'Validé', color: 'success' },
  3: { label: 'Rejeté', color: 'error' },
}

const VIDE = { plan_abonnement_id: '', moyen_paiement_id: '', montant: '', reference_transaction: '', preuve: null }

export default function AbonnementPage() {
  const { hasRole } = useAuth()

  const [moyens, setMoyens] = useState([])
  const [plans, setPlans] = useState([])
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(VIDE)
  const [message, setMessage] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  const charger = () => {
    setLoading(true)
    Promise.all([api.get('/moyens-paiement'), api.get('/plans-abonnement'), api.get('/paiements/moi')]).then(
      ([m, p, h]) => {
        setMoyens(m.data)
        setPlans(p.data.filter((plan) => hasRole(LABEL_TYPE[plan.type]?.toLowerCase())))
        setHistorique(h.data)
        setLoading(false)
      }
    )
  }

  useEffect(charger, [])

  const planSelectionne = plans.find((p) => p.id === form.plan_abonnement_id)

  const choisirPlan = (plan) => {
    setForm({ ...form, plan_abonnement_id: plan.id, montant: plan.montant })
  }

  const soumettre = async (e) => {
    e.preventDefault()
    setMessage(null)
    setEnvoi(true)
    try {
      await api.post('/paiements', form)
      setMessage({ type: 'success', text: 'Paiement envoyé, en attente de validation par un admin.' })
      setForm(VIDE)
      charger()
    } catch {
      setMessage({ type: 'error', text: "Impossible d'envoyer ce paiement, vérifie les champs." })
    } finally {
      setEnvoi(false)
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Régler mon abonnement
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Choisis un plan, fais un dépôt via l'un des moyens ci-dessous, puis déclare ton paiement. Un admin le valide
        manuellement sous peu.
      </Typography>

      <Typography variant="h6" fontWeight={700} gutterBottom>
        Choisir un plan
      </Typography>
      {plans.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          Aucun plan tarifaire n'est configuré pour le moment.
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {plans.map((plan) => (
            <Grid key={plan.id} size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined" sx={{ borderColor: form.plan_abonnement_id === plan.id ? 'primary.main' : undefined, borderWidth: form.plan_abonnement_id === plan.id ? 2 : 1 }}>
                <CardActionArea onClick={() => choisirPlan(plan)} sx={{ p: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    {LABEL_TYPE[plan.type]}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {plan.nom}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={700}>
                    {plan.montant} F CFA
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.duree_jours} jours
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h6" fontWeight={700} gutterBottom>
        Moyens de paiement
      </Typography>
      <Stack spacing={2} sx={{ mb: 4 }}>
        {moyens.map((m) => (
          <Card key={m.id} variant="outlined">
            <CardContent>
              <Typography fontWeight={600}>{m.nom}</Typography>
              <Typography variant="h6" color="primary">
                {m.numero}
              </Typography>
              {m.nom_compte && <Typography color="text.secondary">Compte : {m.nom_compte}</Typography>}
              {m.instructions && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {m.instructions}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
        {moyens.length === 0 && (
          <Alert severity="info">Aucun moyen de paiement n'est configuré pour le moment.</Alert>
        )}
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Déclarer mon paiement
        </Typography>
        <Stack component="form" spacing={2} onSubmit={soumettre}>
          {message && <Alert severity={message.type}>{message.text}</Alert>}

          {planSelectionne && (
            <Alert severity="info">
              Plan {LABEL_TYPE[planSelectionne.type]} — {planSelectionne.nom} ({planSelectionne.duree_jours} jours)
            </Alert>
          )}

          <TextField
            select
            label="Moyen de paiement utilisé"
            value={form.moyen_paiement_id}
            onChange={(e) => setForm({ ...form, moyen_paiement_id: e.target.value })}
          >
            <MenuItem value="">Non précisé</MenuItem>
            {moyens.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nom} — {m.numero}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Montant déposé (F CFA)"
            type="number"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value })}
            required
          />

          <TextField
            label="Référence de la transaction (facultatif)"
            value={form.reference_transaction}
            onChange={(e) => setForm({ ...form, reference_transaction: e.target.value })}
          />

          <PhotoUpload
            label="Capture d'écran de la transaction (facultatif)"
            type="preuve"
            value={form.preuve}
            onChange={(url) => setForm({ ...form, preuve: url })}
            variant="photo"
          />

          <Button type="submit" variant="contained" size="large" disabled={envoi || !form.plan_abonnement_id}>
            {envoi ? 'Envoi...' : 'Envoyer ma déclaration de paiement'}
          </Button>
        </Stack>
      </Paper>

      <Typography variant="h6" fontWeight={700} gutterBottom>
        Historique de mes paiements
      </Typography>
      {historique.length === 0 ? (
        <Typography color="text.secondary">Aucun paiement déclaré pour l'instant.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {historique.map((p) => (
            <Card key={p.id} variant="outlined">
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography fontWeight={600}>
                      {p.contexte === 'boost' && 'Boost 24h'}
                      {p.contexte === 'devis_express' && 'Devis Express'}
                      {p.contexte === 'promo' && `Bon Plan Matos — ${p.promo?.produit?.nom ?? ''}`}
                      {(!p.contexte || p.contexte === 'abonnement') && (
                        <>
                          {LABEL_TYPE[p.type] ?? p.type}
                          {p.plan_abonnement && ` — ${p.plan_abonnement.nom}`}
                        </>
                      )}
                      {' '}— {p.montant} F CFA
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.moyen_paiement?.nom ?? 'Moyen non précisé'} —{' '}
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={STATUTS[p.statut]?.color ?? 'default'}
                    label={STATUTS[p.statut]?.label ?? p.statut}
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  )
}
