import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Stack, Typography, Avatar, Grid, Card, Button, CircularProgress, Box, Chip } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { brand } from '../theme/getTheme'

export default function FicheFournisseurPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [fournisseur, setFournisseur] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get(`/fournisseurs/${id}`)
      .then(({ data }) => setFournisseur(data))
      .finally(() => setLoading(false))
  }, [id])

  const contacterPourProduit = async (produit) => {
    if (!user) {
      navigate('/connexion')
      return
    }
    try {
      const { data } = await api.post('/leads', { produit_id: produit.id })
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
      const { data } = await api.post('/conversations', { pro_id: fournisseur.id })
      navigate(`/messages?c=${data.id}`)
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/verification')
      }
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!fournisseur) return null

  const profil = fournisseur.fournisseur_profile

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
        <Avatar src={profil?.logo ?? undefined} sx={{ width: 96, height: 96 }}>
          <StorefrontIcon fontSize="large" />
        </Avatar>

        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            {profil?.nom_boutique ?? fournisseur.nom}
          </Typography>
          {profil?.adresse && <Typography color="text.secondary">{profil.adresse}</Typography>}
        </Stack>

        <Stack spacing={1}>
          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            disabled={!fournisseur.produits?.length}
            onClick={() => contacterPourProduit(fournisseur.produits[0])}
            sx={{ bgcolor: brand.whatsapp, color: '#fff', '&:hover': { bgcolor: brand.whatsappDark } }}
          >
            Contacter
          </Button>
          <Button variant="outlined" size="large" startIcon={<ChatBubbleOutlineIcon />} onClick={envoyerMessage}>
            Message
          </Button>
        </Stack>
      </Stack>

      <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        Produits
      </Typography>

      {fournisseur.produits?.length ? (
        <Grid container spacing={2}>
          {fournisseur.produits.map((produit) => (
            <Grid key={produit.id} size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <Stack direction="row" spacing={2} sx={{ p: 2, alignItems: 'center' }}>
                  {produit.photo && (
                    <Box
                      component="img"
                      src={produit.photo}
                      alt=""
                      sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={600}>{produit.nom}</Typography>
                    {produit.categorie && (
                      <Chip size="small" label={produit.categorie.nom} sx={{ my: 0.5 }} />
                    )}
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {produit.prix} F CFA
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => contacterPourProduit(produit)}>
                    Voir
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary">Ce fournisseur n'a pas encore ajouté de produits.</Typography>
      )}
    </Container>
  )
}
