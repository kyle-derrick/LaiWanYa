import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../hooks/useSocket';

export default function JoinRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(socket?.connected ?? false);

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

  useEffect(() => {
    if (!socket || !roomId) return;

    // Try to get room info to check if it exists and if password is needed
    socket.emit('getRoomInfo', { roomId: roomId.toUpperCase() });

    const onRoomInfo = (data: { room: { name: string; password: string | null } }) => {
      setRoomName(data.room.name);
      setNeedsPassword(!!data.room.password);
      setLoading(false);
    };

    const onError = (data: { message: string }) => {
      setError(data.message);
      setLoading(false);
    };

    socket.on('roomInfo', onRoomInfo);
    socket.on('error', onError);

    return () => {
      socket.off('roomInfo', onRoomInfo);
      socket.off('error', onError);
    };
  }, [roomId]);

  const handleJoin = () => {
    if (!nickname.trim() || !socket || !roomId) return;

    socket.emit('joinRoom', {
      roomId: roomId.toUpperCase(),
      nickname: nickname.trim(),
      password: needsPassword ? password : undefined,
    });

    socket.once('roomJoined', (data: { roomId: string }) => {
      navigate(`/lobby/${data.roomId}`);
    });

    socket.once('error', (data: { message: string }) => {
      setError(data.message);
    });
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-500">Loading room...</p>
      </div>
    );
  }

  if (error && !roomName) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-2 text-blue-600">Join Room</h1>
      <p className="text-center text-gray-500 mb-6">{roomName}</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nickname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your nickname"
          maxLength={20}
          autoFocus
        />
      </div>

      {needsPassword && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room password"
          />
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={handleJoin}
        disabled={!nickname.trim() || !connected}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium mb-3"
      >
        Join Room
      </button>

      <button
        onClick={() => navigate('/')}
        className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
      >
        Back to Home
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
