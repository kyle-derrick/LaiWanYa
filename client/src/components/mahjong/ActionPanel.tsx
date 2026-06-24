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

  // If no actions and can't discard, nothing to show
  if (!hasActions && !canDiscard) return null;

  return (
    <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-4 border border-gray-200">
      {/* Pending action section (responding to someone's discard) */}
      {pendingAction && hasActions && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">可执行操作：</span>
            {lastDiscard && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">弃牌:</span>
                <TileComponent tile={lastDiscard} small />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {canChi && (
              <button
                onClick={() => onAction('chi')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm transition-colors shadow-sm"
              >
                🀄 吃
              </button>
            )}
            {canPong && (
              <button
                onClick={() => onAction('pong')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm transition-colors shadow-sm"
              >
                🀄 碰
              </button>
            )}
            {canKong && (
              <button
                onClick={() => onAction('kong')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium text-sm transition-colors shadow-sm"
              >
                🀄 杠
              </button>
            )}
            {canHu && (
              <button
                onClick={() => onAction('hu')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-sm transition-colors shadow-sm animate-pulse"
              >
                🏆 胡
              </button>
            )}
            {canPass && (
              <button
                onClick={() => onAction('pass')}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium text-sm transition-colors shadow-sm"
              >
                过
              </button>
            )}
          </div>
        </div>
      )}

      {/* Discard section */}
      {canDiscard && (
        <div className={hasActions ? 'border-t border-gray-200 pt-3' : ''}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {selectedTileId ? '点击按钮出牌 →' : '← 先选一张牌'}
            </span>
            <button
              onClick={onDiscard}
              disabled={!selectedTileId}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-sm transition-colors shadow-sm"
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
              className="px-3 py-1.5 bg-purple-400 text-white rounded-lg hover:bg-purple-500 text-xs font-medium transition-colors"
            >
              杠
            </button>
          )}
          {availableActions.includes('hu_self') && (
            <button
              onClick={() => onAction('hu')}
              className="px-3 py-1.5 bg-red-400 text-white rounded-lg hover:bg-red-500 text-xs font-bold transition-colors animate-pulse"
            >
              自摸胡
            </button>
          )}
        </div>
      )}
    </div>
  );
}
