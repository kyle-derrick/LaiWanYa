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
  [PropertyColor.RAILROAD]: '#000000',
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
  const bgColor = color ? colorMap[color] : '#f3f4f6';
  const houses = ownership?.houses || 0;
  const isMortgaged = ownership?.isMortgaged || false;

  return (
    <div
      className={`relative p-3 rounded-lg border-2 ${
        isMortgaged ? 'border-red-400 opacity-70' : 'border-gray-200'
      } ${isOwnedByMe ? 'ring-2 ring-blue-400' : ''}`}
      style={{ backgroundColor: isMortgaged ? '#fef2f2' : '#ffffff' }}
    >
      {/* Color bar */}
      {color && (
        <div
          className="h-2 rounded-t-md -mt-3 -mx-3 mb-2"
          style={{ backgroundColor: bgColor }}
        />
      )}

      {/* Property name */}
      <h4 className="font-semibold text-sm mb-1">{name}</h4>

      {/* Price */}
      {price && (
        <p className="text-xs text-gray-500 mb-1">${price}</p>
      )}

      {/* Houses indicator */}
      {ownership && houses > 0 && (
        <div className="flex gap-1 mb-1">
          {houses === 5 ? (
            <span className="text-xs bg-red-500 text-white px-1 rounded">HOTEL</span>
          ) : (
            Array.from({ length: houses }).map((_, i) => (
              <span key={i} className="text-xs bg-green-500 text-white px-1 rounded">🏠</span>
            ))
          )}
        </div>
      )}

      {/* Mortgage indicator */}
      {isMortgaged && (
        <p className="text-xs text-red-500 font-medium">MORTGAGED</p>
      )}

      {/* Action buttons for owned properties */}
      {isOwnedByMe && ownership && (
        <div className="flex flex-wrap gap-1 mt-2">
          {canBuild && onBuildHouse && (
            <button
              onClick={onBuildHouse}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              Build
            </button>
          )}
          {canSell && onSellHouse && (
            <button
              onClick={onSellHouse}
              className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Sell
            </button>
          )}
          {canMortgage && onMortgage && (
            <button
              onClick={onMortgage}
              className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Mortgage
            </button>
          )}
          {canUnmortgage && onUnmortgage && (
            <button
              onClick={onUnmortgage}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Unmortgage
            </button>
          )}
        </div>
      )}
    </div>
  );
}
