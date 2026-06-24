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
    return PROPERTY_COLOR_MAP[square.color] || '#2d2d2d';
  }
  switch (square.type) {
    case SquareType.GO: return '#4a1a1a';
    case SquareType.JAIL: return '#3d2e1a';
    case SquareType.FREE_PARKING: return '#1a3d1a';
    case SquareType.GO_TO_JAIL: return '#1a1a4a';
    case SquareType.CHANCE: return '#3d3d1a';
    case SquareType.COMMUNITY_CHEST: return '#1a2d4a';
    case SquareType.TAX: return '#3d2a1a';
    case SquareType.RAILROAD: return '#2a2a2a';
    case SquareType.UTILITY: return '#333333';
    default: return '#2d2d2d';
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

  function getCellBorder(row: number, col: number): string {
    if (!isEdge(row, col)) return '';
    if (isCorner(row, col)) return 'border border-amber-800/60';
    if (row === 0) return 'border-b border-r border-l border-amber-800/60';
    if (row === 10) return 'border-t border-r border-l border-amber-800/60';
    if (col === 0) return 'border-t border-r border-b border-amber-800/60';
    if (col === 10) return 'border-t border-l border-b border-amber-800/60';
    return '';
  }

  return (
    <div className="rounded-xl p-3 shadow-2xl" style={{
      background: 'linear-gradient(145deg, #1a3a1a, #0d260d)',
      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4), 0 10px 40px rgba(0,0,0,0.6)'
    }}>
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
            return (
              <div
                key={`${row}-${col}`}
                className="flex items-center justify-center"
                style={{
                  gridRow: row + 1,
                  gridColumn: col + 1,
                  background: 'radial-gradient(circle, #1a3a1a 0%, #0d1f0d 100%)'
                }}
              >
                {row === 5 && col === 5 && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-300 drop-shadow-lg">大富翁</div>
                    <div className="text-xs text-amber-500/70 font-medium tracking-widest">MONOPOLY</div>
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
              className={`${getCellBorder(row, col)} relative flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${stripClass}`}
              style={{
                gridRow: row + 1,
                gridColumn: col + 1,
                backgroundColor: bgColor,
                borderInlineColor: showColorStrip ? borderColor : undefined,
                ...(showColorStrip && row === 10 ? { borderTopColor: borderColor } : {}),
                ...(showColorStrip && row === 0 ? { borderBottomColor: borderColor } : {}),
                ...(showColorStrip && col === 0 ? { borderRightColor: borderColor } : {}),
                ...(showColorStrip && col === 10 ? { borderLeftColor: borderColor } : {}),
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -1px 2px rgba(0,0,0,0.3)'
              }}
              onClick={() => onSquareClick?.(squareIndex)}
              title={`${square.name}${square.price ? ` - $${square.price}` : ''}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.2)';
                e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.1), 0 0 8px rgba(255,215,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = '';
                e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -1px 2px rgba(0,0,0,0.3)';
              }}
            >
              {/* Square name */}
              <span
                className={`text-center leading-tight font-medium text-gray-200 ${
                  isCornerCell ? 'text-[9px]' : 'text-[7px]'
                } truncate w-full px-0.5`}
              >
                {square.name}
              </span>

              {/* Price or icon */}
              {square.price && square.type !== SquareType.TAX && (
                <span className="text-[6px] text-amber-400/80 font-medium">${square.price}</span>
              )}
              {square.type === SquareType.TAX && square.price && (
                <span className="text-[6px] text-red-400 font-medium">-${square.price}</span>
              )}

              {/* Houses indicator */}
              {ownership && ownership.houses > 0 && (
                <div className="absolute top-0 right-0 flex">
                  {ownership.houses === 5 ? (
                    <span className="text-[8px] bg-red-600 text-white px-0.5 rounded-bl shadow-sm">🏨</span>
                  ) : (
                    <span className="text-[7px]">{'🏠'.repeat(ownership.houses)}</span>
                  )}
                </div>
              )}

              {/* Mortgage indicator */}
              {ownership?.isMortgaged && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="text-[8px] text-red-300 font-bold">M</span>
                </div>
              )}

              {/* Owner indicator */}
              {ownership && !ownership.isMortgaged && (
                <div
                  className="absolute bottom-0 left-0 w-2 h-2 rounded-full border border-white/50"
                  style={{
                    backgroundColor: players.find(p => p.id === ownership.ownerId)
                      ? PLAYER_COLORS[players.findIndex(p => p.id === ownership.ownerId) % PLAYER_COLORS.length]
                      : '#9ca3af',
                    boxShadow: '0 0 4px rgba(0,0,0,0.5)'
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
                        className={`w-3 h-3 rounded-full border border-white/70 ${
                          p.id === currentPlayerId ? 'ring-1 ring-yellow-400 animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: PLAYER_COLORS[pIdx % PLAYER_COLORS.length],
                          marginTop: '-2px',
                          marginLeft: idx > 0 ? '-4px' : '0',
                          boxShadow: p.id === currentPlayerId
                            ? '0 0 6px rgba(255,215,0,0.8), 0 0 12px rgba(255,215,0,0.4)'
                            : '0 1px 3px rgba(0,0,0,0.5)'
                        }}
                        title={p.nickname || p.id}
                      />
                    );
                  })}
                </div>
              )}

              {/* Special icons for corner squares */}
              {isCornerCell && (
                <span className="text-lg absolute opacity-30 drop-shadow-lg">
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
