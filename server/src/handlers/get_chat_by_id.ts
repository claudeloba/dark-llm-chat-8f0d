
import { db } from '../db';
import { chatsTable } from '../db/schema';
import { type Chat } from '../schema';
import { eq } from 'drizzle-orm';

export const getChatById = async (id: number): Promise<Chat | null> => {
  try {
    const results = await db.select()
      .from(chatsTable)
      .where(eq(chatsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get chat by id:', error);
    throw error;
  }
};
