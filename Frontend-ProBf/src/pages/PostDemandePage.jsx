import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Container,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Avatar,
  Grid,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import BoltIcon from '@mui/icons-material/Bolt'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CampaignIcon from '@mui/icons-material/Campaign'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import ListAltIcon from '@mui/icons-material/ListAlt'
import RoomIcon from '@mui/icons-material/Room'
import DescriptionIcon from '@mui/icons-material/Description'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices'
import PlumbingIcon from '@mui/icons-material/Plumbing'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import BuildIcon from '@mui/icons-material/Build'
import InboxIcon from '@mui/icons-material/Inbox'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import DevisExpressDialog from '../components/DevisExpressDialog'
import AjouterMetierDialog from '../components/AjouterMetierDialog'
import AjouterQuartierDialog from '../components/AjouterQuartierDialog'
import useMetiers from '../hooks/useMetiers'

const ICONES_METIER = {
  electricien: ElectricalServicesIcon,
  plombier: PlumbingIcon,
  'froid-climatisation': AcUnitIcon,
}

function IconeMetier({ slug, sx }) {
  const Icone = ICONES_METIER[slug] ?? BuildIcon
  return (
    <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, ...sx }}>
      <Icone fontSize="small" />
    </Avatar>
  )
}

function EtatVide({ icon: Icone, texte }) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 6, color: 'text.secondary' }}>
      <Icone sx={{ fontSize: 40, opacity: 0.4 }} />
      <Typography color="text.secondary">{texte}</Typography>
    </Stack>
  )
}

function formatDateHeure(iso) {
  const date = new Date(iso)
  return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}

