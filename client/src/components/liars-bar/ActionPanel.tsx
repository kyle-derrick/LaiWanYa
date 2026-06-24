import { LiarsBarPhase, LiarsBarRank } from '../../types';

interface ActionPanelProps {
  phase: LiarsBarPhase;
  isMyTurn: boolean;
  selectedCount: number;
  onPlayCards: () => void;
  onChallenge: () => void;
  onPass: () => void;
  targetRank: LiarsBarRank;
  currentPilePlayerId: string | null;
  myId: string | undefined;
}

const RANK_DISPLAY: Record<LiarsBarRank, string> = {
  [LiarsBarRank.ACE]: 'Aces (A)',
  [LiarsBarRank.KING]: 'Kings (K)',
  [LiarsBarRank.QUEEN]: 'Queens (Q)',
  [LiarsBarRank.JACK]: 'Jacks (J)',
};

export default function ActionPanel({
  phase,
  isMyTurn,
  selectedCount,
  onPlayCards,
  onChallenge,
  onPass,
  targetRank,
  currentPilePlayerId,
  myId
}: ActionPanelProps) {
  const canPlay = phase === LiarsBarPhase.PLAYING_CARDS && isMyTurn && selectedCount > 0 && selectedCount <= 3;
  const canChallenge = phase === LiarsBarPhase.CHALLENGING && currentPilePlayerId !== myId;
  const isRevealing = phase === LiarsBarPhase.REVEALING;

  return (
    <div className="space-y-4">
      {/* Target rank indicator */}
      <div className="text-center p-3.5 rounded-xl bg-stone-900/50 backdrop-blur-xl border border-stone-700/40 shadow-md shadow-black/10">
        <p className="text-stone-400 text-sm font-medium">Current Target Rank</p>
        <p className="text-2xl font-bold text-amber-400 mt-1">
          🎯 {RANK_DISPLAY[targetRank]}
        </p>
      </div>

      {/* Playing cards phase */}
      {phase === LiarsBarPhase.PLAYING_CARDS && (
        <div className="space-y-2">
          {isMyTurn ? (
            <>
              <p className="text-center text-emerald-400 text-sm font-medium">
                🎴 Your turn! Select 1-3 cards and play them claiming they are {RANK_DISPLAY[targetRank]}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onPlayCards}
                  disabled={!canPlay}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-500 active:from-blue-800 active:to-blue-700 active:scale-[0.97] disabled:from-stone-700 disabled:to-stone-600 disabled:cursor-not-allowed font-bold text-lg transition-all duration-200 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-800/40 border border-blue-500/30"
                >
                  Play {selectedCount > 0 ? selectedCount : ''} Card{selectedCount !== 1 ? 's' : ''} 🎴
                </button>
              </div>
              {selectedCount > 3 && (
                <p className="text-red-400 text-xs text-center">Max 3 cards per play!</p>
              )}
            </>
          ) : (
            <p className="text-center text-stone-400 text-sm animate-pulse">
              Waiting for the current player to play cards...
            </p>
          )}
        </div>
      )}

      {/* Challenging phase */}
      {phase === LiarsBarPhase.CHALLENGING && (
        <div className="space-y-2">
          {canChallenge ? (
            <>
              <p className="text-center text-amber-400 text-sm font-medium">
                ⚠️ Someone played cards claiming they are {RANK_DISPLAY[targetRank]}. Do you believe them?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onChallenge}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-500 active:from-red-800 active:to-red-700 active:scale-[0.97] font-bold text-lg transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-800/40 border border-red-500/30"
                >
                  ❌ Challenge! (Call their bluff!)
                </button>
                <button
                  onClick={onPass}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-500 active:from-emerald-800 active:to-emerald-700 active:scale-[0.97] font-bold text-lg transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-800/40 border border-emerald-500/30"
                >
                  ✅ Pass (Accept claim)
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-stone-400 text-sm animate-pulse">
              Waiting for other players to challenge or pass...
            </p>
          )}
        </div>
      )}

      {/* Revealing phase */}
      {isRevealing && (
        <div className="text-center p-4 rounded-xl bg-stone-900/50 backdrop-blur-xl border border-amber-500/50 shadow-lg shadow-amber-900/20">
          <p className="text-amber-400 font-bold text-lg animate-pulse">
            🔍 Revealing cards...
          </p>
        </div>
      )}
    </div>
  );
}
