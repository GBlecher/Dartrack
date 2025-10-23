

import React from "react";
import { useGame } from "../context/GameContext";

export default function ScoreBoard() {
  const { players, currentPlayerIndex, currentThrowIndex } = useGame();
  const player = players[currentPlayerIndex];
  if (!player) return null;

  return (
    <div className="score-board scoreBoard bg-gray-800 rounded-lg p-6 text-white w-full mx-auto mb-6">
      <div className="flex flex-col gap-3 md:gap-4">
        <p className="text-lg md:text-xl font-semibold">Total Score: <span className="font-normal">{player.playerScore}</span></p>
        <p className="text-lg md:text-xl font-semibold">Turn Score: <span className="font-normal">{player.turnScore}</span></p>
        <p className="text-md md:text-lg">Last Throw: <span className="font-medium">{player.lastThrowType || " "}</span></p>
      </div>

      <div className="flex gap-3 mt-4 flex-wrap justify-start">
        {player.throws.map((t, i) => {
          const isCurrent = i === currentThrowIndex;
          return (
            <span
              key={i}
              className={`px-3 py-2 rounded flex items-center ${isCurrent ? "bg-gray-600 text-white font-semibold ring-2 ring-gray-500/30 text-xl" : "bg-gray-700 text-lg"}`}
            >
              <span className="mr-3">{t?.score ?? 0}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}