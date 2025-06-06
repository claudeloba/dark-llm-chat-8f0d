
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Users, Sparkles } from 'lucide-react';
import type { ChatType } from '../../../server/src/schema';

interface StartPageProps {
  onCreateChat: (type: ChatType) => void;
  isLoading: boolean;
}

export function StartPage({ onCreateChat, isLoading }: StartPageProps) {
  const chatTypes = [
    {
      type: 'smart_answer' as ChatType,
      title: 'Smart Answer',
      description: 'Get intelligent responses to your questions',
      icon: <Sparkles className="w-8 h-8" />,
      preview: (
        <div className="space-y-2">
          <div className="bg-gray-700 p-2 rounded text-xs">
            Q: What's the weather like?
          </div>
          <div className="bg-blue-600 p-2 rounded text-xs">
            ✨ It's sunny and 72°F today!
          </div>
        </div>
      )
    },
    {
      type: 'group_chat' as ChatType,
      title: 'Group Chat',
      description: 'Chat with multiple AI participants',
      icon: <Users className="w-8 h-8" />,
      preview: (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="bg-gray-700 p-1 rounded text-xs flex-1">Alice: Hello!</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="bg-gray-700 p-1 rounded text-xs flex-1">Bob: Hey there!</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <div className="bg-gray-700 p-1 rounded text-xs flex-1">You: Hi everyone!</div>
          </div>
        </div>
      )
    },
    {
      type: 'autopilot' as ChatType,
      title: 'AutoPilot',
      description: 'AI takes control and thinks for you',
      icon: <MessageSquare className="w-8 h-8" />,
      preview: (
        <div className="flex items-center justify-center h-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-xs text-gray-400">Thinking...</span>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          AI Chat Assistant
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Choose your conversation style and start chatting with advanced AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {chatTypes.map((chatType) => (
          <Card 
            key={chatType.type}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6 text-blue-400">
                {chatType.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-100">
                {chatType.title}
              </h3>
              <p className="text-gray-400 mb-6">
                {chatType.description}
              </p>
              
              {/* Preview */}
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6 min-h-[120px] flex flex-col justify-center">
                {chatType.preview}
              </div>

              <Button
                onClick={() => onCreateChat(chatType.type)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white font-medium py-3 rounded-xl transition-all duration-200"
              >
                {isLoading ? 'Creating...' : `Start ${chatType.title}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm">
          Powered by advanced AI • Secure & Private • Always Learning
        </p>
      </div>
    </div>
  );
}
