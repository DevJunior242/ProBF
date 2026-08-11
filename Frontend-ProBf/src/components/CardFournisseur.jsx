import { Link } from 'react-router-dom'
import { Card, CardContent, CardActionArea, Typography, Stack, Avatar, Chip } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import BoltIcon from '@mui/icons-material/Bolt'

export default function CardFournisseur({ fournisseur }) {
  const profil = fournisseur.fournisseur_profile

  return (
    <Card variant="outlined">
      <CardActionArea component={Link} to={`/fournisseurs/${fournisseur.id}`}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar src={profil?.logo ?? undefined} sx={{ width: 56, height: 56 }}>
              <StorefrontIcon />
            </Avatar>
            <Stack sx={{ flexGrow: 1 }}>
              <Typography fontWeight={600}>{profil?.nom_boutique ?? fournisseur.nom}</Typography>
              {profil?.adresse && (
                <Typography variant="body2" color="text.secondary">
                  {profil.adresse}
                </Typography>
              )}
              {fournisseur.est_boost_actif && (
                <Chip size="small" color="warning" icon={<BoltIcon />} label="Boosté" sx={{ mt: 0.5, alignSelf: 'flex-start' }} />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
