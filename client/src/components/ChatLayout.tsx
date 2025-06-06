
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ParticipantsSidebar } from '@/components/ParticipantsSidebar';
import { MessageList } from '@/components/MessageList';
import { trpc } from '@/utils/trpc';
import { Send, ArrowLeft, Users, MessageSquare } from 'lucide-react';
import type { Chat, Message, Participant, ChatType } from '../../../server/src/schema';

interface ChatLayoutProps {
  chats: Chat[];
  currentChat: Chat | undefined;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onCreateChat: (type: ChatType) => void;
}

export function ChatLayout({ 
  chats, 
  currentChat, 
  onSelectChat, 
  onNewChat,
  onCreateChat 
}: ChatLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = useCallback(async (chatId: number) => {
    try {
      const result = await trpc.getMessagesByChat.query({ chatId });
      setMessages(result);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  const loadParticipants = useCallback(async (chatId: number) => {
    try {
      const result = await trpc.getChatParticipants.query({ chatId });
      setParticipants(result);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  }, []);

  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.id);
      if (currentChat.type === 'group_chat') {
        loadParticipants(currentChat.id);
        setShowParticipants(true);
      } else {
        setShowParticipants(false);
      }
    }
  }, [currentChat, loadMessages, loadParticipants]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentChat) return;

    setIsLoading(true);
    try {
      const newMessage = await trpc.createMessage.mutate({
        chat_id: currentChat.id,
        content: messageInput,
        role: 'user'
      });
      setMessages((prev: Message[]) => [...prev, newMessage]);
      setMessageInput('');
      
      // Simulate AI response based on chat type
      setTimeout(async () => {
        const aiResponse = await trpc.createMessage.mutate({
          chat_id: currentChat.id,
          content: getAIResponse(currentChat.type, messageInput),
          role: 'assistant'
        });
        setMessages((prev: Message[]) => [...prev, aiResponse]);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = (type: ChatType, input: string): string => {
    switch (type) {
      case 'smart_answer':
        return `Here's a smart answer to your question: "${input}". Let me provide you with a detailed and helpful response.`;
      case 'group_chat':
        return `Thanks for your message! This is a group chat response to: "${input}"`;
      case 'autopilot':
        return `🤖 AutoPilot engaged. Processing your request: "${input}". I'll handle this automatically.`;
      default:
        return 'I understand your message and I\'m here to help!';
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <ChatSidebar
          chats={chats}
          currentChatId={currentChat?.id}
          onSelectChat={onSelectChat}
          onNewChat={onNewChat}
          onCreateChat={onCreateChat}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewChat}
              className="text-gray-400 hover:text-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="font-semibold text-gray-100">
                {currentChat?.title || 'Select a chat'}
              </h2>
              {currentChat && (
                <p className="text-xs text-gray-400 capitalize">
                  {currentChat.type.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>
          
          {currentChat?.type === 'group_chat' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-gray-400 hover:text-gray-200"
            >
              <Users className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {currentChat ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <MessageList 
                    messages={messages} 
                    participants={participants}
                    chatType={currentChat.type}
                  />
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-gray-700 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        setMessageInput(e.target.value)
                      }
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !messageInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Participants */}
          {showParticipants && currentChat?.type === 'group_chat' && (
            <div className="w-64 bg-gray-800 border-l border-gray-700">
              <ParticipantsSidebar
                participants={participants}
                chatId={currentChat.id}
                onParticipantsChange={loadParticipants}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
