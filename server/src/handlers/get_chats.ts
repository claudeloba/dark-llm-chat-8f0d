
import { db } from '../db';
import { chatsTable } from '../db/schema';
import { type Chat } from '../schema';
import { desc } from 'drizzle-orm';

export const getChats = async (): Promise<Chat[]> => {
  try {
    const results = await db.select()
      .from(chatsTable)
      .orderBy(desc(chatsTable.updated_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get chats:', error);
    throw error;
  }
};
