import { LiarsBarCard, LiarsBarRank } from '../../types';

interface PlayerHandProps {
  hand: LiarsBarCard[];
  selectedIndices: number[];
  onToggleCard: (index: number) => void;
  disabled: boolean;
  targetRank: LiarsBarRank;
}

const RANK_SYMBOLS: Record<LiarsBarRank, { symbol: string; color: string; bg: string; border: string }> = {
  [LiarsBarRank.ACE]: { symbol: '🅰️', color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/50' },
  [LiarsBarRank.KING]: { symbol: '♚', color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/50' },
  [LiarsBarRank.QUEEN]: { symbol: '♛', color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800/50' },
  [LiarsBarRank.JACK]: { symbol: '♝', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/50' },
};

export default function PlayerHand({ hand, selectedIndices, onToggleCard, disabled, targetRank }: PlayerHandProps) {
  if (!hand || hand.length === 0) {
    return (
      <div className="text-center text-stone-400 py-4">
        No cards in hand
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5 justify-center">
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
              relative w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-center
              transition-all duration-200 font-bold backdrop-blur-sm
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 hover:-translate-y-1 active:scale-100'}
              ${isSelected
                ? 'border-amber-400/80 bg-amber-900/50 shadow-xl shadow-amber-500/30 -translate-y-3 scale-105'
                : isTarget
                  ? 'border-emerald-500/70 bg-emerald-950/40 shadow-lg shadow-emerald-500/15'
                  : `${rankInfo.border} ${rankInfo.bg} shadow-md shadow-black/20`
              }
            `}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs text-black font-bold shadow-md">
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
