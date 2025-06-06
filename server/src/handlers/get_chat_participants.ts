
import { db } from '../db';
import { chatParticipantsTable, participantsTable } from '../db/schema';
import { type Participant } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getChatParticipants = async (chatId: number): Promise<Participant[]> => {
  try {
    // Join chat_participants with participants to get participant details
    // Order by joined_at to maintain the order participants were added
    const results = await db.select()
      .from(chatParticipantsTable)
      .innerJoin(participantsTable, eq(chatParticipantsTable.participant_id, participantsTable.id))
      .where(eq(chatParticipantsTable.chat_id, chatId))
      .orderBy(asc(chatParticipantsTable.joined_at))
      .execute();

    // Extract participant data from joined results
    return results.map(result => ({
      id: result.participants.id,
      name: result.participants.name,
      avatar_url: result.participants.avatar_url,
      description: result.participants.description,
      created_at: result.participants.created_at
    }));
  } catch (error) {
    console.error('Get chat participants failed:', error);
    throw error;
  }
};
