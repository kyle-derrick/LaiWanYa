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
      className={`flex items-center gap-2 p-2.5 rounded-xl backdrop-blur-sm transition-all duration-300 ${
        isBankrupt
          ? 'opacity-40 grayscale'
          : ''
      }`}
      style={{
        background: isCurrentPlayer
          ? 'linear-gradient(145deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        border: isCurrentPlayer
          ? '1px solid rgba(99,102,241,0.5)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isCurrentPlayer
          ? '0 0 16px rgba(99,102,241,0.15), inset 0 1px 1px rgba(255,255,255,0.05)'
          : 'inset 0 1px 1px rgba(255,255,255,0.03)'
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
        style={{
          backgroundColor: isBankrupt ? '#4b5563' : color,
          boxShadow: isCurrentPlayer && !isBankrupt ? `0 0 10px ${color}60` : 'none'
        }}
      >
        {nickname.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrentPlayer ? 'text-blue-300' : isBankrupt ? 'text-gray-500' : 'text-gray-200'}`}>
          {nickname}
          {isInJail && ' 🚔'}
          {isBankrupt && ' 💀'}
        </p>
        <p className={`text-xs font-medium ${isBankrupt ? 'text-gray-600' : 'text-amber-400/80'}`}>${money.toLocaleString()}</p>
      </div>
    </div>
  );
}
