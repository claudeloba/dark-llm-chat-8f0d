
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enum for chat types
export const chatTypeEnum = pgEnum('chat_type', ['smart_answer', 'group_chat', 'autopilot']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);

// Chats table
export const chatsTable = pgTable('chats', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: chatTypeEnum('type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Messages table
export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  chat_id: integer('chat_id').notNull(),
  content: text('content').notNull(),
  role: messageRoleEnum('role').notNull(),
  participant_id: integer('participant_id'), // Nullable for group chat participants
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Participants table (for group chat)
export const participantsTable = pgTable('participants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  avatar_url: text('avatar_url'), // Nullable
  description: text('description'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Chat participants relationship table
export const chatParticipantsTable = pgTable('chat_participants', {
  id: serial('id').primaryKey(),
  chat_id: integer('chat_id').notNull(),
  participant_id: integer('participant_id').notNull(),
  joined_at: timestamp('joined_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type Chat = typeof chatsTable.$inferSelect;
export type NewChat = typeof chatsTable.$inferInsert;
export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;
export type Participant = typeof participantsTable.$inferSelect;
export type NewParticipant = typeof participantsTable.$inferInsert;
export type ChatParticipant = typeof chatParticipantsTable.$inferSelect;
export type NewChatParticipant = typeof chatParticipantsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  chats: chatsTable,
  messages: messagesTable,
  participants: participantsTable,
  chatParticipants: chatParticipantsTable
};
