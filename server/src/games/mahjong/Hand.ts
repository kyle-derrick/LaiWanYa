import { Tile, TileSuit, Meld, MeldType } from './types';
import { tilesEqual, isNumberTile } from './Tile';

/**
 * Hand analysis for mahjong
 * Detects winning hands and calculates fan (番) scores
 */

// ========== Tile Grouping ==========

interface TileGroup {
  suit: TileSuit;
  value: number;
  count: number;
}

/**
 * Group tiles by suit and value, returning counts
 */
export function groupTiles(tiles: Tile[]): TileGroup[] {
  const map = new Map<string, TileGroup>();

  for (const tile of tiles) {
    const key = `${tile.suit}_${tile.value}`;
    const existing = map.get(key);
    if (existing) {
      existing.count++;
    } else {
      map.set(key, { suit: tile.suit, value: tile.value, count: 1 });
    }
  }

  return Array.from(map.values());
}

/**
 * Get the count of a specific tile in a group
 */
function getCount(groups: TileGroup[], suit: TileSuit, value: number): number {
  const g = groups.find(gr => gr.suit === suit && gr.value === value);
  return g ? g.count : 0;
}

// ========== Win Detection ==========

/**
 * Check if a hand (14 tiles total) forms a winning hand
 * A winning hand = 4 melds (sets of 3) + 1 pair (eyes)
 */
export function isWinningHand(tiles: Tile[], melds: Meld[]): boolean {
  if (tiles.length !== 14 && tiles.length + melds.length * 3 !== 14) {
    // For self-draw win, hand has 14 tiles (13 + 1 drawn)
    // Or 14 - melds * 3 tiles in hand
  }

  // Check for special winning hands first
  if (isSevenPairs(tiles)) return true;
  if (isThirteenOrphans(tiles)) return true;

  // Standard winning hand: 4 melds + 1 pair
  // melds are already formed (chi/pong/kong), so remaining tiles must form (4 - melds.length) melds + 1 pair
  const remainingMeldsNeeded = 4 - melds.filter(m => m.type !== MeldType.KONG_AN && m.type !== MeldType.KONG_MING && m.type !== MeldType.KONG_BU).length;
  // Actually kongs count as melds too
  const totalMeldsFromOpen = melds.length;

  return canFormWinningCombination(tiles, totalMeldsFromOpen);
}

/**
 * Check if remaining hand tiles can form (4 - openMelds) melds + 1 pair
 */
