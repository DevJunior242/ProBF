import { useRef, useState } from 'react'
import { Avatar, Box, Button, CircularProgress, Stack, Typography, Alert } from '@mui/material'
import UploadIcon from '@mui/icons-material/CloudUpload'
import api from '../api/client'

export default function PhotoUpload({ label, type, value, onChange, variant = 'avatar' }) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setLoading(true)
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('type', type)

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(data.url)
    } catch {
      setError("Échec de l'envoi de la photo.")
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <Stack spacing={1}>
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {variant === 'avatar' ? (
          <Avatar src={value ?? undefined} sx={{ width: 64, height: 64 }} />
        ) : value ? (
          <Box
            component="img"
            src={value}
            alt=""
            sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
          />
        ) : (
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          />
        )}

        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <UploadIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {value ? 'Changer' : 'Choisir une photo'}
        </Button>

        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </Stack>
    </Stack>
  )
}
