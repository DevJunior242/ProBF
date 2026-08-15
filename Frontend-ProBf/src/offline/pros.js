import { db } from './db'

export async function cacherProDetail(pro) {
  await db.prosDetail.put({ id: pro.id, pro })
}

export async function chargerProDetailCache(id) {
  const row = await db.prosDetail.get(id)
  return row?.pro ?? null
}
