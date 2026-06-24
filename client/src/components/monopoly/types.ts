// Re-export types from shared types
export {
  SquareType,
  PropertyColor,
  type BoardSquare,
  type PropertyOwnership,
  type MonopolyPlayerState,
  type MonopolyCard,
  type PendingAction,
  type MonopolyGameState
} from '../../types';

// Board data - matches server/src/games/monopoly/Board.ts
import { SquareType, PropertyColor, type BoardSquare } from '../../types';

export const BOARD_SQUARES: BoardSquare[] = [
  // 0 - GO
  { index: 0, name: 'GO', type: SquareType.GO },
  // 1 - Mediterranean Avenue (Brown)
  { index: 1, name: 'Mediterranean Ave', type: SquareType.PROPERTY, color: PropertyColor.BROWN, price: 60, rent: [2, 10, 30, 90, 160, 250], mortgageValue: 30, houseCost: 50 },
  // 2 - Community Chest
  { index: 2, name: 'Community Chest', type: SquareType.COMMUNITY_CHEST },
  // 3 - Baltic Avenue (Brown)
  { index: 3, name: 'Baltic Ave', type: SquareType.PROPERTY, color: PropertyColor.BROWN, price: 60, rent: [4, 20, 60, 180, 320, 450], mortgageValue: 30, houseCost: 50 },
  // 4 - Income Tax
  { index: 4, name: 'Income Tax', type: SquareType.TAX, price: 200 },
  // 5 - Reading Railroad
  { index: 5, name: 'Reading Railroad', type: SquareType.RAILROAD, color: PropertyColor.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  // 6 - Oriental Avenue (Light Blue)
  { index: 6, name: 'Oriental Ave', type: SquareType.PROPERTY, color: PropertyColor.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], mortgageValue: 50, houseCost: 50 },
  // 7 - Chance
  { index: 7, name: 'Chance', type: SquareType.CHANCE },
  // 8 - Vermont Avenue (Light Blue)
  { index: 8, name: 'Vermont Ave', type: SquareType.PROPERTY, color: PropertyColor.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], mortgageValue: 50, houseCost: 50 },
  // 9 - Connecticut Avenue (Light Blue)
  { index: 9, name: 'Connecticut Ave', type: SquareType.PROPERTY, color: PropertyColor.LIGHT_BLUE, price: 120, rent: [8, 40, 100, 300, 450, 600], mortgageValue: 60, houseCost: 50 },
  // 10 - Jail / Just Visiting
  { index: 10, name: 'Jail', type: SquareType.JAIL },
  // 11 - St. Charles Place (Pink)
  { index: 11, name: 'St. Charles Place', type: SquareType.PROPERTY, color: PropertyColor.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], mortgageValue: 70, houseCost: 100 },
  // 12 - Electric Company
  { index: 12, name: 'Electric Company', type: SquareType.UTILITY, color: PropertyColor.UTILITY, price: 150, mortgageValue: 75 },
  // 13 - States Avenue (Pink)
  { index: 13, name: 'States Ave', type: SquareType.PROPERTY, color: PropertyColor.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], mortgageValue: 70, houseCost: 100 },
  // 14 - Virginia Avenue (Pink)
  { index: 14, name: 'Virginia Ave', type: SquareType.PROPERTY, color: PropertyColor.PINK, price: 160, rent: [12, 60, 180, 500, 700, 900], mortgageValue: 80, houseCost: 100 },
  // 15 - Pennsylvania Railroad
  { index: 15, name: 'Pennsylvania Railroad', type: SquareType.RAILROAD, color: PropertyColor.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  // 16 - St. James Place (Orange)
  { index: 16, name: 'St. James Place', type: SquareType.PROPERTY, color: PropertyColor.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], mortgageValue: 90, houseCost: 100 },
  // 17 - Community Chest
  { index: 17, name: 'Community Chest', type: SquareType.COMMUNITY_CHEST },
  // 18 - Tennessee Avenue (Orange)
  { index: 18, name: 'Tennessee Ave', type: SquareType.PROPERTY, color: PropertyColor.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], mortgageValue: 90, houseCost: 100 },
  // 19 - New York Avenue (Orange)
  { index: 19, name: 'New York Ave', type: SquareType.PROPERTY, color: PropertyColor.ORANGE, price: 200, rent: [16, 80, 220, 600, 800, 1000], mortgageValue: 100, houseCost: 100 },
  // 20 - Free Parking
  { index: 20, name: 'Free Parking', type: SquareType.FREE_PARKING },
  // 21 - Kentucky Avenue (Red)
  { index: 21, name: 'Kentucky Ave', type: SquareType.PROPERTY, color: PropertyColor.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], mortgageValue: 110, houseCost: 150 },
  // 22 - Chance
  { index: 22, name: 'Chance', type: SquareType.CHANCE },
  // 23 - Indiana Avenue (Red)
  { index: 23, name: 'Indiana Ave', type: SquareType.PROPERTY, color: PropertyColor.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], mortgageValue: 110, houseCost: 150 },
  // 24 - Illinois Avenue (Red)
  { index: 24, name: 'Illinois Ave', type: SquareType.PROPERTY, color: PropertyColor.RED, price: 240, rent: [20, 100, 300, 750, 925, 1100], mortgageValue: 120, houseCost: 150 },
  // 25 - B&O Railroad
  { index: 25, name: 'B&O Railroad', type: SquareType.RAILROAD, color: PropertyColor.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  // 26 - Atlantic Avenue (Yellow)
  { index: 26, name: 'Atlantic Ave', type: SquareType.PROPERTY, color: PropertyColor.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], mortgageValue: 130, houseCost: 150 },
  // 27 - Ventnor Avenue (Yellow)
  { index: 27, name: 'Ventnor Ave', type: SquareType.PROPERTY, color: PropertyColor.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], mortgageValue: 130, houseCost: 150 },
  // 28 - Water Works
  { index: 28, name: 'Water Works', type: SquareType.UTILITY, color: PropertyColor.UTILITY, price: 150, mortgageValue: 75 },
  // 29 - Marvin Gardens (Yellow)
  { index: 29, name: 'Marvin Gardens', type: SquareType.PROPERTY, color: PropertyColor.YELLOW, price: 280, rent: [24, 120, 360, 850, 1025, 1200], mortgageValue: 140, houseCost: 150 },
  // 30 - Go To Jail
  { index: 30, name: 'Go To Jail', type: SquareType.GO_TO_JAIL },
  // 31 - Pacific Avenue (Green)
  { index: 31, name: 'Pacific Ave', type: SquareType.PROPERTY, color: PropertyColor.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], mortgageValue: 150, houseCost: 200 },
  // 32 - North Carolina Avenue (Green)
  { index: 32, name: 'North Carolina Ave', type: SquareType.PROPERTY, color: PropertyColor.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], mortgageValue: 150, houseCost: 200 },
  // 33 - Community Chest
  { index: 33, name: 'Community Chest', type: SquareType.COMMUNITY_CHEST },
  // 34 - Pennsylvania Avenue (Green)
  { index: 34, name: 'Pennsylvania Ave', type: SquareType.PROPERTY, color: PropertyColor.GREEN, price: 320, rent: [28, 150, 450, 1000, 1200, 1400], mortgageValue: 160, houseCost: 200 },
  // 35 - Short Line Railroad
  { index: 35, name: 'Short Line', type: SquareType.RAILROAD, color: PropertyColor.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  // 36 - Chance
  { index: 36, name: 'Chance', type: SquareType.CHANCE },
  // 37 - Park Place (Dark Blue)
  { index: 37, name: 'Park Place', type: SquareType.PROPERTY, color: PropertyColor.DARK_BLUE, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], mortgageValue: 175, houseCost: 200 },
  // 38 - Luxury Tax
  { index: 38, name: 'Luxury Tax', type: SquareType.TAX, price: 100 },
  // 39 - Boardwalk (Dark Blue)
  { index: 39, name: 'Boardwalk', type: SquareType.PROPERTY, color: PropertyColor.DARK_BLUE, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], mortgageValue: 200, houseCost: 200 }
];

