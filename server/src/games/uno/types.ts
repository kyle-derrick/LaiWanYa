export enum UnoColor {
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  WILD = 'WILD'
}

export enum UnoCardType {
  NUMBER = 'NUMBER',
  SKIP = 'SKIP',
  REVERSE = 'REVERSE',
  DRAW_TWO = 'DRAW_TWO',
  WILD = 'WILD',
  WILD_DRAW_FOUR = 'WILD_DRAW_FOUR'
}

export interface UnoCard {
  id: string;
  color: UnoColor;
  type: UnoCardType;
  value: number | null; // 0-9 for number cards, null for special cards
}

export enum UnoDirection {
  CLOCKWISE = 1,
  COUNTER_CLOCKWISE = -1
}

export interface UnoPlayerState {
  id: string;
  hand: UnoCard[];
  hasCalledUno: boolean;
  score: number;
}

export interface UnoGameState {
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentCard: UnoCard | null;
  currentPlayerId: string | null;
  direction: UnoDirection;
  drawPileCount: number;
  players: UnoPlayerState[];
  winnerId: string | null;
  currentColor: UnoColor | null;
  lastAction: string | null;
}
