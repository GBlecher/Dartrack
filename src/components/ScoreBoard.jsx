

import React from "react";
import { useGame } from "../context/GameContext";

export default function ScoreBoard() {
  const { players, currentPlayerIndex } = useGame();
  const player = players[currentPlayerIndex];
  if (!player) return null;

  return (
    <div className="scoreBoard bg-gray-800 rounded-lg p-4 text-white w-full max-w-md mx-auto mb-4">
      <h2 className="text-xl font-bold mb-2">{player.name}</h2>
      <p>Total Score: {player.playerScore}</p>
      <p>Turn Score: {player.turnScore}</p>
      <p>Last Throw: {player.lastThrowType || " "}</p>
      <div className="flex gap-2 mt-2">
        {player.throws.map((t, i) => (
          <span key={i} className="bg-gray-700 px-2 py-1 rounded">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}