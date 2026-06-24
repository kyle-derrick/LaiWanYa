/** Card rank in Liar's Bar */
export enum LiarsBarRank {
  ACE = 'A',
  KING = 'K',
  QUEEN = 'Q',
  JACK = 'J'
}

/** A single card */
export interface LiarsBarCard {
  id: string;
  rank: LiarsBarRank;
}

/** Game phase */
export enum LiarsBarPhase {
  PLAYING_CARDS = 'PLAYING_CARDS',
  CHALLENGING = 'CHALLENGING',
  REVEALING = 'REVEALING',
  ROUND_RESTART = 'ROUND_RESTART',
  GAME_OVER = 'GAME_OVER'
}

/** Player status */
export interface LiarsBarPlayerState {
  id: string;
  nickname: string;
  alive: boolean;
  handSize: number;
  hp: number;               // Hit points (starts at 2)
  bulletPosition: number;   // Hidden: 1-6, the bullet chamber
  currentChamber: number;   // Current position (shared across game)
}

/** Pile of played cards on the table */
export interface PlayedPile {
  playerId: string;
  cards: LiarsBarCard[];
  claimedRank: LiarsBarRank;
  cardCount: number;
}

/** Full game state sent to each player */
export interface LiarsBarGameState {
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentPlayerId: string | null;
  players: LiarsBarPlayerState[];
  targetRank: LiarsBarRank;
  currentPile: PlayedPile | null;
  lastAction: string | null;
  winnerId: string | null;
  phase: LiarsBarPhase;
  roundNumber: number;
  playerHand?: LiarsBarCard[];
  availableActions?: string[];
  revealResult?: {
    cards: LiarsBarCard[];
    wasLying: boolean;
    loserId: string;
    died: boolean;
  } | null;
}
