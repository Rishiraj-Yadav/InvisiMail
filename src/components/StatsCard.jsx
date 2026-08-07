// src/components/StatsCard.jsx
'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function StatsCard({ 
  title, 
  stat, 
  icon, 
  theme = 'gold', 
  subtitle = null, 
  actionLink = null, 
  actionText = null 
}) {
  const themeClasses = {
    blue: {
      bg: 'bg-gray-100 dark:bg-white/5',
      iconBg: 'bg-gray-200 dark:bg-white/10',
      iconColor: 'text-foreground',
      statColor: 'text-foreground',
      border: 'border-gray-200 dark:border-white/5'
    },
    green: {
      bg: 'bg-gray-100 dark:bg-white/5',
      iconBg: 'bg-gray-200 dark:bg-white/10',
      iconColor: 'text-foreground',
      statColor: 'text-foreground',
      border: 'border-gray-200 dark:border-white/5'
    },
    purple: {
      bg: 'bg-gray-100 dark:bg-white/5',
      iconBg: 'bg-gray-200 dark:bg-white/10',
      iconColor: 'text-foreground',
      statColor: 'text-foreground',
      border: 'border-gray-200 dark:border-white/5'
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.blue;

  return (
    <div className={`surface-card ${currentTheme.bg} ${currentTheme.border} border rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`${currentTheme.iconBg} p-3 rounded-lg`}>
              <div className={`${currentTheme.iconColor} w-6 h-6`}>
                {icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-1">{title}</p>
              <p className={`text-3xl font-bold ${currentTheme.statColor} mb-1`}>
                {stat}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {actionLink && actionText && (
          <div className="ml-4">
            <Link 
              href={actionLink}
              className={`inline-flex items-center gap-2 text-sm font-medium ${currentTheme.iconColor} hover:underline transition-colors`}
            >
              {actionText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}