'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Plus, ShieldCheck, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/orders?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-2">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 relative min-w-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders, phone, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 truncate"
            />
          </div>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick action button */}
        <Link
          href="/orders/new"
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all shadow-sky-600/20"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">New Order</span>
        </Link>

        {/* Notifications Icon Link */}
        <Link
          href="/notifications"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
          title="Notifications & WhatsApp Alerts"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </Link>

        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-2 pl-0.5 sm:pl-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sky-700 text-xs sm:text-sm shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div className="hidden md:block text-left max-w-[120px] lg:max-w-none">
            <div className="text-sm font-semibold text-slate-800 leading-tight truncate">
              {user?.name || 'Staff User'}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium truncate">
              <ShieldCheck className="w-3 h-3 text-sky-500 shrink-0" />
              <span className="truncate">{role || 'Staff'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
