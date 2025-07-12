import { useEffect, useState } from "react";
import api from "@/services/axios";
import { useParams } from "react-router-dom";
import { User, MoreVertical, Phone, Video, Info, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import GroupInfoPlan from "./GroupInfoPlan";
import UserInfoPlan from "./UserInfoPlan";

type User = { id: string; name: string; avatar?: string ,email:string};
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
  const [showMenu, setShowMenu] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const navigate = useNavigate();
  const currentUser= JSON.parse(localStorage.getItem("user") || "{}");
  

  useEffect(() => {
    if (!chatId) return;
    api.get(`/chats/${chatId}`).then((res) => {
      const chatData = res.data.chat;
      setChat(chatData);

      if (!chatData.isGroup) {
        const other = chatData.members.find((m: { user: User }) => m.user.id !== currentUser?.id);
        setOtherUser(other?.user);
      }
    });
  }, [chatId]);

  const title = chat?.isGroup ? chat.name : otherUser?.name;
  const avatar = otherUser?.avatar || "/default-avatar.png";
  const isOnline = true; // 🔁 We'll hook this with presence/socket later

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleBackClick = () => {
    navigate("/chat");
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer"  onClick={() => setShowInfoDialog(true)}>
        {/* Back Button for Mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="md:hidden hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Avatar */}
        <div className="relative">
          {avatar && avatar !== "/default-avatar.png" ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
              {chat?.isGroup ? (
                <Users className="h-5 w-5" />
              ) : (
                getInitials(title || "U")
              )}
            </div>
          )}
          {!chat?.isGroup && isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {title || "Loading..."}
          </h3>
          {chat?.isGroup ? (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {chat.members.length} members
            </p>
          ) : (
            <p className={`text-sm ${isOnline ? "text-green-600" : "text-gray-500"}`}>
              {isOnline ? "Online" : "Last seen recently"}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex hover:bg-gray-100 text-gray-600"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex hover:bg-gray-100 text-gray-600"
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-gray-100 text-gray-600"
          onClick={() => setShowInfoDialog(true)}
        >
          <Info className="h-4 w-4" />
        </Button>
        
        {/* More Options */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="hover:bg-gray-100 text-gray-600"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  View Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Media & Files
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Search Messages
                </button>
                {chat?.isGroup && (
                  <>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Group Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      Leave Group
                    </button>
                  </>
                )}
                {!chat?.isGroup && (
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Block User
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="p-0 max-w-md">
          {chat?.isGroup ? (
            <GroupInfoPlan onClose={() => setShowInfoDialog(false)} />
          ) : (
            <UserInfoPlan onClose={() => setShowInfoDialog(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
