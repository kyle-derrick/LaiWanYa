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

  useEffect(() => {
    if (!isRolling) return;

    const interval = setInterval(() => {
      setAnimatingDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRolling]);

  const displayDice = isRolling ? animatingDice : (dice || [1, 1]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center text-4xl border-2 border-gray-200">
          {diceFaces[displayDice[0]]}
        </div>
        <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center text-4xl border-2 border-gray-200">
          {diceFaces[displayDice[1]]}
        </div>
      </div>

      {dice && (
        <p className="text-sm text-gray-600 font-medium">
          Total: {dice[0] + dice[1]}
          {dice[0] === dice[1] && (
            <span className="ml-2 text-green-600 font-bold">Doubles!</span>
          )}
        </p>
      )}

      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
}
