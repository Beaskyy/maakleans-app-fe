'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Tag,
  CheckCircle2,
  Truck,
  Users,
  Sparkles,
  CreditCard,
  UserCog,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Building2,
  Layers,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { business, user, role, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Create Order', href: '/orders/new', icon: PlusCircle, highlight: true },
    { name: 'Garment Tracking', href: '/garments', icon: Tag },
    { name: 'Processing & QC', href: '/processing', icon: CheckCircle2 },
    { name: 'External Partners', href: '/external-batches', icon: Layers },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Services & Pricing', href: '/services', icon: Sparkles },
    { name: 'Payments & Ledger', href: '/payments', icon: CreditCard },
    { name: 'Pickups & Deliveries', href: '/logistics', icon: Truck },
    { name: 'Staff & Roles', href: '/staff', icon: UserCog },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20 shrink-0">
            MK
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-lg leading-none">MaakLeans</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Laundry SaaS
            </div>
          </div>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Business Badge */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="truncate font-medium">{business?.name || 'MaakLeans Executive'}</span>
        </div>
        <div className="text-[11px] text-slate-400 pl-6 capitalize truncate">
          Currency: {business?.currency || 'NGN'} (₦)
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 mb-2 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                    : 'bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 border border-sky-500/30'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-sm font-semibold text-white truncate">{user?.name || 'Staff User'}</div>
            <div className="text-xs text-sky-400 font-mono tracking-wider truncate">{role || 'STAFF'}</div>
          </div>
          <button
            onClick={() => {
              handleLinkClick();
              logout();
            }}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-200 flex-col shrink-0 min-h-screen border-r border-slate-800 sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-200 flex flex-col lg:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        {navContent}
      </aside>
    </>
  );
}
