import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Users, Search, Loader2, UserPlus, UserMinus } from "lucide-react";
import api from "@/services/axios";
import { useNavigate } from "react-router-dom";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type User = {
  id: string;
  name: string;
  email: string;
};

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // 🔍 Enhanced debounced search with better UX
  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get(`/users/search-users?query=${encodeURIComponent(searchQuery.trim())}`);
      setResults(res.data.users || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      searchUsers(query);
    }, 500); // Increased debounce time for better UX

    return () => clearTimeout(delay);
  }, [query, searchUsers]);

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [...prev, user]);
      setQuery("");
      setResults([]);
      setError(""); // Clear any previous errors
    }
  };

  const handleRemoveUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleCreate = async () => {
    if (!name.trim() || selectedUsers.length < 1) return;

    setIsCreating(true);
    setError("");
    
    try {
      const userIds = selectedUsers.map((u) => u.id);

      const { data } = await api.post("/chats/group", {
        name: name.trim(),
        userIds,
      });

      navigate(`/chat/${data.chat.id}`);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelectUser(results[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Users className="h-5 w-5 text-blue-500" />
            Create Group Chat
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Group name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Group Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            maxLength={50}
          />
          <p className="text-xs text-gray-500">
            {name.length}/50 characters
          </p>
        </div>

        {/* Search users */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Add Members *
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="bg-gray-50 rounded-lg border max-h-48 overflow-y-auto">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-2">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && !isLoading && results.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No users found
            </p>
          )}
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Selected Members ({selectedUsers.length})
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-white border border-blue-100 px-3 py-2 rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUser(user.id)}
                    className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || selectedUsers.length < 1 || isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isCreating}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateGroupModal;
