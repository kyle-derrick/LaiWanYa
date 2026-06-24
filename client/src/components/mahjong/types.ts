// Mahjong Frontend Types
// Re-exports from shared types and adds frontend-specific types

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

export interface Tile {
  id: string;
  suit: TileSuit;
  value: number;
  isFlower?: boolean;
}

export enum MeldType {
  CHI = 'chi',
  PONG = 'pong',
  KONG_MING = 'kong_ming',
  KONG_AN = 'kong_an',
  KONG_BU = 'kong_bu'
}

export interface Meld {
  type: MeldType;
  tiles: Tile[];
  fromPlayerId?: string;
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
  actions: string[];
  discardedTile?: Tile;
  discardedByPlayerId?: string;
}

export interface MahjongGameState {
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentPlayerId: string | null;
  players: MahjongPlayerState[];
  wallCount: number;
  lastDiscard: Tile | null;
  lastDiscardPlayerId: string | null;
  lastAction: string | null;
  winnerId: string | null;
  winType: string | null;
  pendingActions: PendingAction[];
  roundWind: WindDirection;

  // Per-player fields
  playerHand?: Tile[];
  playerMelds?: Meld[];
  playerFlowers?: Tile[];
  availableActions?: string[];
  canDiscard?: boolean;
}

// Tile display helper types
export interface TileDisplayInfo {
  label: string;      // Chinese character to display
  color: string;      // CSS color
  suitName: string;   // Suit name in Chinese
}

// Wind display mapping
export const WIND_LABELS: Record<WindDirection, string> = {
  [WindDirection.EAST]: '东',
  [WindDirection.SOUTH]: '南',
  [WindDirection.WEST]: '西',
  [WindDirection.NORTH]: '北',
};

// Wind order for positioning (relative to viewer)
export const WIND_ORDER: WindDirection[] = [
  WindDirection.EAST,
  WindDirection.SOUTH,
  WindDirection.WEST,
  WindDirection.NORTH,
];

// Tile display configuration
export const TILE_COLORS: Record<TileSuit, string> = {
  [TileSuit.WAN]: '#1a5276',    // Dark blue for 万
  [TileSuit.TIAO]: '#27ae60',   // Green for 条
  [TileSuit.TONG]: '#c0392b',   // Red for 筒
  [TileSuit.FENG]: '#2c3e50',   // Dark for 风
  [TileSuit.JIAN]: '#8e44ad',   // Purple for 箭
  [TileSuit.HUA]: '#e67e22',    // Orange for 花
};

export const FENG_LABELS: Record<number, string> = {
  1: '东',
  2: '南',
  3: '西',
  4: '北',
};

export const JIAN_LABELS: Record<number, string> = {
  1: '中',
  2: '发',
  3: '白',
};

export const HUA_LABELS: Record<number, string> = {
  1: '春', 2: '夏', 3: '秋', 4: '冬',
  5: '梅', 6: '兰', 7: '竹', 8: '菊',
};

export const SUIT_LABELS: Record<TileSuit, string> = {
  [TileSuit.WAN]: '万',
  [TileSuit.TIAO]: '条',
  [TileSuit.TONG]: '筒',
  [TileSuit.FENG]: '风',
  [TileSuit.JIAN]: '箭',
  [TileSuit.HUA]: '花',
};

export const MELD_LABELS: Record<MeldType, string> = {
  [MeldType.CHI]: '吃',
  [MeldType.PONG]: '碰',
  [MeldType.KONG_MING]: '明杠',
  [MeldType.KONG_AN]: '暗杠',
  [MeldType.KONG_BU]: '补杠',
};

export const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
