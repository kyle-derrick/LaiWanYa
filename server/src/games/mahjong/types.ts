// Mahjong Tile Types

export enum TileSuit {
  WAN = 'wan',     // 万子 (Characters)
  TIAO = 'tiao',   // 条子 (Bamboo)
  TONG = 'tong',   // 筒子 (Dots)
  FENG = 'feng',   // 风牌 (Winds)
  JIAN = 'jian',   // 箭牌 (Dragons)
  HUA = 'hua'      // 花牌 (Flowers)
}

export enum WindDirection {
  EAST = 'east',
  SOUTH = 'south',
  WEST = 'west',
  NORTH = 'north'
}

export enum DragonType {
  ZHONG = 'zhong',  // 中
  FA = 'fa',        // 发
  BAI = 'bai'       // 白
}

export enum FlowerType {
  CHUN = 'chun',  // 春
  XIA = 'xia',    // 夏
  QIU = 'qiu',    // 秋
  DONG = 'dong',  // 冬
  MEI = 'mei',    // 梅
  LAN = 'lan',    // 兰
  ZHU = 'zhu',    // 竹
  JU = 'ju'       // 菊
}

export interface Tile {
  id: string;       // Unique identifier
  suit: TileSuit;
  value: number;    // 1-9 for wan/tiao/tong, 1-4 for feng, 1-3 for jian, 1-8 for hua
  isFlower?: boolean;
}

export enum MeldType {
  CHI = 'chi',         // 吃 (sequence of 3)
  PONG = 'pong',       // 碰 (triplet)
  KONG_MING = 'kong_ming',   // 明杠
  KONG_AN = 'kong_an',       // 暗杠
  KONG_BU = 'kong_bu'        // 补杠 (added to existing pong)
}

export interface Meld {
  type: MeldType;
  tiles: Tile[];
  fromPlayerId?: string;  // For chi/pong/kong_ming: who discarded
}

export interface MahjongPlayerState {
  id: string;
  nickname: string;
  wind: WindDirection;
  hand: Tile[];
  melds: Meld[];
  discards: Tile[];
  flowers: Tile[];
  score: number;
  isReady: boolean;
}

export interface PendingAction {
  playerId: string;
  actions: string[];  // 'chi', 'pong', 'kong', 'hu', 'pass'
  discardedTile?: Tile;
  discardedByPlayerId?: string;
}

export interface MahjongGameState {
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentPlayerId: string | null;
  players: MahjongPlayerState[];
  wallCount: number;          // Remaining tiles in wall
  lastDiscard: Tile | null;
  lastDiscardPlayerId: string | null;
  lastAction: string | null;
  winnerId: string | null;
  winType: string | null;     // 'hu', 'zimo', etc.
  pendingActions: PendingAction[];
  roundWind: WindDirection;

  // Per-player fields (added in getPlayerState)
  playerHand?: Tile[];
  playerMelds?: Meld[];
  playerFlowers?: Tile[];
  availableActions?: string[];
  canDiscard?: boolean;
}
