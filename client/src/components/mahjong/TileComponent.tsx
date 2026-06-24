import { Tile, TileSuit, TILE_COLORS, FENG_LABELS, JIAN_LABELS, HUA_LABELS } from './types';

interface TileComponentProps {
  tile: Tile;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
  faceDown?: boolean;
  className?: string;
}

function getTileDisplay(tile: Tile): { top: string; bottom: string; color: string } {
  const color = TILE_COLORS[tile.suit] || '#333';

  switch (tile.suit) {
    case TileSuit.WAN:
      return { top: String(tile.value), bottom: '万', color };
    case TileSuit.TIAO:
      return { top: String(tile.value), bottom: '条', color };
    case TileSuit.TONG:
      return { top: String(tile.value), bottom: '筒', color };
    case TileSuit.FENG:
      return { top: FENG_LABELS[tile.value] || '?', bottom: '风', color };
    case TileSuit.JIAN:
      return { top: JIAN_LABELS[tile.value] || '?', bottom: '', color };
    case TileSuit.HUA:
      return { top: HUA_LABELS[tile.value] || '?', bottom: '花', color };
    default:
      return { top: '?', bottom: '', color };
  }
}

export default function TileComponent({
  tile,
  onClick,
  selected = false,
  disabled = false,
  small = false,
  faceDown = false,
  className = '',
}: TileComponentProps) {
  if (faceDown) {
    return (
      <div
        className={`
          inline-flex items-center justify-center rounded-md border-2 border-emerald-800
          bg-gradient-to-br from-emerald-600 to-emerald-800
          ${small ? 'w-8 h-10 text-xs' : 'w-12 h-16 text-sm'}
          ${className}
        `}
      >
        <div className="w-3/4 h-3/4 border border-emerald-400/40 rounded-sm flex items-center justify-center">
          <span className="text-emerald-300/60 font-bold">麻</span>
        </div>
      </div>
    );
  }

  const display = getTileDisplay(tile);
  const isDragonZhong = tile.suit === TileSuit.JIAN && tile.value === 1;
  const isDragonBai = tile.suit === TileSuit.JIAN && tile.value === 3;

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        inline-flex flex-col items-center justify-center rounded-md
        border-2 transition-all duration-150 select-none
        ${small ? 'w-8 h-10 text-xs' : 'w-12 h-16 text-sm'}
        ${selected
          ? 'border-yellow-400 bg-yellow-50 -translate-y-2 shadow-lg shadow-yellow-200'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
    >
      {/* Top: number or character */}
      <span
        className={`font-bold leading-none ${small ? 'text-base' : 'text-xl'}`}
        style={{ color: display.color }}
      >
        {isDragonBai ? '□' : display.top}
      </span>

      {/* Bottom: suit label (for numbered suits) */}
      {display.bottom && (
        <span
          className={`font-medium leading-none ${small ? 'text-xs' : 'text-xs'}`}
          style={{ color: display.color }}
        >
          {display.bottom}
        </span>
      )}

      {/* Dragon zhong has a special red dot */}
      {isDragonZhong && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
      )}
    </div>
  );
}
