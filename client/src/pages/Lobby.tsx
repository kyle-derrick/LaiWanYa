import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Room } from '../types';
import PlayerList from '../components/PlayerList';
import Chat from '../components/Chat';
import { socket } from '../hooks/useSocket';
import { getNickname, setNickname } from '../utils/storage';

export default function Lobby() {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [needsNickname, setNeedsNickname] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchRoom = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit('getRoomInfo', { roomId });
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !socket) return;

    const savedNickname = getNickname();
    if (!savedNickname) {
      setNeedsNickname(true);
    }

    const onRoomInfo = (data: { room: Room }) => setRoom(data.room);
    const onRoomUpdated = (data: { room: Room }) => setRoom(data.room);
    const onPlayerJoined = (data: { room: Room }) => setRoom(data.room);
    const onPlayerLeft = (data: { room: Room }) => setRoom(data.room);
    const onGameStarted = (data: { roomId: string }) => navigate(`/game/${data.roomId}`);
    const onError = (data: { message: string }) => alert(data.message);

    socket.on('roomInfo', onRoomInfo);
    socket.on('roomUpdated', onRoomUpdated);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('playerLeft', onPlayerLeft);
    socket.on('gameStarted', onGameStarted);
    socket.on('error', onError);

    if (savedNickname) {
      socket.emit('joinRoom', { roomId, nickname: savedNickname });
    }

    fetchRoom();
    const pollInterval = setInterval(fetchRoom, 2000);

    return () => {
      clearInterval(pollInterval);
      socket.off('roomInfo', onRoomInfo);
      socket.off('roomUpdated', onRoomUpdated);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('playerLeft', onPlayerLeft);
      socket.off('gameStarted', onGameStarted);
      socket.off('error', onError);
    };
  }, [roomId, navigate, fetchRoom]);

  const handleJoinWithNickname = () => {
    if (!nicknameInput.trim() || !socket || !roomId) return;
    setNickname(nicknameInput.trim());
    setNeedsNickname(false);
    socket.emit('joinRoom', { roomId, nickname: nicknameInput.trim() });
  };

  const handleToggleReady = () => {
    if (socket) socket.emit('toggleReady');
  };

  const handleStartGame = () => {
    if (socket) socket.emit('startGame');
  };

  const handleLeaveRoom = () => {
    if (socket) socket.emit('leaveRoom');
    navigate('/');
  };

  const handleCopyLink = () => {
    if (roomId) {
      navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const gameTypeIcons: Record<string, string> = {
    UNO: '🃏',
    MONOPOLY: '🏦',
    MAHJONG: '🀄',
    LIARS_BAR: '🔫',
  };

  // Nickname input overlay
  if (needsNickname) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
              🎮
            </div>
            <h1 className="text-2xl font-bold text-white">
              {t('joinRoomByUrl')}
            </h1>
            <p className="text-gray-400 text-sm mt-2">Enter your nickname to join</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('nickname')}
            </label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinWithNickname()}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500
                focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              placeholder={t('nicknamePlaceholder')}
              maxLength={20}
              autoFocus
            />
          </div>
          <button
            onClick={handleJoinWithNickname}
            disabled={!nicknameInput.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold
              hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all
              shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98]"
          >
            {t('joinRoom')}
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">{t('loadingRoom')}</p>
        </div>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.id === socket?.id);
  const isHost = currentPlayer?.isHost || false;
  const canStart = room.players.length >= 2 && room.players.every(p => p.isReady);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/30">
              {gameTypeIcons[room.gameType] || '🎮'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('gameLobby')}</h1>
              <p className="text-xs text-gray-500">{room.gameType}</p>
            </div>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all font-medium text-sm"
          >
            ← {t('leave')}
          </button>
        </div>

        {/* Room Info Card */}
        <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{t('room')} ID</span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                title={t('copyLink')}
              >
                <span className="font-mono text-lg font-bold text-cyan-400 tracking-wider">
                  {room.id}
                </span>
                <span className={`text-xs transition-all ${copied ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {copied ? '✓ Copied!' : '📋'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">{t('game')}</p>
              <p className="text-white font-semibold flex items-center gap-2">
                <span>{gameTypeIcons[room.gameType]}</span>
                {room.gameType}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">{t('players')}</p>
              <p className="text-white font-semibold">
                {room.players.length}
                <span className="text-gray-500 font-normal"> / {room.maxPlayers}</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            💡 {t('shareRoomHint')}
          </p>
        </div>

        {/* Player List */}
        <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
          <PlayerList players={room.players} currentPlayerId={socket?.id || ''} />
        </div>

        {/* Chat */}
        <div className="mb-6">
          <Chat roomId={roomId || ''} currentNickname={getNickname() || undefined} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleToggleReady}
            className={`flex-1 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-[0.98]
              ${currentPlayer?.isReady
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-green-500/20'
              }
            `}
          >
            {currentPlayer?.isReady ? `↩ ${t('notReady')}` : `✓ ${t('ready')}`}
          </button>

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold text-sm
                hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
                transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98]"
            >
              🚀 {t('startGame')}
            </button>
          )}
        </div>

        {/* Status Messages */}
        {!canStart && room.players.length < 2 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <span>⏳</span>
            {t('needMorePlayers')}
          </div>
        )}

        {!canStart && room.players.length >= 2 && !room.players.every(p => p.isReady) && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <span>⏳</span>
            {t('waitingForReady')}
          </div>
        )}
      </div>
    </div>
  );
}
