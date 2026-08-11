import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Chip,
} from '@mui/material'
import CampaignIcon from '@mui/icons-material/Campaign'
import api from '../api/client'
import CardFournisseur from '../components/CardFournisseur'

export default function FournisseursPage() {
  const [metiers, setMetiers] = useState([])
  const [categories, setCategories] = useState([])
  const [metier, setMetier] = useState('')
  const [categorie, setCategorie] = useState('')
  const [fournisseurs, setFournisseurs] = useState([])
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.get('/metiers'), api.get('/categories-produit'), api.get('/promos')]).then(([m, c, p]) => {
      setMetiers(m.data)
      setCategories(c.data)
      setPromos(p.data)
    })
  }, [])

  const metierSelectionne = metiers.find((m) => m.slug === metier)
  const categoriesFiltrees = metierSelectionne
    ? categories.filter((c) => !c.metier_id || c.metier_id === metierSelectionne.id)
    : categories

  useEffect(() => {
    setLoading(true)
    setError(null)
    api
      .get('/fournisseurs', { params: { metier: metier || undefined, categorie: categorie || undefined } })
      .then(({ data }) => setFournisseurs(data.data))
      .catch(() => setError("Impossible de charger les fournisseurs pour l'instant."))
      .finally(() => setLoading(false))
  }, [metier, categorie])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Fournisseurs & matériel
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Trouve le matériel qu'il te faut pour ta prestation, directement chez nos fournisseurs partenaires.
      </Typography>

      {promos.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <CampaignIcon color="warning" />
            <Typography variant="h6" fontWeight={700}>
              Bons plans du jour
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
            {promos.map((promo) => (
              <Card key={promo.id} variant="outlined" sx={{ minWidth: 220, flexShrink: 0 }}>
                <CardActionArea component={Link} to={`/fournisseurs/${promo.fournisseur.id}`}>
                  {promo.produit.photo && (
                    <Box
                      component="img"
                      src={promo.produit.photo}
                      alt=""
                      sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                    />
                  )}
                  <CardContent>
                    <Typography fontWeight={600} noWrap>
                      {promo.produit.nom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {promo.fournisseur.fournisseur_profile?.nom_boutique ?? promo.fournisseur.nom}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
                      {promo.prix_promo ? (
                        <>
                          <Typography variant="body2" sx={{ textDecoration: 'line-through' }} color="text.secondary">
                            {promo.produit.prix} F
                          </Typography>
                          <Typography fontWeight={700} color="warning.main">
                            {promo.prix_promo} F
                          </Typography>
                        </>
                      ) : (
                        <Typography fontWeight={700} color="warning.main">
                          {promo.produit.prix} F
                        </Typography>
                      )}
                    </Stack>
                    {promo.texte && <Chip size="small" label={promo.texte} sx={{ mt: 1 }} />}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          select
          label="Métier concerné"
          value={metier}
          onChange={(e) => {
            setMetier(e.target.value)
            setCategorie('')
          }}
          sx={{ minWidth: 260 }}
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
          label="Catégorie de produit"
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          sx={{ minWidth: 260 }}
        >
          <MenuItem value="">Toutes les catégories</MenuItem>
          {categoriesFiltrees.map((c) => (
            <MenuItem key={c.id} value={c.slug}>
              {c.nom}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : fournisseurs.length === 0 ? (
        <Typography color="text.secondary">Aucun fournisseur trouvé pour ces critères.</Typography>
      ) : (
        <Grid container spacing={2}>
          {fournisseurs.map((f) => (
            <Grid key={f.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <CardFournisseur fournisseur={f} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
