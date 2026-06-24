import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UnoGameState, UnoColor, GameType } from '../types';
import { socket } from '../hooks/useSocket';
import UnoCardComponent from '../components/UnoCard';
import MonopolyGame from '../components/monopoly/MonopolyGame';
import { MahjongGame } from '../components/mahjong';
import { LiarsBarGame } from '../components/liars-bar';

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [gameType, setGameType] = useState<GameType | null>(null);

  useEffect(() => {
    if (!roomId || !socket) return;

    const onRoomInfo = (data: { room: { gameType: GameType } }) => {
      setGameType(data.room.gameType);
    };

    socket.on('roomInfo', onRoomInfo);
    socket.emit('getRoomInfo', { roomId });

    return () => {
      socket.off('roomInfo', onRoomInfo);
    };
  }, [roomId]);

  if (gameType === GameType.MONOPOLY) {
    return <MonopolyGame />;
  }

  if (gameType === GameType.MAHJONG) {
    return <MahjongGame />;
  }

  if (gameType === GameType.LIARS_BAR) {
    return <LiarsBarGame />;
  }

  return <UnoGameView roomId={roomId} navigate={navigate} />;
}

/* ──────────────────── UNO GAME VIEW ──────────────────── */

function UnoGameView({ roomId, navigate }: { roomId: string | undefined; navigate: ReturnType<typeof useNavigate> }) {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<UnoGameState | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCardIndex, setPendingCardIndex] = useState<number | null>(null);
  const [lastPlayedCard, setLastPlayedCard] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !socket) return;

    const onGameState = (state: UnoGameState) => {
      // Detect card play for animation
      if (state.currentCard && state.currentCard.id !== lastPlayedCard) {
        setLastPlayedCard(state.currentCard.id);
      }
      setGameState(state);
    };
    const onGameStarted = (data: { roomId: string; gameState: UnoGameState }) => {
      setGameState(data.gameState);
    };
    const onGameFinished = (data: { result: { winnerId: string; winnerNickname: string } }) => {
      alert(`Game Over! Winner: ${data.result.winnerNickname || data.result.winnerId}`);
    };
    const onError = (data: { message: string }) => {
      alert(data.message);
      setShowColorPicker(false);
      setPendingCardIndex(null);
    };

    socket.on('gameState', onGameState);
    socket.on('gameStarted', onGameStarted);
    socket.on('gameFinished', onGameFinished);
    socket.on('error', onError);

    socket.emit('getGameState', { roomId });

    const pollInterval = setInterval(() => {
      socket.emit('getGameState', { roomId });
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      socket.off('gameState', onGameState);
      socket.off('gameStarted', onGameStarted);
      socket.off('gameFinished', onGameFinished);
      socket.off('error', onError);
    };
  }, [roomId, navigate]);

  const handlePlayCard = (cardIndex: number) => {
    if (!socket || !gameState) return;

    const card = gameState.playerHand?.[cardIndex];
    if (!card) return;

    if (card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR') {
      setPendingCardIndex(cardIndex);
      setShowColorPicker(true);
      return;
    }

    socket.emit('uno:playCard', { cardIndex });
  };

  const handleColorSelect = (color: UnoColor) => {
    if (!socket || pendingCardIndex === null) return;

    socket.emit('uno:playCard', { cardIndex: pendingCardIndex, color });
    setShowColorPicker(false);
    setPendingCardIndex(null);
  };

  const handleDrawCard = () => {
    if (!socket) return;
    socket.emit('uno:drawCard');
  };

  const handleCallUno = () => {
    if (!socket) return;
    socket.emit('uno:callUno');
  };

  const handleLeaveGame = () => {
    if (!socket) return;
    socket.emit('leaveRoom');
    navigate('/');
  };

  /* ── Loading state ── */
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-green-300/60 text-sm font-medium">{t('loadingRoom')}</p>
        </div>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === socket?.id;
  const canCallUno = gameState.playerHand?.length === 2;

  const colorDot = (color: string | null) => {
    const map: Record<string, string> = {
      RED: '#ef4444', YELLOW: '#eab308', GREEN: '#22c55e', BLUE: '#3b82f6',
    };
    return map[color || ''] || '#6b7280';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 flex flex-col relative overflow-hidden">
      {/* ── Background decoration ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-3xl" />
        {/* Felt texture pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}
        />
      </div>

      {/* ── Top Bar ── */}
      <div className="relative z-10 flex justify-between items-center px-6 py-3 bg-black/20 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-green-500/30">
            UNO
          </div>
          <h1 className="text-lg font-bold text-white">{t('unoGame')}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Turn indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
            ${isMyTurn
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/10 animate-pulse'
              : 'bg-white/5 text-gray-400 border border-white/10'
            }
          `}>
            <span className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-green-400' : 'bg-gray-600'}`} />
            {isMyTurn ? t('yourTurn') : t('waitingForOthers')}
          </div>

          <span className="text-xs text-gray-500 font-mono">#{roomId}</span>

          <button
            onClick={handleLeaveGame}
            className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all text-sm"
          >
            ✕ {t('leave')}
          </button>
        </div>
      </div>

      {/* ── Main game area ── */}
      <div className="relative z-10 flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-4">

        {/* ── Game info bar ── */}
        <div className="flex items-center justify-between mb-4 px-4 py-3 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{t('direction')}</span>
              <span className="text-white text-sm font-medium">
                {gameState.direction === 1 ? '↻' : '↺'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{t('drawPile')}</span>
              <span className="px-2 py-0.5 bg-emerald-800/50 text-emerald-300 text-sm font-bold rounded-lg">
                {gameState.drawPileCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{t('currentColor')}</span>
              <div
                className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg"
                style={{ backgroundColor: colorDot(gameState.currentColor), boxShadow: `0 0 12px ${colorDot(gameState.currentColor)}60` }}
              />
            </div>
            {gameState.lastAction && (
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{gameState.lastAction}</span>
            )}
          </div>
        </div>

        {/* ── Center area: current card + draw pile ── */}
        <div className="flex-1 flex items-center justify-center gap-8 mb-4">
          {/* Draw pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-28 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-white/10 shadow-xl flex items-center justify-center">
              <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 border border-white/10 flex items-center justify-center">
                <span className="text-white/30 text-xs font-bold">UNO</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">{gameState.drawPileCount} {t('cards')}</span>
          </div>

          {/* Current card (discard pile) */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {gameState.currentCard && (
                <div className="animate-card-play">
                  <UnoCardComponent card={gameState.currentCard} isPlayable={false} large />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">{t('currentCard')}</span>
          </div>
        </div>

        {/* ── Players ── */}
        <div className="mb-4 flex justify-center gap-3 flex-wrap">
          {gameState.playerCount?.map((player) => {
            const isActive = player.id === gameState.currentPlayerId;
            const isMe = player.id === socket?.id;

            return (
              <div
                key={player.id}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-green-500/15 border-2 border-green-500/50 shadow-lg shadow-green-500/10 scale-105'
                    : 'bg-white/5 border border-white/10'
                  }
                `}
              >
                {/* Active glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-green-500/5 animate-pulse pointer-events-none" />
                )}

                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                  ${isActive ? 'bg-green-600' : 'bg-gray-700'}
                `}>
                  {isMe ? '🧑' : '👤'}
                </div>

                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${isActive ? 'text-green-400' : 'text-gray-300'}`}>
                    {isMe ? t('you') : player.id.substring(0, 6)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {player.cardCount} {t('cards')}
                    </span>
                    {player.hasCalledUno && (
                      <span className="text-xs font-bold text-red-400 animate-bounce">UNO!</span>
                    )}
                  </div>
                </div>

                {/* Card count visual */}
                <div className="flex gap-0.5 ml-2">
                  {Array.from({ length: Math.min(player.cardCount, 7) }).map((_, i) => (
                    <div key={i} className="w-1.5 h-5 bg-white/20 rounded-sm -ml-1 first:ml-0" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Player hand ── */}
        <div className="relative bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400">
              {t('yourHand')} <span className="text-white">{gameState.playerHand?.length || 0}</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 justify-center min-h-[120px] items-end">
            {gameState.playerHand?.map((card, index) => (
              <div
                key={card.id}
                className="transition-all duration-200"
                style={{
                  transform: `rotate(${(index - (gameState.playerHand?.length || 0) / 2) * 3}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                <UnoCardComponent
                  card={card}
                  isPlayable={isMyTurn}
                  onClick={() => handlePlayCard(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleDrawCard}
            disabled={!isMyTurn}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold text-sm
              hover:from-emerald-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 active:scale-95"
          >
            🂠 {t('drawCard')}
          </button>

          {canCallUno && (
            <button
              onClick={handleCallUno}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-black text-lg
                hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50
                active:scale-95 animate-pulse tracking-wider"
            >
              UNO!
            </button>
          )}
        </div>
      </div>

      {/* ── Color picker modal ── */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl animate-scale-in max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              🎨 {t('chooseColor')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {[
                { color: UnoColor.RED, gradient: 'from-red-500 to-red-700', glow: 'shadow-red-500/40', label: 'Red', emoji: '🔴' },
                { color: UnoColor.YELLOW, gradient: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-500/40', label: 'Yellow', emoji: '🟡' },
                { color: UnoColor.GREEN, gradient: 'from-green-500 to-green-700', glow: 'shadow-green-500/40', label: 'Green', emoji: '🟢' },
                { color: UnoColor.BLUE, gradient: 'from-blue-500 to-blue-700', glow: 'shadow-blue-500/40', label: 'Blue', emoji: '🔵' },
              ].map(({ color, gradient, glow, label, emoji }) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`group relative px-6 py-5 rounded-2xl bg-gradient-to-br ${gradient} text-white font-bold text-lg
                    hover:scale-105 active:scale-95 transition-all shadow-lg ${glow} hover:shadow-xl`}
                >
                  <span className="text-2xl block mb-1">{emoji}</span>
                  <span className="text-sm opacity-90">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowColorPicker(false);
                setPendingCardIndex(null);
              }}
              className="mt-6 w-full px-4 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ── Custom animations ── */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes card-play {
          0% { transform: translateY(60px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-card-play { animation: card-play 0.4s ease-out; }
      `}</style>
    </div>
  );
}
