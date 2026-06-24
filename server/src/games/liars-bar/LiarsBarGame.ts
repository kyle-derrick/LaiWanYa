import { Game } from '../../managers/GameManager';
import { GameStatus, GameState, GameResult } from '../../types';
import {
  LiarsBarCard,
  LiarsBarRank,
  LiarsBarPhase,
  LiarsBarPlayerState,
  LiarsBarGameState,
  PlayedPile
} from './types';

const ALL_RANKS: LiarsBarRank[] = [
  LiarsBarRank.ACE,
  LiarsBarRank.KING,
  LiarsBarRank.QUEEN,
  LiarsBarRank.JACK
];

const CARDS_PER_PLAYER = 5;
const REVOLVER_CHAMBERS = 6;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck(): LiarsBarCard[] {
  const cards: LiarsBarCard[] = [];
  let id = 0;
  // 6 copies of each rank = 24 cards total
  for (let copy = 0; copy < 6; copy++) {
    for (const rank of ALL_RANKS) {
      cards.push({ id: `card-${id++}`, rank });
    }
  }
  return shuffleArray(cards);
}

interface InternalPlayer {
  id: string;
  nickname: string;
  alive: boolean;
  hp: number;
  hand: LiarsBarCard[];
}

export class LiarsBarGame implements Game {
  private players: InternalPlayer[] = [];
  private currentPlayerIndex = 0;
  private status: GameStatus = GameStatus.INIT;
  private phase: LiarsBarPhase = LiarsBarPhase.PLAYING_CARDS;
  private targetRank: LiarsBarRank = LiarsBarRank.JACK;
  private targetRankIndex = 0;
  private currentPile: PlayedPile | null = null;
  private lastAction: string | null = null;
  private winnerId: string | null = null;
  private roundNumber = 0;
  private deck: LiarsBarCard[] = [];
  private nicknameMap: Record<string, string> = {};

  // Revolver state: a random bullet position (1-6), current chamber starts at 1
  private bulletPosition = 1;
  private currentChamber = 1;

  // Challenge state
  private challengerId: string | null = null;

  // Reveal result (temporary, sent once then cleared)
  private revealResult: LiarsBarGameState['revealResult'] = null;

  constructor(playerIds: string[]) {
    this.initializeGame(playerIds);
  }

  setNicknames(nicknameMap: Record<string, string>): void {
    this.nicknameMap = nicknameMap;
    for (const p of this.players) {
      p.nickname = nicknameMap[p.id] || p.id.substring(0, 8);
    }
  }

  private initializeGame(playerIds: string[]): void {
    this.players = playerIds.map(id => ({
      id,
      nickname: this.nicknameMap[id] || id.substring(0, 8),
      alive: true,
      hp: 2,
      hand: []
    }));

    this.targetRankIndex = 0;
    this.targetRank = ALL_RANKS[this.targetRankIndex];
    this.bulletPosition = Math.floor(Math.random() * REVOLVER_CHAMBERS) + 1;
    this.currentChamber = 1;
    this.roundNumber = 1;

    this.dealCards();
    this.findFirstPlayer();
    this.status = GameStatus.PLAYING;
    this.phase = LiarsBarPhase.PLAYING_CARDS;
    this.currentPile = null;
  }

  private dealCards(): void {
    this.deck = createDeck();
    for (const p of this.players) {
      if (p.alive) {
        p.hand = [];
        for (let i = 0; i < CARDS_PER_PLAYER; i++) {
          if (this.deck.length > 0) {
            p.hand.push(this.deck.pop()!);
          }
        }
      }
    }
  }

  private findFirstPlayer(): void {
    // Find first alive player from current index
    for (let i = 0; i < this.players.length; i++) {
      const idx = (this.currentPlayerIndex + i) % this.players.length;
      if (this.players[idx].alive) {
        this.currentPlayerIndex = idx;
        return;
      }
    }
  }

  private advanceToNextAlivePlayer(): void {
    for (let i = 1; i <= this.players.length; i++) {
      const idx = (this.currentPlayerIndex + i) % this.players.length;
      if (this.players[idx].alive) {
        this.currentPlayerIndex = idx;
        return;
      }
    }
  }

  private getAlivePlayers(): InternalPlayer[] {
    return this.players.filter(p => p.alive);
  }

  private getAliveCount(): number {
    return this.players.filter(p => p.alive).length;
  }

  private rotateTargetRank(): void {
    this.targetRankIndex = (this.targetRankIndex + 1) % ALL_RANKS.length;
    this.targetRank = ALL_RANKS[this.targetRankIndex];
  }

  private pullTrigger(playerId: string): { died: boolean; hpRemaining: number } {
    // Returns if the player dies (bullet fires) and remaining HP
    const player = this.players.find(p => p.id === playerId)!;
    const fired = this.currentChamber === this.bulletPosition;
    this.currentChamber++;
    if (this.currentChamber > REVOLVER_CHAMBERS) {
      this.currentChamber = 1;
      // Re-randomize bullet for next cycle
      this.bulletPosition = Math.floor(Math.random() * REVOLVER_CHAMBERS) + 1;
    }
    if (fired) {
      player.hp--;
      if (player.hp <= 0) {
        return { died: true, hpRemaining: 0 };
      }
      return { died: false, hpRemaining: player.hp };
    }
    return { died: false, hpRemaining: player.hp };
  }

