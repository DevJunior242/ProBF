import { db } from './db'

export async function cacherMetiers(metiers) {
  await db.metiers.bulkPut(metiers)
}

export async function chargerMetiersCache() {
  return db.metiers.toArray()
}

export async function cacherQuartiers(quartiers) {
  await db.quartiers.bulkPut(quartiers)
}

export async function chargerQuartiersCache() {
  return db.quartiers.toArray()
}
