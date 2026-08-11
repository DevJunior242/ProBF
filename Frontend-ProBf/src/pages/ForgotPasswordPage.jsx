import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, TextField, Button, Typography, Stack, Alert, Paper } from '@mui/material'
import api from '../api/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setMessage({ type: 'success', text: 'Si ce compte existe, un email de réinitialisation vient de partir.' })
    } catch {
      setMessage({ type: 'error', text: 'Impossible d\'envoyer l\'email pour le moment.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Mot de passe oublié
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Entre ton email, on t'envoie un lien de réinitialisation.
        </Typography>

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          {message && <Alert severity={message.type}>{message.text}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            Envoyer le lien
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            <Link to="/connexion">Retour à la connexion</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  )
}
