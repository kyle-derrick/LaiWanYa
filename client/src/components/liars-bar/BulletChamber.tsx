import { useState, useEffect } from 'react';

interface BulletChamberProps {
  firing: boolean;
  died: boolean;
  currentChamber: number;
}

const CHAMBER_COUNT = 6;

export default function BulletChamber({ firing, died, currentChamber }: BulletChamberProps) {
  const [animating, setAnimating] = useState(false);
  const [spinning, setSpinning] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (firing) {
      setAnimating(true);
      setShowResult(false);
      // Spin animation
      let count = 0;
      const interval = setInterval(() => {
        setSpinning(prev => (prev + 1) % CHAMBER_COUNT);
        count++;
        if (count >= 12) {
          clearInterval(interval);
          setAnimating(false);
          setShowResult(true);
        }
      }, 150);

      return () => clearInterval(interval);
    } else {
      setAnimating(false);
      setShowResult(false);
    }
  }, [firing]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Revolver cylinder */}
      <div className="relative w-40 h-40">
        {/* Outer circle */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-600 bg-gray-800 shadow-lg">
          {/* Chambers */}
          {Array.from({ length: CHAMBER_COUNT }, (_, i) => {
            const angle = (i * 360) / CHAMBER_COUNT - 90;
            const radians = (angle * Math.PI) / 180;
            const radius = 55;
            const x = 80 + radius * Math.cos(radians) - 16;
            const y = 80 + radius * Math.sin(radians) - 16;
            const isActive = firing ? spinning === i : (currentChamber - 1) === i;

            return (
              <div
                key={i}
                className={`absolute w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? showResult
                      ? died
                        ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/50'
                        : 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/50'
                      : 'bg-yellow-500 border-yellow-300 text-black animate-pulse'
                    : 'bg-gray-700 border-gray-500 text-gray-400'
                }`}
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                {isActive && showResult ? (died ? '💥' : '✓') : i + 1}
              </div>
            );
          })}

          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${
              animating
                ? 'bg-yellow-600 border-yellow-400 animate-spin'
                : showResult
                  ? died
                    ? 'bg-red-700 border-red-500'
                    : 'bg-green-700 border-green-500'
                  : 'bg-gray-700 border-gray-500'
            }`}>
              {animating ? '🔫' : showResult ? (died ? '💀' : '😅') : '🎯'}
            </div>
          </div>
        </div>
      </div>

      {/* Status text */}
      {animating && (
        <p className="text-yellow-400 font-bold text-lg animate-pulse">
          🔫 Pulling the trigger...
        </p>
      )}
      {showResult && (
        <p className={`font-bold text-xl ${died ? 'text-red-500' : 'text-green-500'}`}>
          {died ? '💥 BANG! Eliminated!' : '*click* ... Survived!'}
        </p>
      )}
    </div>
  );
}
