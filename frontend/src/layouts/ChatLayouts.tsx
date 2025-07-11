import { Outlet } from "react-router-dom";
import { ChatSidebar } from "@/components/ChatSidebar";

export const ChatLayout = () => {
  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
    </div>
  );
};
