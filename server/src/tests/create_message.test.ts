
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable, messagesTable, participantsTable, chatParticipantsTable } from '../db/schema';
import { type CreateMessageInput } from '../schema';
import { createMessage } from '../handlers/create_message';
import { eq } from 'drizzle-orm';

describe('createMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testChatId: number;
  let testParticipantId: number;

  beforeEach(async () => {
    // Create prerequisite chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Chat',
        type: 'smart_answer'
      })
      .returning()
      .execute();
    testChatId = chatResult[0].id;

    // Create prerequisite participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Test Participant',
        avatar_url: null,
        description: null
      })
      .returning()
      .execute();
    testParticipantId = participantResult[0].id;
  });

  it('should create a message without participant', async () => {
    const testInput: CreateMessageInput = {
      chat_id: testChatId,
      content: 'Hello, world!',
      role: 'user'
    };

    const result = await createMessage(testInput);

    // Basic field validation
    expect(result.chat_id).toEqual(testChatId);
    expect(result.content).toEqual('Hello, world!');
    expect(result.role).toEqual('user');
    expect(result.participant_id).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a message with participant', async () => {
    const testInput: CreateMessageInput = {
      chat_id: testChatId,
      content: 'Group chat message',
      role: 'assistant',
      participant_id: testParticipantId
    };

    const result = await createMessage(testInput);

    // Basic field validation
    expect(result.chat_id).toEqual(testChatId);
    expect(result.content).toEqual('Group chat message');
    expect(result.role).toEqual('assistant');
    expect(result.participant_id).toEqual(testParticipantId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save message to database', async () => {
    const testInput: CreateMessageInput = {
      chat_id: testChatId,
      content: 'Test message content',
      role: 'system'
    };

    const result = await createMessage(testInput);

    // Query using proper drizzle syntax
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].chat_id).toEqual(testChatId);
    expect(messages[0].content).toEqual('Test message content');
    expect(messages[0].role).toEqual('system');
    expect(messages[0].participant_id).toBeNull();
    expect(messages[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle all message roles', async () => {
    const roles = ['user', 'assistant', 'system'] as const;

    for (const role of roles) {
      const testInput: CreateMessageInput = {
        chat_id: testChatId,
        content: `Message with ${role} role`,
        role: role
      };

      const result = await createMessage(testInput);
      expect(result.role).toEqual(role);
      expect(result.content).toEqual(`Message with ${role} role`);
    }
  });

  it('should create multiple messages for same chat', async () => {
    const testInput1: CreateMessageInput = {
      chat_id: testChatId,
      content: 'First message',
      role: 'user'
    };

    const testInput2: CreateMessageInput = {
      chat_id: testChatId,
      content: 'Second message',
      role: 'assistant'
    };

    const result1 = await createMessage(testInput1);
    const result2 = await createMessage(testInput2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.chat_id).toEqual(testChatId);
    expect(result2.chat_id).toEqual(testChatId);
    expect(result1.content).toEqual('First message');
    expect(result2.content).toEqual('Second message');

    // Verify both messages exist in database
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.chat_id, testChatId))
      .execute();

    expect(messages).toHaveLength(2);
  });
});
