export enum GameType {
  UNO = 'UNO',
  MONOPOLY = 'MONOPOLY',
  MAHJONG = 'MAHJONG',
  LIARS_BAR = 'LIARS_BAR'
}

export enum RoomStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export enum GameStatus {
  INIT = 'INIT',
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
  name: string;
  description: string;
  gameType: GameType;
  status: RoomStatus;
  players: Player[];
  maxPlayers: number;
  isPrivate: boolean;
  password: string | null;
  createdAt: number;
  hostId: string;
}

export interface GameResult {
  winnerId: string;
  winnerNickname: string;
  scores?: Record<string, number>;
}

export interface GameState {
  status: GameStatus;
  currentPlayerId: string | null;
  players: string[];
  data: Record<string, unknown>;
}

export const DEFAULT_MAX_PLAYERS: Record<GameType, number> = {
  [GameType.UNO]: 4,
  [GameType.MONOPOLY]: 4,
  [GameType.MAHJONG]: 4,
  [GameType.LIARS_BAR]: 6
};
