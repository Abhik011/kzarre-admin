'use client';

import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function Header() {
  return (
    <header
      className="
        bg-[var(--background-card)] 
        border-b border-[var(--sidebar-border)] 
        text-[var(--text-primary)]
        sticky top-0 z-40 
        transition-all duration-300"
    >
      <div className="flex items-center justify-between px-8 py-4">

        {/* Search Bar */}
        <div className="flex-1 max-w-md px-3 ">
          <div className="relative">
            <Search
              className="
                absolute left-3 top-1/2 -translate-y-1/2 
                text-[var(--text-secondary)]
              "
              size={19}
            />
            <input
              type="text"
              placeholder="Search"
              className="
                w-full 
                bg-[var(--background-card)] 
                border border-[var(--sidebar-border)]
                text-[var(--text-primary)]
                placeholder-[var(--text-secondary)]
                rounded-lg pl-10 pr-4 py-2 text-sm
                focus:outline-none 
                focus:ring-2 
                focus:ring-[var(--sidebar-border)]
                transition-all duration-300
              "
            />
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-6 ml-8">

          {/* Notifications */}
          <button
            className="
              relative p-2 
              text-[var(--text-secondary)] 
              hover:bg-[var(--accent-green)]
              rounded-lg transition-colors
            "
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button
            className="
              p-2 
              text-[var(--text-secondary)]
              hover:bg-[var(--accent-green)]
              rounded-lg transition-colors
            "
          >
            <Settings size={20} />
          </button>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
