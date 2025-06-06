
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable, participantsTable, chatParticipantsTable } from '../db/schema';
import { removeParticipantFromChat } from '../handlers/remove_participant_from_chat';
import { eq, and } from 'drizzle-orm';

describe('removeParticipantFromChat', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should remove participant from chat', async () => {
    // Create chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();
    const chat = chatResult[0];

    // Create participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Test Participant',
        avatar_url: null,
        description: null
      })
      .returning()
      .execute();
    const participant = participantResult[0];

    // Add participant to chat
    const chatParticipantResult = await db.insert(chatParticipantsTable)
      .values({
        chat_id: chat.id,
        participant_id: participant.id
      })
      .returning()
      .execute();
    const chatParticipant = chatParticipantResult[0];

    // Verify participant is in chat
    const beforeRemoval = await db.select()
      .from(chatParticipantsTable)
      .where(
        and(
          eq(chatParticipantsTable.chat_id, chat.id),
          eq(chatParticipantsTable.participant_id, participant.id)
        )
      )
      .execute();
    expect(beforeRemoval).toHaveLength(1);

    // Remove participant from chat
    await removeParticipantFromChat(chat.id, participant.id);

    // Verify participant is removed from chat
    const afterRemoval = await db.select()
      .from(chatParticipantsTable)
      .where(
        and(
          eq(chatParticipantsTable.chat_id, chat.id),
          eq(chatParticipantsTable.participant_id, participant.id)
        )
      )
      .execute();
    expect(afterRemoval).toHaveLength(0);
  });

  it('should handle non-existent participant in chat gracefully', async () => {
    // Create chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();
    const chat = chatResult[0];

    // Create participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Test Participant',
        avatar_url: null,
        description: null
      })
      .returning()
      .execute();
    const participant = participantResult[0];

    // Try to remove participant that's not in the chat - should not throw
    await removeParticipantFromChat(chat.id, participant.id);

    // Verify no participants in chat
    const chatParticipants = await db.select()
      .from(chatParticipantsTable)
      .where(eq(chatParticipantsTable.chat_id, chat.id))
      .execute();
    expect(chatParticipants).toHaveLength(0);
  });

  it('should only remove specific participant-chat relationship', async () => {
    // Create chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();
    const chat = chatResult[0];

    // Create two participants
    const participant1Result = await db.insert(participantsTable)
      .values({
        name: 'Participant 1',
        avatar_url: null,
        description: null
      })
      .returning()
      .execute();
    const participant1 = participant1Result[0];

    const participant2Result = await db.insert(participantsTable)
      .values({
        name: 'Participant 2',
        avatar_url: null,
        description: null
      })
      .returning()
      .execute();
    const participant2 = participant2Result[0];

    // Add both participants to chat
    await db.insert(chatParticipantsTable)
      .values([
        {
          chat_id: chat.id,
          participant_id: participant1.id
        },
        {
          chat_id: chat.id,
          participant_id: participant2.id
        }
      ])
      .execute();

    // Remove only participant 1
    await removeParticipantFromChat(chat.id, participant1.id);

    // Verify only participant 1 is removed
    const remainingParticipants = await db.select()
      .from(chatParticipantsTable)
      .where(eq(chatParticipantsTable.chat_id, chat.id))
      .execute();
    
    expect(remainingParticipants).toHaveLength(1);
    expect(remainingParticipants[0].participant_id).toEqual(participant2.id);
  });
});
