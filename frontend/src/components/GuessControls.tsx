import React, { useState } from 'react';
import ComposerSearch from './ComposerSearch';
import type { ComposerSummary } from '@src/api/composer';

interface GuessControlsProps {
  disabled: boolean;
  composers: ComposerSummary[];
  onSubmit: (composerId: number) => Promise<boolean>;
}

const GuessControls: React.FC<GuessControlsProps> = ({ disabled, composers, onSubmit }) => {
  const [composerInput, setComposerInput] = useState('');
  const [selectedComposer, setSelectedComposer] = useState<ComposerSummary | null>(null);
  const [shake, setShake] = useState(false);

  function handleInput(value: string) {
    setComposerInput(value);
    setSelectedComposer(null);
  }

  async function handleSubmit() {
    if (!selectedComposer) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const success = await onSubmit(selectedComposer.composerId);
    if (success) {
      setComposerInput('');
      setSelectedComposer(null);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ComposerSearch
        value={composerInput}
        onChange={handleInput}
        onSelect={setSelectedComposer}
        disabled={disabled}
        composers={composers}
      />
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
