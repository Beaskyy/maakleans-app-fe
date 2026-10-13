'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Plus, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const { user, role, business } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/orders?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer phone, garment tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick action button */}
        <Link
          href="/orders/new"
          className="hidden sm:inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </Link>

        {/* Notifications Icon Link */}
        <Link
          href="/notifications"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
          title="Notifications & WhatsApp Alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
        </Link>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sky-700 text-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'Staff User'}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-sky-500" />
              {role || 'Staff'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
