import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material'

export default function AjouterMetierDialog({ open, onClose, onAjoute }) {
  const [nom, setNom] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  const fermer = () => {
    setNom('')
    setErreur(null)
    onClose()
  }

  const soumettre = async (e) => {
    e.preventDefault()
    if (!nom.trim()) return
    setEnvoi(true)
    setErreur(null)
    try {
      await onAjoute(nom.trim())
      fermer()
    } catch {
      setErreur("Impossible d'ajouter ce métier, réessaie.")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <Dialog open={open} onClose={fermer} maxWidth="xs" fullWidth>
      <DialogTitle>Ajouter un métier</DialogTitle>
      <form onSubmit={soumettre}>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nom du métier"
            placeholder="Ex : Peintre en bâtiment"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            sx={{ mt: 1 }}
          />
          {erreur && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {erreur}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fermer}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={envoi || !nom.trim()}>
            {envoi ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
