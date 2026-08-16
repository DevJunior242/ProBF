import { useState } from 'react'
import { Button, Snackbar } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'

// navigator.share et navigator.clipboard exigent un contexte sécurisé
// (HTTPS) : tant que le site tourne en http:// sur l'IP nue du VPS, les
// deux sont undefined et un appel direct plante silencieusement. On
// retombe donc sur document.execCommand('copy'), qui fonctionne même en
// http://, et en tout dernier recours sur une fenêtre prompt() manuelle.
function copierViaTextarea(texte) {
  const zone = document.createElement('textarea')
  zone.value = texte
  zone.style.position = 'fixed'
  zone.style.opacity = '0'
  document.body.appendChild(zone)
  zone.focus()
  zone.select()
  const succes = document.execCommand('copy')
  document.body.removeChild(zone)
  return succes
}

export default function PartagerProfilButton({ chemin, titre }) {
  const [copie, setCopie] = useState(false)
  const url = `${window.location.origin}${chemin}`

  const partager = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: titre, url })
        return
      } catch {
        // L'utilisateur a annulé le partage : on retombe sur la copie.
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        setCopie(true)
        return
      } catch {
        // Clipboard API refusée (contexte non sécurisé) : on continue.
      }
    }

    if (copierViaTextarea(url)) {
      setCopie(true)
      return
    }

    window.prompt('Copie ce lien pour le partager :', url)
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
