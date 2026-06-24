import { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  isHost?: boolean;
  onKick?: (playerId: string) => void;
}

export default function PlayerList({ players, currentPlayerId, isHost = false, onKick }: PlayerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-700">Players</h3>
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center justify-between p-3 rounded-md ${
            player.id === currentPlayerId
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                player.isReady ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="font-medium">
              {player.nickname}
              {player.id === currentPlayerId && ' (You)'}
            </span>
            {player.isHost && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Host
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${
                player.isReady ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {player.isReady ? 'Ready' : 'Not Ready'}
            </span>
            {isHost && player.id !== currentPlayerId && onKick && (
              <button
                onClick={() => onKick(player.id)}
                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Kick
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
