
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { participantsTable } from '../db/schema';
import { type CreateParticipantInput } from '../schema';
import { getParticipants } from '../handlers/get_participants';

// Test participant data
const testParticipant1: CreateParticipantInput = {
  name: 'Alice Smith',
  avatar_url: 'https://example.com/alice.jpg',
  description: 'AI Assistant for customer support'
};

const testParticipant2: CreateParticipantInput = {
  name: 'Bob Johnson',
  avatar_url: null,
  description: 'Technical expert'
};

const testParticipant3: CreateParticipantInput = {
  name: 'Charlie Brown',
  avatar_url: 'https://example.com/charlie.jpg',
  description: null
};

describe('getParticipants', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no participants exist', async () => {
    const result = await getParticipants();

    expect(result).toEqual([]);
  });

  it('should return all participants', async () => {
    // Create test participants
    await db.insert(participantsTable)
      .values([testParticipant1, testParticipant2, testParticipant3])
      .execute();

    const result = await getParticipants();

    expect(result).toHaveLength(3);
    
    // Verify all participants are included
    const names = result.map(p => p.name);
    expect(names).toContain('Alice Smith');
    expect(names).toContain('Bob Johnson');
    expect(names).toContain('Charlie Brown');
  });

  it('should return participants with correct field types', async () => {
    // Create a participant
    await db.insert(participantsTable)
      .values(testParticipant1)
      .execute();

    const result = await getParticipants();

    expect(result).toHaveLength(1);
    const participant = result[0];

    expect(typeof participant.id).toBe('number');
    expect(typeof participant.name).toBe('string');
    expect(participant.avatar_url).toBe('https://example.com/alice.jpg');
    expect(typeof participant.description).toBe('string');
    expect(participant.created_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    // Create participants with null values
    await db.insert(participantsTable)
      .values([testParticipant2, testParticipant3])
      .execute();

    const result = await getParticipants();

    expect(result).toHaveLength(2);
    
    // Find participants by name to check null handling
    const bob = result.find(p => p.name === 'Bob Johnson');
    const charlie = result.find(p => p.name === 'Charlie Brown');

    expect(bob?.avatar_url).toBeNull();
    expect(bob?.description).toBe('Technical expert');
    
    expect(charlie?.avatar_url).toBe('https://example.com/charlie.jpg');
    expect(charlie?.description).toBeNull();
  });

  it('should return participants ordered by creation date (newest first)', async () => {
    // Create participants with small delays to ensure different timestamps
    await db.insert(participantsTable)
      .values(testParticipant1)
      .execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(participantsTable)
      .values(testParticipant2)
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(participantsTable)
      .values(testParticipant3)
      .execute();

    const result = await getParticipants();

    expect(result).toHaveLength(3);
    
    // Should be ordered by created_at descending (newest first)
    expect(result[0].name).toBe('Charlie Brown'); // Created last
    expect(result[1].name).toBe('Bob Johnson');   // Created second
    expect(result[2].name).toBe('Alice Smith');   // Created first
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });
});
