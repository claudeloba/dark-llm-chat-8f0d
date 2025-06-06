
import { db } from '../db';
import { chatsTable, messagesTable, chatParticipantsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteChat = async (id: number): Promise<void> => {
  try {
    // Delete in order to respect foreign key constraints
    // First delete messages associated with the chat
    await db.delete(messagesTable)
      .where(eq(messagesTable.chat_id, id))
      .execute();

    // Then delete chat participant relationships
    await db.delete(chatParticipantsTable)
      .where(eq(chatParticipantsTable.chat_id, id))
      .execute();

    // Finally delete the chat itself
    await db.delete(chatsTable)
      .where(eq(chatsTable.id, id))
      .execute();
  } catch (error) {
    console.error('Chat deletion failed:', error);
    throw error;
  }
};
