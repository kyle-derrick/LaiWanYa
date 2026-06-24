import { UnoCard as UnoCardData, UnoColor, UnoCardType } from '../types';

interface UnoCardProps {
  card: UnoCardData;
  isPlayable: boolean;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  [UnoColor.RED]: '#ef4444',
  [UnoColor.YELLOW]: '#eab308',
  [UnoColor.GREEN]: '#22c55e',
  [UnoColor.BLUE]: '#3b82f6',
  [UnoColor.WILD]: '#6b7280',
};

const typeSymbolMap: Record<string, string> = {
  [UnoCardType.SKIP]: '⊘',
  [UnoCardType.REVERSE]: '⟲',
  [UnoCardType.DRAW_TWO]: '+2',
  [UnoCardType.WILD]: '🌈',
  [UnoCardType.WILD_DRAW_FOUR]: '+4',
};

export default function UnoCard({ card, isPlayable, onClick }: UnoCardProps) {
  const backgroundColor = colorMap[card.color] || '#6b7280';
  const symbol =
    card.type === UnoCardType.NUMBER
      ? card.value?.toString() || '0'
      : typeSymbolMap[card.type] || '?';

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable}
      className={`relative w-16 h-24 rounded-lg shadow-md flex flex-col items-center justify-center text-white font-bold transition-all ${
        isPlayable
          ? 'hover:scale-110 hover:shadow-lg cursor-pointer'
          : 'cursor-default opacity-90'
      }`}
      style={{ backgroundColor }}
    >
      <div className="absolute inset-1 border-2 border-white rounded-md" />
      <span className="text-2xl z-10">{symbol}</span>
      {card.type !== UnoCardType.NUMBER && (
        <span className="text-xs mt-1 z-10">
          {card.type === UnoCardType.SKIP
            ? 'Skip'
            : card.type === UnoCardType.REVERSE
            ? 'Reverse'
            : card.type === UnoCardType.DRAW_TWO
            ? 'Draw 2'
            : card.type === UnoCardType.WILD
            ? 'Wild'
            : 'Wild +4'}
        </span>
      )}
    </button>
  );
}
