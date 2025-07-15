import { Outlet } from "react-router-dom";
import { ChatSidebar } from "@/components/ChatSidebar";
import { requestNotificationPermission } from "@/utils/push";
import { useEffect } from "react";

export const ChatLayout = () => {

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
    </div>
  );
};
