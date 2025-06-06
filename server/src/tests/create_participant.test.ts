
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { participantsTable } from '../db/schema';
import { type CreateParticipantInput } from '../schema';
import { createParticipant } from '../handlers/create_participant';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateParticipantInput = {
  name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  description: 'A test participant for group chats'
};

// Test input with minimal required fields
const minimalInput: CreateParticipantInput = {
  name: 'Jane Smith',
  avatar_url: null,
  description: null
};

describe('createParticipant', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a participant with all fields', async () => {
    const result = await createParticipant(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.description).toEqual('A test participant for group chats');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a participant with minimal fields', async () => {
    const result = await createParticipant(minimalInput);

    // Basic field validation
    expect(result.name).toEqual('Jane Smith');
    expect(result.avatar_url).toBeNull();
    expect(result.description).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save participant to database', async () => {
    const result = await createParticipant(testInput);

    // Query using proper drizzle syntax
    const participants = await db.select()
      .from(participantsTable)
      .where(eq(participantsTable.id, result.id))
      .execute();

    expect(participants).toHaveLength(1);
    expect(participants[0].name).toEqual('John Doe');
    expect(participants[0].avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(participants[0].description).toEqual('A test participant for group chats');
    expect(participants[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle optional fields correctly', async () => {
    // Test with undefined optional fields
    const inputWithUndefined: CreateParticipantInput = {
      name: 'Test User'
      // avatar_url and description are undefined (not provided)
    };

    const result = await createParticipant(inputWithUndefined);

    expect(result.name).toEqual('Test User');
    expect(result.avatar_url).toBeNull();
    expect(result.description).toBeNull();

    // Verify in database
    const participants = await db.select()
      .from(participantsTable)
      .where(eq(participantsTable.id, result.id))
      .execute();

    expect(participants[0].avatar_url).toBeNull();
    expect(participants[0].description).toBeNull();
  });
});
