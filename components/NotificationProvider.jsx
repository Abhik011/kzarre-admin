"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/app/lib/socket";
import { X } from "lucide-react";

const AUTO_HIDE_MS = 5000;

export default function NotificationProvider({ isOpen = false, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(null);

  // ✅ Load from storage
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("admin_notifications") || "[]"
    );
    setNotifications(stored);
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  // ✅ Socket listener
  useEffect(() => {
    socket.on("notification", (data) => {
      const item = {
        id: crypto.randomUUID(),
        title: data.title || "New Notification",
        message: data.message || "",
        time: Date.now(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [item, ...prev];
        localStorage.setItem("admin_notifications", JSON.stringify(updated));
        return updated;
      });

      // ✅ Sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // ✅ Auto-hide toast but keep in list
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== item.id));
      }, AUTO_HIDE_MS);
    });

    return () => socket.off("notification");
  }, []);

  // ✅ Clear all
  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("admin_notifications");
  };

  // ✅ Show when either:
  // - New notification arrives
  // - Bell icon is clicked
  const visible = notifications.length > 0 || isOpen;

  if (!visible) return null;

  return (
    <div className="fixed top-18 right-4 z-[9999] flex flex-col items-end gap-3">
      {notifications.length > 0 && (
      <button
  onClick={clearAll}
  className="
    mb-1 p-1.5 rounded-full
    bg-black/80 text-white hover:bg-black
    dark:bg-white/80 dark:text-black dark:hover:bg-white
    transition shadow-md
  "
  title="Clear Notifications"
>
  <X size={14} />
</button>

      )}

<div className="flex flex-col gap-3">
  {notifications.map((n) => (
    <div
      key={n.id}
      className="
        notification-card
        backdrop-blur-2xl
        bg-white/60 dark:bg-black/60
        shadow-2xl
        border border-white/40 dark:border-white/10
        ring-1 ring-white/20
        rounded-2xl p-4 w-[340px]
        transform transition-all animate-slide-in
      "
    >
      <div className="font-semibold text-sm text-gray-900 dark:text-white">
        {n.title}
      </div>

      <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
        {n.message}
      </div>
    </div>
  ))}
</div>



    </div>
  );
}
