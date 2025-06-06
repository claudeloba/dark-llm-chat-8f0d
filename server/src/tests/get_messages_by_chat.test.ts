
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable, messagesTable } from '../db/schema';
import { getMessagesByChat } from '../handlers/get_messages_by_chat';

describe('getMessagesByChat', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return messages for a specific chat ordered by created_at', async () => {
    // Create test chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Chat',
        type: 'smart_answer'
      })
      .returning()
      .execute();
    const chatId = chatResult[0].id;

    // Create test messages with slight delays to ensure different timestamps
    const message1Result = await db.insert(messagesTable)
      .values({
        chat_id: chatId,
        content: 'First message',
        role: 'user',
        participant_id: null
      })
      .returning()
      .execute();

    // Add a small delay
    await new Promise(resolve => setTimeout(resolve, 10));

    const message2Result = await db.insert(messagesTable)
      .values({
        chat_id: chatId,
        content: 'Second message',
        role: 'assistant',
        participant_id: null
      })
      .returning()
      .execute();

    const messages = await getMessagesByChat(chatId);

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toEqual('First message');
    expect(messages[0].role).toEqual('user');
    expect(messages[0].chat_id).toEqual(chatId);
    expect(messages[0].participant_id).toBeNull();
    expect(messages[0].created_at).toBeInstanceOf(Date);

    expect(messages[1].content).toEqual('Second message');
    expect(messages[1].role).toEqual('assistant');
    expect(messages[1].chat_id).toEqual(chatId);
    expect(messages[1].participant_id).toBeNull();
    expect(messages[1].created_at).toBeInstanceOf(Date);

    // Verify chronological order
    expect(messages[0].created_at <= messages[1].created_at).toBe(true);
  });

  it('should return empty array for chat with no messages', async () => {
    // Create test chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Empty Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();
    const chatId = chatResult[0].id;

    const messages = await getMessagesByChat(chatId);

    expect(messages).toHaveLength(0);
    expect(Array.isArray(messages)).toBe(true);
  });

  it('should return only messages for the specified chat', async () => {
    // Create two test chats
    const chat1Result = await db.insert(chatsTable)
      .values({
        title: 'Chat 1',
        type: 'smart_answer'
      })
      .returning()
      .execute();
    const chat1Id = chat1Result[0].id;

    const chat2Result = await db.insert(chatsTable)
      .values({
        title: 'Chat 2',
        type: 'autopilot'
      })
      .returning()
      .execute();
    const chat2Id = chat2Result[0].id;

    // Create messages for both chats
    await db.insert(messagesTable)
      .values({
        chat_id: chat1Id,
        content: 'Message in chat 1',
        role: 'user',
        participant_id: null
      })
      .execute();

    await db.insert(messagesTable)
      .values({
        chat_id: chat2Id,
        content: 'Message in chat 2',
        role: 'assistant',
        participant_id: null
      })
      .execute();

    await db.insert(messagesTable)
      .values({
        chat_id: chat1Id,
        content: 'Another message in chat 1',
        role: 'system',
        participant_id: null
      })
      .execute();

    const chat1Messages = await getMessagesByChat(chat1Id);
    const chat2Messages = await getMessagesByChat(chat2Id);

    expect(chat1Messages).toHaveLength(2);
    expect(chat2Messages).toHaveLength(1);

    // Verify all messages belong to the correct chat
    chat1Messages.forEach(message => {
      expect(message.chat_id).toEqual(chat1Id);
    });

    chat2Messages.forEach(message => {
      expect(message.chat_id).toEqual(chat2Id);
    });

    expect(chat1Messages[0].content).toEqual('Message in chat 1');
    expect(chat1Messages[1].content).toEqual('Another message in chat 1');
    expect(chat2Messages[0].content).toEqual('Message in chat 2');
  });

  it('should handle messages with participant_id correctly', async () => {
    // Create test chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Group Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();
    const chatId = chatResult[0].id;

    // Create message with participant_id
    await db.insert(messagesTable)
      .values({
        chat_id: chatId,
        content: 'Message with participant',
        role: 'user',
        participant_id: 123
      })
      .execute();

    // Create message without participant_id
    await db.insert(messagesTable)
      .values({
        chat_id: chatId,
        content: 'Message without participant',
        role: 'assistant',
        participant_id: null
      })
      .execute();

    const messages = await getMessagesByChat(chatId);

    expect(messages).toHaveLength(2);
    
    const messageWithParticipant = messages.find(m => m.content === 'Message with participant');
    const messageWithoutParticipant = messages.find(m => m.content === 'Message without participant');

    expect(messageWithParticipant?.participant_id).toEqual(123);
    expect(messageWithoutParticipant?.participant_id).toBeNull();
  });
});
