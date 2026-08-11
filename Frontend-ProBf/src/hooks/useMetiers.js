import { useEffect, useState } from 'react'
import api from '../api/client'

export default function useMetiers() {
  const [metiers, setMetiers] = useState([])

  useEffect(() => {
    api.get('/metiers').then(({ data }) => setMetiers(data))
  }, [])

  const ajouterMetier = async (nom) => {
    const { data } = await api.post('/metiers', { nom })
    setMetiers((prev) => {
      if (prev.some((m) => m.id === data.id)) return prev
      return [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom))
    })
    return data
  }

  return { metiers, ajouterMetier }
}
