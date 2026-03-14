import React, { useState, useEffect } from 'react';
import { Music, Play, Pause } from 'lucide-react';
import { MAX_PLAYS, PIECE_DURATION } from '@src/data/gameData';

interface AudioPlayerProps {
  disabled: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ disabled }) => {
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      setPlaybackTime((t) => Math.min(+(t + 0.1).toFixed(1), PIECE_DURATION));
    }, 100);

    return () => clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    if (playbackTime >= PIECE_DURATION && isPlaying) {
      setIsPlaying(false);
    }
  }, [playbackTime, isPlaying]);

  function handlePlayPause() {
    if (isPlaying) {
      setIsPlaying(false);
    } else if (playCount < MAX_PLAYS && !disabled) {
      setPlayCount((c) => c + 1);
      setPlaybackTime(0);
      setIsPlaying(true);
    }
  }

  const isExhausted = playCount >= MAX_PLAYS;
  const progress = Math.min((playbackTime / PIECE_DURATION) * 100, 100);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-sm border border-indigo-200">
      <div className="flex items-center gap-2 text-indigo-600 mb-4">
        <Music className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">Listen to the Mystery</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          disabled={isExhausted || disabled}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current" />
          )}
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-full h-2 mb-2 overflow-hidden shadow-sm">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>{formatTime(playbackTime)}</span>
            <span>{formatTime(PIECE_DURATION)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AudioPlayer;
