import { useState, useEffect } from 'react';

interface DiceRollerProps {
  dice: [number, number] | null;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

const diceFaces: Record<number, string[]> = {
  1: ['⚀'],
  2: ['⚁'],
  3: ['⚂'],
  4: ['⚃'],
  5: ['⚄'],
  6: ['⚅']
};

export default function DiceRoller({ dice, isRolling, onRoll, disabled }: DiceRollerProps) {
  const [animatingDice, setAnimatingDice] = useState<[number, number]>([1, 1]);
  const [rollRotation, setRollRotation] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!isRolling) return;

    const interval = setInterval(() => {
      setAnimatingDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      setRollRotation([
        Math.floor(Math.random() * 360),
        Math.floor(Math.random() * 360)
      ]);
    }, 80);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRolling]);

  const displayDice = isRolling ? animatingDice : (dice || [1, 1]);

  const diceStyle = (rolling: boolean, rotation: number) => ({
    transform: rolling ? `rotate(${rotation}deg) scale(1.1)` : 'rotate(0deg) scale(1)',
    transition: rolling ? 'transform 0.08s ease' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    background: 'linear-gradient(145deg, #f0e6d3, #d4c5a9)',
    boxShadow: rolling
      ? '0 8px 20px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)'
      : '0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.15)',
    border: '2px solid #a08060'
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-4">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl"
          style={diceStyle(isRolling, rollRotation[0])}
        >
          {diceFaces[displayDice[0]]}
        </div>
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl"
          style={diceStyle(isRolling, rollRotation[1])}
        >
          {diceFaces[displayDice[1]]}
        </div>
      </div>

      {dice && (
        <p className="text-sm text-amber-300 font-medium">
          Total: <span className="text-amber-100 font-bold">{dice[0] + dice[1]}</span>
          {dice[0] === dice[1] && (
            <span className="ml-2 text-yellow-400 font-bold animate-pulse">Doubles! ✨</span>
          )}
        </p>
      )}

      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: disabled || isRolling
            ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))'
            : 'linear-gradient(145deg, #c8a415, #a08010)',
          color: disabled || isRolling ? '#888' : '#fff',
          boxShadow: disabled || isRolling
            ? 'none'
            : '0 4px 16px rgba(200,164,21,0.3), inset 0 1px 1px rgba(255,255,255,0.15)',
          border: disabled || isRolling ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(200,164,21,0.3)',
          cursor: disabled || isRolling ? 'not-allowed' : 'pointer'
        }}
      >
        {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
      </button>
    </div>
  );
}
