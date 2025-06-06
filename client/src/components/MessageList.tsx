
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Sparkles } from 'lucide-react';
import type { Message, Participant, ChatType } from '../../../server/src/schema';

interface MessageListProps {
  messages: Message[];
  participants: Participant[];
  chatType: ChatType;
}

export function MessageList({ messages, participants, chatType }: MessageListProps) {
  const getParticipant = (participantId: number | null) => {
    if (!participantId) return null;
    return participants.find((p: Participant) => p.id === participantId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            {chatType === 'smart_answer' && <Sparkles className="w-8 h-8" />}
            {chatType === 'group_chat' && <User className="w-8 h-8" />}
            {chatType === 'autopilot' && <Bot className="w-8 h-8" />}
          </div>
          <p className="text-lg font-medium mb-2">Start a conversation</p>
          <p className="text-sm">
            {chatType === 'smart_answer' && 'Ask me anything and get intelligent answers'}
            {chatType === 'group_chat' && 'Chat with multiple AI participants'}
            {chatType === 'autopilot' && 'Let AI take control and guide the conversation'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message: Message) => {
        const participant = getParticipant(message.participant_id);
        const isUser = message.role === 'user';
        const isSystem = message.role === 'system';

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {isUser ? (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    You
                  </AvatarFallback>
                </Avatar>
              ) : participant ? (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.avatar_url || undefined} />
                  <AvatarFallback className={`text-white ${getAvatarColor(participant.name)}`}>
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-600 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
              {/* Sender Name & Time */}
              <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs font-medium text-gray-300">
                  {isUser ? 'You' : participant ? participant.name : 'Assistant'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.created_at)}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`
                  inline-block px-4 py-2 rounded-2xl max-w-full
                  ${isUser 
                    ? 'bg-blue-600 text-white' 
                    : isSystem
                    ? 'bg-yellow-600/20 text-yellow-200 border border-yellow-600/30'
                    : 'bg-gray-700 text-gray-100'
                  }
                  ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}
                `}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>

              {/* Participant Description (for group chat) */}
              {!isUser && participant && participant.description && chatType === 'group_chat' && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  {participant.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
