import { useEffect, useState } from "react";
import api from "@/services/axios";
import { useParams } from "react-router-dom";
import { User } from "lucide-react";

type User = { id: string; name: string; avatarUrl?: string };
type Chat = {
  id: string;
  name: string | null;
  isGroup: boolean;
  members: { user: User }[];
};

export const ChatHeader = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!chatId) return;
    api.get(`/api/chats/${chatId}`).then((res) => {
      const chatData = res.data.chat;
      setChat(chatData);

      if (!chatData.isGroup) {
        const other = chatData.members.find((m: any) => m.user.id !== currentUserId);
        setOtherUser(other?.user);
      }
    });
  }, [chatId]);

  const title = chat?.isGroup ? chat.name : otherUser?.name;
  const avatar = otherUser?.avatarUrl || "/default-avatar.png";
  const isOnline = true; // 🔁 We'll hook this with presence/socket later

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
      <div className="flex items-center gap-3">
        {
            avatar?
            <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            : <User />
        }
        <div>
          <h3 className="font-semibold">{title || "Loading..."}</h3>
          {!chat?.isGroup && (
            <p className={`text-sm ${isOnline ? "text-green-500" : "text-gray-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      {/* Actions dropdown (mocked) */}
      <div className="relative">
        <button className="text-xl font-bold">⋮</button>
        {/* Dropdown UI (mock) */}
        {/* Future: Menu for mute, leave group, block */}
      </div>
    </div>
  );
};
