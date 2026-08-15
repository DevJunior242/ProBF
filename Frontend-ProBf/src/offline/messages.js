import { db } from './db'

export async function cacherConversations(conversations) {
  await db.conversations.put({ id: 'liste', conversations })
}

export async function chargerConversationsCache() {
  const row = await db.conversations.get('liste')
  return row?.conversations ?? null
}

export async function cacherMessages(conversationId, messages) {
  await db.messagesParConversation.put({ id: conversationId, messages })
}

export async function chargerMessagesCache(conversationId) {
  const row = await db.messagesParConversation.get(conversationId)
  return row?.messages ?? null
}
