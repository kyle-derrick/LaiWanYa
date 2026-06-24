interface GameBoardProps {
  gameType: string;
  roomId: string;
}

export default function GameBoard({ gameType, roomId }: GameBoardProps) {
  return (
    <div className="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {gameType} Game Board
        </h2>
        <p className="text-gray-500">
          Game board for room {roomId} will be rendered here
        </p>
        <div className="mt-4 p-4 bg-white rounded-md inline-block">
          <p className="text-sm text-gray-600">
            This is a placeholder for the game board component.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Each game type will have its own board implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
