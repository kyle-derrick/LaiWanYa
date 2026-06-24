import { LiarsBarPlayerState } from '../../types';

interface PlayerSpotProps {
  player: LiarsBarPlayerState;
  isMe: boolean;
  isCurrentTurn: boolean;
  isCurrentPilePlayer: boolean;
}

export default function PlayerSpot({ player, isMe, isCurrentTurn, isCurrentPilePlayer }: PlayerSpotProps) {
  const hearts = [];
  for (let i = 0; i < 2; i++) {
    hearts.push(
      <span key={i} className={`text-sm ${i < player.hp ? 'text-red-500' : 'text-gray-600'}`}>
        ❤️
      </span>
    );
  }

  return (
    <div
      className={`
        px-3 py-2 rounded-lg text-center min-w-[90px] transition-all duration-300
        ${isMe ? 'bg-blue-900/80 border-2 border-blue-400' : 'bg-gray-800/80 border border-gray-600'}
        ${isCurrentPilePlayer ? 'ring-2 ring-yellow-400' : ''}
        ${isCurrentTurn ? 'ring-2 ring-green-400 animate-pulse' : ''}
        ${!player.alive ? 'grayscale opacity-50' : ''}
      `}
    >
      {/* Nickname */}
      <p className={`text-xs font-bold truncate ${isMe ? 'text-blue-300' : 'text-gray-300'}`}>
        {isMe ? '👤 You' : player.nickname}
        {!player.alive && ' 💀'}
      </p>

      {/* Card count */}
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className="text-xs text-gray-400">🃏 {player.handSize}</span>
      </div>

      {/* HP hearts */}
      {player.alive && (
        <div className="flex items-center justify-center gap-0 mt-1">
          {hearts}
        </div>
      )}
    </div>
  );
}
