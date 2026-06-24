import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../../hooks/useSocket';
import { MahjongGameState, PendingAction } from './types';
import GameBoard from './GameBoard';
import ActionPanel from './ActionPanel';

export default function MahjongGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<MahjongGameState | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !socket) return;

    const onGameState = (state: MahjongGameState) => {
      setGameState(state);
      setError(null);

      // Check if there's a pending action for me
      const myAction = state.pendingActions?.find(a => a.playerId === socket.id);
      if (myAction) {
        setPendingAction(myAction);
      } else {
        setPendingAction(null);
      }
    };

    const onGameStarted = (data: { roomId: string; gameState: MahjongGameState }) => {
      setGameState(data.gameState);
      setError(null);
    };

    const onGameFinished = (data: { result: { winnerId: string; winnerNickname: string; winType: string } }) => {
      if (data.result.winnerId === socket?.id) {
        alert(`🎉 恭喜你胡了！ (${data.result.winType})`);
      } else {
        alert(`游戏结束！赢家: ${data.result.winnerNickname || data.result.winnerId}`);
      }
    };

    const onActionRequired = (data: PendingAction) => {
      setPendingAction(data);
    };

    const onError = (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('gameState', onGameState);
    socket.on('gameStarted', onGameStarted);
    socket.on('gameFinished', onGameFinished);
    socket.on('actionRequired', onActionRequired);
    socket.on('error', onError);

    // Request game state on mount
    socket.emit('getGameState', { roomId });

    // Poll game state as fallback
    const pollInterval = setInterval(() => {
      socket.emit('getGameState', { roomId });
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      socket.off('gameState', onGameState);
      socket.off('gameStarted', onGameStarted);
      socket.off('gameFinished', onGameFinished);
      socket.off('actionRequired', onActionRequired);
      socket.off('error', onError);
    };
  }, [roomId]);

  const sendAction = useCallback((action: string, data?: Record<string, unknown>) => {
    if (!socket) return;
    socket.emit('mahjong:action', { action, data });
  }, []);

  const handleTileSelect = useCallback((tileId: string) => {
    setSelectedTileId(prev => prev === tileId ? null : tileId);
  }, []);

  const handleDiscard = useCallback(() => {
    if (!selectedTileId) return;
    sendAction('discard', { tileId: selectedTileId });
    setSelectedTileId(null);
  }, [selectedTileId, sendAction]);

  const handleAction = useCallback((action: string, data?: Record<string, unknown>) => {
    sendAction(action, data);
    setPendingAction(null);
  }, [sendAction]);

  const handleLeaveGame = useCallback(() => {
    if (!socket) return;
    socket.emit('leaveRoom');
    navigate('/');
  }, [navigate]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-emerald-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🀄</div>
          <p className="text-white text-lg">加载麻将游戏中...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === socket?.id;
  const availableActions = gameState.availableActions || [];
  const canDiscard = isMyTurn && (gameState.canDiscard ?? false);
  const myHand = gameState.playerHand || [];
  const myMelds = gameState.playerMelds || [];

  // Waiting state
  if (gameState.status === 'WAITING') {
    return (
      <div className="min-h-screen bg-emerald-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🀄</div>
          <h2 className="text-white text-2xl font-bold mb-4">等待玩家加入...</h2>
          <p className="text-emerald-200 mb-2">房间号: {roomId}</p>
          <p className="text-emerald-300 text-sm mb-6">
            当前 {gameState.players.length} / 4 位玩家
          </p>
          <div className="space-y-2">
            {gameState.players.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-center gap-2 text-white">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'][idx] }} />
                <span>{p.nickname || p.id.substring(0, 8)}</span>
                {p.isReady && <span className="text-green-400">✓</span>}
              </div>
            ))}
          </div>
          <button
            onClick={handleLeaveGame}
            className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            离开房间
          </button>
        </div>
      </div>
    );
  }

  // Finished state
  if (gameState.status === 'FINISHED') {
    const winner = gameState.players.find(p => p.id === gameState.winnerId);
    return (
      <div className="min-h-screen bg-emerald-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-white text-2xl font-bold mb-2">游戏结束</h2>
          <p className="text-yellow-300 text-xl mb-4">
            {winner?.nickname || '未知'} 获胜！
          </p>
          {gameState.winType && (
            <p className="text-emerald-200 mb-4">胡牌方式: {gameState.winType}</p>
          )}
          <div className="space-y-2 mb-6">
            {gameState.players.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-white bg-white/5 rounded-lg p-2">
                <span>{p.nickname || p.id.substring(0, 8)}</span>
                <span className="font-bold">{p.score} 分</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleLeaveGame}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            离开房间
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="min-h-screen bg-emerald-900 p-2 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          🀄 麻将
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-emerald-300">房间: {roomId}</span>
          <button
            onClick={handleLeaveGame}
            className="px-3 py-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 text-sm transition-colors"
          >
            离开
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-2 p-2 bg-red-500/80 text-white rounded-lg text-sm text-center animate-pulse">
          {error}
        </div>
      )}

      {/* Last action bar */}
      {gameState.lastAction && (
        <div className="mb-2 p-2 bg-emerald-800/50 border border-emerald-600/30 rounded-lg text-sm text-emerald-200 text-center">
          {gameState.lastAction}
        </div>
      )}

      {/* Turn indicator */}
      <div className="mb-2 text-center">
        {isMyTurn ? (
          <span className="text-yellow-300 font-bold text-sm">
            ⭐ 轮到你了
            {canDiscard ? ' — 请选牌出牌' : ''}
          </span>
        ) : (
          <span className="text-emerald-400 text-sm">
            等待其他玩家...
          </span>
        )}
      </div>

      {/* Main game board */}
      <div className="flex flex-col items-center gap-3">
        <GameBoard
          players={gameState.players}
          myPlayerId={socket?.id || ''}
          currentPlayerId={gameState.currentPlayerId}
          wallCount={gameState.wallCount}
          roundWind={gameState.roundWind}
          lastDiscard={gameState.lastDiscard}
          lastDiscardPlayerId={gameState.lastDiscardPlayerId}
          selectedTileId={selectedTileId}
          canDiscard={canDiscard}
          onTileSelect={handleTileSelect}
          myHand={myHand}
          myMelds={myMelds}
        />

        {/* Action panel */}
        <div className="w-full max-w-[700px]">
          <ActionPanel
            availableActions={availableActions}
            canDiscard={canDiscard}
            selectedTileId={selectedTileId}
            pendingAction={pendingAction}
            lastDiscard={gameState.lastDiscard}
            onDiscard={handleDiscard}
            onAction={handleAction}
          />
        </div>
      </div>
    </div>
  );
}
