
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createChatInputSchema,
  createMessageInputSchema,
  createParticipantInputSchema,
  addParticipantToChatInputSchema,
  updateChatInputSchema
} from './schema';

// Import handlers
import { createChat } from './handlers/create_chat';
import { getChats } from './handlers/get_chats';
import { getChatById } from './handlers/get_chat_by_id';
import { updateChat } from './handlers/update_chat';
import { deleteChat } from './handlers/delete_chat';
import { createMessage } from './handlers/create_message';
import { getMessagesByChat } from './handlers/get_messages_by_chat';
import { createParticipant } from './handlers/create_participant';
import { getParticipants } from './handlers/get_participants';
import { addParticipantToChat } from './handlers/add_participant_to_chat';
import { getChatParticipants } from './handlers/get_chat_participants';
import { removeParticipantFromChat } from './handlers/remove_participant_from_chat';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Chat operations
  createChat: publicProcedure
    .input(createChatInputSchema)
    .mutation(({ input }) => createChat(input)),

  getChats: publicProcedure
    .query(() => getChats()),

  getChatById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getChatById(input.id)),

  updateChat: publicProcedure
    .input(updateChatInputSchema)
    .mutation(({ input }) => updateChat(input)),

  deleteChat: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteChat(input.id)),

  // Message operations
  createMessage: publicProcedure
    .input(createMessageInputSchema)
    .mutation(({ input }) => createMessage(input)),

  getMessagesByChat: publicProcedure
    .input(z.object({ chatId: z.number() }))
    .query(({ input }) => getMessagesByChat(input.chatId)),

  // Participant operations
  createParticipant: publicProcedure
    .input(createParticipantInputSchema)
    .mutation(({ input }) => createParticipant(input)),

  getParticipants: publicProcedure
    .query(() => getParticipants()),

  addParticipantToChat: publicProcedure
    .input(addParticipantToChatInputSchema)
    .mutation(({ input }) => addParticipantToChat(input)),

  getChatParticipants: publicProcedure
    .input(z.object({ chatId: z.number() }))
    .query(({ input }) => getChatParticipants(input.chatId)),

  removeParticipantFromChat: publicProcedure
    .input(z.object({ chatId: z.number(), participantId: z.number() }))
    .mutation(({ input }) => removeParticipantFromChat(input.chatId, input.participantId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
