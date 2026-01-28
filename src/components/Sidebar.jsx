'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiPlus,
  FiSend,
  FiInbox,
  FiFileText,
  FiStar,
  FiLogOut,
  FiGlobe,
  FiUser
} from 'react-icons/fi';
import LanguageSwitcher from './LanguageSwitcher';

export default function Sidebar({ user, onUpgrade }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FiHome,
      active: pathname === '/dashboard',
    },
    {
      name: 'Compose',
      href: '/dashboard/send',
      icon: FiSend,
      active: pathname === '/dashboard/send',
    },
    {
      name: 'Inbox',
      href: '/dashboard/inbox',
      icon: FiInbox,
      active: pathname.startsWith('/dashboard/inbox'),
    },
    {
      name: 'All Aliases',
      href: '/dashboard/aliases',
      icon: FiFileText,
      active: pathname === '/dashboard/aliases',
    },
  ];

  const isPro = user?.plan === 'pro';

  if (isPro) {
    navigationItems.push({
      name: 'Custom Domains',
      href: '/dashboard/domains',
      icon: FiGlobe,
      active: pathname === '/dashboard/domains',
    });
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen transition-colors duration-300">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            {user?.name ? (
              <span className="text-2xl font-bold text-blue-800 dark:text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <FiUser className="w-8 h-8 text-blue-800 dark:text-white" />
            )}
          </div>

          {/* User Info */}
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            {user?.name || 'User'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate max-w-full px-2">
            {user?.email}
          </p>

          {/* Plan Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isPro
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}>
            {isPro && <FiStar className="w-3 h-3" />}
            {isPro ? 'Pro Plan' : 'Free Plan'}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    item.active 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Upgrade Section for Free Users */}
        {!isPro && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onUpgrade}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
            >
              <FiStar className="w-4 h-4" />
              Upgrade to Pro
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              Unlock unlimited aliases & more
            </p>
          </div>
        )}

        {/* Pro Benefits for Pro Users */}
        {isPro && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiStar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                  Pro Active
                </span>
              </div>
              <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <li>✓ Unlimited aliases</li>
                <li>✓ Team collaboration</li>
                <li>✓ Custom domains</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Section: Language + Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* Language Switcher Row */}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FiGlobe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Language
          </span>
          <LanguageSwitcher />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}