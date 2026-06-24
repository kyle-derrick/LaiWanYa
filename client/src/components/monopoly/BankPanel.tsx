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

// Property names for display
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
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-lg mb-3">Your Properties</h3>

      {myProperties.length === 0 ? (
        <p className="text-gray-500 text-sm">No properties owned</p>
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
                className={`p-2 rounded border ${
                  prop.isMortgaged ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    {prop.houses > 0 && (
                      <p className="text-xs text-gray-500">
                        {prop.houses === 5 ? 'Hotel' : `${prop.houses} house(s)`}
                      </p>
                    )}
                    {prop.isMortgaged && (
                      <p className="text-xs text-red-500">Mortgaged</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {canBuild && (
                      <button
                        onClick={() => onBuildHouse(prop.squareIndex)}
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Build
                      </button>
                    )}
                    {canSell && (
                      <button
                        onClick={() => onSellHouse(prop.squareIndex)}
                        className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Sell
                      </button>
                    )}
                    {canMortgageAction && (
                      <button
                        onClick={() => onMortgage(prop.squareIndex)}
                        className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        Mortgage
                      </button>
                    )}
                    {canUnmortgageAction && (
                      <button
                        onClick={() => onUnmortgage(prop.squareIndex)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
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
