import { useAuth } from '@/hooks/useAuth';
import api from '@/services/axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Mail, Calendar, Phone } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
  bio?: string;
  createdAt: string;
}

interface ChatMember {
  user: User;
  userId: string;
  role: string;
}

const UserInfoPlan = ({ onClose }: { onClose: () => void }) => {
  // Suppress unused parameter warning - keeping for future use  
  void onClose;
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !chatId) return;

    api.get(`/chats/${chatId}`).then(({ data }) => {
      const chatData = data.chat;
      if (!chatData.isGroup) {
        const other = chatData.members.find((m: ChatMember) => m.user.id !== user.id);
        setOtherUser(other?.user);
      }
      setLoading(false);
    });
  }, [chatId, user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded shadow w-full h-full">
              <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Info</h2>
        {/* <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button> */}
      </div>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-full w-20 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="p-6 bg-white rounded shadow w-full h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Info</h2>
          {/* <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button> */}
        </div>
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Info</h2>
        {/* <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button> */}
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        {otherUser.avatar ? (
          <img
            src={otherUser.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xl">
            {getInitials(otherUser.name)}
          </div>
        )}
        <h3 className="text-lg font-semibold mt-3">{otherUser.name}</h3>
        {otherUser.username && (
          <p className="text-sm text-gray-500">@{otherUser.username}</p>
        )}
      </div>

      {/* User Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-sm font-medium">{otherUser.email}</p>
          </div>
        </div>

        {otherUser.bio && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Bio</p>
            <p className="text-sm">{otherUser.bio}</p>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Joined</p>
            <p className="text-sm font-medium">
              {new Date(otherUser.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        <Button className="w-full" variant="outline">
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button className="w-full" variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Send Email
        </Button>
      </div>
    </div>
  );
};

export default UserInfoPlan; 