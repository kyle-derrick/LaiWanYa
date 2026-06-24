import { Game } from '../../managers/GameManager';
import { GameStatus, GameState, GameResult } from '../../types';
import {
  MonopolyPlayerState,
  MonopolyGameState,
  PropertyOwnership,
  PendingAction,
  Card,
  CardType,
  CardAction,
  SquareType,
  DiceResult
} from './types';
import { BOARD_SQUARES, BOARD_SIZE, getSquare } from './Board';
import { rollDice } from './Dice';
import {
  calculateRent,
  ownsFullGroup,
  canBuildHouse,
  canSellHouse,
  canMortgage,
  canUnmortgage
} from './Property';
import { createChanceCards, createCommunityChestCards, shuffleCards } from './Card';

const STARTING_MONEY = 1500;
const JAIL_POSITION = 10;
const GO_MONEY = 200;
const MAX_JAIL_TURNS = 3;

export class MonopolyGame implements Game {
  private players: MonopolyPlayerState[] = [];
  private currentPlayerIndex: number = 0;
  private status: GameStatus = GameStatus.INIT;
  private properties: PropertyOwnership[] = [];
  private dice: [number, number] | null = null;
  private doublesCount: number = 0;
  private lastAction: string | null = null;
  private winnerId: string | null = null;
  private currentCard: Card | null = null;
  private pendingAction: PendingAction | null = null;
  private freeParkingPot: number = 0;

  // Card decks
  private chanceCards: Card[] = [];
  private communityChestCards: Card[] = [];
  private chanceDeckIndex: number = 0;
  private communityChestDeckIndex: number = 0;

  // Player order tracking
  private playerOrder: string[] = [];

  constructor(playerIds: string[]) {
    this.initializeGame(playerIds);
  }

  private initializeGame(playerIds: string[]): void {
    // Initialize players
    this.players = playerIds.map(id => ({
      id,
      nickname: '', // Will be set externally
      money: STARTING_MONEY,
      position: 0,
      isInJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      isBankrupt: false,
      properties: []
    }));

    this.playerOrder = [...playerIds];

    // Shuffle card decks
    this.chanceCards = shuffleCards(createChanceCards());
    this.communityChestCards = shuffleCards(createCommunityChestCards());
    this.chanceDeckIndex = 0;
    this.communityChestDeckIndex = 0;

    this.currentPlayerIndex = 0;
    this.status = GameStatus.PLAYING;
  }

  // --- Game interface implementation ---

  getStatus(): GameStatus {
    return this.status;
  }

