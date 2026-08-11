import { Link } from 'react-router-dom'
import { Card, CardContent, CardActionArea, Typography, Stack, Chip, Avatar, Box } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import StarIcon from '@mui/icons-material/Star'
import BoltIcon from '@mui/icons-material/Bolt'
import { brand } from '../theme/getTheme'

export default function CardPro({ pro }) {
  const dispo = pro.profile?.statut_dispo
  const dispoLabel = dispo === 1 ? 'Disponible' : dispo === 2 ? 'Sur RDV' : null
  const dispoColor = dispo === 1 ? brand.disponible : brand.surRdv

  return (
    <Card variant="outlined">
      <CardActionArea component={Link} to={`/pros/${pro.id}`}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar src={pro.profile?.avatar ?? undefined} sx={{ width: 56, height: 56 }}>
              {pro.nom?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography fontWeight={600}>{pro.nom}</Typography>
                {pro.profile?.badge_verifie && (
                  <VerifiedIcon color="primary" fontSize="small" titleAccess="Pro vérifié" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {pro.metiers?.map((m) => m.nom).join(', ')}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            {pro.est_boost_actif && (
              <Chip size="small" color="warning" icon={<BoltIcon />} label="Boosté" />
            )}
            {dispoLabel && (
              <Chip
                size="small"
                label={dispoLabel}
                sx={{ bgcolor: `${dispoColor}22`, color: dispoColor, fontWeight: 600 }}
              />
            )}
            {Number(pro.profile?.note_moyenne) > 0 && (
              <Chip
                size="small"
                icon={<StarIcon sx={{ fontSize: 16, color: '#F59E0B !important' }} />}
                label={`${pro.profile.note_moyenne} (${pro.profile.nb_avis})`}
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
