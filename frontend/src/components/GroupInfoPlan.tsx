import { useAuth } from '@/hooks/useAuth';
import api from '@/services/axios';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Users, Settings, Crown, UserPlus, Trash2, Search, Loader2, Edit3, Save, X as CloseIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
}

interface ChatMember {
  user: User;
  userId: string;
  role: string;
}

const GroupInfoPlan = ({onClose}:{onClose:()=>void}) => {
  // Suppress unused parameter warning - keeping for future use
  void onClose;

    const {chatId}= useParams<{chatId:string}>();

    const {user}=useAuth();
    const [members,setMembers]=useState<ChatMember[]>([]);
    const [chatName,setChatName]=useState("");
    const [isAdmin, setIsAdmin]= useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState("");
    const [showAddUser, setShowAddUser] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");
    const [adminMessage, setAdminMessage] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, userId: string, userName: string} | null>(null);

    useEffect(()=>{
        if(!user) return;

        api.get(`/chats/${chatId}/info`).then(({data})=>{
            setChatName(data.chat.name);
            setMembers(data.chat.members);
            const current = data.chat.members.find((m:ChatMember)=>m.userId===user.id);
            setIsAdmin(current?.role==="ADMIN")
        })
    },[chatId]);

    const handleRemove = async(userId:string)=>{
        try {
            await api.delete(`/chats/${chatId}/members/${userId}`);
            setMembers(prev => prev.filter(m => m.userId !== userId));
            setDeleteConfirm(null);
            setError("");
        } catch (error) {
            setError("Failed to remove member");
        }
    };

    const confirmDelete = (userId: string, userName: string) => {
        setDeleteConfirm({ show: true, userId, userName });
    };

    const handleEditName = () => {
        setEditingName(chatName);
        setIsEditing(true);
    };

    const handleSaveName = async () => {
        try {
            await api.put(`/chats/${chatId}`, { name: editingName });
            setChatName(editingName);
            setIsEditing(false);
            setError("");
        } catch (error) {
            setError("Failed to update group name");
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingName("");
    };

    const searchUsers = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await api.get(`/users/search-users?query=${encodeURIComponent(query.trim())}`);
            // Filter out users who are already members
            const existingMemberIds = members.map(m => m.userId);
            const filteredUsers = res.data.users.filter((u: User) => !existingMemberIds.includes(u.id));
            setSearchResults(filteredUsers);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [members]);

    useEffect(() => {
        const delay = setTimeout(() => {
            searchUsers(searchQuery);
        }, 500);

        return () => clearTimeout(delay);
    }, [searchQuery, searchUsers]);

    const handleAddUser = async (user: User) => {
        try {
            await api.post(`/chats/${chatId}/members`, { userId: user.id });
            const newMember: ChatMember = {
                user,
                userId: user.id,
                role: "MEMBER"
            };
            setMembers(prev => [...prev, newMember]);
            setSearchQuery("");
            setSearchResults([]);
            setShowAddUser(false);
            setError("");
        } catch (error) {
            setError("Failed to add member");
        }
    };

    const showAdminOnlyMessage = (message: string) => {
        setAdminMessage(message);
        setTimeout(() => setAdminMessage(""), 3000);
    };

    
  return (
    <div className="p-6 bg-white rounded shadow w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Group Info</h2>
        {/* <Button size="sm" variant="ghost" onClick={onClose}>
          <CloseIcon className="w-4 h-4" />
        </Button> */}
      </div>

      {/* Group Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg mb-3">
          <Users className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="text-lg font-semibold text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
              />
              <Button size="sm" onClick={handleSaveName} className="h-8 w-8 p-0">
                <Save className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                <CloseIcon className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{chatName}</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={isAdmin ? handleEditName : () => showAdminOnlyMessage("Only admins can edit group name")} 
                className={`h-8 w-8 p-0 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isAdmin}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Users className="w-4 h-4" />
          {members.length} members
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Admin Message */}
      {adminMessage && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <p className="text-yellow-800 text-sm">{adminMessage}</p>
        </div>
      )}

      {/* Group Actions */}
      <div className="mb-6 space-y-2">
        <Button 
          className={`w-full ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
          variant="outline" 
          size="sm"
          onClick={isAdmin ? () => {} : () => showAdminOnlyMessage("Only admins can access group settings")}
          disabled={!isAdmin}
        >
          <Settings className="w-4 h-4 mr-2" />
          Group Settings
        </Button>
        <Button 
          className={`w-full ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
          variant="outline" 
          size="sm"
          onClick={isAdmin ? () => setShowAddUser(true) : () => showAdminOnlyMessage("Only admins can add members")}
          disabled={!isAdmin}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Members
        </Button>
      </div>

      {/* Members List */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members ({members.length})
          </p>
          {!isAdmin && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              View Only
            </span>
          )}
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {members.map((m) => (
            <div key={m.user.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {m.user.avatar ? (
                  <img
                    src={m.user.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{m.user.name}</span>
                    <div className="flex items-center gap-1">
                      {m.role === "ADMIN" ? (
                        <>
                          <Crown className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600 font-medium">Admin</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Member</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{m.user.email}</p>
                </div>
              </div>
              {m.user.id !== user?.id && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={isAdmin ? () => confirmDelete(m.user.id, m.user.name) : () => showAdminOnlyMessage("Only admins can remove members")}
                  className={`${isAdmin ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
                  disabled={!isAdmin}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add User Search */}
      {showAddUser && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Add New Member</h4>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setShowAddUser(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="h-6 w-6 p-0"
            >
              <CloseIcon className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg border max-h-32 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleAddUser(user)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-2 h-6 w-6 p-0">
                    <UserPlus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">
              No users found
            </p>
          )}
        </div>
      )}

      {/* Leave Group Button */}
      <Button className="w-full" variant="outline" size="sm">
        Leave Group
      </Button>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Remove Member</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove <span className="font-medium">{deleteConfirm.userName}</span> from this group?
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => handleRemove(deleteConfirm.userId)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Remove
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupInfoPlan
