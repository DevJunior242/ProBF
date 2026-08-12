import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function GuestRoute() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
