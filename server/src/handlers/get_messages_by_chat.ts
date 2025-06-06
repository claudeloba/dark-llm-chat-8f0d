
import { db } from '../db';
import { messagesTable } from '../db/schema';
import { type Message } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getMessagesByChat = async (chatId: number): Promise<Message[]> => {
  try {
    const results = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.chat_id, chatId))
      .orderBy(asc(messagesTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get messages by chat:', error);
    throw error;
  }
};
