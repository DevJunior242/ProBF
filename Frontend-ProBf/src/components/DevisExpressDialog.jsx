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

const VIDE = { moyen_paiement_id: '', reference_transaction: '', preuve: null }

export default function DevisExpressDialog({ open, onClose, demandeId, onSuccess }) {
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
      await api.post('/devis-express', { ...form, demande_id: demandeId })
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
      <DialogTitle>Devis Express</DialogTitle>
      <Stack component="form" onSubmit={soumettre}>
        <DialogContent>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              25 F CFA pour prévenir immédiatement jusqu'à 3 pros disponibles de ton besoin.
            </Typography>
            {erreur && <Alert severity="error">{erreur}</Alert>}
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
