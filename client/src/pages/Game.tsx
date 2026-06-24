import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UnoGameState, UnoColor, GameType } from '../types';
import { socket } from '../hooks/useSocket';
import UnoCardComponent from '../components/UnoCard';
import MonopolyGame from '../components/monopoly/MonopolyGame';

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [gameType, setGameType] = useState<GameType | null>(null);

  // Determine game type from room info
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

  // Route to the correct game component
  if (gameType === GameType.MONOPOLY) {
    return <MonopolyGame />;
  }

  // Default: UNO game (or loading)
  return <UnoGameView roomId={roomId} navigate={navigate} />;
}

// UNO game component extracted for clarity
function UnoGameView({ roomId, navigate }: { roomId: string | undefined; navigate: ReturnType<typeof useNavigate> }) {
  const [gameState, setGameState] = useState<UnoGameState | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCardIndex, setPendingCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!roomId || !socket) return;

    const onGameState = (state: UnoGameState) => setGameState(state);
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

    // Request game state on mount (in case we missed the gameStarted event)
    socket.emit('getGameState', { roomId });

    // Poll game state as fallback
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

  if (!gameState) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-500">Loading game...</p>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === socket?.id;
  const canCallUno = gameState.playerHand?.length === 2;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">UNO Game</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Room: {roomId}</span>
          <button
            onClick={handleLeaveGame}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Direction: {gameState.direction === 1 ? '→ Clockwise' : '← Counter-clockwise'}
            </p>
            <p className="text-sm text-gray-600">
              Draw pile: {gameState.drawPileCount} cards
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Current color:{' '}
              <span
                className="inline-block w-4 h-4 rounded-full align-middle"
                style={{
                  backgroundColor: gameState.currentColor === 'RED' ? '#ef4444' :
                                   gameState.currentColor === 'YELLOW' ? '#eab308' :
                                   gameState.currentColor === 'GREEN' ? '#22c55e' :
                                   gameState.currentColor === 'BLUE' ? '#3b82f6' : '#6b7280'
                }}
              />
            </p>
            {gameState.lastAction && (
              <p className="text-xs text-gray-500 mt-1">{gameState.lastAction}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Current Card</h2>
        {gameState.currentCard && (
          <UnoCardComponent card={gameState.currentCard} isPlayable={false} />
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Players</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gameState.playerCount?.map((player) => (
            <div
              key={player.id}
              className={`p-3 rounded-md ${
                player.id === gameState.currentPlayerId
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50'
              }`}
            >
              <p className="font-medium text-sm truncate">
                {player.id === socket?.id ? 'You' : player.id.substring(0, 8)}
              </p>
              <p className="text-xs text-gray-500">
                {player.cardCount} cards
                {player.hasCalledUno && ' - UNO!'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Hand</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {gameState.playerHand?.map((card, index) => (
            <UnoCardComponent
              key={card.id}
              card={card}
              isPlayable={isMyTurn}
              onClick={() => handlePlayCard(index)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleDrawCard}
          disabled={!isMyTurn}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          Draw Card
        </button>
        {canCallUno && (
          <button
            onClick={handleCallUno}
            className="px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium"
          >
            UNO!
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        {isMyTurn ? (
          <p className="text-green-600 font-semibold">It's your turn!</p>
        ) : (
          <p className="text-gray-500">Waiting for other player...</p>
        )}
      </div>

      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Choose a color:</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(UnoColor)
                .filter((c) => c !== UnoColor.WILD)
                .map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="px-6 py-3 rounded-md text-white font-medium"
                    style={{
                      backgroundColor:
                        color === UnoColor.RED ? '#ef4444' :
                        color === UnoColor.YELLOW ? '#eab308' :
                        color === UnoColor.GREEN ? '#22c55e' :
                        '#3b82f6',
                    }}
                  >
                    {color}
                  </button>
                ))}
            </div>
            <button
              onClick={() => {
                setShowColorPicker(false);
                setPendingCardIndex(null);
              }}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
