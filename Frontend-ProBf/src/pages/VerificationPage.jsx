import { useEffect, useRef, useState } from 'react'
import { Container, Paper, Typography, Stack, Button, Alert, Box, CircularProgress, Chip } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import UploadIcon from '@mui/icons-material/CloudUpload'
import BadgeIcon from '@mui/icons-material/Badge'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const LABELS_STATUT = {
  1: { label: 'Non soumis', color: 'default' },
  2: { label: 'En attente de validation', color: 'warning' },
  3: { label: 'Vérifié', color: 'success' },
  4: { label: 'Rejeté', color: 'error' },
}

function ChoixFichier({ label, fichier, onChange }) {
  const inputRef = useRef(null)

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      {fichier ? (
        <Box
          component="img"
          src={URL.createObjectURL(fichier)}
          alt=""
          sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        />
      ) : (
        <Box sx={{ width: 120, height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }} />
      )}

      <Button variant="outlined" size="small" startIcon={<UploadIcon />} onClick={() => inputRef.current?.click()}>
        {fichier ? 'Changer' : label}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
      />
    </Stack>
  )
}

export default function VerificationPage() {
  const { user, updateUser } = useAuth()
  const [statut, setStatut] = useState(null)
  const [raisonRejet, setRaisonRejet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recto, setRecto] = useState(null)
  const [verso, setVerso] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(false)

  useEffect(() => {
    api.get('/verification').then(({ data }) => {
      setStatut(data.verification_statut)
      setRaisonRejet(data.verification_rejet_raison)
      updateUser({ verification_statut: data.verification_statut })
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur(null)
    setEnvoi(true)
    try {
      const formData = new FormData()
      formData.append('recto', recto)
      formData.append('verso', verso)
      const { data } = await api.post('/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStatut(data.verification_statut)
      updateUser({ verification_statut: data.verification_statut })
      setSucces(true)
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Échec de l'envoi, réessaie.")
    } finally {
      setEnvoi(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
        <BadgeIcon color="primary" />
        <Typography variant="h4" fontWeight={700}>
          Vérification d'identité
        </Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Pour la sécurité de tous, publier une demande, un produit ou contacter quelqu'un sur ProBF nécessite une
        identité vérifiée. Une seule fois, ça vaut pour toujours.
      </Typography>

      <Chip
        icon={statut === 3 ? <VerifiedUserIcon /> : statut === 2 ? <HourglassTopIcon /> : undefined}
        label={LABELS_STATUT[statut]?.label}
        color={LABELS_STATUT[statut]?.color}
        sx={{ mb: 3 }}
      />

      <Paper variant="outlined" sx={{ p: 3 }}>
        {statut === 3 && (
          <Alert severity="success" icon={<VerifiedUserIcon />}>
            Ton identité est vérifiée. Tu peux publier et contacter librement sur ProBF.
          </Alert>
        )}

        {statut === 2 && (
          <Alert severity="info">
            Ta CNIB a été envoyée et est en cours de vérification par notre équipe. Ça prend généralement moins de
            24h.
          </Alert>
        )}

        {(statut === 1 || statut === 4) && (
          <Stack component="form" spacing={3} onSubmit={soumettre}>
            {statut === 4 && raisonRejet && (
              <Alert severity="error">
                Ta précédente soumission a été rejetée : {raisonRejet}. Tu peux renvoyer de nouvelles photos.
              </Alert>
            )}
            {succes && <Alert severity="success">Envoyé ! On revient vers toi rapidement.</Alert>}
            {erreur && <Alert severity="error">{erreur}</Alert>}

            <Typography variant="body2" color="text.secondary">
              Envoie une photo nette du recto et du verso de ta CNIB (Carte Nationale d'Identité Burkinabè).
            </Typography>

            <ChoixFichier label="Photo recto" fichier={recto} onChange={setRecto} />
            <ChoixFichier label="Photo verso" fichier={verso} onChange={setVerso} />

            <Button type="submit" variant="contained" size="large" disabled={!recto || !verso || envoi}>
              Envoyer pour vérification
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  )
}
