
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, MessageSquare, Users, Sparkles, MoreVertical } from 'lucide-react';
import type { Chat, ChatType } from '../../../server/src/schema';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: number | undefined;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onCreateChat: (type: ChatType) => void;
}

export function ChatSidebar({ 
  chats, 
  currentChatId, 
  onSelectChat, 
  onNewChat,
  onCreateChat 
}: ChatSidebarProps) {
  const getChatIcon = (type: ChatType) => {
    switch (type) {
      case 'smart_answer':
        return <Sparkles className="w-4 h-4" />;
      case 'group_chat':
        return <Users className="w-4 h-4" />;
      case 'autopilot':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-100">Chats</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem 
                onClick={() => onCreateChat('smart_answer')}
                className="text-gray-100 hover:bg-gray-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Smart Answer
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onCreateChat('group_chat')}
                className="text-gray-100 hover:bg-gray-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Group Chat
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onCreateChat('autopilot')}
                className="text-gray-100 hover:bg-gray-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AutoPilot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <Separator className="bg-gray-700" />

      <ScrollArea className="flex-1 px-2">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs">Create your first chat!</p>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {chats.map((chat: Chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-colors duration-200 group
                  ${currentChatId === chat.id 
                    ? 'bg-blue-600/20 border border-blue-600/40' 
                    : 'hover:bg-gray-700/50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-blue-400 flex-shrink-0">
                      {getChatIcon(chat.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-100 truncate text-sm">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-400 capitalize">
                        {chat.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {formatDate(chat.updated_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        // Add menu actions here
                      }}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
