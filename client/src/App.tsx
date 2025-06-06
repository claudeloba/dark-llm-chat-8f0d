
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { StartPage } from '@/components/StartPage';
import { ChatLayout } from '@/components/ChatLayout';
import type { Chat, ChatType } from '../../server/src/schema';

function App() {
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [showStartPage, setShowStartPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const result = await trpc.getChats.query();
      setChats(result);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleCreateNewChat = async (type: ChatType) => {
    setIsLoading(true);
    try {
      const newChat = await trpc.createChat.mutate({
        title: `New ${type.replace('_', ' ')} Chat`,
        type
      });
      setChats((prev: Chat[]) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      setShowStartPage(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = (chatId: number) => {
    setCurrentChatId(chatId);
    setShowStartPage(false);
  };

  const handleBackToStart = () => {
    setCurrentChatId(null);
    setShowStartPage(true);
  };

  const currentChat = chats.find((chat: Chat) => chat.id === currentChatId);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {showStartPage ? (
        <StartPage 
          onCreateChat={handleCreateNewChat} 
          isLoading={isLoading}
        />
      ) : (
        <ChatLayout
          chats={chats}
          currentChat={currentChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleBackToStart}
          onCreateChat={handleCreateNewChat}
        />
      )}
    </div>
  );
}

export default App;
