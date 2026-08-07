"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ iconOnly = false }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting for client mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={`flex items-center justify-center p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] text-[#A1A1AA] transition-colors border border-transparent ${iconOnly ? 'w-10 h-10' : 'w-full gap-3'}`}>
        <div className="w-5 h-5 opacity-50" />
        {!iconOnly && <span className="font-medium">Theme</span>}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`flex items-center justify-center p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition-colors border border-transparent ${iconOnly ? 'w-10 h-10' : 'w-full gap-3'}`}
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
      {!iconOnly && <span className="font-medium">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>}
    </button>
  );
}
