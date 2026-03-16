import React from 'react';

interface GameStatusProps {
  won: boolean;
  composerName: string;
  pieceTitle: string;
  onPlayAgain: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({ won, composerName, pieceTitle, onPlayAgain }) => {
  return (
    <div className="text-center p-6 rounded-2xl bg-white border-2 border-indigo-100 shadow-lg">
      {won ? (
        <>
          <h3 className="serif text-2xl font-bold mb-2 text-green-600">Bravo Maestro!</h3>
          <p className="text-slate-600 mb-4">
            You correctly identified {composerName}'s {pieceTitle}.
          </p>
        </>
      ) : (
        <>
          <h3 className="serif text-2xl font-bold mb-2 text-red-600">Encore Needed...</h3>
          <p className="text-slate-600 mb-4">
            It was actually {composerName}'s {pieceTitle}.
          </p>
        </>
      )}
      <button
        onClick={onPlayAgain}
        className="px-8 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        Play Again
      </button>
    </div>
  );
};

export default GameStatus;
