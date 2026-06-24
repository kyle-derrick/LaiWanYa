import {
  BoardSquare,
  PropertyOwnership,
  MonopolyPlayerState,
  SquareType,
  BOARD_SQUARES,
  getBoardGrid,
  PROPERTY_COLOR_MAP,
  PLAYER_COLORS,
  SQUARE_ICONS
} from './types';

interface GameBoardProps {
  players: MonopolyPlayerState[];
  properties: PropertyOwnership[];
  currentPlayerId: string | null;
  onSquareClick?: (squareIndex: number) => void;
}

// Build grid layout once
const boardGrid = getBoardGrid();

// Flatten grid to list of cells for rendering
const gridCells: { row: number; col: number; squareIndex: number | null }[] = [];
for (let row = 0; row < 11; row++) {
  for (let col = 0; col < 11; col++) {
    gridCells.push({ row, col, squareIndex: boardGrid[row][col] });
  }
}

function getSquareBgColor(square: BoardSquare): string {
  if (square.color && square.type === SquareType.PROPERTY) {
    return PROPERTY_COLOR_MAP[square.color] || '#f3f4f6';
  }
  switch (square.type) {
    case SquareType.GO: return '#ffcccc';
    case SquareType.JAIL: return '#ffcc99';
    case SquareType.FREE_PARKING: return '#ccffcc';
    case SquareType.GO_TO_JAIL: return '#ccccff';
    case SquareType.CHANCE: return '#ffffcc';
    case SquareType.COMMUNITY_CHEST: return '#cce5ff';
    case SquareType.TAX: return '#f0e6d3';
    case SquareType.RAILROAD: return '#dddddd';
    case SquareType.UTILITY: return '#e8e8e8';
    default: return '#f3f4f6';
  }
}

function isCorner(row: number, col: number): boolean {
  return (row === 0 || row === 10) && (col === 0 || col === 10);
}

function isEdge(row: number, col: number): boolean {
  return row === 0 || row === 10 || col === 0 || col === 10;
}

