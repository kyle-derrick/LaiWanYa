import { PropertyOwnership, PropertyColor } from '../../types';

interface PropertyCardProps {
  squareIndex: number;
  name: string;
  color?: PropertyColor;
  price?: number;
  ownership?: PropertyOwnership;
  isOwnedByMe: boolean;
  onBuildHouse?: () => void;
  onSellHouse?: () => void;
  onMortgage?: () => void;
  onUnmortgage?: () => void;
  canBuild?: boolean;
  canSell?: boolean;
  canMortgage?: boolean;
  canUnmortgage?: boolean;
}

const colorMap: Record<PropertyColor, string> = {
  [PropertyColor.BROWN]: '#8B4513',
  [PropertyColor.LIGHT_BLUE]: '#87CEEB',
  [PropertyColor.PINK]: '#FF69B4',
  [PropertyColor.ORANGE]: '#FFA500',
  [PropertyColor.RED]: '#FF0000',
  [PropertyColor.YELLOW]: '#FFD700',
  [PropertyColor.GREEN]: '#008000',
  [PropertyColor.DARK_BLUE]: '#00008B',
  [PropertyColor.RAILROAD]: '#555555',
  [PropertyColor.UTILITY]: '#808080'
};

export default function PropertyCard({
  name,
  color,
  price,
  ownership,
  isOwnedByMe,
  onBuildHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
  canBuild,
  canSell,
  canMortgage,
  canUnmortgage
}: PropertyCardProps) {
  const bgColor = color ? colorMap[color] : '#2d2d2d';
  const houses = ownership?.houses || 0;
  const isMortgaged = ownership?.isMortgaged || false;

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
        isMortgaged ? 'border-red-500/30 opacity-80' : 'border-white/[0.08]'
      } ${isOwnedByMe ? 'ring-2 ring-amber-400/60' : ''}`}
      style={{
        background: isMortgaged
          ? 'linear-gradient(145deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.06)'
      }}
    >
      {/* Color bar */}
      {color && (
        <div
          className="h-3 rounded-t-lg -mt-4 -mx-4 mb-3"
          style={{
            backgroundColor: bgColor,
            boxShadow: `0 2px 8px ${bgColor}40`
          }}
        />
      )}

      {/* Property name */}
      <h4 className="font-bold text-sm mb-2 text-amber-100">{name}</h4>

      {/* Price */}
      {price && (
        <p className="text-xs text-amber-400/80 mb-2 font-medium">${price}</p>
      )}

      {/* Houses indicator */}
      {ownership && houses > 0 && (
        <div className="flex gap-1 mb-2">
          {houses === 5 ? (
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-md font-bold shadow-sm">🏨 HOTEL</span>
          ) : (
            Array.from({ length: houses }).map((_, i) => (
              <span key={i} className="text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded-md shadow-sm">🏠</span>
            ))
          )}
        </div>
      )}

      {/* Mortgage indicator */}
      {isMortgaged && (
        <p className="text-xs text-red-400 font-bold mb-2 flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          MORTGAGED
        </p>
      )}

      {/* Action buttons for owned properties */}
      {isOwnedByMe && ownership && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {canBuild && onBuildHouse && (
            <button
              onClick={onBuildHouse}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                boxShadow: '0 2px 10px rgba(34,197,94,0.25), inset 0 1px 1px rgba(255,255,255,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: 'white'
              }}
            >
              Build
            </button>
          )}
          {canSell && onSellHouse && (
            <button
              onClick={onSellHouse}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(145deg, #eab308, #ca8a04)',
                boxShadow: '0 2px 10px rgba(234,179,8,0.25), inset 0 1px 1px rgba(255,255,255,0.15)',
                border: '1px solid rgba(234,179,8,0.3)',
                color: 'white'
              }}
            >
              Sell
            </button>
          )}
          {canMortgage && onMortgage && (
            <button
              onClick={onMortgage}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(145deg, #f97316, #ea580c)',
                boxShadow: '0 2px 10px rgba(249,115,22,0.25), inset 0 1px 1px rgba(255,255,255,0.15)',
                border: '1px solid rgba(249,115,22,0.3)',
                color: 'white'
              }}
            >
              Mortgage
            </button>
          )}
          {canUnmortgage && onUnmortgage && (
            <button
              onClick={onUnmortgage}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
                boxShadow: '0 2px 10px rgba(59,130,246,0.25), inset 0 1px 1px rgba(255,255,255,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: 'white'
              }}
            >
              Unmortgage
            </button>
          )}
        </div>
      )}
    </div>
  );
}
