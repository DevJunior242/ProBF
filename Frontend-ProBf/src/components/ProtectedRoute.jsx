import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role }) {
  const { user, hasRole } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
