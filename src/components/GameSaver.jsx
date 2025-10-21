import { useEffect } from "react";
import { useGame } from "../context/GameContext";

const GameSaver = () => {
  const { gameType, players, currentPlayerIndex } = useGame();

  useEffect(() => {
    if (gameType && players.length > 0) {
      const gameData = { gameType, players, currentPlayerIndex };
      localStorage.setItem("dartGame", JSON.stringify(gameData));
    }
  }, [gameType, players, currentPlayerIndex]);

  return null;
};

export default GameSaver;
