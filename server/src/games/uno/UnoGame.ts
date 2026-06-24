import { Game } from '../../managers/GameManager';
import { GameStatus, GameState, GameResult } from '../../types';
import {
  UnoCard,
  UnoColor,
  UnoCardType,
  UnoDirection,
  UnoPlayerState,
  UnoGameState
} from './types';
import { createDeck, shuffleDeck } from './Deck';

export class UnoGame implements Game {
  private players: UnoPlayerState[] = [];
  private currentCard: UnoCard | null = null;
  private currentPlayerIndex: number = 0;
  private direction: UnoDirection = UnoDirection.CLOCKWISE;
  private drawPile: UnoCard[] = [];
  private discardPile: UnoCard[] = [];
  private status: GameStatus = GameStatus.INIT;
  private winnerId: string | null = null;
  private currentColor: UnoColor | null = null;
  private lastAction: string | null = null;

  constructor(playerIds: string[]) {
    this.initializeGame(playerIds);
  }

  private initializeGame(playerIds: string[]): void {
    // Create and shuffle deck
    const deck = shuffleDeck(createDeck());

    // Initialize players
    this.players = playerIds.map(id => ({
      id,
      hand: [],
      hasCalledUno: false,
      score: 0
    }));

    // Deal 7 cards to each player
    for (let i = 0; i < 7; i++) {
      for (const player of this.players) {
        player.hand.push(deck.pop()!);
      }
    }

    // Set up draw pile (remaining cards)
    this.drawPile = deck;

    // Find first card for discard pile (must not be a special card)
    let firstCard: UnoCard | undefined;
    while (!firstCard) {
      const card = this.drawPile.pop()!;
      if (card.type === UnoCardType.NUMBER) {
        firstCard = card;
      } else {
        this.drawPile.unshift(card);
        this.drawPile = shuffleDeck(this.drawPile);
      }
    }

    this.currentCard = firstCard;
    this.discardPile.push(firstCard);
    this.currentColor = firstCard.color;
    this.currentPlayerIndex = 0;
    this.status = GameStatus.PLAYING;
  }

  getStatus(): GameStatus {
    return this.status;
  }

  getCurrentPlayerId(): string | null {
    if (this.status !== GameStatus.PLAYING) return null;
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
    return {
      status: this.status === GameStatus.INIT ? 'WAITING' :
              this.status === GameStatus.PLAYING ? 'PLAYING' : 'FINISHED',
      currentCard: this.currentCard,
      currentPlayerId: this.getCurrentPlayerId(),
      direction: this.direction,
      drawPileCount: this.drawPile.length,
      players: this.players.map(p => ({
        ...p,
        hand: [] // Don't expose other players' hands
      })),
      winnerId: this.winnerId,
      currentColor: this.currentColor,
      lastAction: this.lastAction
    };
  }

  getPlayerState(playerId: string): Record<string, unknown> {
    const publicState = this.getPublicState();
    const player = this.players.find(p => p.id === playerId);

    return {
      ...publicState,
      playerHand: player?.hand || [],
      playerCount: this.players.map(p => ({
        id: p.id,
        cardCount: p.hand.length,
        hasCalledUno: p.hasCalledUno
      }))
    };
  }

  getResult(): GameResult | null {
    if (!this.winnerId) return null;

    const winner = this.players.find(p => p.id === this.winnerId);
    if (!winner) return null;

    return {
      winnerId: this.winnerId,
      winnerNickname: '', // Will be filled by caller
      scores: Object.fromEntries(
        this.players.map(p => [p.id, p.score])
      )
    };
  }

