import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../../hooks/useSocket';
import { MonopolyGameState } from '../../types';
import GameBoard from './GameBoard';
import DiceRoller from './DiceRoller';
import PlayerToken from './PlayerToken';
import BankPanel from './BankPanel';
import PropertyCard from './PropertyCard';
import { BOARD_SQUARES, PLAYER_COLORS } from './types';

export default function MonopolyGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<MonopolyGameState | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'properties'>('board');

  useEffect(() => {
    if (!roomId || !socket) return;

    const onGameState = (state: MonopolyGameState) => {
      setGameState(state);
      setIsRolling(false);
    };
    const onGameStarted = (data: { roomId: string; gameState: MonopolyGameState }) => {
      setGameState(data.gameState);
    };
    const onGameFinished = (data: { result: { winnerId: string; winnerNickname: string } }) => {
      alert(`Game Over! Winner: ${data.result.winnerNickname || data.result.winnerId}`);
    };
    const onError = (data: { message: string }) => {
      alert(data.message);
    };

    socket.on('gameState', onGameState);
    socket.on('gameStarted', onGameStarted);
    socket.on('gameFinished', onGameFinished);
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
      socket.off('error', onError);
    };
  }, [roomId]);

  const sendAction = useCallback((action: string, data?: unknown) => {
    if (!socket) return;
    socket.emit('monopoly:action', { action, data });
  }, []);

  const handleRollDice = useCallback(() => {
    setIsRolling(true);
    sendAction('rollDice');
  }, [sendAction]);

  const handleBuyProperty = useCallback(() => {
    sendAction('buyProperty');
  }, [sendAction]);

  const handleDeclineProperty = useCallback(() => {
    sendAction('declineProperty');
  }, [sendAction]);

  const handlePayRent = useCallback(() => {
    sendAction('payRent');
  }, [sendAction]);

  const handlePayTax = useCallback(() => {
    sendAction('payTax');
  }, [sendAction]);

  const handleDrawCard = useCallback(() => {
    sendAction('drawCard');
  }, [sendAction]);

  const handleEndTurn = useCallback(() => {
    sendAction('endTurn');
  }, [sendAction]);

  const handlePayJailFine = useCallback(() => {
    sendAction('payJailFine');
  }, [sendAction]);

  const handleRollForDoubles = useCallback(() => {
    setIsRolling(true);
    sendAction('rollForDoubles');
  }, [sendAction]);

  const handleUseJailCard = useCallback(() => {
    sendAction('useJailCard');
  }, [sendAction]);

  const handleBuildHouse = useCallback((squareIndex: number) => {
    sendAction(`buildHouse:${squareIndex}`);
  }, [sendAction]);

  const handleSellHouse = useCallback((squareIndex: number) => {
    sendAction(`sellHouse:${squareIndex}`);
  }, [sendAction]);

  const handleMortgage = useCallback((squareIndex: number) => {
    sendAction(`mortgage:${squareIndex}`);
  }, [sendAction]);

  const handleUnmortgage = useCallback((squareIndex: number) => {
    sendAction(`unmortgage:${squareIndex}`);
  }, [sendAction]);

  const handleLeaveGame = useCallback(() => {
    if (!socket) return;
    socket.emit('leaveRoom');
    navigate('/');
  }, [navigate]);

  if (!gameState) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-500">Loading Monopoly game...</p>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === socket?.id;
  const availableActions = gameState.availableActions || [];
  const pendingAction = gameState.pendingAction;
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const me = gameState.players.find(p => p.id === socket?.id);

  // Render pending action panel
  const renderPendingAction = () => {
    if (!pendingAction || !isMyTurn) return null;

    switch (pendingAction.type) {
      case 'BUY_PROPERTY': {
        const data = pendingAction.data as { squareIndex: number; price: number };
        const square = BOARD_SQUARES[data.squareIndex];
        return (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">Buy Property?</h3>
            <p className="text-sm text-gray-700 mb-1">{square.name}</p>
            <p className="text-lg font-semibold text-green-700 mb-3">${data.price}</p>
            <div className="flex gap-3">
              <button
                onClick={handleBuyProperty}
                disabled={!availableActions.includes('buyProperty')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Buy
              </button>
              <button
                onClick={handleDeclineProperty}
                disabled={!availableActions.includes('declineProperty')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Decline
              </button>
            </div>
          </div>
        );
      }

      case 'PAY_RENT': {
        const data = pendingAction.data as { toPlayerId: string; amount: number; squareIndex: number };
        const landlord = gameState.players.find(p => p.id === data.toPlayerId);
        return (
          <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">Pay Rent</h3>
            <p className="text-sm text-gray-700">
              Pay <span className="font-bold text-orange-700">${data.amount}</span> to{' '}
              <span className="font-medium">{landlord?.nickname || 'Player'}</span>
            </p>
            <button
              onClick={handlePayRent}
              disabled={!availableActions.includes('payRent')}
              className="mt-3 w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Pay ${data.amount}
            </button>
          </div>
        );
      }

      case 'PAY_TAX': {
        const data = pendingAction.data as { amount: number };
        return (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">Pay Tax</h3>
            <p className="text-sm text-gray-700">
              Pay <span className="font-bold text-red-700">${data.amount}</span> tax
            </p>
            <button
              onClick={handlePayTax}
              disabled={!availableActions.includes('payTax')}
              className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Pay Tax
            </button>
          </div>
        );
      }

      case 'DRAW_CARD': {
        const data = pendingAction.data as { cardType: string };
        return (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">
              {data.cardType === 'CHANCE' ? '❓ Chance' : '📦 Community Chest'}
            </h3>
            {gameState.currentCard ? (
              <p className="text-sm text-gray-700 mb-3">{gameState.currentCard.description}</p>
            ) : (
              <p className="text-sm text-gray-700 mb-3">Draw a card!</p>
            )}
            {!gameState.currentCard && (
              <button
                onClick={handleDrawCard}
                disabled={!availableActions.includes('drawCard')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Draw Card
              </button>
            )}
          </div>
        );
      }

      case 'JAIL_CHOICE': {
        return (
          <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">🔒 In Jail</h3>
            <p className="text-sm text-gray-700 mb-3">Choose how to get out of jail:</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePayJailFine}
                disabled={!availableActions.includes('payJailFine')}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                💰 Pay $50 Fine
              </button>
              <button
                onClick={handleRollForDoubles}
                disabled={!availableActions.includes('rollForDoubles')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                🎲 Roll for Doubles
              </button>
              {availableActions.includes('useJailCard') && (
                <button
                  onClick={handleUseJailCard}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  🎫 Use Get Out of Jail Card
                </button>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-700">🏠 Monopoly</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Room: {roomId}</span>
          <button
            onClick={handleLeaveGame}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Last action bar */}
      {gameState.lastAction && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 text-center">
          {gameState.lastAction}
        </div>
      )}

      {/* Main layout: board + sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Board area */}
        <div className="flex-1 min-w-0">
          {/* Tab toggle for mobile */}
          <div className="flex gap-2 mb-3 lg:hidden">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                activeTab === 'board' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                activeTab === 'properties' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Properties & Actions
            </button>
          </div>

          {/* Game Board */}
          <div className={activeTab === 'board' || window.innerWidth >= 1024 ? '' : 'hidden lg:block'}>
            <GameBoard
              players={gameState.players}
              properties={gameState.properties}
              currentPlayerId={gameState.currentPlayerId}
              onSquareClick={(idx) => setSelectedSquare(idx === selectedSquare ? null : idx)}
            />
          </div>

          {/* Selected square detail */}
          {selectedSquare !== null && (
            <div className="mt-3">
              {(() => {
                const square = BOARD_SQUARES[selectedSquare];
                const ownership = gameState.properties.find(p => p.squareIndex === selectedSquare);
                const isOwnedByMe = ownership?.ownerId === socket?.id;
                return (
                  <PropertyCard
                    squareIndex={selectedSquare}
                    name={square.name}
                    color={square.color}
                    price={square.price}
                    ownership={ownership}
                    isOwnedByMe={!!isOwnedByMe}
                    onBuildHouse={() => handleBuildHouse(selectedSquare)}
                    onSellHouse={() => handleSellHouse(selectedSquare)}
                    onMortgage={() => handleMortgage(selectedSquare)}
                    onUnmortgage={() => handleUnmortgage(selectedSquare)}
                    canBuild={availableActions.includes(`buildHouse:${selectedSquare}`)}
                    canSell={availableActions.includes(`sellHouse:${selectedSquare}`)}
                    canMortgage={availableActions.includes(`mortgage:${selectedSquare}`)}
                    canUnmortgage={availableActions.includes(`unmortgage:${selectedSquare}`)}
                  />
                );
              })()}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className={`w-full lg:w-80 flex flex-col gap-3 ${activeTab === 'properties' ? '' : 'hidden lg:flex'}`}>
          {/* Dice + Actions */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-lg mb-3">
              {isMyTurn ? '🟢 Your Turn' : `⏳ ${currentPlayer?.nickname || 'Waiting'}...`}
            </h3>

            {/* Dice */}
            {(!pendingAction || !isMyTurn) && (
              <DiceRoller
                dice={gameState.dice}
                isRolling={isRolling}
                onRoll={handleRollDice}
                disabled={!isMyTurn || !availableActions.includes('rollDice')}
              />
            )}

            {/* Pending action */}
            {renderPendingAction()}

            {/* End turn button */}
            {isMyTurn && availableActions.includes('endTurn') && !pendingAction && (
              <button
                onClick={handleEndTurn}
                className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                End Turn ➡️
              </button>
            )}
          </div>

          {/* Players */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-lg mb-3">Players</h3>
            <div className="space-y-2">
              {gameState.players.map((player, idx) => (
                <PlayerToken
                  key={player.id}
                  nickname={player.nickname || player.id.substring(0, 8)}
                  color={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                  money={player.money}
                  isCurrentPlayer={player.id === gameState.currentPlayerId}
                  isBankrupt={player.isBankrupt}
                  isInJail={player.isInJail}
                />
              ))}
            </div>
          </div>

          {/* My Properties */}
          {me && (
            <BankPanel
              player={{
                ...me,
                properties: gameState.playerProperties || me.properties
              }}
              properties={gameState.properties}
              onBuildHouse={handleBuildHouse}
              onSellHouse={handleSellHouse}
              onMortgage={handleMortgage}
              onUnmortgage={handleUnmortgage}
              availableActions={availableActions}
            />
          )}

          {/* Free Parking Pot */}
          {gameState.freeParkingPot > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <span className="text-sm text-green-700">
                🅿️ Free Parking Pot: <span className="font-bold">${gameState.freeParkingPot}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
