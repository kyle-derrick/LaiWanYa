import { BoardSquare, PropertyOwnership, PropertyColor, SquareType } from './types';
import { BOARD_SQUARES, getPropertyGroup, getRailroads, getUtilities } from './Board';

export function calculateRent(
  square: BoardSquare,
  ownership: PropertyOwnership,
  diceTotal: number,
  allOwnerships: PropertyOwnership[]
): number {
  if (ownership.isMortgaged) return 0;

  // Railroad: 25 * 2^(n-1) where n = number of railroads owned
  if (square.type === SquareType.RAILROAD) {
    const railroadCount = countOwnedInGroup(ownership.ownerId, PropertyColor.RAILROAD, allOwnerships);
    return 25 * Math.pow(2, railroadCount - 1);
  }

  // Utility: 4x dice if 1 owned, 10x dice if both owned
  if (square.type === SquareType.UTILITY) {
    const utilityCount = countOwnedInGroup(ownership.ownerId, PropertyColor.UTILITY, allOwnerships);
    return diceTotal * (utilityCount === 1 ? 4 : 10);
  }

  // Regular property
  if (!square.rent) return 0;

  // If has hotel (5 houses)
  if (ownership.houses === 5) {
    return square.rent[5];
  }

  // If has houses
  if (ownership.houses > 0) {
    return square.rent[ownership.houses];
  }

  // Base rent - doubled if owner has full color group
  const baseRent = square.rent[0];
  if (square.color && ownsFullGroup(ownership.ownerId, square.color, allOwnerships)) {
    return baseRent * 2;
  }

  return baseRent;
}

export function ownsFullGroup(
  playerId: string,
  color: PropertyColor,
  allOwnerships: PropertyOwnership[]
): boolean {
  const groupSquares = getPropertyGroup(color);
  return groupSquares.every(square =>
    allOwnerships.some(o => o.squareIndex === square.index && o.ownerId === playerId)
  );
}

export function canBuildHouse(
  playerId: string,
  squareIndex: number,
  allOwnerships: PropertyOwnership[]
): boolean {
  const square = BOARD_SQUARES[squareIndex];
  if (!square || square.type !== SquareType.PROPERTY || !square.color) return false;

  const ownership = allOwnerships.find(o => o.squareIndex === squareIndex);
  if (!ownership || ownership.ownerId !== playerId || ownership.isMortgaged) return false;

  // Must own full color group
  if (!ownsFullGroup(playerId, square.color, allOwnerships)) return false;

  // Can't build more than 5 houses (hotel)
  if (ownership.houses >= 5) return false;

  // Must build evenly - can't have more than 1 house difference within group
  const groupSquares = getPropertyGroup(square.color);
  const groupOwnerships = groupSquares.map(s =>
    allOwnerships.find(o => o.squareIndex === s.index)
  ).filter(Boolean) as PropertyOwnership[];

  const minHouses = Math.min(...groupOwnerships.map(o => o.houses));
  if (ownership.houses > minHouses) return false;

  return true;
}

export function canSellHouse(
  playerId: string,
  squareIndex: number,
  allOwnerships: PropertyOwnership[]
): boolean {
  const square = BOARD_SQUARES[squareIndex];
  if (!square || square.type !== SquareType.PROPERTY || !square.color) return false;

  const ownership = allOwnerships.find(o => o.squareIndex === squareIndex);
  if (!ownership || ownership.ownerId !== playerId) return false;

  if (ownership.houses <= 0) return false;

  // Must sell evenly
  const groupSquares = getPropertyGroup(square.color);
  const groupOwnerships = groupSquares.map(s =>
    allOwnerships.find(o => o.squareIndex === s.index)
  ).filter(Boolean) as PropertyOwnership[];

  const maxHouses = Math.max(...groupOwnerships.map(o => o.houses));
  if (ownership.houses < maxHouses) return false;

  return true;
}

export function canMortgage(
  playerId: string,
  squareIndex: number,
  allOwnerships: PropertyOwnership[]
): boolean {
  const ownership = allOwnerships.find(o => o.squareIndex === squareIndex);
  if (!ownership || ownership.ownerId !== playerId || ownership.isMortgaged) return false;

  // Can't mortgage if any property in the group has houses
  const square = BOARD_SQUARES[squareIndex];
  if (square.color) {
    const groupSquares = getPropertyGroup(square.color);
    const hasHouses = groupSquares.some(s => {
      const o = allOwnerships.find(own => own.squareIndex === s.index);
      return o && o.houses > 0;
    });
    if (hasHouses) return false;
  }

  return true;
}

export function canUnmortgage(
  playerId: string,
  squareIndex: number,
  allOwnerships: PropertyOwnership[]
): boolean {
  const ownership = allOwnerships.find(o => o.squareIndex === squareIndex);
  if (!ownership || ownership.ownerId !== playerId || !ownership.isMortgaged) return false;
  return true;
}

function countOwnedInGroup(
  playerId: string,
  color: PropertyColor,
  allOwnerships: PropertyOwnership[]
): number {
  let squares: BoardSquare[];

  if (color === PropertyColor.RAILROAD) {
    squares = getRailroads();
  } else if (color === PropertyColor.UTILITY) {
    squares = getUtilities();
  } else {
    squares = getPropertyGroup(color);
  }

  return squares.filter(s =>
    allOwnerships.some(o => o.squareIndex === s.index && o.ownerId === playerId)
  ).length;
}
