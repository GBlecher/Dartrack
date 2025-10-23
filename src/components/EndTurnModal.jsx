import React from "react";
import { useGame } from "../context/GameContext";

export default function EndTurnModal() {
  const {
    showEndTurnModal,
    players,
    currentPlayerIndex,
    updateThrowForCurrentPlayer,
    confirmEndTurn,
    isBust,
    undoBust,
  } = useGame();

  // always allow editing inline — no toggle

  if (!showEndTurnModal) return null;

  const player = players[currentPlayerIndex];
  if (!player) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
      <div className="endTurnModal bg-white rounded-lg p-6 w-full max-w-md text-black">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold mb-2">End of Turn — {player.name}</h3>
          {isBust && <span className="ml-2 px-2 py-1 bg-red-600 text-white rounded">BUST</span>}
        </div>

        <p className="mb-2">Starting Score: {player.playerScore}</p>
        <p className="mb-4">Turn Score: {player.turnScore}</p>
        <div className="text-sm text-gray-600">Tap on score to edit:</div>
        <div className="endTurnThrows flex gap-2 mt-2">
        
          {player.throws.map((t, i) => (
            <div key={i} className="flex flex-col items-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                defaultValue={t.score}
                onBlur={(e) => updateThrowForCurrentPlayer(i, Number(e.target.value || 0), t.type)}
                className="px-3 py-2 bg-gray-100 rounded w-20 text-center appearance-none"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <div className="flex items-center space-x-2">
            
          </div>

          <div className="flex space-x-2">
            {isBust && (
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => {
                    // undo the bust throw and close the modal
                    undoBust();
                  }}
              >
                Undo
              </button>
            )}
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={() => confirmEndTurn(!isBust)}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
