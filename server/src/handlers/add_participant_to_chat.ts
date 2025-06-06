
import { db } from '../db';
import { chatParticipantsTable, chatsTable, participantsTable } from '../db/schema';
import { type AddParticipantToChatInput, type ChatParticipant } from '../schema';
import { eq, and } from 'drizzle-orm';

export const addParticipantToChat = async (input: AddParticipantToChatInput): Promise<ChatParticipant> => {
  try {
    // Verify that the chat exists
    const chat = await db.select()
      .from(chatsTable)
      .where(eq(chatsTable.id, input.chat_id))
      .execute();

    if (chat.length === 0) {
      throw new Error(`Chat with id ${input.chat_id} not found`);
    }

    // Verify that the participant exists
    const participant = await db.select()
      .from(participantsTable)
      .where(eq(participantsTable.id, input.participant_id))
      .execute();

    if (participant.length === 0) {
      throw new Error(`Participant with id ${input.participant_id} not found`);
    }

    // Check if the participant is already in the chat
    const existingRelation = await db.select()
      .from(chatParticipantsTable)
      .where(and(
        eq(chatParticipantsTable.chat_id, input.chat_id),
        eq(chatParticipantsTable.participant_id, input.participant_id)
      ))
      .execute();

    if (existingRelation.length > 0) {
      throw new Error(`Participant ${input.participant_id} is already in chat ${input.chat_id}`);
    }

    // Add participant to chat
    const result = await db.insert(chatParticipantsTable)
      .values({
        chat_id: input.chat_id,
        participant_id: input.participant_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Adding participant to chat failed:', error);
    throw error;
  }
};
