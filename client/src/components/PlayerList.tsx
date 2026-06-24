import { Player } from '../types';
import { useTranslation } from 'react-i18next';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  isHost?: boolean;
  onKick?: (playerId: string) => void;
}

const avatarColors = [
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-yellow-500',
];

export default function PlayerList({ players, currentPlayerId, isHost = false, onKick }: PlayerListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        {t('players')} ({players.length})
      </h3>
      <div className="grid gap-3">
        {players.map((player, index) => {
          const isMe = player.id === currentPlayerId;
          const colorClass = avatarColors[index % avatarColors.length];

          return (
            <div
              key={player.id}
              className={`relative flex items-center justify-between p-4 rounded-xl transition-all duration-200
                ${isMe
                  ? 'bg-white/10 border border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border border-white/10 hover:bg-white/8'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {player.nickname.charAt(0).toUpperCase()}
                  {/* Online indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900
                    ${player.isReady ? 'bg-green-400' : 'bg-gray-500'}
                  `} />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {player.nickname}
                      {isMe && (
                        <span className="ml-1.5 text-xs text-cyan-400 font-normal">({t('you')})</span>
                      )}
                    </span>
                    {player.isHost && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium border border-amber-500/30">
                        👑 {t('host')}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs ${player.isReady ? 'text-green-400' : 'text-gray-500'}`}>
                    {player.isReady ? `✓ ${t('ready')}` : `○ ${t('notReady')}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Ready status badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${player.isReady
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-700/50 text-gray-500'
                  }
                `}>
                  {player.isReady ? '✓' : '…'}
                </div>

                {/* Kick button */}
                {isHost && player.id !== currentPlayerId && onKick && (
                  <button
                    onClick={() => onKick(player.id)}
                    className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 transition-all flex items-center justify-center text-sm"
                    title="Kick"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
