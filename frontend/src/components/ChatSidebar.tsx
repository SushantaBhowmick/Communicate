import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/axios";
import { StartChatForm } from "./SearchChatForm";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { User, LogOut, MessageCircle, Users, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CreateGroupModal from "./createGorupModal";

type Chat = {
  id: string;
  name: string | null;
  isGroup: boolean;
  members: { user: { id: string; name: string; avatar?: string } }[];
  latestMessage?: {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string };
  } | null;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
};

export const ChatSidebar = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const socket = useSocket();

  // Load initial chats
  useEffect(() => {
    api.get("/chats").then((res) => {
      setChats(res.data.chats);
    });
  }, []);

  // Socket listeners for real-time chat updates
  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (data: { chat: Chat }) => {
      setChats((prevChats) => {
        // Check if chat already exists
        const exists = prevChats.some((chat) => chat.id === data.chat.id);
        if (exists) return prevChats;
        
        // Add new chat to the beginning of the list
        return [data.chat, ...prevChats];
      });
    };

    const handleChatUpdate = (data: { 
      chatId: string; 
      latestMessage: {
        id: string;
        content: string;
        createdAt: string;
        sender: { id: string; name: string };
      }; 
      updatedAt: string 
    }) => {
      setChats((prevChats) => {
        return prevChats
          .map((chat) => {
            if (chat.id === data.chatId) {
              // Increment unread count if message is not from current user
              const newUnreadCount = data.latestMessage.sender.id !== user?.id 
                ? (chat.unreadCount || 0) + 1 
                : chat.unreadCount || 0;
              
              return {
                ...chat,
                latestMessage: data.latestMessage,
                updatedAt: data.updatedAt,
                unreadCount: newUnreadCount,
              };
            }
            return chat;
          })
          .sort((a, b) => {
            // Sort by latest activity (updatedAt or latestMessage timestamp)
            const timeA = a.latestMessage?.createdAt || a.updatedAt;
            const timeB = b.latestMessage?.createdAt || b.updatedAt;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
          });
      });
    };

    const handleChatRead = (data: { chatId: string; unreadCount: number }) => {
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              unreadCount: data.unreadCount,
            };
          }
          return chat;
        });
      });
    };

    socket.on('chat:created', handleNewChat);
    socket.on('chat:updated', handleChatUpdate);
    socket.on('chat:read', handleChatRead);

    return () => {
      socket.off('chat:created', handleNewChat);
      socket.off('chat:updated', handleChatUpdate);
      socket.off('chat:read', handleChatRead);
    };
  }, [socket]);

  const handleSelect = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleCreateGroup = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleCloseCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            Chats
          </h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-800"
              onClick={handleCreateGroup}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <StartChatForm />
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h2 className="text-sm font-medium text-gray-600 mb-3 px-2">
            Recent Chats ({chats.length})
          </h2>
          {chats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => {
                const title = chat.isGroup
                  ? chat.name
                  : chat.members.find(
                      (m) => m.user.id !== user?.id
                    )?.user.name || "Direct Chat";

                return (
                  <Card
                    key={chat.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-150 p-3 border-0 shadow-none hover:shadow-sm"
                    onClick={() => handleSelect(chat.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                          {chat.isGroup ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            getInitials(title || "U")
                          )}
                        </div>
                        {!chat.isGroup && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {title}
                          </h3>
                                                    <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {chat.latestMessage 
                                ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : chat.isGroup && (
                                  <>
                                    <Users className="h-3 w-3 inline mr-1" />
                                    {`${chat.members.length} members`}
                                  </>
                                )
                              }
                            </span>
                            {chat.unreadCount && chat.unreadCount > 0 && (
                              <div className="bg-green-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.latestMessage ? (
                            <span>
                              <span className="font-medium">
                                {chat.latestMessage.sender.id === user?.id 
                                  ? "You" 
                                  : chat.latestMessage.sender.name}:
                              </span>{" "}
                              {chat.latestMessage.content}
                            </span>
                          ) : (
                            chat.isGroup 
                              ? `Group chat with ${chat.members.length} members`
                              : "Start the conversation"
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-medium">
            {user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {user?.name || "User"}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-gray-700 hover:text-red-600 hover:border-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen}
        onClose={handleCloseCreateGroupModal}
      />
    </aside>
  );
};
