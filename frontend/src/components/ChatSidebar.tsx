import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/axios";
import { StartChatForm } from "./SearchChatForm";

type Chat = {
  id: string;
  name: string | null;
  isGroup: boolean;
  members: { user: { id: string; name: string } }[];
};

export const ChatSidebar = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/chats").then((res) => {
      setChats(res.data.chats);
    });
  }, []);

  const handleSelect = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <aside className="w-1/4 bg-gray-100 p-4 border-r h-screen overflow-y-auto">
      <StartChatForm />
      <hr className="my-4" />
      <h2 className="text-lg font-semibold mb-4">Your Chats</h2>
      <ul className="space-y-2">
        {chats.map((chat) => {
          const title = chat.isGroup
            ? chat.name
            : chat.members.find(
                (m) => m.user.id !== localStorage.getItem("userId")
              )?.user.name || "Direct Chat";

          return (
            <li
              key={chat.id}
              className="cursor-pointer hover:bg-blue-100 p-2 rounded"
              onClick={() => handleSelect(chat.id)}
            >
              {title}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
