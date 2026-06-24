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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-red-950">
        <div className="px-10 py-8 rounded-2xl bg-stone-900/60 backdrop-blur-xl border border-stone-700/50 shadow-2xl shadow-red-950/30 text-white">
          <p className="text-center text-stone-400 text-lg tracking-wide animate-pulse">
            🎰 Loading Liar's Bar...
          </p>
        </div>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === socket?.id;
  const isGameOver = gameState.status === 'FINISHED';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-950 via-stone-900 to-red-950 text-white overflow-auto">
      {/* Subtle background pattern overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,40,40,0.15),_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 px-5 py-3.5 rounded-2xl bg-stone-900/50 backdrop-blur-xl border border-stone-700/40 shadow-lg shadow-black/20">
          <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-red-400 via-red-300 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
            🎰 Liar's Bar
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-400 font-medium">Room: <span className="text-stone-300">{roomId}</span></span>
            <span className="text-sm text-stone-400 font-medium">Round <span className="text-amber-400 font-bold">{gameState.roundNumber}</span></span>
            <button
              onClick={handleLeaveGame}
              className="px-5 py-2 bg-gradient-to-r from-red-800 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-600 active:from-red-900 active:to-red-800 active:scale-95 text-sm font-semibold transition-all duration-200 shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-800/40 border border-red-600/30"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Game over overlay */}
        {isGameOver && (
          <div className="mb-6 p-8 rounded-2xl bg-stone-900/60 backdrop-blur-xl border-2 border-amber-500/60 text-center shadow-2xl shadow-amber-900/30">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-3">
              🎉 Game Over!
            </h2>
            {gameState.winnerId ? (
              <p className="text-xl text-stone-200">
                Winner: <span className="text-amber-300 font-extrabold">
                  {gameState.players.find(p => p.id === gameState.winnerId)?.nickname || gameState.winnerId}
                  {gameState.winnerId === socket?.id ? ' (You!)' : ''}
                </span>
              </p>
            ) : (
              <p className="text-xl text-stone-400">No winner</p>
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
          <div className="mb-5 px-5 py-3 rounded-xl bg-stone-900/50 backdrop-blur-xl border border-stone-700/40 text-center shadow-md shadow-black/10">
            <p className="text-stone-300 text-sm font-medium tracking-wide">{gameState.lastAction}</p>
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
          <div className="mb-6 p-5 rounded-2xl bg-stone-900/50 backdrop-blur-xl border border-stone-700/40 shadow-xl shadow-black/20">
            <h2 className="text-lg font-semibold mb-4 text-center text-stone-300 tracking-wide">
              Your Hand <span className="text-amber-400">({gameState.playerHand?.length || 0} cards)</span>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {gameState.players.map((player) => {
            const isMe = player.id === socket?.id;
            const isCurrent = player.id === gameState.currentPlayerId;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-xl text-center text-sm transition-all duration-300 backdrop-blur-lg ${
                  !player.alive
                    ? 'bg-red-950/40 border border-red-800/50 opacity-40 grayscale'
                    : isCurrent
                      ? 'bg-gradient-to-br from-amber-900/40 to-red-900/30 border-2 border-amber-400/70 shadow-lg shadow-amber-500/20 scale-[1.03]'
                      : isMe
                        ? 'bg-stone-800/60 border-2 border-blue-400/60 shadow-md shadow-blue-500/10'
                        : 'bg-stone-800/40 border border-stone-600/40'
                }`}
              >
                <p className={`font-semibold truncate ${
                  !player.alive
                    ? 'text-stone-500'
                    : isCurrent
                      ? 'text-amber-200'
                      : isMe
                        ? 'text-blue-300'
                        : 'text-stone-300'
                }`}>
                  {isCurrent && player.alive && (
                    <span className="inline-block mr-1 animate-pulse">🎯</span>
                  )}
                  {isMe ? '👤 You' : player.nickname}
                  {!player.alive && ' 💀'}
                </p>
                <p className={`text-xs mt-1 ${!player.alive ? 'text-stone-600' : 'text-stone-400'}`}>
                  🃏 {player.handSize} cards
                </p>
                {player.alive && (
                  <p className="text-xs mt-1">
                    {Array.from({ length: 2 }, (_, i) => (
                      <span key={i} className={i < player.hp ? 'text-red-500' : 'text-stone-700'}>❤️</span>
                    ))}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Turn indicator */}
        {!isGameOver && (
          <div className="mt-5 mb-6 text-center">
            {isMyTurn ? (
              <p className="text-emerald-400 font-bold text-lg animate-pulse tracking-wide">
                ⚡ It's your turn!
              </p>
            ) : gameState.phase === LiarsBarPhase.CHALLENGING &&
              gameState.currentPile?.playerId !== socket?.id ? (
              <p className="text-amber-400 font-bold text-lg animate-pulse tracking-wide">
                ❓ Do you want to challenge?
              </p>
            ) : (
              <p className="text-stone-500 text-sm tracking-wide">
                Waiting for {gameState.players.find(p => p.id === gameState.currentPlayerId)?.nickname || 'other player'}...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
