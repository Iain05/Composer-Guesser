import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { GENRES } from '@src/data/gameData';

interface GenreSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const GenreSelect: React.FC<GenreSelectProps> = ({ value, onChange, disabled }) => {
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

  function handleSelect(genre: string) {
    onChange(genre);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed pr-10"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>
          {value || 'Select Genre'}
        </span>
        <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onMouseDown={() => handleSelect(g)}
              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0"
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreSelect;
