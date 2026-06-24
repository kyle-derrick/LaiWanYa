import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameType } from '../types';
import { socket } from '../hooks/useSocket';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameType>(GameType.UNO);
  const [connected, setConnected] = useState(socket?.connected ?? false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleCreateRoom = () => {
    if (!nickname.trim() || !socket) return;

    socket.emit('createRoom', {
      nickname: nickname.trim(),
      gameType: selectedGame
    });

    socket.once('roomCreated', (data: { roomId: string }) => {
      navigate(`/lobby/${data.roomId}`);
    });
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomId.trim() || !socket) return;

    socket.emit('joinRoom', {
      roomId: roomId.trim().toUpperCase(),
      nickname: nickname.trim()
    });

    socket.once('roomJoined', (data: { roomId: string }) => {
      navigate(`/lobby/${data.roomId}`);
    });

    socket.once('error', (data: { message: string }) => {
      alert(data.message);
    });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        Game Platform
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nickname
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your nickname"
          maxLength={20}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Game Type
        </label>
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value as GameType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={GameType.UNO}>UNO</option>
          <option value={GameType.MONOPOLY} disabled>Monopoly (Coming Soon)</option>
          <option value={GameType.MAHJONG} disabled>Mahjong (Coming Soon)</option>
        </select>
      </div>

      <button
        onClick={handleCreateRoom}
        disabled={!nickname.trim() || !connected}
        className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Create Room
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room ID
        </label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter 6-digit room code"
          maxLength={6}
        />
      </div>

      <button
        onClick={handleJoinRoom}
        disabled={!nickname.trim() || !roomId.trim() || !connected}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Join Room
      </button>

      <div className="mt-4 text-center text-sm text-gray-500">
        {connected ? (
          <span className="text-green-600">● Connected to server</span>
        ) : (
          <span className="text-red-600">● Disconnected</span>
        )}
      </div>
    </div>
  );
}
