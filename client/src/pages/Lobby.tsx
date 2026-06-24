import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Room } from '../types';
import PlayerList from '../components/PlayerList';
import { socket } from '../hooks/useSocket';

export default function Lobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);

  const fetchRoom = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit('getRoomInfo', { roomId });
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !socket) return;

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

    // Initial fetch + join room server-side
    fetchRoom();

    // Poll as fallback (every 2 seconds)
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

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      alert('Room ID copied to clipboard!');
    }
  };

  if (!room) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-500">Loading room...</p>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.id === socket?.id);
  const isHost = currentPlayer?.isHost || false;
  const canStart = room.players.length >= 2 && room.players.every(p => p.isReady);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Game Lobby</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Room:</span>
          <button
            onClick={handleCopyRoomId}
            className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 font-mono text-lg font-bold"
          >
            {room.id}
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Game: <span className="font-semibold">{room.gameType}</span>
        </p>
        <p className="text-sm text-gray-600">
          Players: <span className="font-semibold">{room.players.length}/{room.maxPlayers}</span>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Share this room code with friends to join!
        </p>
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
          {currentPlayer?.isReady ? 'Not Ready' : 'Ready'}
        </button>

        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            Start Game
          </button>
        )}

        <button
          onClick={handleLeaveRoom}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
        >
          Leave
        </button>
      </div>

      {!canStart && room.players.length < 2 && (
        <p className="mt-4 text-sm text-yellow-600 text-center">
          Need at least 2 players to start
        </p>
      )}

      {!canStart && room.players.length >= 2 && !room.players.every(p => p.isReady) && (
        <p className="mt-4 text-sm text-yellow-600 text-center">
          Waiting for all players to be ready
        </p>
      )}
    </div>
  );
}
