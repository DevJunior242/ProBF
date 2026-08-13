import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Fab,
  Paper,
  Stack,
  Typography,
  IconButton,
  Button,
  Chip,
  TextField,
  Autocomplete,
  Avatar,
  CircularProgress,
  Divider,
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BuildIcon from '@mui/icons-material/Build'
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const FAQ = [
  { q: 'ProBF c’est gratuit ?', r: 'Oui, publier une demande ou chercher un pro est gratuit. Les pros paient un abonnement pour être visibles.' },
  { q: 'Comment je paie l’artisan ?', r: 'Directement avec lui, en espèces ou mobile money — ProBF ne gère pas les paiements entre client et pro.' },
  { q: 'Pourquoi je dois vérifier mon identité ?', r: 'Pour la sécurité de tous : publier une demande ou contacter quelqu’un nécessite une CNIB vérifiée, une seule fois.' },
]

function BulleBot({ children }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
        <SmartToyIcon sx={{ fontSize: 16 }} />
      </Avatar>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', maxWidth: '85%' }}>
        <Typography variant="body2">{children}</Typography>
      </Paper>
    </Stack>
  )
}

export default function ChatbotWidget() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ouvert, setOuvert] = useState(false)
  const [etape, setEtape] = useState('accueil')

  const [metiers, setMetiers] = useState([])
  const [quartiers, setQuartiers] = useState([])
  const [metier, setMetier] = useState(null)
  const [quartier, setQuartier] = useState(null)
  const [description, setDescription] = useState('')

  const [chargement, setChargement] = useState(false)
  const [pros, setPros] = useState(null)

  useEffect(() => {
    if (!ouvert || metiers.length) return
    api.get('/metiers').then(({ data }) => setMetiers(data))
    api.get('/quartiers').then(({ data }) => setQuartiers(data))
  }, [ouvert, metiers.length])

  const estVerifie = user?.verification_statut === 3

  const reinitialiser = () => {
    setEtape('accueil')
    setMetier(null)
    setQuartier(null)
    setDescription('')
    setPros(null)
  }

  const fermer = () => {
    setOuvert(false)
    reinitialiser()
  }

  const chercherPros = async () => {
    setEtape('resultats')
    setChargement(true)
    const { data } = await api.get('/pros', {
      params: { metier: metier.slug, quartier: quartier.id, dispo: true },
    })
    setPros(data.data.slice(0, 3))
    setChargement(false)
  }

  const choisirPro = (pro) => {
    if (!user) {
      navigate('/inscription')
      fermer()
      return
    }
    if (!estVerifie) {
      navigate('/verification')
      fermer()
      return
    }
    navigate(`/pros/${pro.id}`)
    fermer()
  }

  const publierDemande = () => {
    navigate(user ? '/demandes/nouvelle' : '/inscription')
    fermer()
  }

  return (
    <>
      <Fab
        color="primary"
        onClick={() => setOuvert((v) => !v)}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
        aria-label="Assistant ProBF"
      >
        {ouvert ? <CloseIcon /> : <SmartToyIcon />}
      </Fab>

      {ouvert && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 96,
            right: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 'auto' },
            width: { xs: 'auto', sm: 360 },
            maxHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1300,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {etape !== 'accueil' && (
              <IconButton size="small" onClick={() => setEtape('accueil')} sx={{ color: 'inherit' }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <SmartToyIcon fontSize="small" />
            <Typography fontWeight={700} sx={{ flexGrow: 1 }}>
              ProBF Bot
            </Typography>
            <IconButton size="small" onClick={fermer} sx={{ color: 'inherit' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={2} sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
            {etape === 'accueil' && (
              <>
                <BulleBot>Salut ! Je suis ProBF Bot 👋 Je te trouve un artisan en quelques secondes. Que veux-tu faire ?</BulleBot>
                <Stack spacing={1}>
                  <Button variant="outlined" startIcon={<BuildIcon />} onClick={() => setEtape('metier')}>
                    Dépannage urgent
                  </Button>
                  <Button variant="outlined" startIcon={<HomeRepairServiceIcon />} onClick={() => setEtape('metier')}>
                    Devis travaux
                  </Button>
                  <Button variant="outlined" startIcon={<SupportAgentIcon />} onClick={() => setEtape('humain')}>
                    Parler à un humain
                  </Button>
                  <Button variant="outlined" startIcon={<HelpOutlineIcon />} onClick={() => setEtape('faq')}>
                    FAQ
                  </Button>
                </Stack>
              </>
            )}

            {etape === 'metier' && (
              <>
                <BulleBot>Tu as besoin de quel métier ?</BulleBot>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {metiers.map((m) => (
                    <Chip
                      key={m.id}
                      label={m.nom}
                      clickable
                      color={metier?.id === m.id ? 'primary' : 'default'}
                      onClick={() => {
                        setMetier(m)
                        setEtape('quartier')
                      }}
                    />
                  ))}
                  {!metiers.length && <CircularProgress size={20} />}
                </Stack>
              </>
            )}

            {etape === 'quartier' && (
              <>
                <BulleBot>Ok, {metier?.nom.toLowerCase()}. Décris ton besoin en une phrase (optionnel) puis dis-moi ton quartier.</BulleBot>
                <TextField
                  size="small"
                  label="Ton besoin (optionnel)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Autocomplete
                  size="small"
                  options={quartiers}
                  getOptionLabel={(q) => `${q.nom} — ${q.ville?.nom ?? ''}`}
                  value={quartier}
                  onChange={(_, v) => setQuartier(v)}
                  renderInput={(params) => <TextField {...params} label="Quartier" />}
                />
                <Button variant="contained" disabled={!quartier} onClick={chercherPros}>
                  Chercher un pro
                </Button>
              </>
            )}

            {etape === 'resultats' && (
              <>
                {chargement ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : pros?.length ? (
                  <>
                    <BulleBot>
                      J'ai trouvé {pros.length} pro{pros.length > 1 ? 's' : ''} dispo à {quartier?.nom} 👇
                    </BulleBot>
                    <Stack spacing={1.5}>
                      {pros.map((pro) => (
                        <Paper key={pro.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                            <Typography fontWeight={700}>{pro.nom}</Typography>
                            {pro.profile?.badge_verifie && <VerifiedIcon color="primary" sx={{ fontSize: 16 }} />}
                          </Stack>
                          {Number(pro.profile?.note_moyenne) > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              ★ {pro.profile.note_moyenne} ({pro.profile.nb_avis} avis)
                            </Typography>
                          )}
                          <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => choisirPro(pro)}>
                            Choisir {pro.nom.split(' ')[0]}
                          </Button>
                        </Paper>
                      ))}
                    </Stack>
                  </>
                ) : (
                  <>
                    <BulleBot>
                      Aucun {metier?.nom.toLowerCase()} dispo à {quartier?.nom} pour l'instant 😔 Publie ta demande, les
                      pros du quartier pourront te répondre dès qu'ils sont dispo.
                    </BulleBot>
                    <Button variant="contained" onClick={publierDemande}>
                      Publier ma demande
                    </Button>
                  </>
                )}
              </>
            )}

            {etape === 'humain' && (
              <>
                <BulleBot>
                  Écris-nous directement à{' '}
                  <Box component="a" href="mailto:contact@probf.bf" sx={{ color: 'primary.main' }}>
                    contact@probf.bf
                  </Box>
                  , on te répond au plus vite.
                </BulleBot>
              </>
            )}

            {etape === 'faq' && (
              <Stack spacing={1.5}>
                {FAQ.map((item) => (
                  <Box key={item.q}>
                    <Typography variant="body2" fontWeight={700}>
                      {item.q}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.r}
                    </Typography>
                    <Divider sx={{ mt: 1.5 }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}
    </>
  )
}
