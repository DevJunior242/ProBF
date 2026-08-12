import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Box,
  Chip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import BoltIcon from '@mui/icons-material/Bolt'
import CampaignIcon from '@mui/icons-material/Campaign'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PhotoUpload from '../components/PhotoUpload'
import DashboardTrendChart from '../components/DashboardTrendChart'
import BoostDialog from '../components/BoostDialog'
import PromoDialog from '../components/PromoDialog'
import AjouterMetierDialog from '../components/AjouterMetierDialog'

function StatCard({ label, value }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

const PRODUIT_VIDE = { metier_id: '', categorie_id: '', nom: '', prix: '', photo: null }

export default function FournisseurDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [metiers, setMetiers] = useState([])
  const [categories, setCategories] = useState([])
  const [boutique, setBoutique] = useState({ nom_boutique: '', adresse: '', logo: null })
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [messageBoutique, setMessageBoutique] = useState(null)
  const [messageProduit, setMessageProduit] = useState(null)
  const [produitForm, setProduitForm] = useState(PRODUIT_VIDE)
  const [editingId, setEditingId] = useState(null)
  const [boostOuvert, setBoostOuvert] = useState(false)
  const [promoProduit, setPromoProduit] = useState(null)
  const [messagePromo, setMessagePromo] = useState(null)
  const [dialogMetierOuvert, setDialogMetierOuvert] = useState(false)

  const charger = () => {
    setLoading(true)
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/metiers'),
      api.get('/categories-produit'),
      api.get('/fournisseur-profile'),
      api.get('/produits', { params: { fournisseur_id: user.id } }),
    ]).then(([s, m, c, fp, p]) => {
      setStats(s.data)
      setMetiers(m.data)
      setCategories(c.data)
      if (fp.data) {
        setBoutique({ nom_boutique: fp.data.nom_boutique, adresse: fp.data.adresse ?? '', logo: fp.data.logo })
      }
      setProduits(p.data.data)
      setLoading(false)
    })
  }

  const categoriesFiltrees = produitForm.metier_id
    ? categories.filter((c) => !c.metier_id || c.metier_id === produitForm.metier_id)
    : categories

  useEffect(charger, [user.id])

  const ajouterMetier = async (nom) => {
    const { data } = await api.post('/metiers', { nom })
    setMetiers((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom))))
    return data
  }

  const enregistrerBoutique = async (e) => {
    e.preventDefault()
    setMessageBoutique(null)
    try {
      await api.put('/fournisseur-profile', boutique)
      setMessageBoutique({ type: 'success', text: 'Boutique mise à jour.' })
    } catch {
      setMessageBoutique({ type: 'error', text: 'Impossible de sauvegarder.' })
    }
  }

  const soumettreProduit = async (e) => {
    e.preventDefault()
    setMessageProduit(null)
    try {
      if (editingId) {
        const { data } = await api.put(`/produits/${editingId}`, produitForm)
        setProduits(produits.map((p) => (p.id === editingId ? { ...p, ...data } : p)))
      } else {
        const { data } = await api.post('/produits', produitForm)
        setProduits([data, ...produits])
      }
      setProduitForm(PRODUIT_VIDE)
      setEditingId(null)
    } catch (err) {
      if (err.response?.status === 403) {
        setMessageProduit({ type: 'error', text: err.response.data?.message, verification: true })
      } else {
        setMessageProduit({ type: 'error', text: "Impossible d'enregistrer ce produit." })
      }
    }
  }

  const modifierProduit = (produit) => {
    setEditingId(produit.id)
    setProduitForm({
      metier_id: produit.metier_id ?? '',
      categorie_id: produit.categorie_id ?? '',
      nom: produit.nom,
      prix: produit.prix,
      photo: produit.photo,
    })
  }

  const supprimerProduit = async (id) => {
    await api.delete(`/produits/${id}`)
    setProduits(produits.filter((p) => p.id !== id))
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  const joursAvantExpiration = stats.abonnement_actif
    ? Math.ceil((new Date(stats.abonnement_actif.date_fin) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Tableau de bord fournisseur
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 4 }}>
          <StatCard label="Produits" value={stats.produits_total} />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <StatCard label="Leads total" value={stats.leads_total} />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <StatCard label="Leads ce mois" value={stats.leads_ce_mois} />
        </Grid>
      </Grid>

      {joursAvantExpiration !== null && joursAvantExpiration <= 7 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Ton abonnement expire {joursAvantExpiration <= 0 ? "aujourd'hui" : `dans ${joursAvantExpiration} jour${joursAvantExpiration > 1 ? 's' : ''}`}, pense à le renouveler.
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography color="text.secondary">
          Abonnement :{' '}
          {stats.abonnement_actif
            ? `actif jusqu'au ${new Date(stats.abonnement_actif.date_fin).toLocaleDateString('fr-FR')}`
            : 'aucun abonnement actif'}
        </Typography>
        <Button component={Link} to="/abonnement" variant="outlined" size="small">
          Régler mon abonnement
        </Button>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          startIcon={<BoltIcon />}
          onClick={() => setBoostOuvert(true)}
        >
          Booster mon profil (50F/24h)
        </Button>
      </Stack>

      <BoostDialog open={boostOuvert} onClose={() => setBoostOuvert(false)} type={2} />

      <Box sx={{ mb: 4 }}>
        <DashboardTrendChart />
      </Box>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Ma boutique
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Stack component="form" spacing={2} onSubmit={enregistrerBoutique}>
          {messageBoutique && <Alert severity={messageBoutique.type}>{messageBoutique.text}</Alert>}
          <PhotoUpload
            label="Logo"
            type="logo"
            value={boutique.logo}
            onChange={(url) => setBoutique({ ...boutique, logo: url })}
            variant="avatar"
          />
          <TextField
            label="Nom de la boutique"
            value={boutique.nom_boutique}
            onChange={(e) => setBoutique({ ...boutique, nom_boutique: e.target.value })}
            required
          />
          <TextField
            label="Adresse"
            value={boutique.adresse}
            onChange={(e) => setBoutique({ ...boutique, adresse: e.target.value })}
          />
          <Button type="submit" variant="contained">
            Enregistrer
          </Button>
        </Stack>
      </Paper>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Mes produits
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack component="form" spacing={2} onSubmit={soumettreProduit}>
          {messageProduit && (
            <Alert
              severity={messageProduit.type}
              action={
                messageProduit.verification && (
                  <Button color="inherit" size="small" component={Link} to="/verification">
                    Vérifier
                  </Button>
                )
              }
            >
              {messageProduit.text}
            </Alert>
          )}
          <PhotoUpload
            label="Photo du produit"
            type="produit"
            value={produitForm.photo}
            onChange={(url) => setProduitForm({ ...produitForm, photo: url })}
            variant="photo"
          />
          <TextField
            select
            label="Métier concerné"
            value={produitForm.metier_id}
            onChange={(e) => {
              if (e.target.value === '__autre__') {
                setDialogMetierOuvert(true)
                return
              }
              setProduitForm({ ...produitForm, metier_id: e.target.value, categorie_id: '' })
            }}
          >
            <MenuItem value="">Aucun</MenuItem>
            {metiers.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nom}
              </MenuItem>
            ))}
            <MenuItem value="__autre__" sx={{ fontWeight: 600, color: 'primary.main' }}>
              + Autre (préciser)
            </MenuItem>
          </TextField>
          <TextField
            select
            label="Catégorie"
            value={produitForm.categorie_id}
            onChange={(e) => setProduitForm({ ...produitForm, categorie_id: e.target.value })}
            helperText="Aide les clients à retrouver ce produit plus facilement"
          >
            <MenuItem value="">Aucune</MenuItem>
            {categoriesFiltrees.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nom}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Nom du produit"
            value={produitForm.nom}
            onChange={(e) => setProduitForm({ ...produitForm, nom: e.target.value })}
            required
          />
          <TextField
            label="Prix (F CFA)"
            type="number"
            value={produitForm.prix}
            onChange={(e) => setProduitForm({ ...produitForm, prix: e.target.value })}
            required
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="outlined">
              {editingId ? 'Mettre à jour' : 'Ajouter le produit'}
            </Button>
            {editingId && (
              <Button
                onClick={() => {
                  setEditingId(null)
                  setProduitForm(PRODUIT_VIDE)
                }}
              >
                Annuler
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {messagePromo && (
        <Alert severity={messagePromo.type} sx={{ mb: 2 }}>
          {messagePromo.text}
        </Alert>
      )}

      <Grid container spacing={2}>
        {produits.map((produit) => (
          <Grid key={produit.id} size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <Stack direction="row" spacing={2} sx={{ p: 2, alignItems: 'center' }}>
                {produit.photo && (
                  <Box component="img" src={produit.photo} alt="" sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1 }} />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600}>{produit.nom}</Typography>
                  {produit.categorie && (
                    <Chip size="small" label={produit.categorie.nom} sx={{ my: 0.5 }} />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {produit.prix} F CFA
                  </Typography>
                </Box>
                <IconButton size="small" color="warning" onClick={() => setPromoProduit(produit)} title="Mettre en Bon Plan">
                  <CampaignIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => modifierProduit(produit)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => supprimerProduit(produit.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PromoDialog
        open={Boolean(promoProduit)}
        produit={promoProduit}
        onClose={() => setPromoProduit(null)}
        onSuccess={() => setMessagePromo({ type: 'success', text: 'Ta demande de Bon Plan a été envoyée, en attente de validation.' })}
      />

      <AjouterMetierDialog
        open={dialogMetierOuvert}
        onClose={() => setDialogMetierOuvert(false)}
        onAjoute={async (nom) => {
          const metier = await ajouterMetier(nom)
          setProduitForm({ ...produitForm, metier_id: metier.id, categorie_id: '' })
        }}
      />
    </Container>
  )
}
