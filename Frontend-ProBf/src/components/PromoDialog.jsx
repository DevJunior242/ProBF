import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  Typography,
} from '@mui/material'
import api from '../api/client'
import PhotoUpload from './PhotoUpload'

const VIDE = { prix_promo: '', texte: '', moyen_paiement_id: '', reference_transaction: '', preuve: null }

export default function PromoDialog({ open, onClose, produit, onSuccess }) {
  const [moyens, setMoyens] = useState([])
  const [form, setForm] = useState(VIDE)
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    if (open) {
      api.get('/moyens-paiement').then(({ data }) => setMoyens(data))
      setForm(VIDE)
      setErreur(null)
    }
  }, [open])

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur(null)
    setEnvoi(true)
    try {
      await api.post('/promos', { ...form, produit_id: produit.id })
      onSuccess?.()
      onClose()
    } catch {
      setErreur("Impossible d'envoyer ta demande, vérifie les champs.")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Mettre "{produit?.nom}" en Bon Plan</DialogTitle>
      <Stack component="form" onSubmit={soumettre}>
        <DialogContent>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              1000 F CFA pour afficher ce produit dans "Bons plans du jour" pendant 7 jours.
            </Typography>
            {erreur && <Alert severity="error">{erreur}</Alert>}
            <TextField
              label="Prix promo (facultatif)"
              type="number"
              value={form.prix_promo}
              onChange={(e) => setForm({ ...form, prix_promo: e.target.value })}
              helperText={`Prix normal : ${produit?.prix} F CFA`}
            />
            <TextField
              label="Texte de la promo (facultatif)"
              placeholder="Ex: -10% cette semaine"
              value={form.texte}
              onChange={(e) => setForm({ ...form, texte: e.target.value })}
            />
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={envoi}>
            {envoi ? 'Envoi...' : 'Envoyer ma déclaration'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  )
}
