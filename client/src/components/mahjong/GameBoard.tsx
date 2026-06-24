import { MahjongPlayerState, WindDirection, WIND_LABELS, PLAYER_COLORS, Tile, Meld } from './types';
import TileComponent from './TileComponent';
import PlayerHand from './PlayerHand';
import MeldDisplay from './MeldDisplay';

interface GameBoardProps {
  players: MahjongPlayerState[];
  myPlayerId: string;
  currentPlayerId: string | null;
  wallCount: number;
  roundWind: WindDirection;
  lastDiscard: Tile | null;
  lastDiscardPlayerId: string | null;
  selectedTileId: string | null;
  canDiscard: boolean;
  onTileSelect: (tileId: string) => void;
  myHand: Tile[];
  myMelds: Meld[];
}

// Get the relative position of players (self at bottom, others around)
function getRelativePositions(players: MahjongPlayerState[], myPlayerId: string) {
  const myIdx = players.findIndex(p => p.id === myPlayerId);
  if (myIdx === -1) return { bottom: null, right: null, top: null, left: null };

  // In mahjong, positions are relative to the viewer:
  // bottom = self, right = next player, top = opposite, left = previous
  const n = players.length;
  return {
    bottom: players[myIdx],
    right: players[(myIdx + 1) % n],
    top: players[(myIdx + 2) % n],
    left: players[(myIdx + 3) % n],
  };
}

interface OpponentAreaProps {
  player: MahjongPlayerState;
  position: 'top' | 'left' | 'right';
  isCurrentPlayer: boolean;
  color: string;
  lastDiscardPlayerId: string | null;
}

function OpponentArea({ player, position, isCurrentPlayer, color, lastDiscardPlayerId }: OpponentAreaProps) {
  const isVertical = position === 'left' || position === 'right';
  const windLabel = WIND_LABELS[player.wind] || player.wind;

  return (
    <div className={`
      flex flex-col items-center gap-1 p-2 rounded-lg
      ${isCurrentPlayer ? 'bg-emerald-800/40 ring-2 ring-yellow-400' : 'bg-emerald-900/20'}
      ${isVertical ? 'min-w-[80px]' : 'min-w-[120px]'}
    `}>
      {/* Player info */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-white truncate max-w-[80px]">
          {player.nickname || player.id.substring(0, 6)}
        </span>
        <span className="text-xs text-emerald-300">{windLabel}</span>
      </div>

      {/* Hand (face down) */}
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-0.5`}>
        {player.hand.map((tile, idx) => (
          <TileComponent key={tile.id || idx} tile={tile} faceDown small />
        ))}
      </div>

      {/* Melds */}
      {player.melds.length > 0 && (
        <MeldDisplay melds={player.melds} small />
      )}

      {/* Discards */}
      {player.discards.length > 0 && (
        <div className="flex flex-wrap gap-0.5 max-w-[120px]">
          {player.discards.slice(-6).map((tile, idx) => (
            <TileComponent
              key={tile.id || idx}
              tile={tile}
              small
              className={lastDiscardPlayerId === player.id && idx === player.discards.slice(-6).length - 1 ? 'ring-2 ring-yellow-400' : ''}
            />
          ))}
        </div>
      )}

      {/* Score */}
      <span className="text-xs text-emerald-300">分: {player.score}</span>
    </div>
  );
}

export default function GameBoard({
  players,
  myPlayerId,
  currentPlayerId,
  wallCount,
  roundWind,
  lastDiscard,
  lastDiscardPlayerId,
  selectedTileId,
  canDiscard,
  onTileSelect,
  myHand,
  myMelds,
}: GameBoardProps) {
  const positions = getRelativePositions(players, myPlayerId);
  const roundWindLabel = WIND_LABELS[roundWind] || roundWind;

  return (
    <div className="relative w-full aspect-square max-w-[700px] mx-auto">
      {/* Table background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 rounded-2xl border-4 border-emerald-600 shadow-2xl overflow-hidden">
        {/* Table texture */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Center info */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-emerald-900/60 rounded-xl p-4 text-center backdrop-blur-sm border border-emerald-600/30">
            <div className="text-yellow-300 text-2xl font-bold mb-1">
              {roundWindLabel}风局
            </div>
            <div className="text-emerald-200 text-sm">
              余牌: <span className="font-bold text-white">{wallCount}</span>
            </div>
            {lastDiscard && (
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="text-xs text-emerald-300">最后出牌:</span>
                <TileComponent tile={lastDiscard} small />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top player (opposite) */}
      {positions.top && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <OpponentArea
            player={positions.top}
            position="top"
            isCurrentPlayer={positions.top.id === currentPlayerId}
            color={PLAYER_COLORS[players.indexOf(positions.top) % PLAYER_COLORS.length]}
            lastDiscardPlayerId={lastDiscardPlayerId}
          />
        </div>
      )}

      {/* Left player */}
      {positions.left && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <OpponentArea
            player={positions.left}
            position="left"
            isCurrentPlayer={positions.left.id === currentPlayerId}
            color={PLAYER_COLORS[players.indexOf(positions.left) % PLAYER_COLORS.length]}
            lastDiscardPlayerId={lastDiscardPlayerId}
          />
        </div>
      )}

      {/* Right player */}
      {positions.right && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <OpponentArea
            player={positions.right}
            position="right"
            isCurrentPlayer={positions.right.id === currentPlayerId}
            color={PLAYER_COLORS[players.indexOf(positions.right) % PLAYER_COLORS.length]}
            lastDiscardPlayerId={lastDiscardPlayerId}
          />
        </div>
      )}

      {/* Bottom: My area */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%]">
        <div className={`
          bg-emerald-900/40 rounded-xl p-3 backdrop-blur-sm border border-emerald-600/30
          ${positions.bottom?.id === currentPlayerId ? 'ring-2 ring-yellow-400' : ''}
        `}>
          {/* My info bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PLAYER_COLORS[players.indexOf(positions.bottom!) % PLAYER_COLORS.length] }}
              />
              <span className="text-sm font-medium text-white">
                {positions.bottom?.nickname || '你'}
              </span>
              <span className="text-xs text-emerald-300">
                {positions.bottom ? WIND_LABELS[positions.bottom.wind] : ''}
              </span>
            </div>
            <span className="text-xs text-emerald-300">
              分: {positions.bottom?.score || 0}
            </span>
          </div>

          {/* My melds */}
          {myMelds.length > 0 && (
            <div className="mb-2">
              <MeldDisplay melds={myMelds} />
            </div>
          )}

          {/* My hand */}
          <PlayerHand
            tiles={myHand}
            selectedTileId={selectedTileId}
            onTileSelect={onTileSelect}
            canDiscard={canDiscard}
            isMyHand={true}
          />
        </div>
      </div>
    </div>
  );
}
