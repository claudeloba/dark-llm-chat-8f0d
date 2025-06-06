
import { db } from '../db';
import { chatsTable } from '../db/schema';
import { type UpdateChatInput, type Chat } from '../schema';
import { eq } from 'drizzle-orm';

export const updateChat = async (input: UpdateChatInput): Promise<Chat> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof chatsTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    // Update the chat record
    const result = await db.update(chatsTable)
      .set(updateData)
      .where(eq(chatsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Chat with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Chat update failed:', error);
    throw error;
  }
};
