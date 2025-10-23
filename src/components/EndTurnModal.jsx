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
    <div className="endturn-modal fixed inset-0 bg-black/50 flex items-center justify-center z-60">
      <div className="endturn-modal__panel endTurnModal bg-white rounded-lg p-4 md:p-8 w-full max-w-md md:max-w-2xl text-black">
        <div className="flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-bold mb-2">End of Turn — {player.name}</h3>
          {isBust && <span className="ml-2 px-2 py-1 bg-red-600 text-white rounded">BUST</span>}
        </div>

        <p className="mb-2 text-lg md:text-xl">Starting Score: {player.playerScore}</p>
        <p className="mb-4 text-lg md:text-xl">Turn Score: {player.turnScore}</p>
        <div className="text-sm md:text-base text-gray-600">Tap on score to edit:</div>
          <div className="endTurnThrows flex gap-3 mt-3">
        
          {player.throws.map((t, i) => (
            <div key={i} className="flex flex-col items-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                defaultValue={t.score}
                onBlur={(e) => updateThrowForCurrentPlayer(i, Number(e.target.value || 0), t.type)}
                className="px-3 py-2 md:px-4 md:py-3 bg-gray-100 rounded w-20 md:w-28 text-center appearance-none text-lg"
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
