
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable } from '../db/schema';
import { type CreateChatInput } from '../schema';
import { createChat } from '../handlers/create_chat';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateChatInput = {
  title: 'Test Chat',
  type: 'smart_answer'
};

describe('createChat', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a chat', async () => {
    const result = await createChat(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Chat');
    expect(result.type).toEqual('smart_answer');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save chat to database', async () => {
    const result = await createChat(testInput);

    // Query using proper drizzle syntax
    const chats = await db.select()
      .from(chatsTable)
      .where(eq(chatsTable.id, result.id))
      .execute();

    expect(chats).toHaveLength(1);
    expect(chats[0].title).toEqual('Test Chat');
    expect(chats[0].type).toEqual('smart_answer');
    expect(chats[0].created_at).toBeInstanceOf(Date);
    expect(chats[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create chat with group_chat type', async () => {
    const groupChatInput: CreateChatInput = {
      title: 'Group Discussion',
      type: 'group_chat'
    };

    const result = await createChat(groupChatInput);

    expect(result.title).toEqual('Group Discussion');
    expect(result.type).toEqual('group_chat');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create chat with autopilot type', async () => {
    const autopilotInput: CreateChatInput = {
      title: 'Autopilot Session',
      type: 'autopilot'
    };

    const result = await createChat(autopilotInput);

    expect(result.title).toEqual('Autopilot Session');
    expect(result.type).toEqual('autopilot');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
