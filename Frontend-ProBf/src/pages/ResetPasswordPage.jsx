import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Container, Typography, Stack, Alert, Paper, Button } from '@mui/material'
import api from '../api/client'
import PasswordField from '../components/PasswordField'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/connexion')
    } catch {
      setError('Lien invalide ou expiré, redemande un email de réinitialisation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Nouveau mot de passe
        </Typography>

        {!token || !email ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Lien invalide. <Link to="/mot-de-passe-oublie">Redemander un lien</Link>
          </Alert>
        ) : (
          <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <PasswordField label="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            <PasswordField
              label="Confirmer le mot de passe"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              Réinitialiser
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  )
}
