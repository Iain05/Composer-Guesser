import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '@src/context/ThemeContext';

const ThemeMenu: React.FC = () => {
  const { isDark, toggleTheme, currentTheme, setTheme, availableThemes } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 bg-surface border border-border text-ink-muted rounded-xl shadow-sm hover:shadow-md hover:border-border-hover transition-all"
        aria-label="Theme settings"
      >
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-xl shadow-xl z-50 p-3 flex flex-col gap-3">

          {/* Light / Dark toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border text-xs font-semibold">
            <button
              onClick={() => isDark && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 transition-colors ${
                !isDark ? 'bg-primary text-primary-text' : 'text-ink-muted hover:bg-canvas'
              }`}
            >
              <Sun className="w-3 h-3" /> Light
            </button>
            <button
              onClick={() => !isDark && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 transition-colors ${
                isDark ? 'bg-primary text-primary-text' : 'text-ink-muted hover:bg-canvas'
              }`}
            >
              <Moon className="w-3 h-3" /> Dark
            </button>
          </div>

          <div className="border-t border-border" />

          {/* Theme list */}
          <div className="flex flex-col gap-0.5">
            {Object.entries(availableThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => { setTheme(key); setOpen(false); }}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                  currentTheme === key ? 'text-ink font-semibold' : 'text-ink-muted hover:bg-canvas'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                  style={{ backgroundColor: theme.light.primary }}
                />
                {theme.label}
                {currentTheme === key && <Check className="w-3 h-3 ml-auto text-primary" />}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default ThemeMenu;
