'use client';
import { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get current locale from cookie
    const cookies = document.cookie.split(';');
    const lingoCookie = cookies.find(c => c.trim().startsWith('lingo-locale='));
    if (lingoCookie) {
      const locale = lingoCookie.split('=')[1];
      setCurrentLocale(locale);
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const changeLanguage = (locale) => {
    // Set cookie
    document.cookie = `lingo-locale=${locale}; path=/; max-age=31536000`;
    
    // Reload page to apply new language
    window.location.reload();
  };

  const currentLang = LANGUAGES.find(lang => lang.code === currentLocale) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {currentLang.flag}
        </span>
      </button>

      {/* Dropdown Menu */}
     {isOpen && (
  <div className="absolute left-full top-1/2 -translate-y-[80%] ml-3 w-56
                  bg-white dark:bg-gray-800 rounded-lg shadow-lg
                  border border-gray-200 dark:border-gray-700
                  z-50 overflow-hidden transition-all duration-200">
    <div className="py-1">
      {LANGUAGES.map((lang) => {
        const isSelected = currentLocale === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => {
              changeLanguage(lang.code);
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 flex items-center justify-between
              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
              ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{lang.flag}</span>
              <span className={`text-sm font-medium ${
                isSelected
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {lang.name}
              </span>
            </div>
            {isSelected && (
              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </button>
        );
      })}
    </div>
  </div>
)}

    </div>
  );
}
