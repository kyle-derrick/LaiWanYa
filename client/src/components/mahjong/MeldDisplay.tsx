import { Meld, MeldType, MELD_LABELS } from './types';
import TileComponent from './TileComponent';

interface MeldDisplayProps {
  melds: Meld[];
  small?: boolean;
}

export default function MeldDisplay({ melds, small = false }: MeldDisplayProps) {
  if (!melds || melds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {melds.map((meld, idx) => (
        <div
          key={idx}
          className={`
            inline-flex items-end gap-0.5 p-1 rounded-md
            ${meld.type === MeldType.KONG_AN ? 'bg-gray-100' : 'bg-amber-50'}
            border border-amber-200
          `}
          title={MELD_LABELS[meld.type]}
        >
          {meld.tiles.map((tile, tIdx) => (
            <TileComponent
              key={tile.id || tIdx}
              tile={tile}
              small={small}
              faceDown={meld.type === MeldType.KONG_AN && (tIdx === 0 || tIdx === 3)}
            />
          ))}
          <span className={`
            ml-1 text-xs font-medium text-amber-700 self-center
            ${small ? 'text-[10px]' : ''}
          `}>
            {MELD_LABELS[meld.type]}
          </span>
        </div>
      ))}
    </div>
  );
}
