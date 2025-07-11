import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/axios";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../hooks/useAuth";
import { ChatHeader } from "@/components/ChatHeader";

type Message = {
  id: string;
  chatId: string;
  sender: { id: string; name: string };
  senderId:string,
  content: string;
  createdAt: string;
  seenBy: string[]; // Ensure this exists for seen logic
};

export const ChatPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socket = useSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Join socket room & register listeners
  useEffect(() => {
    if (!chatId) return;

    socket.emit("room:join", chatId);

    socket.on("message:receive", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing:started", ({ userId }) => setTypingUser(userId));
    socket.on("typing:stopped", () => setTypingUser(null));

    socket.on("message:updated", ({ messageId, seenBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, seenBy } : msg
        )
      );
    });

    socket.on("error", (error) => {
      console.log(error);
    });

    return () => {
      socket.emit("room:leave", chatId);
      socket.off("message:receive");
      socket.off("typing:started");
      socket.off("typing:stopped");
      socket.off("message:updated");
    };
  }, [chatId, socket]);

  // Seen logic
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && user && !lastMsg.seenBy.includes(user.id)) {
      socket.emit("message:seen", { messageId: lastMsg.id });
    }
  }, [messages, user]);

  // Load initial history
  useEffect(() => {
    if (!chatId) return;

    api
      .get(`/api/messages/${chatId}?page=1&limit=20`)
      .then((res) => setMessages(res.data.messages.reverse()))
      .catch((err) => {
        console.error("Failed to load messages:", err);
      });
  }, [chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim() || !chatId) return;
    socket.emit("message:send", { chatId, content: newMsg });
    setNewMsg("");
  };

  const handleTyping = () => {
    socket.emit("typing:start", { chatId });
    setTimeout(() => socket.emit("typing:stop", { chatId }), 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Header */}
      <ChatHeader />

      {/* Chat body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-3 ${msg.senderId === user?.id ? "flex  justify-end":"flex justify-start"}`}>
              <strong>{msg.sender.name}</strong>: {msg.content}
              <div className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleTimeString()}
                {msg.seenBy.includes(user?.id) && <span> ✓ Seen</span>}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Typing Indicator */}
        {typingUser && (
          <div className="px-4 text-sm text-gray-400">{typingUser} is typing...</div>
        )}

        {/* Message Input */}
        <div className="flex px-4 py-3 border-t bg-gray-50">
          <input
            className="border flex-1 p-2 rounded"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message"
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
