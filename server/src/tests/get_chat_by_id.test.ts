
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable } from '../db/schema';
import { type CreateChatInput } from '../schema';
import { getChatById } from '../handlers/get_chat_by_id';

const testChatInput: CreateChatInput = {
  title: 'Test Chat',
  type: 'smart_answer'
};

describe('getChatById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return chat when found', async () => {
    // Create a test chat
    const createResult = await db.insert(chatsTable)
      .values({
        title: testChatInput.title,
        type: testChatInput.type
      })
      .returning()
      .execute();

    const createdChat = createResult[0];

    // Get the chat by id
    const result = await getChatById(createdChat.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdChat.id);
    expect(result!.title).toEqual('Test Chat');
    expect(result!.type).toEqual('smart_answer');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when chat not found', async () => {
    const result = await getChatById(999);

    expect(result).toBeNull();
  });

  it('should handle different chat types correctly', async () => {
    // Create group_chat type
    const groupChatResult = await db.insert(chatsTable)
      .values({
        title: 'Group Chat',
        type: 'group_chat'
      })
      .returning()
      .execute();

    const groupChat = await getChatById(groupChatResult[0].id);

    expect(groupChat).not.toBeNull();
    expect(groupChat!.type).toEqual('group_chat');
    expect(groupChat!.title).toEqual('Group Chat');

    // Create autopilot type
    const autopilotResult = await db.insert(chatsTable)
      .values({
        title: 'Autopilot Chat',
        type: 'autopilot'
      })
      .returning()
      .execute();

    const autopilotChat = await getChatById(autopilotResult[0].id);

    expect(autopilotChat).not.toBeNull();
    expect(autopilotChat!.type).toEqual('autopilot');
    expect(autopilotChat!.title).toEqual('Autopilot Chat');
  });
});
