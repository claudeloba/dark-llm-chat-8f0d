
import { z } from 'zod';

// Chat type enum
export const chatTypeSchema = z.enum(['smart_answer', 'group_chat', 'autopilot']);
export type ChatType = z.infer<typeof chatTypeSchema>;

// Chat schema
export const chatSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: chatTypeSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Chat = z.infer<typeof chatSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.number(),
  chat_id: z.number(),
  content: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  participant_id: z.number().nullable(), // For group chat participants
  created_at: z.coerce.date()
});

export type Message = z.infer<typeof messageSchema>;

// Participant schema (for group chat)
export const participantSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Participant = z.infer<typeof participantSchema>;

// Chat participant relationship
export const chatParticipantSchema = z.object({
  id: z.number(),
  chat_id: z.number(),
  participant_id: z.number(),
  joined_at: z.coerce.date()
});

export type ChatParticipant = z.infer<typeof chatParticipantSchema>;

// Input schemas
export const createChatInputSchema = z.object({
  title: z.string(),
  type: chatTypeSchema
});

export type CreateChatInput = z.infer<typeof createChatInputSchema>;

export const createMessageInputSchema = z.object({
  chat_id: z.number(),
  content: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  participant_id: z.number().nullable().optional()
});

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const createParticipantInputSchema = z.object({
  name: z.string(),
  avatar_url: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

export type CreateParticipantInput = z.infer<typeof createParticipantInputSchema>;

export const addParticipantToChatInputSchema = z.object({
  chat_id: z.number(),
  participant_id: z.number()
});

export type AddParticipantToChatInput = z.infer<typeof addParticipantToChatInputSchema>;

export const updateChatInputSchema = z.object({
  id: z.number(),
  title: z.string().optional()
});

export type UpdateChatInput = z.infer<typeof updateChatInputSchema>;