  getAvailableActions(playerId: string): string[] {
    if (this.status !== GameStatus.PLAYING) return [];
    if (this.getCurrentPlayerId() !== playerId) return [];

    const actions: string[] = ['drawCard'];

    const player = this.players.find(p => p.id === playerId);
    if (!player) return actions;

    // Check if player can call UNO
    if (player.hand.length === 2) {
      actions.push('callUno');
    }

    // Check which cards can be played
    for (let i = 0; i < player.hand.length; i++) {
      if (this.canPlayCard(player.hand[i])) {
        actions.push(`playCard:${i}`);
      }
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
      case 'playCard': {
        const cardIndex = (data as { cardIndex: number })?.cardIndex;
        if (cardIndex === undefined || cardIndex < 0 || cardIndex >= player.hand.length) {
          return { success: false, error: 'Invalid card index' };
        }
        return this.playCard(player, cardIndex, data as { color?: UnoColor });
      }

      case 'drawCard':
        return this.drawCard(player);

      case 'callUno':
        return this.callUno(player);

      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  private canPlayCard(card: UnoCard): boolean {
    if (!this.currentCard) return false;

    // Wild cards can always be played
    if (card.type === UnoCardType.WILD || card.type === UnoCardType.WILD_DRAW_FOUR) {
      return true;
    }

    // Match by color
    if (card.color === this.currentColor) {
      return true;
    }

    // Match by value/type
    if (card.type === this.currentCard.type) {
      if (card.type === UnoCardType.NUMBER) {
        return card.value === this.currentCard.value;
      }
      return true; // Same special card type
    }

    // Match by number value
    if (card.type === UnoCardType.NUMBER && this.currentCard.type === UnoCardType.NUMBER) {
      return card.value === this.currentCard.value;
    }

    return false;
  }

  private playCard(player: UnoPlayerState, cardIndex: number, data?: { color?: UnoColor }): { success: boolean; error?: string } {
    const card = player.hand[cardIndex];

    if (!this.canPlayCard(card)) {
      return { success: false, error: 'Card cannot be played' };
    }

    // Handle wild card color selection
    if (card.type === UnoCardType.WILD || card.type === UnoCardType.WILD_DRAW_FOUR) {
      if (!data?.color || !Object.values(UnoColor).includes(data.color) || data.color === UnoColor.WILD) {
        return { success: false, error: 'Must select a valid color for wild card' };
      }
      this.currentColor = data.color;
    } else {
      this.currentColor = card.color;
    }

    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    this.discardPile.push(card);
    this.currentCard = card;

    // Check for win
    if (player.hand.length === 0) {
      this.winnerId = player.id;
      this.status = GameStatus.FINISHED;
      this.calculateScores();
      this.lastAction = `${player.id} wins!`;
      return { success: true };
    }

    // Reset UNO call if player has more than 1 card
    if (player.hand.length > 1) {
      player.hasCalledUno = false;
    }

    // Apply special card effects
    this.applyCardEffect(card);

    // Move to next player
    this.advanceTurn();
    this.lastAction = `${player.id} played ${card.color} ${card.type === UnoCardType.NUMBER ? card.value : card.type}`;

    return { success: true };
  }

  private applyCardEffect(card: UnoCard): void {
    switch (card.type) {
      case UnoCardType.SKIP:
        // Skip next player
        this.advanceTurn();
        break;

      case UnoCardType.REVERSE:
        // Reverse direction
        this.direction = this.direction === UnoDirection.CLOCKWISE
          ? UnoDirection.COUNTER_CLOCKWISE
          : UnoDirection.CLOCKWISE;
        break;

      case UnoCardType.DRAW_TWO:
        // Next player draws 2 cards and loses turn
        this.advanceTurn();
        const drawTwoPlayer = this.players[this.currentPlayerIndex];
        this.drawCardsForPlayer(drawTwoPlayer, 2);
        this.advanceTurn();
        break;

      case UnoCardType.WILD_DRAW_FOUR:
        // Next player draws 4 cards and loses turn
        this.advanceTurn();
        const drawFourPlayer = this.players[this.currentPlayerIndex];
        this.drawCardsForPlayer(drawFourPlayer, 4);
        this.advanceTurn();
        break;

      case UnoCardType.WILD:
        // No additional effect, just color change (already handled)
        break;
    }
  }

  private drawCard(player: UnoPlayerState): { success: boolean; error?: string } {
    if (this.drawPile.length === 0) {
      // Reshuffle discard pile into draw pile
      this.reshuffleDiscardPile();
    }

    if (this.drawPile.length === 0) {
      return { success: false, error: 'No cards left to draw' };
    }

    const card = this.drawPile.pop()!;
    player.hand.push(card);

    // Reset UNO call
    player.hasCalledUno = false;

    this.advanceTurn();
    this.lastAction = `${player.id} drew a card`;

    return { success: true };
  }

  private callUno(player: UnoPlayerState): { success: boolean; error?: string } {
    if (player.hand.length !== 2) {
      return { success: false, error: 'Can only call UNO with 2 cards (before playing)' };
    }

    player.hasCalledUno = true;
    this.lastAction = `${player.id} called UNO!`;

    return { success: true };
  }

  private drawCardsForPlayer(player: UnoPlayerState, count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        this.reshuffleDiscardPile();
      }
      if (this.drawPile.length > 0) {
        player.hand.push(this.drawPile.pop()!);
      }
    }
    player.hasCalledUno = false;
  }

  private reshuffleDiscardPile(): void {
    if (this.discardPile.length <= 1) return;

    // Keep the top card
    const topCard = this.discardPile.pop()!;
    this.drawPile = shuffleDeck(this.discardPile);
    this.discardPile = [topCard];
  }

  private advanceTurn(): void {
    const increment = this.direction;
    this.currentPlayerIndex = (this.currentPlayerIndex + increment + this.players.length) % this.players.length;
  }

  private calculateScores(): void {
    if (!this.winnerId) return;

    const winner = this.players.find(p => p.id === this.winnerId);
    if (!winner) return;

    // Sum up all cards in other players' hands
    let totalScore = 0;
    for (const player of this.players) {
      if (player.id !== this.winnerId) {
        for (const card of player.hand) {
          totalScore += this.getCardValue(card);
        }
      }
    }

    winner.score = totalScore;
  }

  private getCardValue(card: UnoCard): number {
    switch (card.type) {
      case UnoCardType.NUMBER:
        return card.value || 0;
      case UnoCardType.SKIP:
      case UnoCardType.REVERSE:
      case UnoCardType.DRAW_TWO:
        return 20;
      case UnoCardType.WILD:
      case UnoCardType.WILD_DRAW_FOUR:
        return 50;
      default:
        return 0;
    }
  }
}
