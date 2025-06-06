
import { db } from '../db';
import { participantsTable } from '../db/schema';
import { type CreateParticipantInput, type Participant } from '../schema';

export const createParticipant = async (input: CreateParticipantInput): Promise<Participant> => {
  try {
    // Insert participant record
    const result = await db.insert(participantsTable)
      .values({
        name: input.name,
        avatar_url: input.avatar_url || null,
        description: input.description || null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Participant creation failed:', error);
    throw error;
  }
};