export default function PostDemandePage() {
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()
  const [onglet, setOnglet] = useState(0)
  const { metiers, ajouterMetier } = useMetiers()
  const [dialogMetierOuvert, setDialogMetierOuvert] = useState(false)
  const [dialogQuartierOuvert, setDialogQuartierOuvert] = useState(false)
  const [quartiers, setQuartiers] = useState([])
  const [metierId, setMetierId] = useState('')
  const [quartierId, setQuartierId] = useState('')
  const [description, setDescription] = useState('')
  const [urgence, setUrgence] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [editingDemandeId, setEditingDemandeId] = useState(null)

  const [demandes, setDemandes] = useState([])
  const [loadingDemandes, setLoadingDemandes] = useState(false)
  const [filtreMetier, setFiltreMetier] = useState('')

  const [mesDemandes, setMesDemandes] = useState([])
  const [loadingMesDemandes, setLoadingMesDemandes] = useState(false)
  const [demandeExpressId, setDemandeExpressId] = useState(null)
  const [messageExpress, setMessageExpress] = useState(null)
  const [aSupprimer, setASupprimer] = useState(null)

  useEffect(() => {
    api.get('/quartiers').then(({ data }) => setQuartiers(data))
  }, [])

  const ajouterQuartier = async ({ ville, nom }) => {
    const { data } = await api.post('/quartiers', { ville, nom })
    setQuartiers((prev) => (prev.some((q) => q.id === data.id) ? prev : [...prev, data]))
    return data
  }

  const chargerDemandes = () => {
    if (!user) return
    setLoadingDemandes(true)
    api
      .get('/demandes', { params: { metier_id: filtreMetier || undefined } })
      .then(({ data }) => setDemandes(data.data))
      .finally(() => setLoadingDemandes(false))
  }

  useEffect(() => {
    if (onglet === 1) chargerDemandes()
  }, [onglet, filtreMetier])

  const chargerMesDemandes = () => {
    if (!user) return
    setLoadingMesDemandes(true)
    api
      .get('/demandes', { params: { mine: 1 } })
      .then(({ data }) => setMesDemandes(data.data))
      .finally(() => setLoadingMesDemandes(false))
  }

  useEffect(() => {
    if (onglet === 2) chargerMesDemandes()
  }, [onglet])

  const resetForm = () => {
    setDescription('')
    setMetierId('')
    setQuartierId('')
    setUrgence(false)
    setEditingDemandeId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      navigate('/connexion')
      return
    }

    const payload = { metier_id: metierId, quartier_id: quartierId, description, urgence }

    try {
      if (editingDemandeId) {
        await api.put(`/demandes/${editingDemandeId}`, payload)
        chargerMesDemandes()
        setSuccessMessage('Demande mise à jour !')
      } else {
        await api.post('/demandes', payload)
        setSuccessMessage('Demande envoyée ! Les pros du quartier vont être notifiés.')
      }
      resetForm()
    } catch {
      setError("Impossible d'envoyer ta demande, vérifie les champs.")
    }
  }

  const modifierDemande = (demande) => {
    setSuccessMessage(null)
    setError(null)
    setEditingDemandeId(demande.id)
    setMetierId(demande.metier.id)
    setQuartierId(demande.quartier.id)
    setDescription(demande.description)
    setUrgence(demande.urgence)
    setOnglet(0)
  }

  const confirmerSuppression = async () => {
    await api.delete(`/demandes/${aSupprimer.id}`)
    setMesDemandes(mesDemandes.filter((d) => d.id !== aSupprimer.id))
    setASupprimer(null)
  }

  const repondre = async (demande) => {
    const { data } = await api.post('/conversations', { client_id: demande.client.id })
    navigate(`/messages?c=${data.id}`)
  }

  const toggleStatutDemande = async (demande) => {
    const { data } = await api.patch(`/demandes/${demande.id}/statut`)
    setMesDemandes(mesDemandes.map((d) => (d.id === demande.id ? data : d)))
  }

  const peutRepondre = hasRole('pro') || hasRole('fournisseur')

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>
          <CampaignIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Radar de demande
          </Typography>
          <Typography color="text.secondary">
            Décris ton besoin, les pros du quartier concerné pourront te contacter.
          </Typography>
        </Box>
      </Stack>

      <Tabs
        value={onglet}
        onChange={(_, v) => setOnglet(v)}
        sx={{ mb: 3, mt: 3, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<PlaylistAddIcon fontSize="small" />} iconPosition="start" label="Publier une demande" />
        <Tab icon={<TravelExploreIcon fontSize="small" />} iconPosition="start" label="Demandes ouvertes" />
        {user && <Tab icon={<ListAltIcon fontSize="small" />} iconPosition="start" label="Mes demandes" />}
      </Tabs>

      {onglet === 0 && (
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            {editingDemandeId && (
              <Alert
                severity="info"
                action={
                  <Button color="inherit" size="small" onClick={resetForm}>
                    Annuler
                  </Button>
                }
              >
                Tu modifies une demande existante.
              </Alert>
            )}

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Alert severity="error">{error}</Alert>
                </motion.div>
              )}
              {successMessage && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Alert severity="success">{successMessage}</Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Métier recherché"
                  value={metierId}
                  onChange={(e) => {
                    if (e.target.value === '__autre__') {
                      setDialogMetierOuvert(true)
                      return
                    }
                    setMetierId(e.target.value)
                  }}
                  required
                >
                  {metiers.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.nom}
                    </MenuItem>
                  ))}
                  <MenuItem value="__autre__" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    + Autre (préciser)
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Quartier"
                  value={quartierId}
                  onChange={(e) => {
                    if (e.target.value === '__autre__') {
                      setDialogQuartierOuvert(true)
                      return
                    }
                    setQuartierId(e.target.value)
                  }}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <RoomIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  {quartiers.map((q) => (
                    <MenuItem key={q.id} value={q.id}>
                      {q.nom} — {q.ville?.nom}
                    </MenuItem>
                  ))}
                  <MenuItem value="__autre__" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    + Autre (préciser)
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Décris ton besoin"
              placeholder="Ex : prise électrique qui ne fonctionne plus dans le salon..."
              multiline
              minRows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: urgence ? 'error.main' : 'divider',
                bgcolor: urgence ? 'rgba(211,47,47,0.08)' : 'transparent',
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <PriorityHighIcon color={urgence ? 'error' : 'disabled'} fontSize="small" />
                <Box>
                  <Typography fontWeight={600} variant="body2">
                    C'est urgent
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ta demande sera mise en avant auprès des pros
                  </Typography>
                </Box>
              </Stack>
              <FormControlLabel
                sx={{ m: 0 }}
                control={<Switch color="error" checked={urgence} onChange={(e) => setUrgence(e.target.checked)} />}
                label=""
              />
            </Paper>

            <Button type="submit" variant="contained" size="large" startIcon={editingDemandeId ? <EditIcon /> : <PlaylistAddIcon />}>
              {editingDemandeId ? 'Mettre à jour ma demande' : 'Publier ma demande'}
            </Button>
          </Stack>
        </Paper>
      )}

      {onglet === 1 && (
        <Box>
          {!user ? (
            <Alert severity="info">Connecte-toi pour voir les demandes en cours.</Alert>
          ) : (
            <>
              <TextField
                select
                label="Filtrer par métier"
                value={filtreMetier}
                onChange={(e) => setFiltreMetier(e.target.value)}
                sx={{ mb: 3, minWidth: 240 }}
              >
                <MenuItem value="">Tous les métiers</MenuItem>
                {metiers.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.nom}
                  </MenuItem>
                ))}
              </TextField>

              {loadingDemandes ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : demandes.length === 0 ? (
                <EtatVide icon={TravelExploreIcon} texte="Aucune demande ouverte pour l'instant." />
              ) : (
                <Stack spacing={2}>
                  {demandes.map((d, i) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          transition: 'box-shadow 0.2s, transform 0.2s',
                          '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                            <IconeMetier slug={d.metier.slug} />
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
                                <Typography fontWeight={700}>{d.client.nom}</Typography>
                                <Typography color="text.secondary">cherche un {d.metier.nom}</Typography>
                                {d.urgence && (
                                  <Chip size="small" color="error" icon={<PriorityHighIcon />} label="Urgent" />
                                )}
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
                                <RoomIcon sx={{ fontSize: 15 }} color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {d.quartier.nom} — {formatDateHeure(d.created_at)}
                                </Typography>
                              </Stack>
                              <Typography sx={{ mb: 2 }}>{d.description}</Typography>
                              {peutRepondre && (
                                <Button size="small" variant="outlined" onClick={() => repondre(d)}>
                                  Répondre
                                </Button>
                              )}
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </>
          )}
        </Box>
      )}

      {onglet === 2 && (
        <Box>
          <AnimatePresence>
            {messageExpress && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert severity={messageExpress.type} sx={{ mb: 2 }}>
                  {messageExpress.text}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {loadingMesDemandes ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : mesDemandes.length === 0 ? (
            <EtatVide icon={InboxIcon} texte="Tu n'as pas encore publié de demande." />
          ) : (
            <Stack spacing={2}>
              {mesDemandes.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                        <IconeMetier slug={d.metier.slug} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
                            <Typography fontWeight={700} sx={{ flexGrow: 1 }}>
                              Recherche un {d.metier.nom}
                            </Typography>
                            {d.urgence && (
                              <Chip size="small" color="error" icon={<PriorityHighIcon />} label="Urgent" />
                            )}
                            <Chip
                              size="small"
                              color={d.statut === 1 ? 'success' : 'default'}
                              icon={d.statut === 1 ? <RadioButtonCheckedIcon /> : <CheckCircleIcon />}
                              label={d.statut === 1 ? 'Ouverte' : 'Réglée'}
                            />
                            <IconButton size="small" onClick={() => modifierDemande(d)} title="Modifier">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setASupprimer(d)} title="Supprimer">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
                            <RoomIcon sx={{ fontSize: 15 }} color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {d.quartier.nom} — {formatDateHeure(d.created_at)}
                            </Typography>
                          </Stack>
                          <Typography sx={{ mb: 2 }}>{d.description}</Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                            <Button size="small" variant="outlined" onClick={() => toggleStatutDemande(d)}>
                              {d.statut === 1 ? 'Marquer comme réglée' : 'Rouvrir'}
                            </Button>
                            {d.statut === 1 && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<BoltIcon />}
                                onClick={() => setDemandeExpressId(d.id)}
                              >
                                Devis Express (25F)
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stack>
          )}
        </Box>
      )}

      <DevisExpressDialog
        open={Boolean(demandeExpressId)}
        demandeId={demandeExpressId}
        onClose={() => setDemandeExpressId(null)}
        onSuccess={() => setMessageExpress({ type: 'success', text: 'Ta demande express a été envoyée, en attente de validation.' })}
      />

      <Dialog open={Boolean(aSupprimer)} onClose={() => setASupprimer(null)}>
        <DialogTitle>Supprimer cette demande ?</DialogTitle>
        <DialogContent>
          <Typography>
            Tu es sur le point de supprimer définitivement ta demande pour un <strong>{aSupprimer?.metier?.nom}</strong>{' '}
            à <strong>{aSupprimer?.quartier?.nom}</strong>. Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setASupprimer(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={confirmerSuppression}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <AjouterMetierDialog
        open={dialogMetierOuvert}
        onClose={() => setDialogMetierOuvert(false)}
        onAjoute={async (nom) => {
          const metier = await ajouterMetier(nom)
          setMetierId(metier.id)
        }}
      />

      <AjouterQuartierDialog
        open={dialogQuartierOuvert}
        onClose={() => setDialogQuartierOuvert(false)}
        onAjoute={async ({ ville, nom }) => {
          const quartier = await ajouterQuartier({ ville, nom })
          setQuartierId(quartier.id)
        }}
      />
    </Container>
  )
}
