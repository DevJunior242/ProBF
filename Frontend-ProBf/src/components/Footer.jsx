import { Link } from 'react-router-dom'
import { Box, Container, Grid, Typography, Stack } from '@mui/material'
import Logo from './Logo'

export default function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 8, py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Logo size={28} sx={{ mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              La plateforme qui connecte clients, artisans et fournisseurs au Burkina Faso.
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Liens rapides
            </Typography>
            <Stack spacing={0.5}>
              <Typography component={Link} to="/demandes/nouvelle" variant="body2" color="text.secondary">
                Radar de demande
              </Typography>
              <Typography component={Link} to="/inscription" variant="body2" color="text.secondary">
                Devenir Pro
              </Typography>
              <Typography component={Link} to="/inscription" variant="body2" color="text.secondary">
                Devenir Fournisseur
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Légal
            </Typography>
            <Stack spacing={0.5}>
              <Typography component={Link} to="/cgu" variant="body2" color="text.secondary">
                Conditions Générales d'Utilisation
              </Typography>
              <Typography component={Link} to="/confidentialite" variant="body2" color="text.secondary">
                Politique de confidentialité
              </Typography>
              <Typography component="a" href="mailto:contact@probf.bf" variant="body2" color="text.secondary">
                contact@probf.bf
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} ProBF. Tous droits réservés.
        </Typography>
      </Container>
    </Box>
  )
}
