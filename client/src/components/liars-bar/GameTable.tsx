import { LiarsBarPlayerState, LiarsBarRank, PlayedPile, LiarsBarPhase } from '../../types';
import BulletChamber from './BulletChamber';
import PlayerSpot from './PlayerSpot';

interface GameTableProps {
  players: LiarsBarPlayerState[];
  currentPile: PlayedPile | null;
  targetRank: LiarsBarRank;
  myId: string | undefined;
  phase: LiarsBarPhase;
  revealResult?: {
    cards: { id: string; rank: LiarsBarRank }[];
    wasLying: boolean;
    loserId: string;
    died: boolean;
  } | null;
}

const RANK_EMOJI: Record<LiarsBarRank, string> = {
  [LiarsBarRank.ACE]: '🅰️',
  [LiarsBarRank.KING]: '♚',
  [LiarsBarRank.QUEEN]: '♛',
  [LiarsBarRank.JACK]: '♝',
};

export default function GameTable({
  players,
  currentPile,
  targetRank,
  myId,
  phase,
  revealResult
}: GameTableProps) {
  const currentPlayer = players.find(p => p.id === currentPile?.playerId);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Table background */}
      <div className="bg-green-900/60 border-2 border-green-700 rounded-full aspect-[2/1] flex items-center justify-center relative overflow-hidden">
        {/* Table texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-800/40 to-green-900/60 rounded-full" />

        {/* Target rank indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/80 px-4 py-1 rounded-full border border-yellow-500">
          <span className="text-yellow-400 font-bold">
            🎯 Target: {RANK_EMOJI[targetRank]} {targetRank}
          </span>
        </div>

        {/* Center: played cards pile */}
        <div className="relative z-10 text-center">
          {currentPile ? (
            <div className="space-y-2">
              <div className="flex gap-1 justify-center">
                {Array.from({ length: currentPile.cardCount }, (_, i) => (
                  <div
                    key={i}
                    className="w-12 h-16 bg-gray-700 border-2 border-gray-500 rounded-lg flex items-center justify-center text-lg"
                  >
                    {phase === LiarsBarPhase.REVEALING && revealResult?.cards[i]
                      ? RANK_EMOJI[revealResult.cards[i].rank]
                      : '🂠'
                    }
                  </div>
                ))}
              </div>
              <p className="text-gray-300 text-sm">
                {currentPlayer?.nickname || 'Unknown'} played {currentPile.cardCount} card{currentPile.cardCount !== 1 ? 's' : ''}
                <br />
                <span className="text-yellow-400">claiming {RANK_EMOJI[targetRank]} {targetRank}</span>
              </p>
            </div>
          ) : (
            <div className="text-gray-500">
              <p className="text-3xl mb-2">🃏</p>
              <p className="text-sm">Waiting for play...</p>
            </div>
          )}
        </div>

        {/* Reveal result overlay */}
        {phase === LiarsBarPhase.REVEALING && revealResult && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 px-6 py-3 rounded-lg border-2 border-yellow-500">
            <p className={`font-bold text-lg ${revealResult.wasLying ? 'text-red-400' : 'text-green-400'}`}>
              {revealResult.wasLying ? '🤥 THEY WERE LYING!' : '😇 THEY WERE HONEST!'}
            </p>
          </div>
        )}
      </div>

      {/* Players around the table */}
      <div className="absolute inset-0 pointer-events-none">
        {players.map((player, index) => {
          const angle = (index * 360) / players.length - 90;
          const radians = (angle * Math.PI) / 180;
          const radiusX = 48;
          const radiusY = 52;
          const x = 50 + radiusX * Math.cos(radians);
          const y = 50 + radiusY * Math.sin(radians);

          return (
            <div
              key={player.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <PlayerSpot
                player={player}
                isMe={player.id === myId}
                isCurrentTurn={false}
                isCurrentPilePlayer={player.id === currentPile?.playerId}
              />
            </div>
          );
        })}
      </div>

      {/* Bullet chamber (shown during reveal) */}
      {phase === LiarsBarPhase.REVEALING && revealResult && (
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2">
          <BulletChamber
            firing={true}
            died={revealResult.died}
            currentChamber={0}
          />
        </div>
      )}
    </div>
  );
}
