'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  LayoutDashboard,
  Users,
  Layers,
  BarChart3,
  ShoppingCart,
  Truck,
  TrendingUp,
  DollarSign,
  Shield,
  Settings,
  MoreVertical,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + '/');

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'User Management', icon: Users, href: '/user-management' },
    { label: 'CMS', icon: Layers, href: '/cms' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'E-Commerce', icon: ShoppingCart, href: '/ecom' },
    { label: 'S&L', icon: Truck, href: '/s&l' },
    { label: 'Marketing', icon: TrendingUp, href: '/marketing' },
    { label: 'Payments & Finance', icon: DollarSign, href: '/payments' },
    { label: 'Security & Compliance', icon: Shield, href: '/security' },
    { label: 'Website Settings', icon: Settings, href: '/settings' },
  ];
    
   // Load role from localStorage
const [role, setRole] = useState("");

React.useEffect(() => {
  if (typeof window !== "undefined") {
    setRole(localStorage.getItem("role") || "");
  }
}, []);

// Define role-wise menu visibility
const roleAccess = {
  superadmin: [
    "Dashboard",
    "User Management",
    "CMS",
    "Analytics",
    "E-Commerce",
    "S&L",
    "Marketing",
    "Payments & Finance",
    "Security & Compliance",
    "Website Settings",
  ],
  admin: [
    "Dashboard",
    "E-Commerce",
    "CMS",
    "Analytics",
  ],
  staff: [
    "Dashboard",
    "E-Commerce",
  ],
  viewer: ["Dashboard"],
};



  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 
                   p-2 bg-[var(--background-card)] 
                   border border-[var(--sidebar-border)] 
                   rounded-lg transition"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${isOpen ? 'w-64' : 'w-22'}
          bg-[var(--sidebar-bg)]
          border-r border-[var(--sidebar-border)]
          text-[var(--text-primary)]
          h-screen flex flex-col transition-all duration-300
          overflow-y-auto fixed lg:relative z-40 lg:z-auto
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[var(--sidebar-border)]">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-80 transition"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="w-9 h-9 bg-green-900 rounded-full flex items-center justify-center">
             <span className="text-[var(--logo-color)] !text-[var(--logo-color)] font-bold text-sm">KZ</span>
            </div>

            {isOpen && (
              <span className="font-semibold text-lg tracking-wide">
                KZARRÈ
              </span>
            )}
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2 ">
           {menuItems
  .filter((item) =>
    roleAccess[role]?.includes(item.label)
  )
  .map((item) => {

              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg 
                      transition-all duration-200 
                      ${
                        active
                          ? 'bg-[var(--accent-green)] text-black font-semibold'
                          : 'text-[var(--text-primary)] hover:bg-[var(--background-card)]'
                      }
                    `}
                  >
                   <Icon size={22} className="min-w-[22px]" />

                    {isOpen && (
                      <span className="text-sm font-medium ">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[var(--sidebar-border)] ">
          <div
            className="bg-[var(--background-card)] 
                       rounded-lg p-3 cursor-pointer
                       hover:opacity-90 transition hover:bg-[var(--accent-green)]"
            onClick={() => router.push("/profile")}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br 
                              from-orange-300 to-orange-500 
                              rounded-full flex items-center justify-center 
                              text-white font-bold" >
                A
              </div>

              {/* Name + Email */}
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-[var(--text-primary)]">
                    Abhijeet Kulkarni
                  </p>
                  <p className="text-xs truncate text-[var(--text-secondary)]">
                    abhijeet.work@kzarre.com
                  </p>
                </div>
              )}

              {/* 3-Dot Menu */}
              {isOpen && (
                <button
                  className="p-1 hover:bg-[var(--accent-green)] rounded transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                >
                  <MoreVertical size={16} className="text-[var(--text-primary)]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Button */}
        <div className="p-4 border-t border-[var(--sidebar-border)] hidden lg:block">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-center p-2 
                       hover:bg-[var(--background-card)] rounded-lg transition"
          >
            <span className="font-bold text-[var(--text-primary)]">
              {isOpen ? '←' : '→'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
