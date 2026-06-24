interface PlayerTokenProps {
  nickname: string;
  color: string;
  money: number;
  isCurrentPlayer: boolean;
  isBankrupt: boolean;
  isInJail: boolean;
}

export default function PlayerToken({
  nickname,
  color,
  money,
  isCurrentPlayer,
  isBankrupt,
  isInJail
}: PlayerTokenProps) {
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-md ${
        isBankrupt
          ? 'bg-gray-200 opacity-50'
          : isCurrentPlayer
          ? 'bg-blue-100 border-2 border-blue-500'
          : 'bg-gray-50'
      }`}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: isBankrupt ? '#9ca3af' : color }}
      >
        {nickname.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {nickname}
          {isInJail && ' 🚔'}
          {isBankrupt && ' 💀'}
        </p>
        <p className="text-xs text-gray-500">${money.toLocaleString()}</p>
      </div>
    </div>
  );
}
