
import { db } from '../db';
import { participantsTable } from '../db/schema';
import { type Participant } from '../schema';
import { desc } from 'drizzle-orm';

export const getParticipants = async (): Promise<Participant[]> => {
  try {
    const results = await db.select()
      .from(participantsTable)
      .orderBy(desc(participantsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get participants:', error);
    throw error;
  }
};
