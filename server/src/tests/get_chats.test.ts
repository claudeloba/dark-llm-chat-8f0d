
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chatsTable } from '../db/schema';
import { type CreateChatInput } from '../schema';
import { getChats } from '../handlers/get_chats';
import { eq } from 'drizzle-orm';

// Test chat inputs
const testChat1: CreateChatInput = {
  title: 'First Chat',
  type: 'smart_answer'
};

const testChat2: CreateChatInput = {
  title: 'Second Chat',
  type: 'group_chat'
};

const testChat3: CreateChatInput = {
  title: 'Third Chat',
  type: 'autopilot'
};

describe('getChats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no chats exist', async () => {
    const result = await getChats();

    expect(result).toEqual([]);
  });

  it('should return all chats', async () => {
    // Create test chats
    await db.insert(chatsTable)
      .values([
        {
          title: testChat1.title,
          type: testChat1.type
        },
        {
          title: testChat2.title,
          type: testChat2.type
        },
        {
          title: testChat3.title,
          type: testChat3.type
        }
      ])
      .execute();

    const result = await getChats();

    expect(result).toHaveLength(3);
    
    // Verify all chats are present
    const titles = result.map(chat => chat.title);
    expect(titles).toContain('First Chat');
    expect(titles).toContain('Second Chat');
    expect(titles).toContain('Third Chat');

    // Verify structure of returned chats
    result.forEach(chat => {
      expect(chat.id).toBeDefined();
      expect(typeof chat.title).toBe('string');
      expect(['smart_answer', 'group_chat', 'autopilot']).toContain(chat.type);
      expect(chat.created_at).toBeInstanceOf(Date);
      expect(chat.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return chats ordered by updated_at descending', async () => {
    // Create first chat
    const firstChat = await db.insert(chatsTable)
      .values({
        title: testChat1.title,
        type: testChat1.type
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second chat
    const secondChat = await db.insert(chatsTable)
      .values({
        title: testChat2.title,
        type: testChat2.type
      })
      .returning()
      .execute();

    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update the first chat (making it the most recently updated)
    await db.update(chatsTable)
      .set({ 
        title: 'Updated First Chat',
        updated_at: new Date()
      })
      .where(eq(chatsTable.id, firstChat[0].id))
      .execute();

    const result = await getChats();

    expect(result).toHaveLength(2);
    
    // The updated first chat should be first in results (most recent updated_at)
    expect(result[0].title).toBe('Updated First Chat');
    expect(result[1].title).toBe(testChat2.title);

    // Verify ordering - first result should have more recent updated_at
    expect(result[0].updated_at.getTime()).toBeGreaterThan(result[1].updated_at.getTime());
  });

  it('should handle different chat types correctly', async () => {
    // Create chats with all different types
    await db.insert(chatsTable)
      .values([
        {
          title: 'Smart Answer Chat',
          type: 'smart_answer'
        },
        {
          title: 'Group Chat',
          type: 'group_chat'
        },
        {
          title: 'Autopilot Chat',
          type: 'autopilot'
        }
      ])
      .execute();

    const result = await getChats();

    expect(result).toHaveLength(3);

    // Find each chat type
    const smartAnswerChat = result.find(chat => chat.type === 'smart_answer');
    const groupChat = result.find(chat => chat.type === 'group_chat');
    const autopilotChat = result.find(chat => chat.type === 'autopilot');

    expect(smartAnswerChat).toBeDefined();
    expect(smartAnswerChat?.title).toBe('Smart Answer Chat');
    
    expect(groupChat).toBeDefined();
    expect(groupChat?.title).toBe('Group Chat');
    
    expect(autopilotChat).toBeDefined();
    expect(autopilotChat?.title).toBe('Autopilot Chat');
  });
});
