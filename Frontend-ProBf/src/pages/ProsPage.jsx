import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import api from '../api/client'
import CardPro from '../components/CardPro'

export default function ProsPage() {
  const [searchParams] = useSearchParams()
  const [metiers, setMetiers] = useState([])
  const [quartiers, setQuartiers] = useState([])
  const [metier, setMetier] = useState(searchParams.get('metier') ?? '')
  const [quartierId, setQuartierId] = useState(searchParams.get('quartier') ?? '')
  const [rechercheSaisie, setRechercheSaisie] = useState(searchParams.get('recherche') ?? '')
  const [recherche, setRecherche] = useState(searchParams.get('recherche') ?? '')
  const [page, setPage] = useState(1)
  const [pros, setPros] = useState([])
  const [dernierePage, setDernierePage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.get('/metiers'), api.get('/quartiers')]).then(([m, q]) => {
      setMetiers(m.data)
      setQuartiers(q.data)
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setRecherche(rechercheSaisie)
    }, 400)
    return () => clearTimeout(t)
  }, [rechercheSaisie])

  useEffect(() => {
    setLoading(true)
    setError(null)
    api
      .get('/pros', {
        params: {
          metier: metier || undefined,
          quartier: quartierId || undefined,
          recherche: recherche || undefined,
          page,
        },
      })
      .then(({ data }) => {
        setPros(data.data)
        setDernierePage(data.last_page)
        setTotal(data.total)
      })
      .catch(() => setError("Impossible de charger les pros pour l'instant."))
      .finally(() => setLoading(false))
  }, [metier, quartierId, recherche, page])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Trouve un artisan
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Filtre par métier et par quartier pour trouver le bon pro près de chez toi.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          label="Nom du pro"
          placeholder="Ex: Pro Demo"
          value={rechercheSaisie}
          onChange={(e) => setRechercheSaisie(e.target.value)}
          sx={{ minWidth: 220 }}
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

        <TextField
          select
          label="Métier"
          value={metier}
          onChange={(e) => {
            setPage(1)
            setMetier(e.target.value)
          }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Tous les métiers</MenuItem>
          {metiers.map((m) => (
            <MenuItem key={m.id} value={m.slug}>
              {m.nom}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Quartier"
          value={quartierId}
          onChange={(e) => {
            setPage(1)
            setQuartierId(e.target.value)
          }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Tous les quartiers</MenuItem>
          {quartiers.map((q) => (
            <MenuItem key={q.id} value={q.id}>
              {q.nom} — {q.ville?.nom}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Pros disponibles
        </Typography>
        {!loading && total > 0 && (
          <Typography variant="body2" color="text.secondary">
            {total} résultat{total > 1 ? 's' : ''}
          </Typography>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : pros.length === 0 ? (
        <Typography color="text.secondary">Aucun pro trouvé pour ces critères.</Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {pros.map((pro) => (
              <Grid key={pro.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <CardPro pro={pro} />
              </Grid>
            ))}
          </Grid>

          {dernierePage > 1 && (
            <Stack sx={{ alignItems: 'center', mt: 4 }}>
              <Pagination
                count={dernierePage}
                page={page}
                onChange={(_, value) => {
                  setPage(value)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                color="primary"
              />
            </Stack>
          )}
        </>
      )}
    </Container>
  )
}
