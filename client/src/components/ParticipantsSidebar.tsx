
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import { Plus, UserPlus, X } from 'lucide-react';
import type { Participant } from '../../../server/src/schema';

interface ParticipantsSidebarProps {
  participants: Participant[];
  chatId: number;
  onParticipantsChange: (chatId: number) => void;
}

export function ParticipantsSidebar({ 
  participants, 
  chatId, 
  onParticipantsChange 
}: ParticipantsSidebarProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantDescription, setNewParticipantDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;

    setIsLoading(true);
    try {
      // Create participant
      const participant = await trpc.createParticipant.mutate({
        name: newParticipantName,
        description: newParticipantDescription || null
      });

      // Add to chat
      await trpc.addParticipantToChat.mutate({
        chat_id: chatId,
        participant_id: participant.id
      });

      // Reset form
      setNewParticipantName('');
      setNewParticipantDescription('');
      setShowAddDialog(false);
      
      // Refresh participants
      onParticipantsChange(chatId);
    } catch (error) {
      console.error('Failed to add participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await trpc.removeParticipantFromChat.mutate({
        chatId,
        participantId
      });
      onParticipantsChange(chatId);
    } catch (error) {
      console.error('Failed to remove participant:', error);
    }
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-100">Participants</h2>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Add Participant</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddParticipant} className="space-y-4">
                <Input
                  placeholder="Participant name"
                  value={newParticipantName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewParticipantName(e.target.value)
                  }
                  className="bg-gray-700 border-gray-600 text-gray-100"
                  required
                />
                <Input
                  placeholder="Description (optional)"
                  value={newParticipantDescription}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewParticipantDescription(e.target.value)
                  }
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-xs text-gray-400 mb-4">
          {participants.length} member{participants.length !== 1 ? 's' : ''}
        </p>
      </div>

      <Separator className="bg-gray-700" />

      <ScrollArea className="flex-1 px-4">
        {participants.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No participants yet</p>
            <p className="text-xs">Add someone to start chatting!</p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {participants.map((participant: Participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 group"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={participant.avatar_url || undefined} />
                  <AvatarFallback className={`text-white ${getAvatarColor(participant.name)}`}>
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-100 text-sm truncate">
                    {participant.name}
                  </h3>
                  {participant.description && (
                    <p className="text-xs text-gray-400 truncate">
                      {participant.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveParticipant(participant.id)}
                  className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
