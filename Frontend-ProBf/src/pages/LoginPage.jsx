import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, TextField, Button, Typography, Stack, Alert, Paper } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import PasswordField from '../components/PasswordField'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(identifiant, password)
      navigate('/')
    } catch {
      setError('Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Connexion
        </Typography>

        <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Téléphone ou email"
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
            required
            fullWidth
          />
          <PasswordField label="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            Se connecter
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          </Typography>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Pas encore de compte ? <Link to="/inscription">Inscris-toi</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  )
}
