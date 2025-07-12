import { useState } from "react";
import api from "@/services/axios";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const StartChatForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data: userData } = await api.get(`/users/search?email=${email}`);
      const { data: chatData } = await api.post("/chats/direct", {
        targetUserId: userData.user.id,
      });
      
      setSuccess("Chat started successfully!");
      setTimeout(() => {
        navigate(`/chat/${chatData.chat.id}`);
      }, 500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "User not found or something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
    if (success) setSuccess("");
  };

  return (
    <Card className="border-0 shadow-none bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="h-4 w-4 text-blue-600" />
        <h3 className="font-medium text-gray-900">Start New Chat</h3>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            placeholder="Enter user email address"
            value={email}
            onChange={handleInputChange}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Start Chat
            </>
          )}
        </Button>
      </form>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            {error}
          </p>
        </div>
      )}
      
      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <span className="text-green-500">✅</span>
            {success}
          </p>
        </div>
      )}
    </Card>
  );
};
