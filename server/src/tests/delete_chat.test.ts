
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable, messagesTable, participantsTable, chatParticipantsTable } from '../db/schema';
import { deleteChat } from '../handlers/delete_chat';
import { eq } from 'drizzle-orm';

describe('deleteChat', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a chat', async () => {
    // Create test chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Chat',
        type: 'smart_answer'
      })
      .returning()
      .execute();

    const chatId = chatResult[0].id;

    // Verify chat exists
    const chatsBefore = await db.select()
      .from(chatsTable)
      .where(eq(chatsTable.id, chatId))
      .execute();
    
    expect(chatsBefore).toHaveLength(1);

    // Delete the chat
    await deleteChat(chatId);

    // Verify chat is deleted
    const chatsAfter = await db.select()
      .from(chatsTable)
      .where(eq(chatsTable.id, chatId))
      .execute();
    
    expect(chatsAfter).toHaveLength(0);
  });

  it('should delete associated messages when deleting chat', async () => {
    // Create test chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Chat with Messages',
        type: 'group_chat'
      })
      .returning()
      .execute();

    const chatId = chatResult[0].id;

    // Create test messages
    await db.insert(messagesTable)
      .values([
        {
          chat_id: chatId,
          content: 'First message',
          role: 'user',
          participant_id: null
        },
        {
          chat_id: chatId,
          content: 'Second message',
          role: 'assistant',
          participant_id: null
        }
      ])
      .execute();

    // Verify messages exist
    const messagesBefore = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.chat_id, chatId))
      .execute();
    
    expect(messagesBefore).toHaveLength(2);

    // Delete the chat
    await deleteChat(chatId);

    // Verify messages are deleted
    const messagesAfter = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.chat_id, chatId))
      .execute();
    
    expect(messagesAfter).toHaveLength(0);
  });

  it('should delete chat participant relationships when deleting chat', async () => {
    // Create test chat
    const chatResult = await db.insert(chatsTable)
      .values({
        title: 'Test Group Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();

    const chatId = chatResult[0].id;

    // Create test participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Test Participant',
        avatar_url: null,
        description: null
      })
      .returning()
      .execute();

    const participantId = participantResult[0].id;

    // Create chat participant relationship
    await db.insert(chatParticipantsTable)
      .values({
        chat_id: chatId,
        participant_id: participantId
      })
      .execute();

    // Verify relationship exists
    const relationshipsBefore = await db.select()
      .from(chatParticipantsTable)
      .where(eq(chatParticipantsTable.chat_id, chatId))
      .execute();
    
    expect(relationshipsBefore).toHaveLength(1);

    // Delete the chat
    await deleteChat(chatId);

    // Verify relationship is deleted
    const relationshipsAfter = await db.select()
      .from(chatParticipantsTable)
      .where(eq(chatParticipantsTable.chat_id, chatId))
      .execute();
    
    expect(relationshipsAfter).toHaveLength(0);

    // Verify participant still exists (should not be deleted)
    const participantsAfter = await db.select()
      .from(participantsTable)
      .where(eq(participantsTable.id, participantId))
      .execute();
    
    expect(participantsAfter).toHaveLength(1);
  });

  it('should handle deleting non-existent chat gracefully', async () => {
    const nonExistentId = 99999;

    // Should not throw error when deleting non-existent chat
    await expect(deleteChat(nonExistentId)).resolves.toBeUndefined();
  });
});
