'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Plus,
  Send,
  Inbox,
  FileText,
  Star,
  LogOut,
  Globe,
  User,
  X,
  Menu
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Sidebar({ user, onUpgrade, isMobileOpen, setIsMobileOpen }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, active: pathname === '/dashboard' },
    { name: 'Compose', href: '/dashboard/send', icon: Send, active: pathname === '/dashboard/send' },
    { name: 'Inbox', href: '/dashboard/inbox', icon: Inbox, active: pathname.startsWith('/dashboard/inbox') },
    { name: 'All Aliases', href: '/dashboard/aliases', icon: FileText, active: pathname === '/dashboard/aliases' },
  ];

  const isPro = user?.plan === 'pro';

  if (isPro) {
    navigationItems.push({
      name: 'Custom Domains',
      href: '/dashboard/domains',
      icon: Globe,
      active: pathname === '/dashboard/domains',
    });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <aside
        className={`w-[260px] bg-[#111113]/80 backdrop-blur-xl border-r border-[#27272A] flex-col h-screen z-50 overflow-hidden
        ${isMobileOpen
          ? 'translate-x-0 fixed inset-y-0 left-0 flex'
          : '-translate-x-full fixed inset-y-0 left-0 md:relative md:translate-x-0 md:flex hidden md:!flex'
        } transition-transform duration-300`}
      >
        {/* Mobile Close */}
        <button
          onClick={() => setIsMobileOpen?.(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Profile */}
        <div className="p-5 pt-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              {user?.name ? (
                <span className="text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-white/70" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#FAFAFA] truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-[#A1A1AA] truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Plan Badge */}
          <div className="mt-4">
            <div className="flex items-center gap-2 inline-flex px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-[#A1A1AA]">
              {isPro && <Star className="w-3 h-3 text-[#FAFAFA]" />}
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen?.(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer relative group ${
                      item.active
                        ? 'bg-white/5 text-[#FAFAFA]'
                        : 'text-[#A1A1AA] hover:bg-white/5 hover:text-[#FAFAFA]'
                    }`}
                  >
                    {item.active && (
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[3px] bg-[#6366F1] rounded-r-full" />
                    )}
                    <Icon className={`w-[18px] h-[18px] transition-transform ${item.active ? 'text-[#FAFAFA]' : ''}`} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Upgrade */}
          {!isPro && (
            <div className="mt-6 pt-5 border-t border-white/5">
              <button
                onClick={onUpgrade}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#09090B] hover:bg-[#FAFAFA]/90 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Star className="w-4 h-4" />
                Upgrade to Pro
              </button>
              <p className="text-xs text-center text-[#A1A1AA] mt-3">
                Unlimited aliases & more
              </p>
            </div>
          )}

          {/* Pro Benefits */}
          {isPro && (
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="p-3.5 rounded-lg bg-[#111113] border border-white/10 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-medium text-white">Pro Active</span>
                </div>
                <ul className="text-xs text-[#A1A1AA] space-y-2">
                  <li className="flex items-center gap-2"><span className="text-[#FAFAFA]">✓</span> Unlimited aliases</li>
                  <li className="flex items-center gap-2"><span className="text-[#FAFAFA]">✓</span> Custom domains</li>
                  <li className="flex items-center gap-2"><span className="text-[#FAFAFA]">✓</span> Team collaboration</li>
                  <li className="flex items-center gap-2"><span className="text-[#FAFAFA]">✓</span> Priority support</li>
                </ul>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-[#A1A1AA] flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              Language
            </span>
            <LanguageSwitcher />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}