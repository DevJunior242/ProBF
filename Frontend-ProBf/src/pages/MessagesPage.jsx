import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Container,
  Grid,
  Paper,
  Box,
  Stack,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Chip,
  TextField,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import DownloadIcon from '@mui/icons-material/Download'
import DoneIcon from '@mui/icons-material/Done'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import ScheduleIcon from '@mui/icons-material/Schedule'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import Alert from '@mui/material/Alert'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { db } from '../offline/db'
import { cacherConversations, chargerConversationsCache, cacherMessages, chargerMessagesCache } from '../offline/messages'

const POLL_THREAD_MS = 8000

function autreParticipant(conversation, userId) {
  return conversation.client.id === userId ? conversation.pro : conversation.client
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [loadingListe, setLoadingListe] = useState(true)
  const [messages, setMessages] = useState([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [texte, setTexte] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [horsLigneListe, setHorsLigneListe] = useState(false)
  const [horsLigneThread, setHorsLigneThread] = useState(false)
  const [enLigne, setEnLigne] = useState(navigator.onLine)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const conversationIdRef = useRef(null)

  useEffect(() => {
    const surLigne = () => setEnLigne(true)
    const horsLigne = () => setEnLigne(false)
    window.addEventListener('online', surLigne)
    window.addEventListener('offline', horsLigne)
    return () => {
      window.removeEventListener('online', surLigne)
      window.removeEventListener('offline', horsLigne)
    }
  }, [])

  const conversationId = searchParams.get('c')
  const conversationActive = conversations.find((c) => c.id === conversationId)

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  const chargerConversations = () => {
    setHorsLigneListe(false)
    api
      .get('/conversations')
      .then(({ data }) => {
        setConversations(data)
        setLoadingListe(false)
        cacherConversations(data)
      })
      .catch(async () => {
        const cache = await chargerConversationsCache()
        if (cache) {
          setConversations(cache)
          setHorsLigneListe(true)
        }
        setLoadingListe(false)
      })
  }

  useEffect(chargerConversations, [])

  const chargerMessages = (id) => {
    setHorsLigneThread(false)
    api
      .get(`/conversations/${id}/messages`)
      .then(({ data }) => {
        setMessages(data)
        setLoadingThread(false)
        cacherMessages(id, data)
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, non_lus_count: 0 } : c)))
      })
      .catch(async () => {
        const cache = await chargerMessagesCache(id)
        if (cache) {
          setMessages(cache)
          setHorsLigneThread(true)
        }
        setLoadingThread(false)
      })
  }

  useEffect(() => {
    if (!conversationId) return
    setLoadingThread(true)
    chargerMessages(conversationId)
    const interval = setInterval(() => {
      if (navigator.onLine) chargerMessages(conversationId)
    }, POLL_THREAD_MS)
    return () => clearInterval(interval)
  }, [conversationId])

  // Envoie au serveur chaque message texte encore en attente, appelé au
  // montage et à chaque retour de connexion. Les pièces jointes ne sont pas
  // mises en file : impossible de rejouer un upload sans garder le fichier
  // lui-même en mémoire, donc on désactive juste l'envoi de fichier hors
  // ligne (voir envoyerFichier) plutôt que de faire semblant de le gérer.
  const flushMessageQueue = async () => {
    const pending = await db.syncQueue.where({ type: 'message', status: 'pending' }).toArray()

    for (const item of pending) {
      try {
        await api.post(`/conversations/${item.payload.conversationId}/messages`, {
          type: 1,
          contenu: item.payload.contenu,
        })
        await db.syncQueue.delete(item.id)
      } catch (err) {
        if (!err.response) break
        await db.syncQueue.update(item.id, { status: 'failed' })
      }
    }

    if (conversationIdRef.current) chargerMessages(conversationIdRef.current)
    chargerConversations()
  }

  useEffect(() => {
    flushMessageQueue()
    window.addEventListener('online', flushMessageQueue)
    return () => window.removeEventListener('online', flushMessageQueue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectionner = (id) => setSearchParams({ c: id })

  const envoyerTexte = async (e) => {
    e.preventDefault()
    if (!texte.trim()) return
    const contenu = texte
    setEnvoiEnCours(true)
    try {
      await api.post(`/conversations/${conversationId}/messages`, { type: 1, contenu })
      setTexte('')
      chargerMessages(conversationId)
      chargerConversations()
    } catch (err) {
      if (!err.response) {
        // Pas de réponse du tout = hors ligne : on affiche le message tout
        // de suite avec une icône "en attente" plutôt que de le perdre,
        // et on le met en file pour l'envoi réel à la reconnexion.
        const messagePending = {
          id: `pending-${crypto.randomUUID()}`,
          sender_id: user.id,
          type: 1,
          contenu,
          created_at: new Date().toISOString(),
          read_at: null,
          pending: true,
        }
        const nouveauxMessages = [...messages, messagePending]
        setMessages(nouveauxMessages)
        cacherMessages(conversationId, nouveauxMessages)
        await db.syncQueue.add({
          id: crypto.randomUUID(),
          type: 'message',
          status: 'pending',
          createdAt: Date.now(),
          payload: { conversationId, contenu },
        })
        setTexte('')
      }
    } finally {
      setEnvoiEnCours(false)
    }
  }

  const envoyerFichier = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!navigator.onLine) {
      e.target.value = ''
      return
    }
    setEnvoiEnCours(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('type', 'message')
      const { data: upload } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await api.post(`/conversations/${conversationId}/messages`, {
        type: upload.est_document ? 3 : 2,
        fichier_url: upload.url,
        fichier_nom: upload.nom_original,
      })
      chargerMessages(conversationId)
      chargerConversations()
    } finally {
      setEnvoiEnCours(false)
      e.target.value = ''
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Messages
      </Typography>

      {(horsLigneListe || horsLigneThread) && (
        <Alert severity="warning" icon={<WifiOffIcon fontSize="small" />} sx={{ mb: 2 }}>
          Pas de connexion : affichage depuis ta dernière consultation. Les messages envoyés partiront à la
          reconnexion.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ height: '70vh', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Liste des conversations */}
          <Grid
            size={{ xs: 12, sm: 4 }}
            sx={{
              borderRight: { sm: 1 },
              borderColor: 'divider',
              height: '100%',
              overflowY: 'auto',
              display: { xs: conversationId ? 'none' : 'block', sm: 'block' },
            }}
          >
            {loadingListe ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : conversations.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 3 }}>
                Aucune conversation pour l'instant.
              </Typography>
            ) : (
              <List disablePadding>
                {conversations.map((c) => {
                  const autre = autreParticipant(c, user.id)
                  return (
                    <ListItemButton
                      key={c.id}
                      selected={c.id === conversationId}
                      onClick={() => selectionner(c.id)}
                    >
                      <ListItemAvatar>
                        <Avatar>{autre.nom?.[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={autre.nom}
                        secondary={
                          c.dernier_message?.contenu
                          ?? (c.dernier_message?.type === 3 ? c.dernier_message?.fichier_nom ?? 'Fichier' : c.dernier_message ? 'Photo' : 'Nouvelle conversation')
                        }
                        slotProps={{ secondary: { noWrap: true } }}
                      />
                      {c.non_lus_count > 0 && <Chip size="small" color="primary" label={c.non_lus_count} />}
                    </ListItemButton>
                  )
                })}
              </List>
            )}
          </Grid>

          {/* Fil de discussion */}
          <Grid
            size={{ xs: 12, sm: 8 }}
            sx={{
              height: '100%',
              display: { xs: conversationId ? 'flex' : 'none', sm: 'flex' },
              flexDirection: 'column',
            }}
          >
            {!conversationActive ? (
              <Box sx={{ m: 'auto', textAlign: 'center' }}>
                <Typography color="text.secondary">Sélectionne une conversation.</Typography>
              </Box>
            ) : (
              <>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <IconButton sx={{ display: { sm: 'none' } }} onClick={() => setSearchParams({})}>
                    <ArrowBackIcon />
                  </IconButton>
                  <Avatar>{autreParticipant(conversationActive, user.id).nom?.[0]}</Avatar>
                  <Typography fontWeight={700}>{autreParticipant(conversationActive, user.id).nom}</Typography>
                </Stack>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                  {loadingThread ? (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {messages.map((m) => {
                        const moi = m.sender_id === user.id
                        return (
                          <Box key={m.id} sx={{ display: 'flex', justifyContent: moi ? 'flex-end' : 'flex-start' }}>
                            <Box
                              sx={{
                                maxWidth: '75%',
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                bgcolor: moi ? 'primary.main' : 'action.hover',
                                color: moi ? 'primary.contrastText' : 'text.primary',
                              }}
                            >
                              {m.type === 2 ? (
                                <Box
                                  component="img"
                                  src={m.fichier_url}
                                  alt=""
                                  sx={{ maxWidth: '100%', borderRadius: 1, display: 'block' }}
                                />
                              ) : m.type === 3 ? (
                                <Stack
                                  component="a"
                                  href={m.fichier_url}
                                  target="_blank"
                                  rel="noopener"
                                  direction="row"
                                  spacing={1}
                                  sx={{ alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                                >
                                  <InsertDriveFileIcon fontSize="small" />
                                  <Typography variant="body2" sx={{ textDecoration: 'underline', wordBreak: 'break-all' }}>
                                    {m.fichier_nom ?? 'Fichier'}
                                  </Typography>
                                  <DownloadIcon fontSize="small" />
                                </Stack>
                              ) : (
                                <Typography variant="body2">{m.contenu}</Typography>
                              )}
                              {moi && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.25 }}>
                                  {m.pending ? (
                                    <ScheduleIcon sx={{ fontSize: 16, opacity: 0.7 }} titleAccess="En attente d'envoi" />
                                  ) : m.read_at ? (
                                    <DoneAllIcon sx={{ fontSize: 16, color: '#5AC8FA' }} titleAccess="Lu" />
                                  ) : (
                                    <DoneIcon sx={{ fontSize: 16, opacity: 0.7 }} titleAccess="Envoyé" />
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )
                      })}
                      <div ref={bottomRef} />
                    </Stack>
                  )}
                </Box>

                <Divider />

                <Stack
                  component="form"
                  direction="row"
                  spacing={1}
                  onSubmit={envoyerTexte}
                  sx={{ p: 2, alignItems: 'center' }}
                >
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={envoiEnCours || !enLigne}
                    title={enLigne ? undefined : "Indisponible hors ligne"}
                  >
                    <AttachFileIcon />
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    hidden
                    onChange={envoyerFichier}
                  />
                  <TextField
                    placeholder="Écris ton message..."
                    value={texte}
                    onChange={(e) => setTexte(e.target.value)}
                    fullWidth
                    size="small"
                    disabled={envoiEnCours}
                  />
                  <IconButton type="submit" color="primary" disabled={envoiEnCours || !texte.trim()}>
                    <SendIcon />
                  </IconButton>
                </Stack>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}