function canFormWinningCombination(tiles: Tile[], openMelds: number): boolean {
  const meldsNeeded = 4 - openMelds;
  const groups = groupTiles(tiles);

  // Try each possible pair
  for (const pairCandidate of groups) {
    if (pairCandidate.count >= 2) {
      // Try this pair
      const remaining = groups.map(g => ({ ...g }));
      const pair = remaining.find(g => g.suit === pairCandidate.suit && g.value === pairCandidate.value)!;
      pair.count -= 2;

      if (canFormMelds(remaining, meldsNeeded)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if the grouped tiles can form exactly 'count' melds (sets of 3)
 */
function canFormMelds(groups: TileGroup[], count: number): boolean {
  // Count total tiles
  const totalTiles = groups.reduce((sum, g) => sum + g.count, 0);
  if (totalTiles !== count * 3) return false;
  if (count === 0) return totalTiles === 0;

  // Find the first non-zero tile
  const firstNonZero = groups.find(g => g.count > 0);
  if (!firstNonZero) return count === 0;

  const { suit, value } = firstNonZero;

  // Try triplet (刻子)
  if (firstNonZero.count >= 3) {
    firstNonZero.count -= 3;
    if (canFormMelds(groups, count - 1)) {
      firstNonZero.count += 3;
      return true;
    }
    firstNonZero.count += 3;
  }

  // Try sequence (顺子) - only for number tiles
  if (isNumberTile({ suit, value } as Tile)) {
    const g1 = groups.find(g => g.suit === suit && g.value === value);
    const g2 = groups.find(g => g.suit === suit && g.value === value + 1);
    const g3 = groups.find(g => g.suit === suit && g.value === value + 2);

    if (g1 && g2 && g3 && g1.count > 0 && g2.count > 0 && g3.count > 0) {
      g1.count--;
      g2.count--;
      g3.count--;
      if (canFormMelds(groups, count - 1)) {
        g1.count++;
        g2.count++;
        g3.count++;
        return true;
      }
      g1.count++;
      g2.count++;
      g3.count++;
    }
  }

  return false;
}

/**
 * Check for seven pairs (七对子)
 */
function isSevenPairs(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;

  const groups = groupTiles(tiles);
  return groups.every(g => g.count === 2 || g.count === 4 || g.count === 6);
}

/**
 * Check for thirteen orphans (十三幺)
 */
function isThirteenOrphans(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;

  const requiredTiles = [
    { suit: TileSuit.WAN, value: 1 },
    { suit: TileSuit.WAN, value: 9 },
    { suit: TileSuit.TIAO, value: 1 },
    { suit: TileSuit.TIAO, value: 9 },
    { suit: TileSuit.TONG, value: 1 },
    { suit: TileSuit.TONG, value: 9 },
    { suit: TileSuit.FENG, value: 1 }, // 东
    { suit: TileSuit.FENG, value: 2 }, // 南
    { suit: TileSuit.FENG, value: 3 }, // 西
    { suit: TileSuit.FENG, value: 4 }, // 北
    { suit: TileSuit.JIAN, value: 1 }, // 中
    { suit: TileSuit.JIAN, value: 2 }, // 发
    { suit: TileSuit.JIAN, value: 3 }  // 白
  ];

  const groups = groupTiles(tiles);

  // Must have at least 1 of each required tile
  for (const req of requiredTiles) {
    const count = getCount(groups, req.suit, req.value);
    if (count < 1) return false;
  }

  // Total must be 14, so one of the 13 types appears twice (the pair)
  const totalCount = groups.reduce((sum, g) => sum + g.count, 0);
  return totalCount === 14;
}

// ========== Chi Detection ==========

/**
 * Find all possible chi combinations from a player's hand with a discarded tile
 * Returns arrays of 2 tiles that can form a chi with the discarded tile
 */
export function findPossibleChi(hand: Tile[], discardedTile: Tile): Tile[][] {
  if (!isNumberTile(discardedTile)) return [];

  const results: Tile[][] = [];
  const suit = discardedTile.suit;
  const value = discardedTile.value;

  // Check 3 sequences: [v-2, v-1, v], [v-1, v, v+1], [v, v+1, v+2]
  const sequences = [
    [value - 2, value - 1],
    [value - 1, value + 1],
    [value + 1, value + 2]
  ];

  for (const [a, b] of sequences) {
    if (a < 1 || a > 9 || b < 1 || b > 9) continue;

    const tileA = hand.find(t => t.suit === suit && t.value === a);
    const tileB = hand.find(t => t.suit === suit && t.value === b && (t.id !== tileA?.id || a !== b));

    if (tileA && tileB) {
      // For same-value tiles, need distinct tiles
      if (a === b) {
        const matchingTiles = hand.filter(t => t.suit === suit && t.value === a);
        if (matchingTiles.length >= 2) {
          results.push([matchingTiles[0], matchingTiles[1]]);
        }
      } else {
        results.push([tileA, tileB]);
      }
    }
  }

  return results;
}

/**
 * Check if a player can pong the discarded tile
 */
export function canPong(hand: Tile[], discardedTile: Tile): boolean {
  return hand.filter(t => tilesEqual(t, discardedTile)).length >= 2;
}

/**
 * Check if a player can kong (ming kong) the discarded tile
 */
export function canKong(hand: Tile[], discardedTile: Tile): boolean {
  return hand.filter(t => tilesEqual(t, discardedTile)).length >= 3;
}

/**
 * Check for concealed kong (暗杠) in hand
 */
export function findConcealedKongs(hand: Tile[]): Tile[][] {
  const groups = groupTiles(hand);
  const kongs: Tile[][] = [];

  for (const group of groups) {
    if (group.count === 4) {
      const matching = hand.filter(t => t.suit === group.suit && t.value === group.value);
      kongs.push(matching);
    }
  }

  return kongs;
}

/**
 * Check for supplement kong (补杠) - adding 4th tile to existing pong
 */
export function findSupplementKongs(hand: Tile[], melds: Meld[]): Tile[][] {
  const kongs: Tile[][] = [];

  for (const meld of melds) {
    if (meld.type === MeldType.PONG) {
      const pongTile = meld.tiles[0];
      const matching = hand.find(t => tilesEqual(t, pongTile));
      if (matching) {
        kongs.push([matching]);
      }
    }
  }

  return kongs;
}

// ========== Win Scoring (Simplified Fan Calculation) ==========

export interface WinResult {
  isWin: boolean;
  fan: number;
  winTypes: string[];
  description: string;
}

/**
 * Calculate the fan (番) score for a winning hand
 * Simplified version of Chinese Official Mahjong scoring
 */
export function calculateWin(
  hand: Tile[],
  melds: Meld[],
  winTile: Tile,
  isSelfDraw: boolean,
  isKongFlower: boolean,
  flowers: Tile[],
  seatWind: number,  // 1=east, 2=south, 3=west, 4=north
  roundWind: number
): WinResult {
  if (!isWinningHand([...hand, winTile], melds)) {
    return { isWin: false, fan: 0, winTypes: [], description: '' };
  }

  let totalFan = 0;
  const winTypes: string[] = [];

  // 门前清 (All concealed) + 自摸 = 1番
  const isAllConcealed = melds.every(m =>
    m.type === MeldType.KONG_AN
  );

  // Self-draw (自摸) - 1番
  if (isSelfDraw) {
    totalFan += 1;
    winTypes.push('自摸');
  }

  // 门前清自摸 (Concealed self-draw) - additional
  if (isAllConcealed && isSelfDraw) {
    totalFan += 1;
    winTypes.push('门前清');
  }

  // Check special patterns
  const allTiles = [...hand, winTile];
  const groups = groupTiles(allTiles);

  // 碰碰胡 (All triplets) - 2番
  const isOpenPongPong = melds.every(m =>
    m.type === MeldType.PONG || m.type === MeldType.KONG_MING || m.type === MeldType.KONG_AN || m.type === MeldType.KONG_BU
  );
  const handTriplets = countTripletsInGroups(groups);
  if (isOpenPongPong && handTriplets >= 1) {
    totalFan += 2;
    winTypes.push('碰碰胡');
  }

  // 混一色 (Half flush) - 2番
  const usedSuits = new Set<TileSuit>();
  for (const tile of allTiles) {
    usedSuits.add(tile.suit);
  }
  for (const meld of melds) {
    for (const tile of meld.tiles) {
      usedSuits.add(tile.suit);
    }
  }
  const numberSuits = [TileSuit.WAN, TileSuit.TIAO, TileSuit.TONG];
  const hasNumberSuit = numberSuits.some(s => usedSuits.has(s));
  const hasHonor = usedSuits.has(TileSuit.FENG) || usedSuits.has(TileSuit.JIAN);
  const numberSuitCount = numberSuits.filter(s => usedSuits.has(s)).length;

  if (numberSuitCount === 1 && hasHonor) {
    totalFan += 2;
    winTypes.push('混一色');
  }

  // 清一色 (Full flush) - 4番
  if (numberSuitCount === 1 && !hasHonor && !usedSuits.has(TileSuit.HUA)) {
    totalFan += 4;
    winTypes.push('清一色');
  }

  // 七对子 (Seven pairs) - 2番
  if (isSevenPairs(allTiles)) {
    totalFan += 2;
    winTypes.push('七对子');
  }

  // 花牌 (Flower tiles) - 1番 per flower
  if (flowers.length > 0) {
    totalFan += flowers.length;
    winTypes.push(`${flowers.length}花`);
  }

  // 杠上开花 (Win from kong) - 1番
  if (isKongFlower) {
    totalFan += 1;
    winTypes.push('杠上开花');
  }

  // Dragon pong/kong (箭牌刻子) - 1番 each
  const dragonPongs = melds.filter(m =>
    (m.type === MeldType.PONG || m.type === MeldType.KONG_MING || m.type === MeldType.KONG_AN || m.type === MeldType.KONG_BU) &&
    m.tiles[0].suit === TileSuit.JIAN
  );
  if (dragonPongs.length > 0) {
    totalFan += dragonPongs.length;
    winTypes.push(`${dragonPongs.length}箭刻`);
  }

  // Seat wind pong/kong (门风刻) - 1番
  const seatWindPongs = melds.filter(m =>
    (m.type === MeldType.PONG || m.type === MeldType.KONG_MING || m.type === MeldType.KONG_AN || m.type === MeldType.KONG_BU) &&
    m.tiles[0].suit === TileSuit.FENG && m.tiles[0].value === seatWind
  );
  if (seatWindPongs.length > 0) {
    totalFan += 1;
    winTypes.push('门风刻');
  }

  // Round wind pong/kong (圈风刻) - 1番
  const roundWindPongs = melds.filter(m =>
    (m.type === MeldType.PONG || m.type === MeldType.KONG_MING || m.type === MeldType.KONG_AN || m.type === MeldType.KONG_BU) &&
    m.tiles[0].suit === TileSuit.FENG && m.tiles[0].value === roundWind
  );
  if (roundWindPongs.length > 0 && roundWind !== seatWind) {
    totalFan += 1;
    winTypes.push('圈风刻');
  }

  // 平胡 (All chis + pair) - 1番 (basic)
  const hasOnlyChi = melds.every(m => m.type === MeldType.CHI);
  if (hasOnlyChi && melds.length > 0) {
    totalFan += 1;
    winTypes.push('平胡');
  }

  // Minimum 1 fan for any win
  if (totalFan === 0) {
    totalFan = 1;
    winTypes.push('基本胡');
  }

  return {
    isWin: true,
    fan: totalFan,
    winTypes,
    description: winTypes.join(' + ') + ` (${totalFan}番)`
  };
}

function countTripletsInGroups(groups: TileGroup[]): number {
  return groups.filter(g => g.count >= 3).length;
}
