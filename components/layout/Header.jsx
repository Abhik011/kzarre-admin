"use client";

import React, { useState } from "react";
import { Search, Bell, Settings } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import NotificationProvider from "@/components/NotificationProvider";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ✅ MAC STYLE NOTIFICATION UI */}
      <NotificationProvider isOpen={open} onClose={() => setOpen(false)} />

      <header className="bg-[var(--background-card)] border-b border-[var(--sidebar-border)] sticky top-0 z-40">
        <div className="flex items-center justify-between px-8 py-4">

          {/* Search */}
          <div className="flex-1 max-w-md px-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={19} />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-[var(--background-card)] border border-[var(--sidebar-border)]
                text-[var(--text-primary)] rounded-lg pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-8">
            {/* 🔔 Bell → Opens MAC UI */}
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 hover:bg-[var(--accent-green)] rounded-lg"
            >
              <Bell size={20} />
            </button>

            <button className="p-2 hover:bg-[var(--accent-green)] rounded-lg">
              <Settings size={20} />
            </button>

            <DarkModeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
