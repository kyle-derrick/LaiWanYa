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

// Monopoly types
export enum SquareType {
  PROPERTY = 'PROPERTY',
  RAILROAD = 'RAILROAD',
  UTILITY = 'UTILITY',
  CHANCE = 'CHANCE',
  COMMUNITY_CHEST = 'COMMUNITY_CHEST',
  TAX = 'TAX',
  GO = 'GO',
  JAIL = 'JAIL',
  FREE_PARKING = 'FREE_PARKING',
  GO_TO_JAIL = 'GO_TO_JAIL'
}

export enum PropertyColor {
  BROWN = 'BROWN',
  LIGHT_BLUE = 'LIGHT_BLUE',
  PINK = 'PINK',
  ORANGE = 'ORANGE',
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  DARK_BLUE = 'DARK_BLUE',
  RAILROAD = 'RAILROAD',
  UTILITY = 'UTILITY'
}

export interface BoardSquare {
  index: number;
  name: string;
  type: SquareType;
  color?: PropertyColor;
  price?: number;
  rent?: number[];
  mortgageValue?: number;
  houseCost?: number;
}

export interface PropertyOwnership {
  squareIndex: number;
  ownerId: string;
  houses: number;
  isMortgaged: boolean;
}

export interface MonopolyPlayerState {
  id: string;
  nickname: string;
  money: number;
  position: number;
  isInJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  isBankrupt: boolean;
  properties: number[];
}

export interface MonopolyCard {
  id: string;
  type: 'CHANCE' | 'COMMUNITY_CHEST';
  description: string;
  action: string;
  value?: number;
}

export interface PendingAction {
  type: 'BUY_PROPERTY' | 'PAY_RENT' | 'DRAW_CARD' | 'PAY_TAX' | 'AUCTION' | 'JAIL_CHOICE';
  data?: Record<string, unknown>;
}

export interface MonopolyGameState {
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentPlayerId: string | null;
  players: MonopolyPlayerState[];
  properties: PropertyOwnership[];
  dice: [number, number] | null;
  doublesCount: number;
  lastAction: string | null;
  winnerId: string | null;
  currentCard: MonopolyCard | null;
  pendingAction: PendingAction | null;
  freeParkingPot: number;
  playerMoney?: number;
  playerProperties?: number[];
  playerPosition?: number;
  playerIsInJail?: boolean;
  availableActions?: string[];
}
