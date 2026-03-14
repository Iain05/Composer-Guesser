import React, { useState } from 'react';
import ComposerSearch from './ComposerSearch';
import GenreSelect from './GenreSelect';

interface GuessControlsProps {
  disabled: boolean;
  onSubmit: (composerName: string, genreName: string) => boolean;
}

const GuessControls: React.FC<GuessControlsProps> = ({ disabled, onSubmit }) => {
  const [composer, setComposer] = useState('');
  const [genre, setGenre] = useState('');
  const [shake, setShake] = useState(false);

  function handleSubmit() {
    const success = onSubmit(composer, genre);
    if (success) {
      setComposer('');
      setGenre('');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComposerSearch value={composer} onChange={setComposer} disabled={disabled} />
        <GenreSelect value={genre} onChange={setGenre} disabled={disabled} />
      </div>
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
