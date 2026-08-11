import { useEffect, useState } from 'react'
import { Paper, Stack, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import api from '../api/client'

export default function DashboardTrendChart({ endpoint = '/dashboard/graphiques', color = '#F3680F' }) {
  const [periode, setPeriode] = useState('jour')
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get(endpoint, { params: { periode } }).then(({ data }) => setData(data))
  }, [endpoint, periode])

  const labels = data?.donnees.map((d) => d.periode) ?? []
  const valeurs = data?.donnees.map((d) => d.total) ?? []

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {data?.label ?? 'Évolution'}
        </Typography>
        <ToggleButtonGroup size="small" value={periode} exclusive onChange={(_, v) => v && setPeriode(v)}>
          <ToggleButton value="jour">14 jours</ToggleButton>
          <ToggleButton value="mois">6 mois</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {labels.length === 0 ? (
        <Typography color="text.secondary">Pas encore de données à afficher.</Typography>
      ) : (
        <LineChart
          xAxis={[{ scaleType: 'point', data: labels }]}
          series={[{ data: valeurs, label: data.label, color, area: true, curve: 'natural' }]}
          height={240}
        />
      )}
    </Paper>
  )
}
