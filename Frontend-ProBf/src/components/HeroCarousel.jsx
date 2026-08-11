import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Box } from '@mui/material'
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices'
import PlumbingIcon from '@mui/icons-material/Plumbing'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import HandymanIcon from '@mui/icons-material/Handyman'

const INTERVALLE_MS = 5000

// Placeholders en attendant de vraies photos d'artisans.
// Pour les remplacer : déposer les fichiers dans src/assets/hero/ (ex: artisan-1.jpg),
// puis remplacer `gradient` + `Icone` par `image: <url importée>` et un <Box component="img"> ici.
const SLIDES = [
  { id: 'electricien', gradient: 'linear-gradient(135deg, #F3680F, #B34C0C)', Icone: ElectricalServicesIcon },
  { id: 'plombier', gradient: 'linear-gradient(135deg, #B34C0C, #7A3512)', Icone: PlumbingIcon },
  { id: 'froid', gradient: 'linear-gradient(135deg, #3A2E28, #5C4536)', Icone: AcUnitIcon },
  { id: 'artisan', gradient: 'linear-gradient(135deg, #7A3512, #F3680F)', Icone: HandymanIcon },
]

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, INTERVALLE_MS)
    return () => clearInterval(interval)
  }, [])

  const slide = SLIDES[index]

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: slide.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '8%',
          }}
        >
          <slide.Icone sx={{ fontSize: { xs: 120, sm: 200 }, color: 'rgba(255,255,255,0.18)' }} />
        </motion.div>
      </AnimatePresence>

      {/* Points de position */}
      <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
        {SLIDES.map((s, i) => (
          <Box
            key={s.id}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: i === index ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'background-color 0.3s',
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