export default function GameBoard({
  players,
  properties,
  currentPlayerId,
  onSquareClick
}: GameBoardProps) {
  // Build a map of squareIndex -> ownership
  const ownershipMap = new Map<number, PropertyOwnership>();
  for (const prop of properties) {
    ownershipMap.set(prop.squareIndex, prop);
  }

  // Build a map of squareIndex -> player[]
  const playerPositionMap = new Map<number, MonopolyPlayerState[]>();
  for (const player of players) {
    if (!player.isBankrupt) {
      const existing = playerPositionMap.get(player.position) || [];
      existing.push(player);
      playerPositionMap.set(player.position, existing);
    }
  }

  // Determine which border each non-corner edge cell needs
  // Top row (row=0): bottom border
  // Bottom row (row=10): top border
  // Left col (col=0): right border
  // Right col (col=10): left border
  function getCellBorder(row: number, col: number): string {
    if (!isEdge(row, col)) return '';
    if (isCorner(row, col)) return 'border border-gray-400';
    if (row === 0) return 'border-b border-r border-l border-gray-400';
    if (row === 10) return 'border-t border-r border-l border-gray-400';
    if (col === 0) return 'border-t border-r border-b border-gray-400';
    if (col === 10) return 'border-t border-l border-b border-gray-400';
    return '';
  }

  return (
    <div className="bg-green-100 rounded-lg p-2 shadow-lg">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: 'repeat(11, 1fr)',
          gridTemplateRows: 'repeat(11, 1fr)',
          width: '100%',
          maxWidth: '700px',
          margin: '0 auto',
          aspectRatio: '1 / 1'
        }}
      >
        {gridCells.map(({ row, col, squareIndex }) => {
          if (squareIndex === null) {
            // Center area - show game title / free parking pot
            return (
              <div
                key={`${row}-${col}`}
                className="bg-green-200 flex items-center justify-center"
                style={{ gridRow: row + 1, gridColumn: col + 1 }}
              >
                {row === 5 && col === 5 && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-800">大富翁</div>
                    <div className="text-xs text-green-600">MONOPOLY</div>
                  </div>
                )}
              </div>
            );
          }

          const square = BOARD_SQUARES[squareIndex];
          const isCornerCell = isCorner(row, col);
          const bgColor = getSquareBgColor(square);
          const ownership = ownershipMap.get(squareIndex);
          const playersHere = playerPositionMap.get(squareIndex) || [];

          // Color strip position
          const showColorStrip = square.type === SquareType.PROPERTY || square.type === SquareType.RAILROAD || square.type === SquareType.UTILITY;
          let stripClass = '';
          if (showColorStrip) {
            if (row === 10) stripClass = 'border-t-4';
            else if (row === 0) stripClass = 'border-b-4';
            else if (col === 0) stripClass = 'border-r-4';
            else if (col === 10) stripClass = 'border-l-4';
          }

          const borderColor = square.color ? PROPERTY_COLOR_MAP[square.color] : 'transparent';

          return (
            <div
              key={`${row}-${col}`}
              className={`${getCellBorder(row, col)} relative flex flex-col items-center justify-center cursor-pointer hover:brightness-90 transition-all overflow-hidden ${stripClass}`}
              style={{
                gridRow: row + 1,
                gridColumn: col + 1,
                backgroundColor: bgColor,
                borderInlineColor: showColorStrip ? borderColor : undefined,
                ...(showColorStrip && row === 10 ? { borderTopColor: borderColor } : {}),
                ...(showColorStrip && row === 0 ? { borderBottomColor: borderColor } : {}),
                ...(showColorStrip && col === 0 ? { borderRightColor: borderColor } : {}),
                ...(showColorStrip && col === 10 ? { borderLeftColor: borderColor } : {})
              }}
              onClick={() => onSquareClick?.(squareIndex)}
              title={`${square.name}${square.price ? ` - $${square.price}` : ''}`}
            >
              {/* Square name */}
              <span
                className={`text-center leading-tight font-medium ${
                  isCornerCell ? 'text-[9px]' : 'text-[7px]'
                } truncate w-full px-0.5`}
              >
                {square.name}
              </span>

              {/* Price or icon */}
              {square.price && square.type !== SquareType.TAX && (
                <span className="text-[6px] text-gray-600">${square.price}</span>
              )}
              {square.type === SquareType.TAX && square.price && (
                <span className="text-[6px] text-red-600">-${square.price}</span>
              )}

              {/* Houses indicator */}
              {ownership && ownership.houses > 0 && (
                <div className="absolute top-0 right-0 flex">
                  {ownership.houses === 5 ? (
                    <span className="text-[8px] bg-red-600 text-white px-0.5 rounded-bl">🏨</span>
                  ) : (
                    <span className="text-[7px]">{'🏠'.repeat(ownership.houses)}</span>
                  )}
                </div>
              )}

              {/* Mortgage indicator */}
              {ownership?.isMortgaged && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">M</span>
                </div>
              )}

              {/* Owner indicator */}
              {ownership && !ownership.isMortgaged && (
                <div
                  className="absolute bottom-0 left-0 w-2 h-2 rounded-full border border-white"
                  style={{
                    backgroundColor: players.find(p => p.id === ownership.ownerId)
                      ? PLAYER_COLORS[players.findIndex(p => p.id === ownership.ownerId) % PLAYER_COLORS.length]
                      : '#9ca3af'
                  }}
                />
              )}

              {/* Player tokens */}
              {playersHere.length > 0 && (
                <div className="absolute bottom-0 right-0 flex flex-wrap gap-0 max-w-[24px]">
                  {playersHere.map((p, idx) => {
                    const pIdx = players.findIndex(pl => pl.id === p.id);
                    return (
                      <div
                        key={p.id}
                        className={`w-3 h-3 rounded-full border border-white ${
                          p.id === currentPlayerId ? 'ring-1 ring-yellow-400' : ''
                        }`}
                        style={{
                          backgroundColor: PLAYER_COLORS[pIdx % PLAYER_COLORS.length],
                          marginTop: '-2px',
                          marginLeft: idx > 0 ? '-4px' : '0'
                        }}
                        title={p.nickname || p.id}
                      />
                    );
                  })}
                </div>
              )}

              {/* Special icons for corner squares */}
              {isCornerCell && (
                <span className="text-lg absolute opacity-20">
                  {SQUARE_ICONS[square.type] || ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