  getCurrentPlayerId(): string | null {
    if (this.status !== GameStatus.PLAYING) return null;
    const activePlayers = this.players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1) return null;
    return this.players[this.currentPlayerIndex]?.id || null;
  }

  getPlayers(): string[] {
    return this.players.map(p => p.id);
  }

  getState(): GameState {
    return {
      status: this.status,
      currentPlayerId: this.getCurrentPlayerId(),
      players: this.getPlayers(),
      data: this.getPublicState()
    };
  }

  getPublicState(): Record<string, unknown> {
    const state: MonopolyGameState = {
      status: this.status === GameStatus.INIT ? 'WAITING' :
              this.status === GameStatus.PLAYING ? 'PLAYING' : 'FINISHED',
      currentPlayerId: this.getCurrentPlayerId(),
      players: this.players.map(p => ({
        ...p,
        // Don't expose internal state
      })),
      properties: this.properties,
      dice: this.dice,
      doublesCount: this.doublesCount,
      lastAction: this.lastAction,
      winnerId: this.winnerId,
      currentCard: this.currentCard,
      pendingAction: this.pendingAction,
      freeParkingPot: this.freeParkingPot
    };
    return state as unknown as Record<string, unknown>;
  }

  getPlayerState(playerId: string): Record<string, unknown> {
    const publicState = this.getPublicState() as unknown as MonopolyGameState;
    const player = this.players.find(p => p.id === playerId);

    return {
      ...publicState,
      playerMoney: player?.money || 0,
      playerProperties: player?.properties || [],
      playerPosition: player?.position || 0,
      playerIsInJail: player?.isInJail || false,
      availableActions: this.getAvailableActions(playerId)
    };
  }

  getResult(): GameResult | null {
    if (!this.winnerId) return null;

    const winner = this.players.find(p => p.id === this.winnerId);
    if (!winner) return null;

    return {
      winnerId: this.winnerId,
      winnerNickname: winner.nickname || '',
      scores: Object.fromEntries(
        this.players.map(p => [p.id, p.money])
      )
    };
  }

  getAvailableActions(playerId: string): string[] {
    if (this.status !== GameStatus.PLAYING) return [];
    if (this.getCurrentPlayerId() !== playerId) return [];

    const player = this.players.find(p => p.id === playerId);
    if (!player) return [];

    const actions: string[] = [];

    // If there's a pending action, only allow resolving it
    if (this.pendingAction) {
      switch (this.pendingAction.type) {
        case 'BUY_PROPERTY':
          actions.push('buyProperty', 'declineProperty');
          break;
        case 'PAY_RENT':
          actions.push('payRent');
          break;
        case 'DRAW_CARD':
          actions.push('drawCard');
          break;
        case 'PAY_TAX':
          actions.push('payTax');
          break;
        case 'JAIL_CHOICE':
          actions.push('payJailFine', 'rollForDoubles', 'useJailCard');
          break;
      }
      return actions;
    }

    // If player needs to roll dice
    if (!this.dice) {
      actions.push('rollDice');
    }

    // Property management actions (always available on your turn)
    for (const propIndex of player.properties) {
      const prop = this.properties.find(p => p.squareIndex === propIndex);
      if (!prop) continue;

      if (canBuildHouse(playerId, propIndex, this.properties)) {
        actions.push(`buildHouse:${propIndex}`);
      }
      if (canSellHouse(playerId, propIndex, this.properties)) {
        actions.push(`sellHouse:${propIndex}`);
      }
      if (canMortgage(playerId, propIndex, this.properties)) {
        actions.push(`mortgage:${propIndex}`);
      }
      if (canUnmortgage(playerId, propIndex, this.properties)) {
        actions.push(`unmortgage:${propIndex}`);
      }
    }

    // End turn (if dice have been rolled and no pending action)
    if (this.dice && !this.pendingAction) {
      actions.push('endTurn');
    }

    return actions;
  }

  handleAction(playerId: string, action: string, data?: unknown): { success: boolean; error?: string } {
    if (this.status !== GameStatus.PLAYING) {
      return { success: false, error: 'Game is not in progress' };
    }

    if (this.getCurrentPlayerId() !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    switch (action) {
      case 'rollDice':
        return this.handleRollDice(player);

      case 'buyProperty':
        return this.handleBuyProperty(player);

      case 'declineProperty':
        return this.handleDeclineProperty(player);

      case 'payRent':
        return this.handlePayRent(player);

      case 'payTax':
        return this.handlePayTax(player);

      case 'drawCard':
        return this.handleDrawCard(player);

      case 'payJailFine':
        return this.handlePayJailFine(player);

      case 'rollForDoubles':
        return this.handleRollForDoubles(player);

      case 'useJailCard':
        return this.handleUseJailCard(player);

      case 'endTurn':
        return this.handleEndTurn(player);

      default: {
        // Handle build/sell/mortgage/unmortgage
        if (action.startsWith('buildHouse:')) {
          const index = parseInt(action.split(':')[1]);
          return this.handleBuildHouse(player, index);
        }
        if (action.startsWith('sellHouse:')) {
          const index = parseInt(action.split(':')[1]);
          return this.handleSellHouse(player, index);
        }
        if (action.startsWith('mortgage:')) {
          const index = parseInt(action.split(':')[1]);
          return this.handleMortgage(player, index);
        }
        if (action.startsWith('unmortgage:')) {
          const index = parseInt(action.split(':')[1]);
          return this.handleUnmortgage(player, index);
        }
        return { success: false, error: 'Unknown action' };
      }
    }
  }

  // --- Dice rolling ---

  private handleRollDice(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (this.dice) {
      return { success: false, error: 'Already rolled this turn' };
    }

    if (player.isInJail) {
      return { success: false, error: 'Must handle jail first' };
    }

    const result = rollDice();
    this.dice = [result.die1, result.die2];

    // Check for 3 doubles in a row -> go to jail
    if (result.isDoubles) {
      this.doublesCount++;
      if (this.doublesCount >= 3) {
        this.sendToJail(player);
        this.lastAction = `${player.nickname || player.id} rolled 3 doubles and went to jail!`;
        return { success: true };
      }
    } else {
      this.doublesCount = 0;
    }

    // Move player
    this.movePlayer(player, result.total);

    // Handle landing on square
    this.handleLanding(player);

    this.lastAction = `${player.nickname || player.id} rolled ${result.die1}+${result.die2}=${result.total}`;

    return { success: true };
  }

  // --- Movement ---

  private movePlayer(player: MonopolyPlayerState, steps: number): void {
    const oldPosition = player.position;
    player.position = (player.position + steps) % BOARD_SIZE;

    // Pass GO - collect $200
    if (player.position < oldPosition && steps > 0) {
      player.money += GO_MONEY;
      this.lastAction = `${player.nickname || player.id} passed GO and collected $${GO_MONEY}`;
    }
  }

  // --- Landing handling ---

  private handleLanding(player: MonopolyPlayerState): void {
    const square = getSquare(player.position);

    switch (square.type) {
      case SquareType.PROPERTY:
      case SquareType.RAILROAD:
      case SquareType.UTILITY:
        this.handlePropertyLanding(player, square);
        break;

      case SquareType.CHANCE:
        this.pendingAction = { type: 'DRAW_CARD', data: { cardType: 'CHANCE' } };
        break;

      case SquareType.COMMUNITY_CHEST:
        this.pendingAction = { type: 'DRAW_CARD', data: { cardType: 'COMMUNITY_CHEST' } };
        break;

      case SquareType.TAX:
        this.pendingAction = { type: 'PAY_TAX', data: { amount: square.price || 200 } };
        break;

      case SquareType.GO_TO_JAIL:
        this.sendToJail(player);
        this.lastAction = `${player.nickname || player.id} went to jail!`;
        break;

      case SquareType.FREE_PARKING:
        player.money += this.freeParkingPot;
        if (this.freeParkingPot > 0) {
          this.lastAction = `${player.nickname || player.id} collected $${this.freeParkingPot} from Free Parking!`;
        }
        this.freeParkingPot = 0;
        break;

      case SquareType.GO:
        // Already handled in movePlayer
        break;

      case SquareType.JAIL:
        // Just visiting
        break;
    }
  }

  private handlePropertyLanding(player: MonopolyPlayerState, square: { index: number; price?: number }): void {
    const ownership = this.properties.find(o => o.squareIndex === square.index);

    if (!ownership) {
      // Unowned - offer to buy
      if (square.price && player.money >= square.price) {
        this.pendingAction = { type: 'BUY_PROPERTY', data: { squareIndex: square.index, price: square.price } };
      }
      // If player can't afford it, do nothing (could add auction later)
    } else if (ownership.ownerId !== player.id && !ownership.isMortgaged) {
      // Owned by someone else - pay rent
      const boardSquare = BOARD_SQUARES[square.index];
      const diceTotal = this.dice ? this.dice[0] + this.dice[1] : 0;
      const rent = calculateRent(boardSquare, ownership, diceTotal, this.properties);

      this.pendingAction = {
        type: 'PAY_RENT',
        data: { toPlayerId: ownership.ownerId, amount: rent, squareIndex: square.index }
      };
    }
    // If owned by self or mortgaged, do nothing
  }

  // --- Buy / Decline ---

  private handleBuyProperty(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (!this.pendingAction || this.pendingAction.type !== 'BUY_PROPERTY') {
      return { success: false, error: 'No property to buy' };
    }

    const { squareIndex, price } = this.pendingAction.data as { squareIndex: number; price: number };

    if (player.money < price) {
      return { success: false, error: 'Not enough money' };
    }

    player.money -= price;
    player.properties.push(squareIndex);
    this.properties.push({
      squareIndex,
      ownerId: player.id,
      houses: 0,
      isMortgaged: false
    });

    this.pendingAction = null;
    this.lastAction = `${player.nickname || player.id} bought ${BOARD_SQUARES[squareIndex].name} for $${price}`;

    return { success: true };
  }

  private handleDeclineProperty(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (!this.pendingAction || this.pendingAction.type !== 'BUY_PROPERTY') {
      return { success: false, error: 'No property to decline' };
    }

    this.pendingAction = null;
    this.lastAction = `${player.nickname || player.id} declined to buy`;

    return { success: true };
  }

  // --- Rent ---

  private handlePayRent(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (!this.pendingAction || this.pendingAction.type !== 'PAY_RENT') {
      return { success: false, error: 'No rent to pay' };
    }

    const { toPlayerId, amount } = this.pendingAction.data as { toPlayerId: string; amount: number };
    const landlord = this.players.find(p => p.id === toPlayerId);
    if (!landlord) {
      return { success: false, error: 'Landlord not found' };
    }

    const actualPayment = Math.min(amount, player.money);
    player.money -= actualPayment;
    landlord.money += actualPayment;

    this.lastAction = `${player.nickname || player.id} paid $${actualPayment} rent to ${landlord.nickname || landlord.id}`;

    // Check bankruptcy
    if (player.money <= 0) {
      this.handleBankruptcy(player, landlord);
    }

    this.pendingAction = null;
    return { success: true };
  }

  // --- Tax ---

  private handlePayTax(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (!this.pendingAction || this.pendingAction.type !== 'PAY_TAX') {
      return { success: false, error: 'No tax to pay' };
    }

    const { amount } = this.pendingAction.data as { amount: number };
    const actualPayment = Math.min(amount, player.money);
    player.money -= actualPayment;
    this.freeParkingPot += actualPayment;

    this.lastAction = `${player.nickname || player.id} paid $${actualPayment} tax`;

    if (player.money <= 0) {
      this.handleBankruptcy(player, null);
    }

    this.pendingAction = null;
    return { success: true };
  }

  // --- Cards ---

  private handleDrawCard(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (!this.pendingAction || this.pendingAction.type !== 'DRAW_CARD') {
      return { success: false, error: 'No card to draw' };
    }

    const { cardType } = this.pendingAction.data as { cardType: string };
    let card: Card;

    if (cardType === 'CHANCE') {
      card = this.chanceCards[this.chanceDeckIndex];
      this.chanceDeckIndex = (this.chanceDeckIndex + 1) % this.chanceCards.length;
    } else {
      card = this.communityChestCards[this.communityChestDeckIndex];
      this.communityChestDeckIndex = (this.communityChestDeckIndex + 1) % this.communityChestCards.length;
    }

    this.currentCard = card;
    this.lastAction = `${player.nickname || player.id} drew: ${card.description}`;

    // Apply card effect
    this.applyCardEffect(player, card);

    return { success: true };
  }

  private applyCardEffect(player: MonopolyPlayerState, card: Card): void {
    switch (card.action) {
      case CardAction.MOVE_TO:
        if (card.value !== undefined) {
          const oldPos = player.position;
          player.position = card.value;
          // Pass GO check
          if (card.value < oldPos) {
            player.money += GO_MONEY;
          }
          this.handleLanding(player);
        }
        break;

      case CardAction.MOVE_FORWARD:
        if (card.value === -1) {
          // Nearest utility
          this.moveToNearestUtility(player);
        } else if (card.value === -2) {
          // Nearest railroad
          this.moveToNearestRailroad(player);
        } else if (card.value !== undefined) {
          this.movePlayer(player, card.value);
          this.handleLanding(player);
        }
        break;

      case CardAction.MOVE_BACKWARD:
        if (card.value !== undefined) {
          player.position = (player.position - card.value + BOARD_SIZE) % BOARD_SIZE;
          this.handleLanding(player);
        }
        break;

      case CardAction.COLLECT:
        if (card.value) {
          player.money += card.value;
        }
        break;

      case CardAction.PAY:
        if (card.value) {
          const payment = Math.min(card.value, player.money);
          player.money -= payment;
          this.freeParkingPot += payment;
          if (player.money <= 0) {
            this.handleBankruptcy(player, null);
          }
        }
        break;

      case CardAction.COLLECT_FROM_EACH:
        if (card.value) {
          for (const other of this.players) {
            if (other.id !== player.id && !other.isBankrupt) {
              const payment = Math.min(card.value, other.money);
              other.money -= payment;
              player.money += payment;
              if (other.money <= 0) {
                this.handleBankruptcy(other, player);
              }
            }
          }
        }
        break;

      case CardAction.PAY_EACH:
        if (card.value) {
          for (const other of this.players) {
            if (other.id !== player.id && !other.isBankrupt) {
              const payment = Math.min(card.value, player.money);
              player.money -= payment;
              other.money += payment;
            }
          }
          if (player.money <= 0) {
            this.handleBankruptcy(player, null);
          }
        }
        break;

      case CardAction.GO_TO_JAIL:
        this.sendToJail(player);
        break;

      case CardAction.GET_OUT_OF_JAIL:
        player.getOutOfJailCards++;
        break;

      case CardAction.REPAIRS:
        if (card.value) {
          let totalCost = 0;
          for (const propIndex of player.properties) {
            const ownership = this.properties.find(o => o.squareIndex === propIndex);
            if (ownership) {
              if (ownership.houses === 5) {
                totalCost += 100; // hotel
              } else {
                totalCost += ownership.houses * card.value;
              }
            }
          }
          const payment = Math.min(totalCost, player.money);
          player.money -= payment;
          this.freeParkingPot += payment;
          if (player.money <= 0) {
            this.handleBankruptcy(player, null);
          }
        }
        break;
    }

    // Clear pending action after card effect
    this.pendingAction = null;
  }

  private moveToNearestUtility(player: MonopolyPlayerState): void {
    const utilityPositions = [12, 28];
    let nearest = utilityPositions[0];
    for (const pos of utilityPositions) {
      if (pos > player.position) {
        nearest = pos;
        break;
      }
    }
    // If behind us, wrap to first one
    if (nearest <= player.position) {
      nearest = utilityPositions[0];
      player.money += GO_MONEY; // Pass GO
    }
    player.position = nearest;
    this.handleLanding(player);
  }

  private moveToNearestRailroad(player: MonopolyPlayerState): void {
    const railroadPositions = [5, 15, 25, 35];
    let nearest = railroadPositions[0];
    for (const pos of railroadPositions) {
      if (pos > player.position) {
        nearest = pos;
        break;
      }
    }
    if (nearest <= player.position) {
      nearest = railroadPositions[0];
      player.money += GO_MONEY;
    }
    player.position = nearest;
    this.handleLanding(player);
  }

  // --- Jail ---

  private sendToJail(player: MonopolyPlayerState): void {
    player.position = JAIL_POSITION;
    player.isInJail = true;
    player.jailTurns = 0;
    this.doublesCount = 0;
    this.dice = null;
    this.pendingAction = null;
  }

  private handlePayJailFine(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (!player.isInJail) return { success: false, error: 'Not in jail' };

    const fine = 50;
    if (player.money < fine) return { success: false, error: 'Not enough money' };

    player.money -= fine;
    player.isInJail = false;
    player.jailTurns = 0;

    this.lastAction = `${player.nickname || player.id} paid $${fine} to leave jail`;
    this.pendingAction = null;

    return { success: true };
  }

  private handleRollForDoubles(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (!player.isInJail) return { success: false, error: 'Not in jail' };

    const result = rollDice();
    this.dice = [result.die1, result.die2];

    if (result.isDoubles) {
      player.isInJail = false;
      player.jailTurns = 0;
      this.movePlayer(player, result.total);
      this.handleLanding(player);
      this.lastAction = `${player.nickname || player.id} rolled doubles (${result.die1}+${result.die2}) to leave jail!`;
    } else {
      player.jailTurns++;
      if (player.jailTurns >= MAX_JAIL_TURNS) {
        // Auto-pay fine after 3 turns
        const fine = 50;
        player.money -= Math.min(fine, player.money);
        player.isInJail = false;
        player.jailTurns = 0;
        this.movePlayer(player, result.total);
        this.handleLanding(player);
        this.lastAction = `${player.nickname || player.id} failed to roll doubles 3 times, paid $${fine} and left jail`;
      } else {
        this.lastAction = `${player.nickname || player.id} failed to roll doubles in jail (${result.die1}+${result.die2})`;
      }
    }

    this.pendingAction = null;
    return { success: true };
  }

  private handleUseJailCard(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (!player.isInJail) return { success: false, error: 'Not in jail' };
    if (player.getOutOfJailCards <= 0) return { success: false, error: 'No Get Out of Jail cards' };

    player.getOutOfJailCards--;
    player.isInJail = false;
    player.jailTurns = 0;

    this.lastAction = `${player.nickname || player.id} used Get Out of Jail Free card`;
    this.pendingAction = null;

    return { success: true };
  }

  // --- Property management ---

  private handleBuildHouse(player: MonopolyPlayerState, squareIndex: number): { success: boolean; error?: string } {
    const square = BOARD_SQUARES[squareIndex];
    if (!square.houseCost) return { success: false, error: 'Cannot build here' };

    if (!canBuildHouse(player.id, squareIndex, this.properties)) {
      return { success: false, error: 'Cannot build house here' };
    }

    if (player.money < square.houseCost) {
      return { success: false, error: 'Not enough money' };
    }

    player.money -= square.houseCost;
    const ownership = this.properties.find(o => o.squareIndex === squareIndex);
    if (ownership) {
      ownership.houses++;
    }

    this.lastAction = `${player.nickname || player.id} built ${ownership?.houses === 5 ? 'a hotel' : 'a house'} on ${square.name}`;

    return { success: true };
  }

  private handleSellHouse(player: MonopolyPlayerState, squareIndex: number): { success: boolean; error?: string } {
    const square = BOARD_SQUARES[squareIndex];
    if (!square.houseCost) return { success: false, error: 'Cannot sell here' };

    if (!canSellHouse(player.id, squareIndex, this.properties)) {
      return { success: false, error: 'Cannot sell house here' };
    }

    const ownership = this.properties.find(o => o.squareIndex === squareIndex);
    if (ownership) {
      ownership.houses--;
      player.money += square.houseCost / 2;
    }

    this.lastAction = `${player.nickname || player.id} sold ${ownership?.houses === 4 ? 'a hotel' : 'a house'} on ${square.name}`;

    return { success: true };
  }

  private handleMortgage(player: MonopolyPlayerState, squareIndex: number): { success: boolean; error?: string } {
    const square = BOARD_SQUARES[squareIndex];
    if (!square.mortgageValue) return { success: false, error: 'Cannot mortgage' };

    if (!canMortgage(player.id, squareIndex, this.properties)) {
      return { success: false, error: 'Cannot mortgage this property' };
    }

    const ownership = this.properties.find(o => o.squareIndex === squareIndex);
    if (ownership) {
      ownership.isMortgaged = true;
      player.money += square.mortgageValue;
    }

    this.lastAction = `${player.nickname || player.id} mortgaged ${square.name} for $${square.mortgageValue}`;

    return { success: true };
  }

  private handleUnmortgage(player: MonopolyPlayerState, squareIndex: number): { success: boolean; error?: string } {
    const square = BOARD_SQUARES[squareIndex];
    if (!square.mortgageValue) return { success: false, error: 'Cannot unmortgage' };

    if (!canUnmortgage(player.id, squareIndex, this.properties)) {
      return { success: false, error: 'Cannot unmortgage this property' };
    }

    const cost = Math.ceil(square.mortgageValue * 1.1);
    if (player.money < cost) {
      return { success: false, error: 'Not enough money' };
    }

    const ownership = this.properties.find(o => o.squareIndex === squareIndex);
    if (ownership) {
      ownership.isMortgaged = false;
      player.money -= cost;
    }

    this.lastAction = `${player.nickname || player.id} unmortgaged ${square.name} for $${cost}`;

    return { success: true };
  }

  // --- End turn ---

  private handleEndTurn(player: MonopolyPlayerState): { success: boolean; error?: string } {
    if (this.pendingAction) {
      return { success: false, error: 'Must resolve pending action first' };
    }

    // Check if player gets another turn (doubles)
    if (this.dice && this.dice[0] === this.dice[1] && !player.isInJail) {
      this.dice = null;
      this.lastAction = `${player.nickname || player.id} gets another turn (rolled doubles!)`;
      return { success: true };
    }

    // Move to next player
    this.advanceTurn();
    this.dice = null;
    this.doublesCount = 0;
    this.currentCard = null;

    // Check if current player is in jail
    const nextPlayer = this.players[this.currentPlayerIndex];
    if (nextPlayer && nextPlayer.isInJail) {
      this.pendingAction = { type: 'JAIL_CHOICE' };
    }

    this.lastAction = `It's now ${this.players[this.currentPlayerIndex]?.nickname || this.players[this.currentPlayerIndex]?.id}'s turn`;

    return { success: true };
  }

  // --- Bankruptcy ---

  private handleBankruptcy(player: MonopolyPlayerState, creditor: MonopolyPlayerState | null): void {
    player.isBankrupt = true;

    // Transfer all properties to creditor
    for (const propIndex of player.properties) {
      const ownership = this.properties.find(o => o.squareIndex === propIndex);
      if (ownership) {
        if (creditor) {
          ownership.ownerId = creditor.id;
          creditor.properties.push(propIndex);
        } else {
          // Bank takes over - remove ownership
          this.properties = this.properties.filter(o => o.squareIndex !== propIndex);
        }
      }
    }
    player.properties = [];

    this.lastAction = `${player.nickname || player.id} is bankrupt!`;

    // Check for winner
    const activePlayers = this.players.filter(p => !p.isBankrupt);
    if (activePlayers.length === 1) {
      this.winnerId = activePlayers[0].id;
      this.status = GameStatus.FINISHED;
      this.lastAction = `${activePlayers[0].nickname || activePlayers[0].id} wins the game!`;
    }
  }

  // --- Turn management ---

  private advanceTurn(): void {
    const activePlayers = this.players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1) return;

    let nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
    while (this.players[nextIndex].isBankrupt) {
      nextIndex = (nextIndex + 1) % this.players.length;
    }
    this.currentPlayerIndex = nextIndex;
  }

  // --- Helper for setting nicknames ---
  setNicknames(nicknameMap: Record<string, string>): void {
    for (const player of this.players) {
      if (nicknameMap[player.id]) {
        player.nickname = nicknameMap[player.id];
      }
    }
  }
}
