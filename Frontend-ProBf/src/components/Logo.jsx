import { Box, Typography } from '@mui/material'

/**
 * Mark ProBF : un "P" traversé d'un éclair (vitesse d'intervention, électricité).
 * Vectoriel, net à toute taille — voir la proposition de logo pour les variantes.
 */
function LogoMark({ size = 32, badgeColor = '#F3680F', glyphColor = '#FFFFFF' }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 120 120"
      sx={{ width: size, height: size, flexShrink: 0, display: 'block' }}
    >
      <rect x="0" y="0" width="120" height="120" rx="26" fill={badgeColor} />
      <path
        d="M38,26 L56,26 L56,94 L38,94 Z M38,26 L86,26 L92,50 L38,58 Z"
        fill={glyphColor}
        fillRule="evenodd"
      />
      <path d="M64,30 L78,30 L66,46 L74,46 L54,68 L62,48 L52,48 Z" fill={badgeColor} />
    </Box>
  )
}

export default function Logo({ size = 32, iconOnly = false, onDark = false, sx }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, ...sx }}>
      <LogoMark size={size} />
      {!iconOnly && (
        <Typography
          component="span"
          sx={{
            fontWeight: 900,
            letterSpacing: '-0.03em',
            fontSize: size * 0.7,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          <Box component="span" sx={{ color: onDark ? '#fff' : 'text.primary' }}>Pro</Box>
          <Box component="span" sx={{ color: onDark ? '#F59E0B' : 'primary.main' }}>BF</Box>
        </Typography>
      )}
    </Box>
  )
}
