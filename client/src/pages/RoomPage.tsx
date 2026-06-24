import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Room } from '../types';
import PlayerList from '../components/PlayerList';
import { socket } from '../hooks/useSocket';
import { getNickname, setNickname } from '../utils/storage';

export default function RoomPage() {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [nickname, setNicknameState] = useState(getNickname() || '');
  const [tempNickname, setTempNickname] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const fetchRoom = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit('getRoomInfo', { roomId });
  }, [roomId]);

  // If no nickname, show nickname input; otherwise auto-join
  useEffect(() => {
    if (!roomId || !socket) return;

    const savedNickname = getNickname();
    if (savedNickname) {
      setNicknameState(savedNickname);
      doJoin(savedNickname);
    }

    const onRoomInfo = (data: { room: Room }) => setRoom(data.room);
    const onRoomUpdated = (data: { room: Room }) => setRoom(data.room);
    const onPlayerJoined = (data: { room: Room }) => setRoom(data.room);
    const onPlayerLeft = (data: { room: Room }) => setRoom(data.room);
    const onGameStarted = (data: { roomId: string }) => navigate(`/game/${data.roomId}`);
    const onError = (data: { message: string }) => {
      setError(data.message);
      setJoining(false);
    };

    socket.on('roomInfo', onRoomInfo);
    socket.on('roomUpdated', onRoomUpdated);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('playerLeft', onPlayerLeft);
    socket.on('gameStarted', onGameStarted);
    socket.on('error', onError);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const doJoin = (name: string) => {
    if (!socket || !roomId || !name.trim()) return;
    setJoining(true);
    setError('');
    socket.emit('joinRoom', {
      roomId: roomId.trim().toUpperCase(),
      nickname: name.trim(),
    });
    socket.once('roomJoined', () => {
      setJoining(false);
      fetchRoom();
    });
  };

  const handleJoinWithNickname = () => {
    const trimmed = tempNickname.trim();
    if (!trimmed) return;
    setNickname(trimmed);
    setNicknameState(trimmed);
    doJoin(trimmed);
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
      alert(t('linkCopied'));
    }
  };

  // No nickname yet - show nickname input
  if (!nickname) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          {t('joinRoomByUrl')}
        </h1>
        <p className="text-sm text-gray-500 mb-4 text-center">
          {t('room')}: <span className="font-mono font-bold">{roomId}</span>
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('nickname')}
          </label>
          <input
            type="text"
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinWithNickname()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('nicknamePlaceholder')}
            maxLength={20}
            autoFocus
          />
        </div>
        <button
          onClick={handleJoinWithNickname}
          disabled={!tempNickname.trim()}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {t('joinRoom')}
        </button>
        {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}
      </div>
    );
  }

  // Joining in progress
  if (joining && !room) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-500">{t('enteringRoom')}</p>
      </div>
    );
  }

  // Room lobby view
  if (!room) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-500">{t('loadingRoom')}</p>
        {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}
      </div>
    );
  }

  const currentPlayer = room.players.find((p) => p.id === socket?.id);
  const isHost = currentPlayer?.isHost || false;
  const canStart = room.players.length >= 2 && room.players.every((p) => p.isReady);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">{t('gameLobby')}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('room')}:</span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 font-mono text-lg font-bold"
            title={t('copyLink')}
          >
            {room.id}
          </button>
          <button
            onClick={handleCopyLink}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            {t('copyLink')}
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          {t('game')}: <span className="font-semibold">{room.gameType}</span>
        </p>
        <p className="text-sm text-gray-600">
          {t('players')}: <span className="font-semibold">{room.players.length}/{room.maxPlayers}</span>
        </p>
        <p className="text-sm text-gray-600 mt-2">{t('shareRoomHint')}</p>
      </div>

      <PlayerList players={room.players} currentPlayerId={socket?.id || ''} />

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleToggleReady}
          className={`flex-1 px-4 py-2 rounded-md font-medium ${
            currentPlayer?.isReady
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {currentPlayer?.isReady ? t('notReady') : t('ready')}
        </button>

        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {t('startGame')}
          </button>
        )}

        <button
          onClick={handleLeaveRoom}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
        >
          {t('leave')}
        </button>
      </div>

      {!canStart && room.players.length < 2 && (
        <p className="mt-4 text-sm text-yellow-600 text-center">{t('needMorePlayers')}</p>
      )}

      {!canStart && room.players.length >= 2 && !room.players.every((p) => p.isReady) && (
        <p className="mt-4 text-sm text-yellow-600 text-center">{t('waitingForReady')}</p>
      )}

      {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
}
