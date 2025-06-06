
import { db } from '../db';
import { chatParticipantsTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const removeParticipantFromChat = async (chatId: number, participantId: number): Promise<void> => {
  try {
    await db.delete(chatParticipantsTable)
      .where(
        and(
          eq(chatParticipantsTable.chat_id, chatId),
          eq(chatParticipantsTable.participant_id, participantId)
        )
      )
      .execute();
  } catch (error) {
    console.error('Remove participant from chat failed:', error);
    throw error;
  }
};
