import { MonopolyPlayerState, PropertyOwnership } from '../../types';

interface BankPanelProps {
  player: MonopolyPlayerState;
  properties: PropertyOwnership[];
  onBuildHouse: (squareIndex: number) => void;
  onSellHouse: (squareIndex: number) => void;
  onMortgage: (squareIndex: number) => void;
  onUnmortgage: (squareIndex: number) => void;
  availableActions: string[];
}

const propertyNames: Record<number, string> = {
  1: 'Mediterranean Ave', 3: 'Baltic Ave',
  5: 'Reading Railroad', 6: 'Oriental Ave', 8: 'Vermont Ave', 9: 'Connecticut Ave',
  11: 'St. Charles Place', 12: 'Electric Company', 13: 'States Ave', 14: 'Virginia Ave',
  15: 'Pennsylvania Railroad', 16: 'St. James Place', 18: 'Tennessee Ave', 19: 'New York Ave',
  21: 'Kentucky Ave', 23: 'Indiana Ave', 24: 'Illinois Ave',
  25: 'B&O Railroad', 26: 'Atlantic Ave', 27: 'Ventnor Ave', 28: 'Water Works',
  29: 'Marvin Gardens', 31: 'Pacific Ave', 32: 'North Carolina Ave', 34: 'Pennsylvania Ave',
  35: 'Short Line', 37: 'Park Place', 39: 'Boardwalk'
};

export default function BankPanel({
  player,
  properties,
  onBuildHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
  availableActions
}: BankPanelProps) {
  const myProperties = properties.filter(p => p.ownerId === player.id);

  return (
    <div
      className="rounded-xl p-4 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <h3 className="font-bold text-lg mb-3 text-amber-200 flex items-center gap-2">
        <span className="text-amber-400">🏦</span> Your Properties
      </h3>

      {myProperties.length === 0 ? (
        <p className="text-amber-600/60 text-sm italic">No properties owned</p>
      ) : (
        <div className="space-y-2">
          {myProperties.map(prop => {
            const name = propertyNames[prop.squareIndex] || `Square ${prop.squareIndex}`;
            const canBuild = availableActions.includes(`buildHouse:${prop.squareIndex}`);
            const canSell = availableActions.includes(`sellHouse:${prop.squareIndex}`);
            const canMortgageAction = availableActions.includes(`mortgage:${prop.squareIndex}`);
            const canUnmortgageAction = availableActions.includes(`unmortgage:${prop.squareIndex}`);

            return (
              <div
                key={prop.squareIndex}
                className="p-3 rounded-xl transition-all duration-200"
                style={{
                  background: prop.isMortgaged
                    ? 'linear-gradient(145deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                  border: prop.isMortgaged
                    ? '1px solid rgba(239,68,68,0.2)'
                    : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.03)'
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-amber-100">{name}</p>
                    {prop.houses > 0 && (
                      <p className="text-xs text-amber-500/70 mt-0.5">
                        {prop.houses === 5 ? '🏨 Hotel' : `${prop.houses} house(s)`}
                      </p>
                    )}
                    {prop.isMortgaged && (
                      <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        Mortgaged
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {canBuild && (
                      <button
                        onClick={() => onBuildHouse(prop.squareIndex)}
                        className="px-2 py-1 text-xs rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
                        style={{
                          background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                          boxShadow: '0 2px 8px rgba(34,197,94,0.25), inset 0 1px 1px rgba(255,255,255,0.15)',
                          border: '1px solid rgba(34,197,94,0.3)',
                          color: 'white'
                        }}
                      >
                        Build
                      </button>
                    )}
                    {canSell && (
                      <button
                        onClick={() => onSellHouse(prop.squareIndex)}
                        className="px-2 py-1 text-xs rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
                        style={{
                          background: 'linear-gradient(145deg, #eab308, #ca8a04)',
                          boxShadow: '0 2px 8px rgba(234,179,8,0.25), inset 0 1px 1px rgba(255,255,255,0.15)',
                          border: '1px solid rgba(234,179,8,0.3)',
                          color: 'white'
                        }}
                      >
                        Sell
                      </button>
                    )}
                    {canMortgageAction && (
                      <button
                        onClick={() => onMortgage(prop.squareIndex)}
                        className="px-2 py-1 text-xs rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
                        style={{
                          background: 'linear-gradient(145deg, #f97316, #ea580c)',
                          boxShadow: '0 2px 8px rgba(249,115,22,0.25), inset 0 1px 1px rgba(255,255,255,0.15)',
                          border: '1px solid rgba(249,115,22,0.3)',
                          color: 'white'
                        }}
                      >
                        Mortgage
                      </button>
                    )}
                    {canUnmortgageAction && (
                      <button
                        onClick={() => onUnmortgage(prop.squareIndex)}
                        className="px-2 py-1 text-xs rounded-lg font-medium transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
                        style={{
                          background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
                          boxShadow: '0 2px 8px rgba(59,130,246,0.25), inset 0 1px 1px rgba(255,255,255,0.15)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          color: 'white'
                        }}
                      >
                        Unmortgage
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
