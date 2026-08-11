import { useEffect, useState } from 'react'
import {
  Stack,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  TextField,
  MenuItem,
} from '@mui/material'
import api from '../../api/client'

export default function AdminAbonnements() {
  const [lignes, setLignes] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [role, setRole] = useState('')
  const [statut, setStatut] = useState('')
  const [visibilite, setVisibilite] = useState('')

  const charger = () => {
    setLoading(true)
    api
      .get('/admin/abonnements', {
        params: {
          recherche: recherche || undefined,
          role: role || undefined,
          statut: statut || undefined,
          visibilite: visibilite || undefined,
        },
      })
      .then(({ data }) => {
        setLignes(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    const t = setTimeout(charger, recherche ? 350 : 0)
    return () => clearTimeout(t)
  }, [recherche, role, statut, visibilite])

  const toggleMasque = async (id) => {
    await api.patch(`/admin/utilisateurs/${id}/masquer`)
    setLignes(lignes.map((l) => (l.id === id ? { ...l, masque: !l.masque } : l)))
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
        <TextField
          label="Rechercher (nom, téléphone, email)"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          sx={{ minWidth: 260 }}
        />
        <TextField select label="Rôle" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="pro">Pro</MenuItem>
          <MenuItem value="fournisseur">Fournisseur</MenuItem>
        </TextField>
        <TextField
          select
          label="Statut abonnement"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="actif">Actif</MenuItem>
          <MenuItem value="impaye">Impayé</MenuItem>
        </TextField>
        <TextField
          select
          label="Visibilité"
          value={visibilite}
          onChange={(e) => setVisibilite(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Toutes</MenuItem>
          <MenuItem value="visible">Visible</MenuItem>
          <MenuItem value="masque">Masqué</MenuItem>
        </TextField>
      </Stack>

      {loading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : lignes.length === 0 ? (
        <Typography color="text.secondary">Aucun résultat.</Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Rôles</TableCell>
                <TableCell>Abonnement</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Visibilité</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {lignes.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.nom}</TableCell>
                  <TableCell>{l.telephone}</TableCell>
                  <TableCell>{l.roles.join(', ')}</TableCell>
                  <TableCell>
                    {l.abonnement
                      ? `${l.abonnement.type === 1 ? 'Pro' : 'Fournisseur'} — jusqu'au ${new Date(l.abonnement.date_fin).toLocaleDateString('fr-FR')}`
                      : 'Aucun'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={l.abonnement_actif ? 'Actif' : 'Impayé'}
                      color={l.abonnement_actif ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={l.masque ? 'Masqué' : 'Visible'}
                      color={l.masque ? 'default' : 'primary'}
                      variant={l.masque ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => toggleMasque(l.id)}>
                      {l.masque ? 'Réafficher' : 'Masquer'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  )
}
