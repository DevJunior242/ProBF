import { useState } from 'react'
import { Container, Typography, Tabs, Tab, Box } from '@mui/material'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminPaiements from '../components/admin/AdminPaiements'
import AdminMoyensPaiement from '../components/admin/AdminMoyensPaiement'
import AdminTarifs from '../components/admin/AdminTarifs'
import AdminAbonnements from '../components/admin/AdminAbonnements'
import AdminUtilisateurs from '../components/admin/AdminUtilisateurs'
import AdminRetraits from '../components/admin/AdminRetraits'

export default function AdminPage() {
  const [onglet, setOnglet] = useState(0)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Administration
      </Typography>

      <Tabs
        value={onglet}
        onChange={(_, v) => setOnglet(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Dashboard" />
        <Tab label="Paiements à valider" />
        <Tab label="Moyens de paiement" />
        <Tab label="Tarifs" />
        <Tab label="Abonnements" />
        <Tab label="Retraits ambassadeurs" />
        <Tab label="Utilisateurs" />
      </Tabs>

      <Box role="tabpanel" hidden={onglet !== 0}>
        {onglet === 0 && <AdminDashboard />}
      </Box>
      <Box role="tabpanel" hidden={onglet !== 1}>
        {onglet === 1 && <AdminPaiements />}
      </Box>
      <Box role="tabpanel" hidden={onglet !== 2}>
        {onglet === 2 && <AdminMoyensPaiement />}
      </Box>
      <Box role="tabpanel" hidden={onglet !== 3}>
        {onglet === 3 && <AdminTarifs />}
      </Box>
      <Box role="tabpanel" hidden={onglet !== 4}>
        {onglet === 4 && <AdminAbonnements />}
      </Box>
      <Box role="tabpanel" hidden={onglet !== 5}>
        {onglet === 5 && <AdminRetraits />}
      </Box>
      <Box role="tabpanel" hidden={onglet !== 6}>
        {onglet === 6 && <AdminUtilisateurs />}
      </Box>
    </Container>
  )
}
