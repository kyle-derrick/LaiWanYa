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
      <div className="text-center p-3 bg-gray-800 rounded-lg border border-gray-600">
        <p className="text-gray-400 text-sm">Current Target Rank</p>
        <p className="text-2xl font-bold text-yellow-400 mt-1">
          🎯 {RANK_DISPLAY[targetRank]}
        </p>
      </div>

      {/* Playing cards phase */}
      {phase === LiarsBarPhase.PLAYING_CARDS && (
        <div className="space-y-2">
          {isMyTurn ? (
            <>
              <p className="text-center text-green-400 text-sm font-medium">
                🎴 Your turn! Select 1-3 cards and play them claiming they are {RANK_DISPLAY[targetRank]}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onPlayCards}
                  disabled={!canPlay}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-lg transition-colors"
                >
                  Play {selectedCount > 0 ? selectedCount : ''} Card{selectedCount !== 1 ? 's' : ''} 🎴
                </button>
              </div>
              {selectedCount > 3 && (
                <p className="text-red-400 text-xs text-center">Max 3 cards per play!</p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-400 text-sm animate-pulse">
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
              <p className="text-center text-orange-400 text-sm font-medium">
                ⚠️ Someone played cards claiming they are {RANK_DISPLAY[targetRank]}. Do you believe them?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onChallenge}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-lg transition-colors"
                >
                  ❌ Challenge! (Call their bluff!)
                </button>
                <button
                  onClick={onPass}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition-colors"
                >
                  ✅ Pass (Accept claim)
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 text-sm animate-pulse">
              Waiting for other players to challenge or pass...
            </p>
          )}
        </div>
      )}

      {/* Revealing phase */}
      {isRevealing && (
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-yellow-500">
          <p className="text-yellow-400 font-bold text-lg animate-pulse">
            🔍 Revealing cards...
          </p>
        </div>
      )}
    </div>
  );
}