export const BOARD_SIZE = 40;

// Property color hex map
export const PROPERTY_COLOR_MAP: Record<PropertyColor, string> = {
  [PropertyColor.BROWN]: '#8B4513',
  [PropertyColor.LIGHT_BLUE]: '#87CEEB',
  [PropertyColor.PINK]: '#FF69B4',
  [PropertyColor.ORANGE]: '#FFA500',
  [PropertyColor.RED]: '#FF0000',
  [PropertyColor.YELLOW]: '#FFD700',
  [PropertyColor.GREEN]: '#008000',
  [PropertyColor.DARK_BLUE]: '#00008B',
  [PropertyColor.RAILROAD]: '#333333',
  [PropertyColor.UTILITY]: '#808080'
};

// Player colors for tokens
export const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];

// Square type emoji/icons
export const SQUARE_ICONS: Record<string, string> = {
  GO: '➡️',
  JAIL: '🔒',
  FREE_PARKING: '🅿️',
  GO_TO_JAIL: '👮',
  CHANCE: '❓',
  COMMUNITY_CHEST: '📦',
  TAX: '💰',
  RAILROAD: '🚂',
  UTILITY: '⚡',
  PROPERTY: '🏠'
};

// 11x11 grid layout mapping
// The board is a standard Monopoly ring layout:
// Bottom row (left to right): squares 0-10
// Left column (bottom to top): squares 11-19  (wait, this doesn't work with 11x11)
//
// Standard approach for an 11x11 grid:
// - Bottom row, left to right: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
// - Left column, bottom to top: 10(shared), 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
// - Top row, right to left: 20(shared), 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
// - Right column, top to bottom: 30(shared), 31, 32, 33, 34, 35, 36, 37, 38, 39, 0(shared)
//
// Each cell in the 11x11 grid has an (row, col) position.
// Corner squares are at the 4 corners.

export interface GridCell {
  row: number;
  col: number;
  squareIndex: number | null; // null = empty center
}

// Build the 11x11 grid layout
export function getBoardGrid(): (number | null)[][] {
  const grid: (number | null)[][] = Array.from({ length: 11 }, () =>
    Array.from({ length: 11 }, () => null as number | null)
  );

  // Bottom row (row=10): squares 0-10, left to right
  for (let col = 0; col <= 10; col++) {
    grid[10][col] = col; // 0-10
  }

  // Left column (col=0): squares 19 down to 10... actually:
  // Row 9 = square 19, row 8 = square 18, ... row 1 = square 11, row 0 = square 10 (corner)
  for (let row = 9; row >= 1; row--) {
    grid[row][0] = 19 - (9 - row); // 19, 18, 17, 16, 15, 14, 13, 12, 11
  }

  // Top row (row=0): squares 20-30, right to left
  // col 0 = square 20 (corner), col 1 = square 21, ... col 10 = square 30 (corner)
  for (let col = 0; col <= 10; col++) {
    grid[0][col] = 20 + col; // 20-30
  }

  // Right column (col=10): squares 39 down to 30
  // Row 0 = square 30 (corner), row 1 = square 31, ... row 9 = square 39
  for (let row = 1; row <= 9; row++) {
    grid[row][10] = 30 + row; // 31-39
  }

  return grid;
}
