import { UnoCard as UnoCardData, UnoColor, UnoCardType } from '../types';

interface UnoCardProps {
  card: UnoCardData;
  isPlayable: boolean;
  onClick?: () => void;
  large?: boolean;
}

const colorMap: Record<string, { bg: string; gradient: string; shadow: string }> = {
  [UnoColor.RED]: {
    bg: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
    shadow: '0 4px 15px rgba(239, 68, 68, 0.5)',
  },
  [UnoColor.YELLOW]: {
    bg: '#ca8a04',
    gradient: 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%)',
    shadow: '0 4px 15px rgba(234, 179, 8, 0.5)',
  },
  [UnoColor.GREEN]: {
    bg: '#16a34a',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
    shadow: '0 4px 15px rgba(34, 197, 94, 0.5)',
  },
  [UnoColor.BLUE]: {
    bg: '#2563eb',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
    shadow: '0 4px 15px rgba(59, 130, 246, 0.5)',
  },
  [UnoColor.WILD]: {
    bg: '#1f2937',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #eab308 25%, #22c55e 50%, #3b82f6 75%, #ef4444 100%)',
    shadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
  },
};

const typeSymbolMap: Record<string, string> = {
  [UnoCardType.SKIP]: '⊘',
  [UnoCardType.REVERSE]: '⟲',
  [UnoCardType.DRAW_TWO]: '+2',
  [UnoCardType.WILD]: '★',
  [UnoCardType.WILD_DRAW_FOUR]: '+4',
};

const typeLabelMap: Record<string, string> = {
  [UnoCardType.SKIP]: 'Skip',
  [UnoCardType.REVERSE]: 'Reverse',
  [UnoCardType.DRAW_TWO]: 'Draw 2',
  [UnoCardType.WILD]: 'Wild',
  [UnoCardType.WILD_DRAW_FOUR]: 'Wild +4',
};

export default function UnoCard({ card, isPlayable, onClick, large = false }: UnoCardProps) {
  const colorInfo = colorMap[card.color] || colorMap[UnoColor.WILD];
  const symbol =
    card.type === UnoCardType.NUMBER
      ? card.value?.toString() || '0'
      : typeSymbolMap[card.type] || '?';

  const sizeClass = large ? 'w-28 h-40' : 'w-20 h-28';
  const symbolSize = large ? 'text-5xl' : 'text-2xl';
  const labelSize = large ? 'text-sm' : 'text-[10px]';
  const ovalInset = large ? 'inset-2' : 'inset-1';

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable}
      className={`relative ${sizeClass} rounded-xl flex flex-col items-center justify-center text-white font-black
        transition-all duration-200 ease-out select-none
        ${isPlayable
          ? 'hover:-translate-y-3 hover:scale-110 cursor-pointer active:scale-95'
          : 'cursor-default opacity-85'
        }
      `}
      style={{
        background: colorInfo.gradient,
        boxShadow: isPlayable ? colorInfo.shadow : '0 2px 8px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255,255,255,0.3)',
      }}
    >
      {/* Inner white oval border */}
      <div
        className={`absolute ${ovalInset} rounded-[40%] border-[3px] border-white/80 pointer-events-none`}
        style={{ borderRadius: '45% 45% 47% 47%' }}
      />

      {/* Diagonal white stripe for non-number cards */}
      {card.type !== UnoCardType.NUMBER && (
        <div
          className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[40%] bg-white/15 pointer-events-none"
          style={{ borderRadius: '50%', transform: 'translateY(-50%) rotate(-20deg)' }}
        />
      )}

      {/* Symbol */}
      <span className={`${symbolSize} z-10 drop-shadow-md leading-none`}>
        {symbol}
      </span>

      {/* Label for action cards */}
      {card.type !== UnoCardType.NUMBER && (
        <span className={`${labelSize} mt-1 z-10 font-semibold tracking-wide opacity-90`}>
          {typeLabelMap[card.type]}
        </span>
      )}

      {/* Corner indicators */}
      <span className={`absolute top-1 left-1.5 ${large ? 'text-xs' : 'text-[8px]'} font-bold opacity-70`}>
        {symbol}
      </span>
      <span className={`absolute bottom-1 right-1.5 ${large ? 'text-xs' : 'text-[8px]'} font-bold opacity-70 rotate-180`}>
        {symbol}
      </span>

      {/* Glow effect when playable */}
      {isPlayable && (
        <div className="absolute -inset-1 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `0 0 20px ${colorInfo.shadow.match(/rgba.*\)/)?.[0] || 'transparent'}` }}
        />
      )}
    </button>
  );
}
