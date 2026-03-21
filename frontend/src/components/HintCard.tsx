import React, { useState, useEffect } from 'react';
import type { HintStatus } from '@src/types/game';

interface HintCardProps {
  text: string;
  status: HintStatus;
}

const statusClass: Record<HintStatus, string> = {
  CORRECT: 'bg-correct',
  CLOSE: 'bg-close',
  WRONG: 'bg-wrong',
};

const HintCard: React.FC<HintCardProps> = ({ text, status }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`guess-card hint-card ${statusClass[status]} ${revealed ? 'revealed' : ''}`}>
      <span className="break-words w-full text-center">{text}</span>
    </div>
  );
};

export default HintCard;
