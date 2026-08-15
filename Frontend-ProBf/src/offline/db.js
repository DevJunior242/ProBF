import Dexie from 'dexie'

export const db = new Dexie('ProBF')

// metiers/quartiers : référentiels dont dépendent les formulaires (publier
// une demande, filtrer les pros) — sans cache, un visiteur hors-ligne se
// retrouve avec des menus déroulants vides et ne peut plus rien faire.
//
// prosQueries : une ligne par combinaison de filtres déjà consultée
// (id = clé sérialisée métier+quartier+recherche+page), pas une ligne par
// pro — on veut rejouer exactement ce que l'utilisateur a déjà vu, comme
// `rosters` dans IBC (un roster entier par assignment, pas un élève par
// élève).
//
// syncQueue : demandes publiées hors-ligne, en attente d'envoi réel au
// serveur. Index composé [type+status] car flushDemandeQueue filtre
// toujours sur les deux à la fois.
db.version(1).stores({
  metiers: 'id',
  quartiers: 'id',
  prosQueries: 'id',
  syncQueue: 'id, type, status, createdAt, [type+status]',
})
