import { useState } from 'react'
import { Button, Snackbar } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'

export default function PartagerProfilButton({ chemin, titre }) {
  const [copie, setCopie] = useState(false)
  const url = `${window.location.origin}${chemin}`

  const partager = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: titre, url })
      } catch {
        // L'utilisateur a annulé le partage : rien à faire.
      }
      return
    }

    await navigator.clipboard.writeText(url)
    setCopie(true)
  }

  return (
    <>
      <Button variant="outlined" size="small" startIcon={<ShareIcon />} onClick={partager}>
        Partager mon profil
      </Button>
      <Snackbar
        open={copie}
        autoHideDuration={3000}
        onClose={() => setCopie(false)}
        message="Lien du profil copié dans le presse-papiers."
      />
    </>
  )
}
