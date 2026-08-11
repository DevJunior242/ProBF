import { useEffect, useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PhotoUpload from '../components/PhotoUpload'
import AjouterMetierDialog from '../components/AjouterMetierDialog'

export default function ProfileEditPage() {
  const { user } = useAuth()
  const [metiers, setMetiers] = useState([])
  const [quartiers, setQuartiers] = useState([])
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [selectedMetiers, setSelectedMetiers] = useState([])
  const [selectedQuartiers, setSelectedQuartiers] = useState([])
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [dialogMetierOuvert, setDialogMetierOuvert] = useState(false)

  const [nouveauPortfolio, setNouveauPortfolio] = useState({ photo_avant: '', photo_apres: '', description: '' })

  const charger = () => {
    setLoading(true)
    Promise.all([api.get('/metiers'), api.get('/quartiers'), api.get(`/pros/${user.id}`)]).then(
      ([m, q, pro]) => {
        setMetiers(m.data)
        setQuartiers(q.data)
        setBio(pro.data.profile?.bio ?? '')
        setAvatar(pro.data.profile?.avatar ?? null)
        setSelectedMetiers(pro.data.metiers?.map((x) => x.id) ?? [])
        setSelectedQuartiers(pro.data.quartiers?.map((x) => x.id) ?? [])
        setPortfolios(pro.data.portfolios ?? [])
        setLoading(false)
      },
    )
  }

  useEffect(charger, [user.id])

  const ajouterMetier = async (nom) => {
    const { data } = await api.post('/metiers', { nom })
    setMetiers((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom))))
    return data
  }

  const enregistrer = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await api.put('/profile', { bio, avatar, metiers: selectedMetiers, quartiers: selectedQuartiers })
      setMessage({ type: 'success', text: 'Profil mis à jour.' })
    } catch {
      setMessage({ type: 'error', text: 'Impossible de sauvegarder le profil.' })
    } finally {
      setSaving(false)
    }
  }

  const ajouterPortfolio = async (e) => {
    e.preventDefault()
    if (!nouveauPortfolio.photo_avant) return
    const { data } = await api.post('/portfolios', nouveauPortfolio)
    setPortfolios([data, ...portfolios])
    setNouveauPortfolio({ photo_avant: '', photo_apres: '', description: '' })
  }

  const supprimerPortfolio = async (id) => {
    await api.delete(`/portfolios/${id}`)
    setPortfolios(portfolios.filter((p) => p.id !== id))
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Mon profil
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Stack component="form" spacing={3} onSubmit={enregistrer}>
          {message && <Alert severity={message.type}>{message.text}</Alert>}

          <PhotoUpload label="Photo de profil" type="avatar" value={avatar} onChange={setAvatar} variant="avatar" />

          <TextField label="Bio" multiline minRows={3} value={bio} onChange={(e) => setBio(e.target.value)} />

          <FormControl>
            <InputLabel>Métiers</InputLabel>
            <Select
              multiple
              value={selectedMetiers}
              onChange={(e) => {
                const valeurs = e.target.value
                if (valeurs.includes('__autre__')) {
                  setDialogMetierOuvert(true)
                  return
                }
                setSelectedMetiers(valeurs)
              }}
              input={<OutlinedInput label="Métiers" />}
              renderValue={(selected) => (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {selected.map((id) => (
                    <Chip key={id} label={metiers.find((m) => m.id === id)?.nom} size="small" />
                  ))}
                </Stack>
              )}
            >
              {metiers.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nom}
                </MenuItem>
              ))}
              <MenuItem value="__autre__" sx={{ fontWeight: 600, color: 'primary.main' }}>
                + Autre (préciser)
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Quartiers d'intervention</InputLabel>
            <Select
              multiple
              value={selectedQuartiers}
              onChange={(e) => setSelectedQuartiers(e.target.value)}
              input={<OutlinedInput label="Quartiers d'intervention" />}
              renderValue={(selected) => (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {selected.map((id) => (
                    <Chip key={id} label={quartiers.find((q) => q.id === id)?.nom} size="small" />
                  ))}
                </Stack>
              )}
            >
              {quartiers.map((q) => (
                <MenuItem key={q.id} value={q.id}>
                  {q.nom} — {q.ville?.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" size="large" disabled={saving}>
            Enregistrer
          </Button>
        </Stack>
      </Paper>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Mes réalisations
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack component="form" spacing={2} onSubmit={ajouterPortfolio}>
          <PhotoUpload
            label="Photo avant"
            type="portfolio"
            value={nouveauPortfolio.photo_avant}
            onChange={(url) => setNouveauPortfolio({ ...nouveauPortfolio, photo_avant: url })}
            variant="photo"
          />
          <PhotoUpload
            label="Photo après (optionnel)"
            type="portfolio"
            value={nouveauPortfolio.photo_apres}
            onChange={(url) => setNouveauPortfolio({ ...nouveauPortfolio, photo_apres: url })}
            variant="photo"
          />
          <TextField
            label="Description"
            value={nouveauPortfolio.description}
            onChange={(e) => setNouveauPortfolio({ ...nouveauPortfolio, description: e.target.value })}
          />
          <Button type="submit" variant="outlined" disabled={!nouveauPortfolio.photo_avant}>
            Ajouter au portfolio
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {portfolios.map((p) => (
          <Grid key={p.id} size={{ xs: 6, sm: 4 }}>
            <Card variant="outlined">
              <Box component="img" src={p.photo_avant} alt="" sx={{ width: '100%', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" noWrap>
                  {p.description || 'Sans description'}
                </Typography>
                <IconButton size="small" onClick={() => supprimerPortfolio(p.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <AjouterMetierDialog
        open={dialogMetierOuvert}
        onClose={() => setDialogMetierOuvert(false)}
        onAjoute={async (nom) => {
          const metier = await ajouterMetier(nom)
          setSelectedMetiers((prev) => [...prev, metier.id])
        }}
      />
    </Container>
  )
}
