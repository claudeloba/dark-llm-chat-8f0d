
import { db } from '../db';
import { messagesTable } from '../db/schema';
import { type CreateMessageInput, type Message } from '../schema';

export const createMessage = async (input: CreateMessageInput): Promise<Message> => {
  try {
    // Insert message record
    const result = await db.insert(messagesTable)
      .values({
        chat_id: input.chat_id,
        content: input.content,
        role: input.role,
        participant_id: input.participant_id || null
      })
      .returning()
      .execute();

    const message = result[0];
    return message;
  } catch (error) {
    console.error('Message creation failed:', error);
    throw error;
  }
};
