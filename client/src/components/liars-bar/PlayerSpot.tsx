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
      <span key={i} className={`text-sm ${i < player.hp ? 'text-red-500' : 'text-stone-700'}`}>
        ❤️
      </span>
    );
  }

  return (
    <div
      className={`
        px-3 py-2 rounded-xl text-center min-w-[90px] transition-all duration-300 backdrop-blur-lg shadow-lg
        ${isMe
          ? 'bg-blue-900/60 border-2 border-blue-400/70 shadow-blue-500/15'
          : 'bg-stone-800/60 border border-stone-600/50 shadow-black/20'
        }
        ${isCurrentPilePlayer ? 'ring-2 ring-amber-400/70 shadow-amber-500/20' : ''}
        ${isCurrentTurn ? 'ring-2 ring-emerald-400/70 animate-pulse shadow-emerald-500/20' : ''}
        ${!player.alive ? 'grayscale opacity-40' : ''}
      `}
    >
      {/* Nickname */}
      <p className={`text-xs font-bold truncate ${
        !player.alive
          ? 'text-stone-500'
          : isMe
            ? 'text-blue-300'
            : 'text-stone-300'
      }`}>
        {isMe ? '👤 You' : player.nickname}
        {!player.alive && ' 💀'}
      </p>

      {/* Card count */}
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className={`text-xs ${!player.alive ? 'text-stone-600' : 'text-stone-400'}`}>🃏 {player.handSize}</span>
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
