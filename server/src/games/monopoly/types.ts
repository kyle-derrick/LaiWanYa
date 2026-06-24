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
  houses: number; // 0-4, 5 = hotel
  isMortgaged: boolean;
}

export enum CardType {
  CHANCE = 'CHANCE',
  COMMUNITY_CHEST = 'COMMUNITY_CHEST'
}

export enum CardAction {
  MOVE_TO = 'MOVE_TO',
  MOVE_FORWARD = 'MOVE_FORWARD',
  MOVE_BACKWARD = 'MOVE_BACKWARD',
  COLLECT = 'COLLECT',
  PAY = 'PAY',
  COLLECT_FROM_EACH = 'COLLECT_FROM_EACH',
  PAY_EACH = 'PAY_EACH',
  GO_TO_JAIL = 'GO_TO_JAIL',
  GET_OUT_OF_JAIL = 'GET_OUT_OF_JAIL',
  REPAIRS = 'REPAIRS'
}

export interface Card {
  id: string;
  type: CardType;
  description: string;
  action: CardAction;
  value?: number; // money amount or position
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
  properties: number[]; // square indices owned
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
  currentCard: Card | null;
  pendingAction: PendingAction | null;
  freeParkingPot: number;
}

export interface PendingAction {
  type: 'BUY_PROPERTY' | 'PAY_RENT' | 'DRAW_CARD' | 'PAY_TAX' | 'AUCTION' | 'JAIL_CHOICE';
  data?: Record<string, unknown>;
}

export interface DiceResult {
  die1: number;
  die2: number;
  isDoubles: boolean;
  total: number;
}
