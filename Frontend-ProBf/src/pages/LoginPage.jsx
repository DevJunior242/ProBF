import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Container, TextField, Button, Typography, Stack, Alert, Paper, Box, Link } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import PasswordField from '../components/PasswordField'
import Logo from '../components/Logo'

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
    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', py: { xs: 5, sm: 8 }, px: 2 }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 480,
            height: 480,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.12,
            filter: 'blur(90px)',
          }}
        />
      </Box>

      <Container maxWidth="xs" disableGutters>
        <Stack sx={{ alignItems: 'center', mb: 3 }}>
          <Logo size={40} />
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Connexion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accède à ton espace ProBF.
            </Typography>
          </Stack>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Téléphone ou email"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <PasswordField label="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Typography variant="body2" sx={{ textAlign: 'right' }}>
              <Link component={RouterLink} to="/mot-de-passe-oublie" underline="hover">
                Mot de passe oublié ?
              </Link>
            </Typography>

            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
              Se connecter
            </Button>
          </Stack>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
          Pas encore de compte ?{' '}
          <Link component={RouterLink} to="/inscription" underline="hover" fontWeight={600}>
            Inscris-toi
          </Link>
        </Typography>
      </Container>
    </Box>
  )
}
