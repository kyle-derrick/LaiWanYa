export enum GameType {
  UNO = 'UNO',
  MONOPOLY = 'MONOPOLY',
  MAHJONG = 'MAHJONG'
}

export enum RoomStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
}

export interface Room {
  id: string;
  gameType: GameType;
  status: RoomStatus;
  players: Player[];
  maxPlayers: number;
  createdAt: string;
}

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
  value: number | null;
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
  direction: number;
  drawPileCount: number;
  players: UnoPlayerState[];
  winnerId: string | null;
  currentColor: UnoColor | null;
  lastAction: string | null;
  playerHand?: UnoCard[];
  playerCount?: { id: string; cardCount: number; hasCalledUno: boolean }[];
}
