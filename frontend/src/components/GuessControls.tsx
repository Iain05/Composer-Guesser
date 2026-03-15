import React, { useState } from 'react';
import ComposerSearch from './ComposerSearch';
import type { ComposerSummary } from '@src/api/composer';

interface GuessControlsProps {
  disabled: boolean;
  composers: ComposerSummary[];
  onSubmit: (composerName: string) => boolean;
}

const GuessControls: React.FC<GuessControlsProps> = ({ disabled, composers, onSubmit }) => {
  const [composer, setComposer] = useState('');
  const [shake, setShake] = useState(false);

  function handleSubmit() {
    const success = onSubmit(composer);
    if (success) {
      setComposer('');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ComposerSearch value={composer} onChange={setComposer} disabled={disabled} composers={composers} />
      <button
        onClick={handleSubmit}
        disabled={disabled}
        className={`w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${shake ? 'bg-red-500 hover:bg-red-500' : ''}`}
      >
        Submit Guess
      </button>
    </div>
  );
};

export default GuessControls;
