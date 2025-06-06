
import { db } from '../db';
import { chatsTable } from '../db/schema';
import { type CreateChatInput, type Chat } from '../schema';

export const createChat = async (input: CreateChatInput): Promise<Chat> => {
  try {
    // Insert chat record
    const result = await db.insert(chatsTable)
      .values({
        title: input.title,
        type: input.type
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Chat creation failed:', error);
    throw error;
  }
};
