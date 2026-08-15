import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Stack,
  Typography,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  Rating,
  TextField,
  Alert,
} from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { brand } from '../theme/getTheme'
import { cacherProDetail, chargerProDetailCache } from '../offline/pros'

export default function FichoProPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avisNote, setAvisNote] = useState(5)
  const [avisCommentaire, setAvisCommentaire] = useState('')
  const [avisMessage, setAvisMessage] = useState(null)
  const [horsLigne, setHorsLigne] = useState(false)

  const chargerPro = () => {
    setLoading(true)
    setHorsLigne(false)
    api
      .get(`/pros/${id}`)
      .then(({ data }) => {
        setPro(data)
        cacherProDetail(data)
      })
      .catch(async () => {
        const cache = await chargerProDetailCache(id)
        if (cache) {
          setPro(cache)
          setHorsLigne(true)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(chargerPro, [id])

  const contacterWhatsApp = async () => {
    if (!user) {
      navigate('/connexion')
      return
    }
    try {
      const { data } = await api.post('/whatsapp-clicks', { pro_id: pro.id })
      window.open(`https://wa.me/${data.telephone.replace(/[^0-9]/g, '')}`, '_blank')
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/verification')
      }
    }
  }

  const envoyerMessage = async () => {
    if (!user) {
      navigate('/connexion')
      return
    }
    try {
      const { data } = await api.post('/conversations', { pro_id: pro.id })
      navigate(`/messages?c=${data.id}`)
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/verification')
      }
    }
  }

  const envoyerAvis = async (e) => {
    e.preventDefault()
    setAvisMessage(null)
    try {
      await api.post('/avis', { pro_id: pro.id, note: avisNote, commentaire: avisCommentaire })
      setAvisCommentaire('')
      setAvisMessage({ type: 'success', text: 'Avis envoyé, merci !' })
      chargerPro()
    } catch {
      setAvisMessage({ type: 'error', text: "Impossible d'envoyer l'avis." })
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!pro) return null

  const dispo = pro.profile?.statut_dispo
  const dispoLabel = dispo === 1 ? 'Disponible' : dispo === 2 ? 'Sur RDV' : null
  const dispoColor = dispo === 1 ? brand.disponible : brand.surRdv

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {horsLigne && (
        <Alert severity="warning" icon={<WifiOffIcon fontSize="small" />} sx={{ mb: 3 }}>
          Pas de connexion : fiche affichée depuis ta dernière consultation.
        </Alert>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
        <Avatar src={pro.profile?.avatar ?? undefined} sx={{ width: 96, height: 96 }}>
          {pro.nom?.[0]}
        </Avatar>

        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="h4" fontWeight={700}>
              {pro.nom}
            </Typography>
            {pro.profile?.badge_verifie && <VerifiedIcon color="primary" titleAccess="Pro vérifié" />}
          </Stack>

          <Typography color="text.secondary">
            {pro.metiers?.map((m) => m.nom).join(', ')} — {pro.quartiers?.map((q) => q.nom).join(', ')}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {dispoLabel && (
              <Chip size="small" label={dispoLabel} sx={{ bgcolor: `${dispoColor}22`, color: dispoColor, fontWeight: 600 }} />
            )}
            {Number(pro.profile?.note_moyenne) > 0 && (
              <Chip size="small" label={`★ ${pro.profile.note_moyenne} (${pro.profile.nb_avis} avis)`} />
            )}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            onClick={contacterWhatsApp}
            sx={{ bgcolor: brand.whatsapp, color: '#fff', '&:hover': { bgcolor: brand.whatsappDark } }}
          >
            Contacter
          </Button>
          <Button variant="outlined" size="large" startIcon={<ChatBubbleOutlineIcon />} onClick={envoyerMessage}>
            Message
          </Button>
        </Stack>
      </Stack>

      {pro.profile?.bio && (
        <Typography sx={{ mt: 3 }} color="text.secondary">
          {pro.profile.bio}
        </Typography>
      )}

      {pro.portfolios?.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Réalisations
          </Typography>
          <Grid container spacing={2}>
            {pro.portfolios.map((p) => (
              <Grid key={p.id} size={{ xs: 6, sm: 4 }}>
                <Card variant="outlined">
                  <img src={p.photo_avant} alt={p.description ?? ''} style={{ width: '100%', display: 'block' }} />
                  {p.description && (
                    <CardContent>
                      <Typography variant="body2">{p.description}</Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Avis
      </Typography>

      {user && user.id !== pro.id && (
        <Stack component="form" spacing={2} onSubmit={envoyerAvis} sx={{ mb: 3, maxWidth: 400 }}>
          {avisMessage && <Alert severity={avisMessage.type}>{avisMessage.text}</Alert>}
          <Rating value={avisNote} onChange={(_, value) => setAvisNote(value)} />
          <TextField
            label="Ton commentaire"
            multiline
            minRows={2}
            value={avisCommentaire}
            onChange={(e) => setAvisCommentaire(e.target.value)}
          />
          <Button type="submit" variant="outlined">
            Laisser un avis
          </Button>
        </Stack>
      )}

      <Stack spacing={2}>
        {pro.avis_recus?.length ? (
          pro.avis_recus.map((avis) => (
            <Card key={avis.id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Rating value={avis.note} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {avis.client?.nom}
                  </Typography>
                </Stack>
                {avis.commentaire && <Typography sx={{ mt: 1 }}>{avis.commentaire}</Typography>}
                {avis.reponse_pro && (
                  <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
                    Réponse du pro : {avis.reponse_pro}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography color="text.secondary">Aucun avis pour l'instant.</Typography>
        )}
      </Stack>
    </Container>
  )
}
