import { useEffect, useState } from 'react'
import {
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../api/client'

export default function AdminUtilisateurs() {
  const [recherche, setRecherche] = useState('')
  const [rechercheDebattue, setRechercheDebattue] = useState('')
  const [page, setPage] = useState(1)
  const [utilisateurs, setUtilisateurs] = useState([])
  const [dernierePage, setDernierePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [aSupprimer, setASupprimer] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setRechercheDebattue(recherche)
    }, 400)
    return () => clearTimeout(t)
  }, [recherche])

  const charger = () => {
    setLoading(true)
    api
      .get('/admin/utilisateurs', { params: { recherche: rechercheDebattue || undefined, page } })
      .then(({ data }) => {
        setUtilisateurs(data.data)
        setDernierePage(data.last_page)
      })
      .finally(() => setLoading(false))
  }

  useEffect(charger, [rechercheDebattue, page])

  const confirmerSuppression = async () => {
    await api.delete(`/admin/utilisateurs/${aSupprimer.id}`)
    setUtilisateurs(utilisateurs.filter((u) => u.id !== aSupprimer.id))
    setASupprimer(null)
  }

  return (
    <Stack spacing={2}>
      <TextField
        placeholder="Rechercher par nom, téléphone ou email"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        sx={{ maxWidth: 400 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {loading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : utilisateurs.length === 0 ? (
        <Typography color="text.secondary">Aucun utilisateur trouvé.</Typography>
      ) : (
        <>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôles</TableCell>
                  <TableCell>Inscrit le</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {utilisateurs.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nom}</TableCell>
                    <TableCell>{u.telephone}</TableCell>
                    <TableCell>{u.email ?? '—'}</TableCell>
                    <TableCell>
                      {u.roles.map((r) => (
                        <Chip key={r.id} size="small" label={r.nom} sx={{ mr: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setASupprimer(u)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {dernierePage > 1 && (
            <Stack sx={{ alignItems: 'center' }}>
              <Pagination count={dernierePage} page={page} onChange={(_, v) => setPage(v)} />
            </Stack>
          )}
        </>
      )}

      <Dialog open={Boolean(aSupprimer)} onClose={() => setASupprimer(null)}>
        <DialogTitle>Supprimer ce compte ?</DialogTitle>
        <DialogContent>
          <Typography>
            Tu es sur le point de supprimer définitivement le compte de <strong>{aSupprimer?.nom}</strong> et
            toutes ses données associées (profil, messages, avis, etc.). Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setASupprimer(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={confirmerSuppression}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
