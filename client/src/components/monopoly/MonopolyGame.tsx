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

const darkPanelStyle = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)'
};

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

    socket.emit('getGameState', { roomId });

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
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0f0f14 0%, #1a1024 50%, #0f0f14 100%)'
      }}>
        <div className="text-center p-8 rounded-xl" style={darkPanelStyle}>
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-amber-300 text-lg">Loading Monopoly game...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === socket?.id;
  const availableActions = gameState.availableActions || [];
  const pendingAction = gameState.pendingAction;
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const me = gameState.players.find(p => p.id === socket?.id);

  const buttonStyle = (color: string, disabled = false) => ({
    background: disabled
      ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))'
      : `linear-gradient(145deg, ${color}, ${color}dd)`,
    boxShadow: disabled ? 'none' : `0 4px 16px ${color}30, inset 0 1px 1px rgba(255,255,255,0.15)`,
    color: disabled ? '#888' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: disabled ? '1px solid rgba(255,255,255,0.04)' : `1px solid ${color}40`,
    transition: 'all 0.2s ease'
  });

  const renderPendingAction = () => {
    if (!pendingAction || !isMyTurn) return null;

    switch (pendingAction.type) {
      case 'BUY_PROPERTY': {
        const data = pendingAction.data as { squareIndex: number; price: number };
        const square = BOARD_SQUARES[data.squareIndex];
        return (
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(145deg, rgba(234,179,8,0.08), rgba(234,179,8,0.03))',
            border: '1px solid rgba(234,179,8,0.2)',
            boxShadow: '0 4px 16px rgba(234,179,8,0.1), inset 0 1px 1px rgba(255,255,255,0.04)'
          }}>
            <h3 className="font-bold text-lg mb-2 text-amber-200">Buy Property?</h3>
            <p className="text-sm text-amber-100 mb-1">{square.name}</p>
            <p className="text-lg font-bold text-amber-400 mb-3">${data.price}</p>
            <div className="flex gap-3">
              <button
                onClick={handleBuyProperty}
                disabled={!availableActions.includes('buyProperty')}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                style={buttonStyle('#22c55e', !availableActions.includes('buyProperty'))}
              >
                Buy
              </button>
              <button
                onClick={handleDeclineProperty}
                disabled={!availableActions.includes('declineProperty')}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                style={buttonStyle('#ef4444', !availableActions.includes('declineProperty'))}
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
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(145deg, rgba(249,115,22,0.08), rgba(249,115,22,0.03))',
            border: '1px solid rgba(249,115,22,0.2)',
            boxShadow: '0 4px 16px rgba(249,115,22,0.1), inset 0 1px 1px rgba(255,255,255,0.04)'
          }}>
            <h3 className="font-bold text-lg mb-2 text-orange-200">Pay Rent</h3>
            <p className="text-sm text-orange-100">
              Pay <span className="font-bold text-orange-400">${data.amount}</span> to{' '}
              <span className="font-medium">{landlord?.nickname || 'Player'}</span>
            </p>
            <button
              onClick={handlePayRent}
              disabled={!availableActions.includes('payRent')}
              className="mt-3 w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
              style={buttonStyle('#f97316', !availableActions.includes('payRent'))}
            >
              Pay ${data.amount}
            </button>
          </div>
        );
      }

      case 'PAY_TAX': {
        const data = pendingAction.data as { amount: number };
        return (
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(145deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))',
            border: '1px solid rgba(239,68,68,0.2)',
            boxShadow: '0 4px 16px rgba(239,68,68,0.1), inset 0 1px 1px rgba(255,255,255,0.04)'
          }}>
            <h3 className="font-bold text-lg mb-2 text-red-200">Pay Tax</h3>
            <p className="text-sm text-red-100">
              Pay <span className="font-bold text-red-400">${data.amount}</span> tax
            </p>
            <button
              onClick={handlePayTax}
              disabled={!availableActions.includes('payTax')}
              className="mt-3 w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
              style={buttonStyle('#ef4444', !availableActions.includes('payTax'))}
            >
              Pay Tax
            </button>
          </div>
        );
      }

      case 'DRAW_CARD': {
        const data = pendingAction.data as { cardType: string };
        return (
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(145deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))',
            border: '1px solid rgba(59,130,246,0.2)',
            boxShadow: '0 4px 16px rgba(59,130,246,0.1), inset 0 1px 1px rgba(255,255,255,0.04)'
          }}>
            <h3 className="font-bold text-lg mb-2 text-blue-200">
              {data.cardType === 'CHANCE' ? '❓ Chance' : '📦 Community Chest'}
            </h3>
            {gameState.currentCard ? (
              <p className="text-sm text-blue-100 mb-3">{gameState.currentCard.description}</p>
            ) : (
              <p className="text-sm text-blue-100 mb-3">Draw a card!</p>
            )}
            {!gameState.currentCard && (
              <button
                onClick={handleDrawCard}
                disabled={!availableActions.includes('drawCard')}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                style={buttonStyle('#3b82f6', !availableActions.includes('drawCard'))}
              >
                Draw Card
              </button>
            )}
          </div>
        );
      }

      case 'JAIL_CHOICE': {
        return (
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(168,85,247,0.03))',
            border: '1px solid rgba(168,85,247,0.2)',
            boxShadow: '0 4px 16px rgba(168,85,247,0.1), inset 0 1px 1px rgba(255,255,255,0.04)'
          }}>
            <h3 className="font-bold text-lg mb-2 text-purple-200">🔒 In Jail</h3>
            <p className="text-sm text-purple-100 mb-3">Choose how to get out of jail:</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePayJailFine}
                disabled={!availableActions.includes('payJailFine')}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                style={buttonStyle('#eab308', !availableActions.includes('payJailFine'))}
              >
                💰 Pay $50 Fine
              </button>
              <button
                onClick={handleRollForDoubles}
                disabled={!availableActions.includes('rollForDoubles')}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                style={buttonStyle('#3b82f6', !availableActions.includes('rollForDoubles'))}
              >
                🎲 Roll for Doubles
              </button>
              {availableActions.includes('useJailCard') && (
                <button
                  onClick={handleUseJailCard}
                  className="w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                  style={buttonStyle('#22c55e')}
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
    <div className="min-h-screen p-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f0f14 0%, #1a1024 50%, #0f0f14 100%)'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-amber-300 flex items-center gap-2 drop-shadow-lg">
          🏠 Monopoly
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-amber-300/60 px-3 py-1 rounded-lg backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            Room: {roomId}
          </span>
          <button
            onClick={handleLeaveGame}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(145deg, rgba(239,68,68,0.8), rgba(220,38,38,0.7))',
              boxShadow: '0 4px 16px rgba(239,68,68,0.25), inset 0 1px 1px rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: 'white'
            }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Last action bar */}
      {gameState.lastAction && (
        <div className="mb-3 p-3 rounded-xl text-sm text-amber-200/90 text-center backdrop-blur-md" style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>
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
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'board' ? 'text-amber-100' : 'text-amber-500/70'
              }`}
              style={{
                background: activeTab === 'board'
                  ? 'linear-gradient(145deg, #c8a415, #a08010)'
                  : 'linear-gradient(145deg, #2a2318, #1a1510)',
                boxShadow: activeTab === 'board' ? '0 4px 12px rgba(200,164,21,0.3)' : 'none',
                border: '1px solid rgba(139,90,43,0.3)'
              }}
            >
              Board
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'properties' ? 'text-amber-100' : 'text-amber-500/70'
              }`}
              style={{
                background: activeTab === 'properties'
                  ? 'linear-gradient(145deg, #c8a415, #a08010)'
                  : 'linear-gradient(145deg, #2a2318, #1a1510)',
                boxShadow: activeTab === 'properties' ? '0 4px 12px rgba(200,164,21,0.3)' : 'none',
                border: '1px solid rgba(139,90,43,0.3)'
              }}
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
          <div className="rounded-xl p-4" style={darkPanelStyle}>
            <h3 className="font-bold text-lg mb-3 text-amber-200">
              {isMyTurn ? (
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                  Your Turn
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-500/50 rounded-full" />
                  {currentPlayer?.nickname || 'Waiting'}...
                </span>
              )}
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
                className="mt-3 w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                style={buttonStyle('#6366f1')}
              >
                End Turn ➡️
              </button>
            )}
          </div>

          {/* Players */}
          <div className="rounded-xl p-4" style={darkPanelStyle}>
            <h3 className="font-bold text-lg mb-3 text-amber-200">Players</h3>
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
            <div className="rounded-xl p-3 text-center backdrop-blur-md" style={{
              background: 'linear-gradient(145deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))',
              border: '1px solid rgba(34,197,94,0.15)',
              boxShadow: '0 4px 16px rgba(34,197,94,0.1), inset 0 1px 1px rgba(255,255,255,0.04)'
            }}>
              <span className="text-sm text-emerald-300">
                🅿️ Free Parking Pot: <span className="font-bold text-emerald-200">${gameState.freeParkingPot}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
