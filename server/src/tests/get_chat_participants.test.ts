
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable, participantsTable, chatParticipantsTable } from '../db/schema';
import { getChatParticipants } from '../handlers/get_chat_participants';

describe('getChatParticipants', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return participants for a chat', async () => {
    // Create a chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();
    const chat = chatResult[0];

    // Create participants
    const participantResults = await db.insert(participantsTable)
      .values([
        {
          name: 'Alice',
          avatar_url: 'https://example.com/alice.jpg',
          description: 'AI Assistant Alice'
        },
        {
          name: 'Bob',
          avatar_url: null,
          description: 'Bot Bob'
        }
      ])
      .returning()
      .execute();

    // Add participants to chat
    await db.insert(chatParticipantsTable)
      .values([
        {
          chat_id: chat.id,
          participant_id: participantResults[0].id
        },
        {
          chat_id: chat.id,
          participant_id: participantResults[1].id
        }
      ])
      .execute();

    const result = await getChatParticipants(chat.id);

    expect(result).toHaveLength(2);
    
    // Check first participant
    const alice = result.find(p => p.name === 'Alice');
    expect(alice).toBeDefined();
    expect(alice!.name).toEqual('Alice');
    expect(alice!.avatar_url).toEqual('https://example.com/alice.jpg');
    expect(alice!.description).toEqual('AI Assistant Alice');
    expect(alice!.created_at).toBeInstanceOf(Date);
    expect(alice!.id).toBeDefined();

    // Check second participant
    const bob = result.find(p => p.name === 'Bob');
    expect(bob).toBeDefined();
    expect(bob!.name).toEqual('Bob');
    expect(bob!.avatar_url).toBeNull();
    expect(bob!.description).toEqual('Bot Bob');
    expect(bob!.created_at).toBeInstanceOf(Date);
    expect(bob!.id).toBeDefined();
  });

  it('should return empty array for chat with no participants', async () => {
    // Create a chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Empty Chat',
        type: 'smart_answer'
      })
      .returning()
      .execute();
    const chat = chatResult[0];

    const result = await getChatParticipants(chat.id);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent chat', async () => {
    const result = await getChatParticipants(999);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return participants ordered by join order', async () => {
    // Create a chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Ordered Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();
    const chat = chatResult[0];

    // Create participants
    const participantResults = await db.insert(participantsTable)
      .values([
        { name: 'First' },
        { name: 'Second' },
        { name: 'Third' }
      ])
      .returning()
      .execute();

    // Add participants to chat one by one to ensure proper ordering
    // Add Third first
    await db.insert(chatParticipantsTable)
      .values({
        chat_id: chat.id,
        participant_id: participantResults[2].id
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Add First second
    await db.insert(chatParticipantsTable)
      .values({
        chat_id: chat.id,
        participant_id: participantResults[0].id
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Add Second third
    await db.insert(chatParticipantsTable)
      .values({
        chat_id: chat.id,
        participant_id: participantResults[1].id
      })
      .execute();

    const result = await getChatParticipants(chat.id);

    expect(result).toHaveLength(3);
    // Results should maintain the order they were added to the chat (by joined_at timestamp)
    expect(result[0].name).toEqual('Third');
    expect(result[1].name).toEqual('First');
    expect(result[2].name).toEqual('Second');
  });
});
