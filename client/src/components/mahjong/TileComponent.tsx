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
          inline-flex items-center justify-center rounded-lg
          ${small ? 'w-8 h-10 text-xs' : 'w-12 h-16 text-sm'}
          ${className}
        `}
        style={{
          background: 'linear-gradient(145deg, #2d5a3a, #1a3d25)',
          border: '2px solid #3d7a4a',
          boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.2)'
        }}
      >
        <div className="w-3/4 h-3/4 border border-emerald-500/30 rounded-sm flex items-center justify-center">
          <span className="text-emerald-400/50 font-bold">麻</span>
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
        inline-flex flex-col items-center justify-center rounded-lg
        transition-all duration-150 select-none relative
        ${small ? 'w-8 h-10 text-xs' : 'w-12 h-16 text-sm'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
      style={{
        background: selected
          ? 'linear-gradient(145deg, #fef3c7, #fde68a)'
          : 'linear-gradient(145deg, #faf5ee, #f0e6d3)',
        border: selected ? '2px solid #f59e0b' : '2px solid #d4c5a9',
        boxShadow: selected
          ? '0 8px 16px rgba(245,158,11,0.4), inset 0 2px 4px rgba(255,255,255,0.5), 0 0 12px rgba(245,158,11,0.3)'
          : '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.1)',
        transform: selected ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
      }}
    >
      {/* 3D highlight */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg" />
      </div>

      {/* Top: number or character */}
      <span
        className={`font-bold leading-none relative z-10 ${small ? 'text-base' : 'text-xl'}`}
        style={{
          color: display.color,
          textShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}
      >
        {isDragonBai ? '□' : display.top}
      </span>

      {/* Bottom: suit label (for numbered suits) */}
      {display.bottom && (
        <span
          className={`font-medium leading-none relative z-10 ${small ? 'text-xs' : 'text-xs'}`}
          style={{
            color: display.color,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        >
          {display.bottom}
        </span>
      )}

      {/* Dragon zhong has a special red dot */}
      {isDragonZhong && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm" />
      )}

      {/* Selection glow */}
      {selected && (
        <div className="absolute inset-0 rounded-lg animate-pulse" style={{
          boxShadow: '0 0 20px rgba(245,158,11,0.5)'
        }} />
      )}
    </div>
  );
}
