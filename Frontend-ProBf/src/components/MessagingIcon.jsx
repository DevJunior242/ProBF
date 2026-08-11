import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, IconButton } from '@mui/material'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const POLL_INTERVAL_MS = 20000

export default function MessagingIcon() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const charger = () => {
      api.get('/messages/unread-count').then(({ data }) => setCount(data.count))
    }

    charger()
    const interval = setInterval(charger, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [user])

  if (!user) return null

  return (
    <IconButton onClick={() => navigate('/messages')} aria-label="Messages">
      <Badge badgeContent={count} color="error">
        <ChatBubbleOutlineIcon />
      </Badge>
    </IconButton>
  )
}
