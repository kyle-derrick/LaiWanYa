import { Tile, TileSuit, WindDirection, DragonType, FlowerType } from './types';

/**
 * Create a complete set of 136 mahjong tiles (no flowers for standard play)
 * 万条筒各36张 + 风牌16张 + 箭牌12张 = 100张
 * With flowers: +8 = 136 (but we'll handle flowers separately)
 */
export function createTileSet(): Tile[] {
  const tiles: Tile[] = [];

  // 万子 (Characters) - 4 copies each of 1-9
  for (let copy = 0; copy < 4; copy++) {
    for (let value = 1; value <= 9; value++) {
      tiles.push({
        id: `wan_${value}_${copy}`,
        suit: TileSuit.WAN,
        value
      });
    }
  }

  // 条子 (Bamboo) - 4 copies each of 1-9
  for (let copy = 0; copy < 4; copy++) {
    for (let value = 1; value <= 9; value++) {
      tiles.push({
        id: `tiao_${value}_${copy}`,
        suit: TileSuit.TIAO,
        value
      });
    }
  }

  // 筒子 (Dots) - 4 copies each of 1-9
  for (let copy = 0; copy < 4; copy++) {
    for (let value = 1; value <= 9; value++) {
      tiles.push({
        id: `tong_${value}_${copy}`,
        suit: TileSuit.TONG,
        value
      });
    }
  }

  // 风牌 (Winds) - 4 copies each of 4 directions
  const winds = [WindDirection.EAST, WindDirection.SOUTH, WindDirection.WEST, WindDirection.NORTH];
  for (let copy = 0; copy < 4; copy++) {
    for (let value = 1; value <= 4; value++) {
      tiles.push({
        id: `feng_${value}_${copy}`,
        suit: TileSuit.FENG,
        value
      });
    }
  }

  // 箭牌 (Dragons) - 4 copies each of 3 types
  for (let copy = 0; copy < 4; copy++) {
    for (let value = 1; value <= 3; value++) {
      tiles.push({
        id: `jian_${value}_${copy}`,
        suit: TileSuit.JIAN,
        value
      });
    }
  }

  // 花牌 (Flowers) - 1 copy each of 8
  for (let value = 1; value <= 8; value++) {
    tiles.push({
      id: `hua_${value}_0`,
      suit: TileSuit.HUA,
      value,
      isFlower: true
    });
  }

  return tiles;
}

/**
 * Shuffle tiles using Fisher-Yates algorithm
 */
export function shuffleTiles(tiles: Tile[]): Tile[] {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get display name for a tile
 */
export function getTileName(tile: Tile): string {
  switch (tile.suit) {
    case TileSuit.WAN:
      return `${tile.value}万`;
    case TileSuit.TIAO:
      return `${tile.value}条`;
    case TileSuit.TONG:
      return `${tile.value}筒`;
    case TileSuit.FENG: {
      const windNames: Record<number, string> = { 1: '东', 2: '南', 3: '西', 4: '北' };
      return windNames[tile.value] || '?';
    }
    case TileSuit.JIAN: {
      const dragonNames: Record<number, string> = { 1: '中', 2: '发', 3: '白' };
      return dragonNames[tile.value] || '?';
    }
    case TileSuit.HUA: {
      const flowerNames: Record<number, string> = {
        1: '春', 2: '夏', 3: '秋', 4: '冬',
        5: '梅', 6: '兰', 7: '竹', 8: '菊'
      };
      return flowerNames[tile.value] || '?';
    }
    default:
      return '?';
  }
}

/**
 * Get emoji/icon for a tile
 */
export function getTileEmoji(tile: Tile): string {
  switch (tile.suit) {
    case TileSuit.WAN:
      return ['🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏'][tile.value - 1] || '🀫';
    case TileSuit.TIAO:
      return ['🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘'][tile.value - 1] || '🀫';
    case TileSuit.TONG:
      return ['🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡'][tile.value - 1] || '🀫';
    case TileSuit.FENG:
      return ['🀀', '🀁', '🀂', '🀃'][tile.value - 1] || '🀫';
    case TileSuit.JIAN:
      return ['🀄', '🀅', '🀆'][tile.value - 1] || '🀫';
    case TileSuit.HUA:
      return '🌺';
    default:
      return '🀫';
  }
}

/**
 * Compare two tiles for equality (same suit and value)
 */
export function tilesEqual(a: Tile, b: Tile): boolean {
  return a.suit === b.suit && a.value === b.value;
}

/**
 * Sort tiles by suit and value
 */
export function sortTiles(tiles: Tile[]): Tile[] {
  const suitOrder: Record<string, number> = {
    [TileSuit.WAN]: 0,
    [TileSuit.TIAO]: 1,
    [TileSuit.TONG]: 2,
    [TileSuit.FENG]: 3,
    [TileSuit.JIAN]: 4,
    [TileSuit.HUA]: 5
  };

  return [...tiles].sort((a, b) => {
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) return suitDiff;
    return a.value - b.value;
  });
}

/**
 * Check if a tile is a number tile (wan/tiao/tong)
 */
export function isNumberTile(tile: Tile): boolean {
  return tile.suit === TileSuit.WAN || tile.suit === TileSuit.TIAO || tile.suit === TileSuit.TONG;
}
