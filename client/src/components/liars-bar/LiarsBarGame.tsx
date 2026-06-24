import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiarsBarGameState, LiarsBarPhase } from '../../types';
import { socket } from '../../hooks/useSocket';
import GameTable from './GameTable';
import PlayerHand from './PlayerHand';
import ActionPanel from './ActionPanel';

export default function LiarsBarGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<LiarsBarGameState | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onGameState = (state: LiarsBarGameState) => {
      setGameState(state);
      // Clear selection when game state changes
      if (state.phase !== LiarsBarPhase.PLAYING_CARDS) {
        setSelectedIndices([]);
      }
    };

    const onGameStarted = (data: { roomId: string; gameState: LiarsBarGameState }) => {
      setRoomId(data.roomId);
      setGameState(data.gameState);
    };

    const onGameFinished = (data: { result: { winnerId: string; winnerNickname: string } }) => {
      setGameState(prev => prev ? { ...prev, status: 'FINISHED', winnerId: data.result.winnerId } : prev);
    };

    const onRoomInfo = (data: { room: { id: string } }) => {
      setRoomId(data.room.id);
    };

    socket.on('gameState', onGameState);
    socket.on('gameStarted', onGameStarted);
    socket.on('gameFinished', onGameFinished);
    socket.on('roomInfo', onRoomInfo);

    // Request game state on mount
    socket.emit('getRoomInfo', { roomId: window.location.pathname.split('/').pop() });

    const pollInterval = setInterval(() => {
      if (roomId) {
        socket.emit('getGameState', { roomId });
      }
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      socket.off('gameState', onGameState);
      socket.off('gameStarted', onGameStarted);
      socket.off('gameFinished', onGameFinished);
      socket.off('roomInfo', onRoomInfo);
    };
  }, [roomId]);

  const handleToggleCard = useCallback((index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : prev.length < 3
          ? [...prev, index].sort()
          : prev
    );
  }, []);

  const handlePlayCards = useCallback(() => {
    if (!socket || selectedIndices.length === 0) return;
    socket.emit('liars-bar:action', {
      action: 'playCards',
      data: { cardIndices: selectedIndices }
    });
    setSelectedIndices([]);
  }, [selectedIndices]);

  const handleChallenge = useCallback(() => {
    if (!socket) return;
    socket.emit('liars-bar:action', { action: 'challenge' });
  }, []);

  const handlePass = useCallback(() => {
    if (!socket) return;
    socket.emit('liars-bar:action', { action: 'pass' });
  }, []);

  const handleLeaveGame = useCallback(() => {
    if (!socket) return;
    socket.emit('leaveRoom');
    navigate('/');
  }, [navigate]);

  if (!gameState) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-md text-white">
        <p className="text-center text-gray-400">Loading Liar's Bar...</p>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === socket?.id;
  const isGameOver = gameState.status === 'FINISHED';

  return (
    <div className="max-w-6xl mx-auto mt-4 p-4 bg-gray-900 rounded-lg shadow-md text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-red-500">
          🎰 Liar's Bar
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Room: {roomId}</span>
          <span className="text-sm text-gray-400">Round {gameState.roundNumber}</span>
          <button
            onClick={handleLeaveGame}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Game over overlay */}
      {isGameOver && (
        <div className="mb-6 p-6 bg-gray-800 rounded-lg border-2 border-yellow-500 text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">🎉 Game Over!</h2>
          {gameState.winnerId ? (
            <p className="text-xl text-white">
              Winner: <span className="text-yellow-300 font-bold">
                {gameState.players.find(p => p.id === gameState.winnerId)?.nickname || gameState.winnerId}
                {gameState.winnerId === socket?.id ? ' (You!)' : ''}
              </span>
            </p>
          ) : (
            <p className="text-xl text-gray-400">No winner</p>
          )}
        </div>
      )}

      {/* Game table */}
      <div className="mb-6">
        <GameTable
          players={gameState.players}
          currentPile={gameState.currentPile}
          targetRank={gameState.targetRank}
          myId={socket?.id}
          phase={gameState.phase}
          revealResult={gameState.revealResult}
        />
      </div>

      {/* Last action */}
      {gameState.lastAction && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600 text-center">
          <p className="text-gray-300 text-sm">{gameState.lastAction}</p>
        </div>
      )}

      {/* Action panel */}
      <div className="mb-6">
        <ActionPanel
          phase={gameState.phase}
          isMyTurn={isMyTurn}
          selectedCount={selectedIndices.length}
          onPlayCards={handlePlayCards}
          onChallenge={handleChallenge}
          onPass={handlePass}
          targetRank={gameState.targetRank}
          currentPilePlayerId={gameState.currentPile?.playerId || null}
          myId={socket?.id}
        />
      </div>

      {/* Player hand */}
      {!isGameOver && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-3 text-center">
            Your Hand ({gameState.playerHand?.length || 0} cards)
          </h2>
          <PlayerHand
            hand={gameState.playerHand || []}
            selectedIndices={selectedIndices}
            onToggleCard={handleToggleCard}
            disabled={!isMyTurn || gameState.phase !== LiarsBarPhase.PLAYING_CARDS}
            targetRank={gameState.targetRank}
          />
        </div>
      )}

      {/* Player list */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {gameState.players.map((player) => {
          const isMe = player.id === socket?.id;
          const isCurrent = player.id === gameState.currentPlayerId;

          return (
            <div
              key={player.id}
              className={`p-2 rounded-md text-center text-sm ${
                !player.alive
                  ? 'bg-red-900/30 border border-red-700 opacity-50'
                  : isCurrent
                    ? 'bg-blue-900/50 border-2 border-blue-400'
                    : 'bg-gray-800 border border-gray-600'
              }`}
            >
              <p className={`font-medium truncate ${isMe ? 'text-blue-300' : 'text-gray-300'}`}>
                {isMe ? '👤 You' : player.nickname}
              </p>
              <p className="text-xs text-gray-400">
                🃏 {player.handSize} cards
                {!player.alive && ' 💀'}
              </p>
              {player.alive && (
                <p className="text-xs mt-0.5">
                  {Array.from({ length: 2 }, (_, i) => (
                    <span key={i} className={i < player.hp ? 'text-red-500' : 'text-gray-600'}>❤️</span>
                  ))}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Turn indicator */}
      {!isGameOver && (
        <div className="mt-4 text-center">
          {isMyTurn ? (
            <p className="text-green-400 font-semibold animate-pulse">
              ⚡ It's your turn!
            </p>
          ) : gameState.phase === LiarsBarPhase.CHALLENGING &&
            gameState.currentPile?.playerId !== socket?.id ? (
            <p className="text-orange-400 font-semibold animate-pulse">
              ❓ Do you want to challenge?
            </p>
          ) : (
            <p className="text-gray-500">
              Waiting for {gameState.players.find(p => p.id === gameState.currentPlayerId)?.nickname || 'other player'}...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
