import { Tile } from './types';
import TileComponent from './TileComponent';

interface PlayerHandProps {
  tiles: Tile[];
  selectedTileId?: string | null;
  onTileSelect?: (tileId: string) => void;
  canDiscard?: boolean;
  isMyHand?: boolean;
  faceDown?: boolean;
  small?: boolean;
}

export default function PlayerHand({
  tiles,
  selectedTileId,
  onTileSelect,
  canDiscard = false,
  isMyHand = true,
  faceDown = false,
  small = false,
}: PlayerHandProps) {
  // Sort tiles by suit then value for display
  const sortedTiles = [...tiles].sort((a, b) => {
    const suitOrder = { wan: 0, tiao: 1, tong: 2, feng: 3, jian: 4, hua: 5 };
    const aOrder = suitOrder[a.suit as keyof typeof suitOrder] ?? 99;
    const bOrder = suitOrder[b.suit as keyof typeof suitOrder] ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.value - b.value;
  });

  return (
    <div className={`flex flex-wrap gap-1 justify-center ${small ? 'gap-0.5' : 'gap-1'}`}>
      {sortedTiles.map((tile) => (
        <TileComponent
          key={tile.id}
          tile={tile}
          selected={selectedTileId === tile.id}
          onClick={isMyHand && canDiscard ? () => onTileSelect?.(tile.id) : undefined}
          disabled={!isMyHand || !canDiscard}
          faceDown={faceDown}
          small={small}
        />
      ))}
      {sortedTiles.length === 0 && (
        <div className={`text-gray-400 ${small ? 'text-xs' : 'text-sm'}`}>
          {faceDown ? '' : '无手牌'}
        </div>
      )}
    </div>
  );
}
