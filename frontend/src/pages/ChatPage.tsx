import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/axios";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../hooks/useAuth";
import { ChatHeader } from "@/components/ChatHeader";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  chatId: string;
  sender: { id: string; name: string };
  senderId: string;
  content: string;
  createdAt: string;
  seenBy: string[];
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    socket.emit("typing:start", { chatId });
    setTimeout(() => socket.emit("typing:stop", { chatId }), 1500);
  };

  const formatMessageTime = (createdAt: string) => {
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <ChatHeader />

      {/* Chat body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 ${
                      isCurrentUser
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                    }`}
                  >
                    {!isCurrentUser && (
                      <div className="text-xs font-semibold mb-1 text-gray-600">
                        {msg.sender.name}
                      </div>
                    )}
                    <div className="break-words">{msg.content}</div>
                    <div
                      className={`text-xs mt-1 flex items-center gap-1 ${
                        isCurrentUser ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                      {isCurrentUser && msg.seenBy.includes(user?.id) && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>

        {/* Typing Indicator */}
        {typingUser && (
          <div className="px-6 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
              <span>{typingUser} is typing...</span>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 hover:bg-gray-100 text-gray-500"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => {
                  handleKeyPress(e);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full"
              />
              <Button
                onClick={handleSend}
                disabled={!newMsg.trim()}
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
