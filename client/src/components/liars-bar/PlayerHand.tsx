import { LiarsBarCard, LiarsBarRank } from '../../types';

interface PlayerHandProps {
  hand: LiarsBarCard[];
  selectedIndices: number[];
  onToggleCard: (index: number) => void;
  disabled: boolean;
  targetRank: LiarsBarRank;
}

const RANK_SYMBOLS: Record<LiarsBarRank, { symbol: string; color: string; bg: string }> = {
  [LiarsBarRank.ACE]: { symbol: '🅰️', color: 'text-red-400', bg: 'bg-red-900/30' },
  [LiarsBarRank.KING]: { symbol: '♚', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  [LiarsBarRank.QUEEN]: { symbol: '♛', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  [LiarsBarRank.JACK]: { symbol: '♝', color: 'text-blue-400', bg: 'bg-blue-900/30' },
};

export default function PlayerHand({ hand, selectedIndices, onToggleCard, disabled, targetRank }: PlayerHandProps) {
  if (!hand || hand.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No cards in hand
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {hand.map((card, index) => {
        const isSelected = selectedIndices.includes(index);
        const isTarget = card.rank === targetRank;
        const rankInfo = RANK_SYMBOLS[card.rank];

        return (
          <button
            key={card.id}
            onClick={() => !disabled && onToggleCard(index)}
            disabled={disabled}
            className={`
              relative w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center
              transition-all duration-200 font-bold
              ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105'}
              ${isSelected
                ? 'border-yellow-400 bg-yellow-900/50 shadow-lg shadow-yellow-500/30 -translate-y-2'
                : isTarget
                  ? 'border-green-500 bg-green-900/30'
                  : 'border-gray-500 ' + rankInfo.bg
              }
            `}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs text-black font-bold">
                ✓
              </div>
            )}

            {/* Target indicator */}
            {isTarget && !isSelected && (
              <div className="absolute -top-1 -left-1 text-xs">⭐</div>
            )}

            {/* Rank symbol */}
            <span className={`text-2xl ${rankInfo.color}`}>
              {rankInfo.symbol}
            </span>

            {/* Rank text */}
            <span className={`text-sm mt-1 ${rankInfo.color}`}>
              {card.rank}
            </span>
          </button>
        );
      })}
    </div>
  );
}
