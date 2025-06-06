
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable } from '../db/schema';
import { type CreateChatInput, type UpdateChatInput } from '../schema';
import { updateChat } from '../handlers/update_chat';
import { eq } from 'drizzle-orm';

// Test input for creating initial chat
const testChatInput: CreateChatInput = {
  title: 'Original Chat Title',
  type: 'smart_answer'
};

describe('updateChat', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update chat title', async () => {
    // Create initial chat
    const [createdChat] = await db.insert(chatsTable)
      .values({
        title: testChatInput.title,
        type: testChatInput.type
      })
      .returning()
      .execute();

    const updateInput: UpdateChatInput = {
      id: createdChat.id,
      title: 'Updated Chat Title'
    };

    const result = await updateChat(updateInput);

    expect(result.id).toEqual(createdChat.id);
    expect(result.title).toEqual('Updated Chat Title');
    expect(result.type).toEqual('smart_answer');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
  });

  it('should update chat in database', async () => {
    // Create initial chat
    const [createdChat] = await db.insert(chatsTable)
      .values({
        title: testChatInput.title,
        type: testChatInput.type
      })
      .returning()
      .execute();

    const updateInput: UpdateChatInput = {
      id: createdChat.id,
      title: 'Updated Chat Title'
    };

    await updateChat(updateInput);

    // Verify update in database
    const chats = await db.select()
      .from(chatsTable)
      .where(eq(chatsTable.id, createdChat.id))
      .execute();

    expect(chats).toHaveLength(1);
    expect(chats[0].title).toEqual('Updated Chat Title');
    expect(chats[0].type).toEqual('smart_answer');
    expect(chats[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle partial updates', async () => {
    // Create initial chat
    const [createdChat] = await db.insert(chatsTable)
      .values({
        title: testChatInput.title,
        type: testChatInput.type
      })
      .returning()
      .execute();

    const updateInput: UpdateChatInput = {
      id: createdChat.id
      // No title provided - should only update updated_at
    };

    const result = await updateChat(updateInput);

    expect(result.id).toEqual(createdChat.id);
    expect(result.title).toEqual('Original Chat Title'); // Should remain unchanged
    expect(result.type).toEqual('smart_answer');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
  });

  it('should throw error for non-existent chat', async () => {
    const updateInput: UpdateChatInput = {
      id: 99999,
      title: 'This should fail'
    };

    expect(updateChat(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update updated_at timestamp even without other changes', async () => {
    // Create initial chat
    const [createdChat] = await db.insert(chatsTable)
      .values({
        title: testChatInput.title,
        type: testChatInput.type
      })
      .returning()
      .execute();

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateChatInput = {
      id: createdChat.id
    };

    const result = await updateChat(updateInput);

    expect(result.updated_at.getTime()).toBeGreaterThan(createdChat.updated_at.getTime());
  });
});