  private eliminatePlayer(playerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.alive = false;
      player.hand = [];
    }
  }

  private checkGameOver(): boolean {
    const alive = this.getAlivePlayers();
    if (alive.length <= 1) {
      if (alive.length === 1) {
        this.winnerId = alive[0].id;
      }
      this.status = GameStatus.FINISHED;
      this.phase = LiarsBarPhase.GAME_OVER;
      return true;
    }
    return false;
  }

  private startNewRound(): void {
    this.rotateTargetRank();
    this.roundNumber++;
    this.currentPile = null;
    this.phase = LiarsBarPhase.PLAYING_CARDS;
    this.challengerId = null;
    this.revealResult = null;

    // Re-deal if any alive player has empty hand
    const needsRedeal = this.getAlivePlayers().some(p => p.hand.length === 0);
    if (needsRedeal) {
      this.dealCards();
    }

    this.findFirstPlayer();
  }

  // --- Game interface ---

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
      currentPlayerId: this.getCurrentPlayerId(),
      players: this.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        alive: p.alive,
        handSize: p.hand.length,
        hp: p.hp,
        bulletPosition: 0,  // Hidden
        currentChamber: this.currentChamber
      })),
      targetRank: this.targetRank,
      currentPile: this.currentPile ? {
        ...this.currentPile,
        cards: [] // Hidden until reveal
      } : null,
      lastAction: this.lastAction,
      winnerId: this.winnerId,
      phase: this.phase,
      roundNumber: this.roundNumber,
      revealResult: this.revealResult
    };
  }

  getPlayerState(playerId: string): Record<string, unknown> {
    const publicState = this.getPublicState();
    const player = this.players.find(p => p.id === playerId);

    return {
      ...publicState,
      playerHand: player?.hand || [],
      availableActions: this.getAvailableActions(playerId)
    };
  }

  getResult(): GameResult | null {
    if (!this.winnerId) return null;

    const winner = this.players.find(p => p.id === this.winnerId);
    if (!winner) return null;

    return {
      winnerId: this.winnerId,
      winnerNickname: winner.nickname,
      scores: Object.fromEntries(
        this.players.map(p => [p.id, p.alive ? 1 : 0])
      )
    };
  }

  getAvailableActions(playerId: string): string[] {
    if (this.status !== GameStatus.PLAYING) return [];

    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.alive) return [];

    if (this.phase === LiarsBarPhase.PLAYING_CARDS) {
      if (this.getCurrentPlayerId() === playerId) {
        return ['playCards'];
      }
    }

    if (this.phase === LiarsBarPhase.CHALLENGING) {
      // All alive players except the one who just played can challenge or pass
      if (playerId !== this.currentPile?.playerId) {
        return ['challenge', 'pass'];
      }
    }

    return [];
  }

  handleAction(playerId: string, action: string, data?: unknown): { success: boolean; error?: string } {
    if (this.status !== GameStatus.PLAYING) {
      return { success: false, error: 'Game is not in progress' };
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.alive) {
      return { success: false, error: 'Player not found or eliminated' };
    }

    switch (action) {
      case 'playCards':
        return this.handlePlayCards(playerId, data as { cardIndices: number[] });

      case 'challenge':
        return this.handleChallenge(playerId);

      case 'pass':
        return this.handlePass(playerId);

      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  private handlePlayCards(playerId: string, data?: { cardIndices: number[] }): { success: boolean; error?: string } {
    if (this.phase !== LiarsBarPhase.PLAYING_CARDS) {
      return { success: false, error: 'Not in playing phase' };
    }
    if (this.getCurrentPlayerId() !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const player = this.players.find(p => p.id === playerId)!;

    if (!data?.cardIndices || !Array.isArray(data.cardIndices) || data.cardIndices.length === 0) {
      return { success: false, error: 'Must select at least 1 card' };
    }
    if (data.cardIndices.length > 3) {
      return { success: false, error: 'Cannot play more than 3 cards' };
    }
    if (data.cardIndices.length > player.hand.length) {
      return { success: false, error: 'Not enough cards in hand' };
    }

    // Validate indices
    for (const idx of data.cardIndices) {
      if (idx < 0 || idx >= player.hand.length) {
        return { success: false, error: 'Invalid card index' };
      }
    }

    // Remove selected cards from hand (sort descending to remove safely)
    const sortedIndices = [...data.cardIndices].sort((a, b) => b - a);
    const playedCards: LiarsBarCard[] = [];
    for (const idx of sortedIndices) {
      playedCards.unshift(player.hand.splice(idx, 1)[0]);
    }

    // Place on the pile (claiming they are the target rank)
    this.currentPile = {
      playerId,
      cards: playedCards,
      claimedRank: this.targetRank,
      cardCount: playedCards.length
    };

    this.lastAction = `${player.nickname} played ${playedCards.length} card(s) claiming ${this.targetRank}`;
    this.phase = LiarsBarPhase.CHALLENGING;
    this.challengerId = null;

    // Check if player has no more cards → they auto-survive the round
    if (player.hand.length === 0) {
      // If no one can challenge (only 1 alive with cards), restart round
      const aliveWithCards = this.players.filter(p => p.alive && p.hand.length > 0);
      if (aliveWithCards.length === 0) {
        // Everyone ran out of cards, new round
        this.lastAction += ' — Round complete!';
        this.startNewRound();
        return { success: true };
      }
    }

    return { success: true };
  }

  private handleChallenge(challengerId: string): { success: boolean; error?: string } {
    if (this.phase !== LiarsBarPhase.CHALLENGING) {
      return { success: false, error: 'Not in challenging phase' };
    }
    if (!this.currentPile) {
      return { success: false, error: 'No cards to challenge' };
    }
    if (challengerId === this.currentPile.playerId) {
      return { success: false, error: 'Cannot challenge your own play' };
    }

    const challenger = this.players.find(p => p.id === challengerId)!;
    const bluffer = this.players.find(p => p.id === this.currentPile!.playerId)!;

    // Check if the played cards are actually the claimed rank
    const wasLying = this.currentPile.cards.some(c => c.rank !== this.targetRank);

    let loserId: string;
    if (wasLying) {
      // Bluffer was lying → bluffer pulls the trigger
      loserId = bluffer.id;
    } else {
      // Bluffer was honest → challenger pulls the trigger
      loserId = challenger.id;
    }

    const triggerResult = this.pullTrigger(loserId);

    if (triggerResult.died) {
      this.eliminatePlayer(loserId);
      this.lastAction = `${loserId === bluffer.id ? bluffer.nickname : challenger.nickname} was caught ${wasLying ? 'lying' : 'wrongly challenging'} and PULLED THE TRIGGER — BANG! 💀 Eliminated!`;
    } else {
      const hpMsg = triggerResult.hpRemaining < 2 ? ` (HP: ${'❤️'.repeat(triggerResult.hpRemaining)}${'🖤'.repeat(2 - triggerResult.hpRemaining)})` : '';
      this.lastAction = `${loserId === bluffer.id ? bluffer.nickname : challenger.nickname} pulled the trigger... *click* — Survived! 😅${hpMsg}`;
    }

    // Set reveal result
    this.revealResult = {
      cards: this.currentPile.cards,
      wasLying,
      loserId,
      died: triggerResult.died
    };

    this.phase = LiarsBarPhase.REVEALING;

    // Check game over
    if (this.checkGameOver()) {
      return { success: true };
    }

    // After reveal, start new round (with small delay handled by client)
    setTimeout(() => {
      if (this.status === GameStatus.PLAYING) {
        this.startNewRound();
      }
    }, 3000);

    return { success: true };
  }

  private handlePass(playerId: string): { success: boolean; error?: string } {
    if (this.phase !== LiarsBarPhase.CHALLENGING) {
      return { success: false, error: 'Not in challenging phase' };
    }
    if (!this.currentPile) {
      return { success: false, error: 'No play to pass on' };
    }
    if (playerId === this.currentPile.playerId) {
      return { success: false, error: 'Cannot pass on your own play' };
    }

    const player = this.players.find(p => p.id === playerId)!;
    this.lastAction = `${player.nickname} passed`;

    // Check if all other alive players (except the one who played) have passed
    const alivePlayers = this.players.filter(p => p.alive && p.id !== this.currentPile!.playerId);
    const playersWhoCanAct = alivePlayers.filter(p => p.hand.length > 0 || true);

    // For simplicity: after one pass, the pile owner gets another turn to play
    // (All players need to pass for the current play to be accepted)
    // We'll implement it as: each alive player gets one chance to challenge
    // If all pass, next player plays

    // Move to next alive player for potential challenge
    // Actually, let's simplify: if any player passes, we move the "challenge window" to the next player
    // If the next player is the pile owner (full circle), the play is accepted

    const pileOwnerId = this.currentPile.playerId;
    const nextAliveIdx = this.findNextAlivePlayerAfter(playerId);
    if (nextAliveIdx === -1 || this.players[nextAliveIdx].id === pileOwnerId) {
      // Full circle — play is accepted, move to next player
      this.lastAction = `All players accepted. Moving on...`;
      this.currentPile = null;
      this.phase = LiarsBarPhase.PLAYING_CARDS;
      this.advanceToNextAlivePlayer();

      // If the new current player has no cards, start new round
      if (this.players[this.currentPlayerIndex].hand.length === 0) {
        this.startNewRound();
      }
    }

    return { success: true };
  }

  private findNextAlivePlayerAfter(playerId: string): number {
    const idx = this.players.findIndex(p => p.id === playerId);
    if (idx === -1) return -1;

    for (let i = 1; i <= this.players.length; i++) {
      const nextIdx = (idx + i) % this.players.length;
      if (this.players[nextIdx].alive) {
        return nextIdx;
      }
    }
    return -1;
  }
}
