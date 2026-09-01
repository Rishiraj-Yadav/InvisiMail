'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const themes = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export default function ThemeToggle({ compact = false }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selectedTheme = mounted ? theme : 'system';
  const resolvedLabel = mounted ? (resolvedTheme === 'dark' ? 'Dark' : 'Light') : 'System';

  return (
    <div
      role="group"
      aria-label="Theme preference"
      className={`flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1 ${compact ? 'w-fit' : 'w-full'}`}
    >
      {themes.map(({ value, label, Icon }) => {
        const isSelected = selectedTheme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isSelected}
            aria-label={value === 'system' ? `Use system theme (currently ${resolvedLabel})` : `Use ${label} theme`}
            title={value === 'system' ? `System (${resolvedLabel})` : label}
            className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background ${compact ? '' : 'flex-1'} ${isSelected ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:bg-card/70 hover:text-foreground'}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className={compact ? 'sr-only' : ''}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
