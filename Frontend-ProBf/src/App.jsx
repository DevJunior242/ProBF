import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FichoProPage from './pages/FichoProPage'
import ProsPage from './pages/ProsPage'
import FournisseursPage from './pages/FournisseursPage'
import FicheFournisseurPage from './pages/FicheFournisseurPage'
import DashboardPage from './pages/DashboardPage'
import ProfileEditPage from './pages/ProfileEditPage'
import FournisseurDashboardPage from './pages/FournisseurDashboardPage'
import PostDemandePage from './pages/PostDemandePage'
import ParrainagePage from './pages/ParrainagePage'
import AbonnementPage from './pages/AbonnementPage'
import MessagesPage from './pages/MessagesPage'
import AdminPage from './pages/AdminPage'
import CguPage from './pages/CguPage'
import ConfidentialitePage from './pages/ConfidentialitePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import NotFoundPage from './pages/NotFoundPage'
import VerificationPage from './pages/VerificationPage'

function App() {
  return (
    <Routes>
      {/* Pages publiques : navbar classique */}
      <Route element={<Layout />}>
        <Route element={<GuestRoute />}>
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<RegisterPage />} />
        </Route>
        <Route path="/" element={<HomePage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
        <Route path="/pros" element={<ProsPage />} />
        <Route path="/pros/:id" element={<FichoProPage />} />
        <Route path="/fournisseurs" element={<FournisseursPage />} />
        <Route path="/fournisseurs/:id" element={<FicheFournisseurPage />} />
        <Route path="/demandes/nouvelle" element={<PostDemandePage />} />
        <Route path="/cgu" element={<CguPage />} />
        <Route path="/confidentialite" element={<ConfidentialitePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Espace connecté : sidebar, protégé */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profil" element={<ProfileEditPage />} />
          <Route path="/fournisseur/dashboard" element={<FournisseurDashboardPage />} />
          <Route path="/parrainage" element={<ParrainagePage />} />
          <Route path="/abonnement" element={<AbonnementPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
