import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, Stack } from '@mui/material'

export default function AjouterQuartierDialog({ open, onClose, onAjoute }) {
  const [ville, setVille] = useState('')
  const [nom, setNom] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  const fermer = () => {
    setVille('')
    setNom('')
    setErreur(null)
    onClose()
  }

  const soumettre = async (e) => {
    e.preventDefault()
    if (!ville.trim() || !nom.trim()) return
    setEnvoi(true)
    setErreur(null)
    try {
      await onAjoute({ ville: ville.trim(), nom: nom.trim() })
      fermer()
    } catch {
      setErreur("Impossible d'ajouter ce quartier, réessaie.")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <Dialog open={open} onClose={fermer} maxWidth="xs" fullWidth>
      <DialogTitle>Ajouter un quartier</DialogTitle>
      <form onSubmit={soumettre}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Ville"
              placeholder="Ex : Ouagadougou"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
            />
            <TextField
              fullWidth
              label="Quartier"
              placeholder="Ex : Cissin"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
            {erreur && <Alert severity="error">{erreur}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={fermer}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={envoi || !ville.trim() || !nom.trim()}>
            {envoi ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
