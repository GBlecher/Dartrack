import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import PlayerTabs from "../components/PlayerTabs";
import ScoreBoard from "../components/ScoreBoard";
import ButtonGrid from "../components/ButtonGrid";

export default function GamePage() {
  const { id } = useParams();
  const { players, addThrow, nextTurn } = useGame();
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  const handleAction = (value, type) => {
    const currentPlayer = activePlayerIndex;
    if (typeof value === "number") {
      addThrow(currentPlayer, value, type === "hold" ? "triple" : "single");
    } else {
      // handle special actions
      console.log(`Special action: ${value}`);
    }
    nextTurn();
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <PlayerTabs
        players={players}
        activeIndex={activePlayerIndex}
        setActiveIndex={setActivePlayerIndex}
      />
      <ScoreBoard player={players[activePlayerIndex]} />
      <ButtonGrid onAction={handleAction} />
    </div>
  );
}
