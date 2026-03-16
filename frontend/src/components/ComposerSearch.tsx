import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { ComposerSummary } from '@src/api/composer';

interface ComposerSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (composer: ComposerSummary) => void;
  disabled: boolean;
  composers: ComposerSummary[];
}

const ComposerSearch: React.FC<ComposerSearchProps> = ({ value, onChange, onSelect, disabled, composers }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? composers.filter((c) => c.name.toLowerCase().includes(value.toLowerCase()))
    : composers;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
    setOpen(true);
  }

  function handleSelect(composer: ComposerSummary) {
    onChange(composer.name);
    onSelect(composer);
    setOpen(false);
  }

  const showDropdown = open && filtered.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <label htmlFor="composer-search" className="sr-only">
        Search Composer
      </label>
      <div className="relative">
        <input
          id="composer-search"
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder="Search composer..."
          autoComplete="off"
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
          {filtered.map((c) => (
            <button
              key={c.composerId}
              type="button"
              onMouseDown={() => handleSelect(c)}
              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComposerSearch;
