import { useEffect, useState } from 'react'
import {
  Paper,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import api from '../../api/client'

const VIDE = { type: 1, nom: '', duree_jours: '', montant: '', actif: true, ordre: 0 }

const LABEL_TYPE = { 1: 'Pro', 2: 'Fournisseur' }

export default function AdminTarifs() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(VIDE)
  const [editingId, setEditingId] = useState(null)

  const charger = () => {
    setLoading(true)
    api.get('/plans-abonnement').then(({ data }) => {
      setPlans(data)
      setLoading(false)
    })
  }

  useEffect(charger, [])

  const soumettre = async (e) => {
    e.preventDefault()
    if (editingId) {
      const { data } = await api.put(`/plans-abonnement/${editingId}`, form)
      setPlans(plans.map((p) => (p.id === editingId ? data : p)))
    } else {
      const { data } = await api.post('/plans-abonnement', form)
      setPlans([...plans, data])
    }
    setForm(VIDE)
    setEditingId(null)
  }

  const modifier = (plan) => {
    setEditingId(plan.id)
    setForm({
      type: plan.type,
      nom: plan.nom,
      duree_jours: plan.duree_jours,
      montant: plan.montant,
      actif: plan.actif,
      ordre: plan.ordre,
    })
  }

  const supprimer = async (id) => {
    await api.delete(`/plans-abonnement/${id}`)
    setPlans(plans.filter((p) => p.id !== id))
  }

  const toggleActif = async (plan) => {
    const { data } = await api.put(`/plans-abonnement/${plan.id}`, { actif: !plan.actif })
    setPlans(plans.map((p) => (p.id === plan.id ? data : p)))
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {editingId ? 'Modifier le plan' : 'Ajouter un plan tarifaire'}
        </Typography>
        <Stack component="form" spacing={2} onSubmit={soumettre} sx={{ maxWidth: 480 }}>
          <TextField
            select
            label="Concerne"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
          >
            <MenuItem value={1}>Pro</MenuItem>
            <MenuItem value={2}>Fournisseur</MenuItem>
          </TextField>
          <TextField
            label="Nom du plan"
            placeholder="Mensuel, Annuel, Trimestriel..."
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
          />
          <TextField
            label="Durée (jours)"
            type="number"
            value={form.duree_jours}
            onChange={(e) => setForm({ ...form, duree_jours: e.target.value })}
            required
          />
          <TextField
            label="Montant (F CFA)"
            type="number"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value })}
            required
          />
          <TextField
            label="Ordre d'affichage"
            type="number"
            value={form.ordre}
            onChange={(e) => setForm({ ...form, ordre: e.target.value })}
          />
          <FormControlLabel
            control={<Switch checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} />}
            label="Actif (proposé aux pros/fournisseurs)"
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">
              {editingId ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            {editingId && (
              <Button
                onClick={() => {
                  setEditingId(null)
                  setForm(VIDE)
                }}
              >
                Annuler
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {plans.map((plan) => (
          <Card key={plan.id} variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={600}>
                  {LABEL_TYPE[plan.type] ?? plan.type} — {plan.nom}{' '}
                  {!plan.actif && (
                    <Typography component="span" variant="body2" color="text.secondary">
                      (inactif)
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.montant} F CFA — {plan.duree_jours} jours
                </Typography>
              </Box>
              <FormControlLabel control={<Switch checked={plan.actif} onChange={() => toggleActif(plan)} />} label="Actif" />
              <IconButton onClick={() => modifier(plan)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => supprimer(plan.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && <Typography color="text.secondary">Aucun plan configuré.</Typography>}
      </Stack>
    </Stack>
  )
}
