import { useEffect, useState } from 'react'
import {
  Paper,
  Stack,
  TextField,
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
import PhotoUpload from '../PhotoUpload'

const VIDE = { nom: '', numero: '', nom_compte: '', instructions: '', logo: null, actif: true }

export default function AdminMoyensPaiement() {
  const [moyens, setMoyens] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(VIDE)
  const [editingId, setEditingId] = useState(null)

  const charger = () => {
    setLoading(true)
    api.get('/moyens-paiement').then(({ data }) => {
      setMoyens(data)
      setLoading(false)
    })
  }

  useEffect(charger, [])

  const soumettre = async (e) => {
    e.preventDefault()
    if (editingId) {
      const { data } = await api.put(`/moyens-paiement/${editingId}`, form)
      setMoyens(moyens.map((m) => (m.id === editingId ? data : m)))
    } else {
      const { data } = await api.post('/moyens-paiement', form)
      setMoyens([...moyens, data])
    }
    setForm(VIDE)
    setEditingId(null)
  }

  const modifier = (moyen) => {
    setEditingId(moyen.id)
    setForm({
      nom: moyen.nom,
      numero: moyen.numero,
      nom_compte: moyen.nom_compte ?? '',
      instructions: moyen.instructions ?? '',
      logo: moyen.logo,
      actif: moyen.actif,
    })
  }

  const supprimer = async (id) => {
    await api.delete(`/moyens-paiement/${id}`)
    setMoyens(moyens.filter((m) => m.id !== id))
  }

  const toggleActif = async (moyen) => {
    const { data } = await api.put(`/moyens-paiement/${moyen.id}`, { actif: !moyen.actif })
    setMoyens(moyens.map((m) => (m.id === moyen.id ? data : m)))
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
          {editingId ? 'Modifier le moyen de paiement' : 'Ajouter un moyen de paiement'}
        </Typography>
        <Stack component="form" spacing={2} onSubmit={soumettre} sx={{ maxWidth: 480 }}>
          <PhotoUpload label="Logo" type="logo" value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} variant="avatar" />
          <TextField label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          <TextField label="Numéro" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} required />
          <TextField
            label="Nom du compte"
            value={form.nom_compte}
            onChange={(e) => setForm({ ...form, nom_compte: e.target.value })}
          />
          <TextField
            label="Instructions"
            multiline
            minRows={2}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
          <FormControlLabel
            control={<Switch checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} />}
            label="Actif (visible pour les pros/fournisseurs)"
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
        {moyens.map((moyen) => (
          <Card key={moyen.id} variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {moyen.logo && (
                <Box component="img" src={moyen.logo} alt="" sx={{ width: 48, height: 48, objectFit: 'contain' }} />
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={600}>
                  {moyen.nom} {!moyen.actif && <Typography component="span" variant="body2" color="text.secondary">(inactif)</Typography>}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {moyen.numero} {moyen.nom_compte && `— ${moyen.nom_compte}`}
                </Typography>
              </Box>
              <FormControlLabel control={<Switch checked={moyen.actif} onChange={() => toggleActif(moyen)} />} label="Actif" />
              <IconButton onClick={() => modifier(moyen)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => supprimer(moyen.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}
