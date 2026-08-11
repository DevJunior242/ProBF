import { Link as RouterLink } from 'react-router-dom'
import { Container, Stack, Typography, Avatar, Button } from '@mui/material'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import HomeIcon from '@mui/icons-material/Home'

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72 }}>
          <SearchOffIcon fontSize="large" />
        </Avatar>
        <Stack spacing={1}>
          <Typography variant="h3" fontWeight={800}>
            404
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            Cette page n'existe pas
          </Typography>
          <Typography color="text.secondary">
            Le lien est peut-être cassé, ou la page a été déplacée. Retourne à l'accueil pour continuer.
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button component={RouterLink} to="/" variant="contained" size="large" startIcon={<HomeIcon />}>
            Retour à l'accueil
          </Button>
          <Button component={RouterLink} to="/pros" variant="outlined" size="large">
            Trouver un pro
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}
