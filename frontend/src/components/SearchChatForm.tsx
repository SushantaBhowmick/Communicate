import { useState } from "react";
import api from "@/services/axios";
import { useNavigate } from "react-router-dom";

export const StartChatForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: userData } = await api.get(`/api/users/search?email=${email}`);
      const { data: chatData } = await api.post("/api/chats/direct", {
        targetUserId: userData.user.id,
      });
      navigate(`/chat/${chatData.chat.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        className="border p-2 rounded w-full"
        placeholder="Enter user email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? "Starting..." : "Start Chat"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
