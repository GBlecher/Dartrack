

import React from "react";
import { useGame } from "../context/GameContext";

export default function ScoreBoard() {
  const { players, currentPlayerIndex, currentThrowIndex } = useGame();
  const player = players[currentPlayerIndex];
  if (!player) return null;

  return (
    <div className="scoreBoard bg-gray-800 rounded-lg p-4 text-white w-full max-w-md mx-auto mb-4">
      <h2 className="text-xl font-bold mb-2">{player.name}</h2>
      <p>Total Score: {player.playerScore}</p>
      <p>Turn Score: {player.turnScore}</p>
      <p>Last Throw: {player.lastThrowType || " "}</p>
      <div className="flex gap-2 mt-2">
        {player.throws.map((t, i) => {
          const isCurrent = i === currentThrowIndex;
          return (
            <span
              key={i}
              className={`px-2 py-1 rounded flex items-center ${isCurrent ? "bg-gray-600 text-white font-semibold ring-2 ring-gray-500/30 text-lg" : "bg-gray-700"}`}
            >
              <span className="mr-2">{t?.score ?? 0}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}