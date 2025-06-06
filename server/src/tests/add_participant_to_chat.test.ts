
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable, participantsTable, chatParticipantsTable } from '../db/schema';
import { type AddParticipantToChatInput, type CreateChatInput, type CreateParticipantInput } from '../schema';
import { addParticipantToChat } from '../handlers/add_participant_to_chat';
import { eq, and } from 'drizzle-orm';

// Test data
const testChatInput: CreateChatInput = {
  title: 'Test Group Chat',
  type: 'group_chat'
};

const testParticipantInput: CreateParticipantInput = {
  name: 'Alice',
  avatar_url: 'https://example.com/alice.jpg',
  description: 'AI Assistant for testing'
};

describe('addParticipantToChat', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should add participant to chat', async () => {
    // Create prerequisite data
    const chatResult = await db.insert(chatsTable)
      .values(testChatInput)
      .returning()
      .execute();
    const chat = chatResult[0];

    const participantResult = await db.insert(participantsTable)
      .values(testParticipantInput)
      .returning()
      .execute();
    const participant = participantResult[0];

    const input: AddParticipantToChatInput = {
      chat_id: chat.id,
      participant_id: participant.id
    };

    const result = await addParticipantToChat(input);

    // Verify result
    expect(result.id).toBeDefined();
    expect(result.chat_id).toEqual(chat.id);
    expect(result.participant_id).toEqual(participant.id);
    expect(result.joined_at).toBeInstanceOf(Date);
  });

  it('should save relationship to database', async () => {
    // Create prerequisite data
    const chatResult = await db.insert(chatsTable)
      .values(testChatInput)
      .returning()
      .execute();
    const chat = chatResult[0];

    const participantResult = await db.insert(participantsTable)
      .values(testParticipantInput)
      .returning()
      .execute();
    const participant = participantResult[0];

    const input: AddParticipantToChatInput = {
      chat_id: chat.id,
      participant_id: participant.id
    };

    const result = await addParticipantToChat(input);

    // Query database to verify relationship was saved
    const chatParticipants = await db.select()
      .from(chatParticipantsTable)
      .where(eq(chatParticipantsTable.id, result.id))
      .execute();

    expect(chatParticipants).toHaveLength(1);
    expect(chatParticipants[0].chat_id).toEqual(chat.id);
    expect(chatParticipants[0].participant_id).toEqual(participant.id);
    expect(chatParticipants[0].joined_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent chat', async () => {
    // Create only participant
    const participantResult = await db.insert(participantsTable)
      .values(testParticipantInput)
      .returning()
      .execute();
    const participant = participantResult[0];

    const input: AddParticipantToChatInput = {
      chat_id: 999, // Non-existent chat ID
      participant_id: participant.id
    };

    await expect(addParticipantToChat(input)).rejects.toThrow(/Chat with id 999 not found/i);
  });

  it('should throw error for non-existent participant', async () => {
    // Create only chat
    const chatResult = await db.insert(chatsTable)
      .values(testChatInput)
      .returning()
      .execute();
    const chat = chatResult[0];

    const input: AddParticipantToChatInput = {
      chat_id: chat.id,
      participant_id: 999 // Non-existent participant ID
    };

    await expect(addParticipantToChat(input)).rejects.toThrow(/Participant with id 999 not found/i);
  });

  it('should throw error when participant already in chat', async () => {
    // Create prerequisite data
    const chatResult = await db.insert(chatsTable)
      .values(testChatInput)
      .returning()
      .execute();
    const chat = chatResult[0];

    const participantResult = await db.insert(participantsTable)
      .values(testParticipantInput)
      .returning()
      .execute();
    const participant = participantResult[0];

    const input: AddParticipantToChatInput = {
      chat_id: chat.id,
      participant_id: participant.id
    };

    // Add participant first time - should succeed
    await addParticipantToChat(input);

    // Try to add same participant again - should fail
    await expect(addParticipantToChat(input)).rejects.toThrow(/Participant .* is already in chat/i);
  });

  it('should handle multiple participants in same chat', async () => {
    // Create chat and two participants
    const chatResult = await db.insert(chatsTable)
      .values(testChatInput)
      .returning()
      .execute();
    const chat = chatResult[0];

    const participant1Result = await db.insert(participantsTable)
      .values(testParticipantInput)
      .returning()
      .execute();
    const participant1 = participant1Result[0];

    const participant2Result = await db.insert(participantsTable)
      .values({
        name: 'Bob',
        avatar_url: 'https://example.com/bob.jpg',
        description: 'Another AI Assistant'
      })
      .returning()
      .execute();
    const participant2 = participant2Result[0];

    // Add both participants to chat
    const result1 = await addParticipantToChat({
      chat_id: chat.id,
      participant_id: participant1.id
    });

    const result2 = await addParticipantToChat({
      chat_id: chat.id,
      participant_id: participant2.id
    });

    // Verify both relationships exist
    const chatParticipants = await db.select()
      .from(chatParticipantsTable)
      .where(eq(chatParticipantsTable.chat_id, chat.id))
      .execute();

    expect(chatParticipants).toHaveLength(2);
    expect(chatParticipants.map(cp => cp.participant_id)).toContain(participant1.id);
    expect(chatParticipants.map(cp => cp.participant_id)).toContain(participant2.id);
  });
});
