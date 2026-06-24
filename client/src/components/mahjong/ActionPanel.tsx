import { Tile, PendingAction } from './types';
import TileComponent from './TileComponent';

interface ActionPanelProps {
  availableActions: string[];
  canDiscard: boolean;
  selectedTileId: string | null;
  pendingAction: PendingAction | null;
  lastDiscard: Tile | null;
  onDiscard: () => void;
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

export default function ActionPanel({
  availableActions,
  canDiscard,
  selectedTileId,
  pendingAction,
  lastDiscard,
  onDiscard,
  onAction,
}: ActionPanelProps) {
  const hasActions = availableActions.length > 0;
  const canChi = availableActions.includes('chi');
  const canPong = availableActions.includes('pong');
  const canKong = availableActions.includes('kong');
  const canHu = availableActions.includes('hu');
  const canPass = availableActions.includes('pass');

  if (!hasActions && !canDiscard) return null;

  const actionButtonStyle = (color: string) => ({
    background: `linear-gradient(145deg, ${color}, ${color}dd)`,
    boxShadow: `0 4px 12px ${color}40`,
    color: 'white'
  });

  return (
    <div
      className="rounded-xl shadow-lg p-4 backdrop-blur-sm"
      style={{
        background: 'linear-gradient(145deg, rgba(30,60,40,0.95), rgba(15,40,25,0.95))',
        border: '1px solid rgba(45,106,58,0.4)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.05)'
      }}
    >
      {/* Pending action section (responding to someone's discard) */}
      {pendingAction && hasActions && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-emerald-200">可执行操作：</span>
            {lastDiscard && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-emerald-400/80">弃牌:</span>
                <TileComponent tile={lastDiscard} small />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {canChi && (
              <button
                onClick={() => onAction('chi')}
                className="px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
                style={actionButtonStyle('#3b82f6')}
              >
                🀄 吃
              </button>
            )}
            {canPong && (
              <button
                onClick={() => onAction('pong')}
                className="px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
                style={actionButtonStyle('#22c55e')}
              >
                🀄 碰
              </button>
            )}
            {canKong && (
              <button
                onClick={() => onAction('kong')}
                className="px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
                style={actionButtonStyle('#a855f7')}
              >
                🀄 杠
              </button>
            )}
            {canHu && (
              <button
                onClick={() => onAction('hu')}
                className="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 animate-pulse"
                style={{
                  ...actionButtonStyle('#ef4444'),
                  boxShadow: '0 4px 12px rgba(239,68,68,0.5), 0 0 20px rgba(239,68,68,0.3)'
                }}
              >
                🏆 胡
              </button>
            )}
            {canPass && (
              <button
                onClick={() => onAction('pass')}
                className="px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(145deg, #6b7280, #4b5563)',
                  boxShadow: '0 2px 8px rgba(107,114,128,0.3)',
                  color: 'white'
                }}
              >
                过
              </button>
            )}
          </div>
        </div>
      )}

      {/* Discard section */}
      {canDiscard && (
        <div className={hasActions ? 'border-t border-emerald-700/40 pt-3' : ''}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-emerald-200">
              {selectedTileId ? '点击按钮出牌 →' : '← 先选一张牌'}
            </span>
            <button
              onClick={onDiscard}
              disabled={!selectedTileId}
              className="px-6 py-2 rounded-xl font-bold text-sm transition-all duration-200"
              style={{
                background: selectedTileId
                  ? 'linear-gradient(145deg, #f97316, #ea580c)'
                  : 'linear-gradient(145deg, #4a4a4a, #3a3a3a)',
                boxShadow: selectedTileId ? '0 4px 12px rgba(249,115,22,0.4)' : 'none',
                color: selectedTileId ? 'white' : '#888',
                cursor: selectedTileId ? 'pointer' : 'not-allowed'
              }}
            >
              出牌
            </button>
          </div>
        </div>
      )}

      {/* Self-draw kong/hu (during own turn) */}
      {canDiscard && !pendingAction && (
        <div className="flex flex-wrap gap-2 mt-2">
          {availableActions.includes('kong_self') && (
            <button
              onClick={() => onAction('kong')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
              style={actionButtonStyle('#a855f7')}
            >
              杠
            </button>
          )}
          {availableActions.includes('hu_self') && (
            <button
              onClick={() => onAction('hu')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 animate-pulse"
              style={{
                ...actionButtonStyle('#ef4444'),
                boxShadow: '0 2px 8px rgba(239,68,68,0.4)'
              }}
            >
              自摸胡
            </button>
          )}
        </div>
      )}
    </div>
  );
}
