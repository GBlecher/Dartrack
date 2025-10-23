import { useEffect } from "react";
import { useGame } from "../context/GameContext";

const GameSaver = () => {
  const { gameType, players, currentPlayerIndex } = useGame();

  useEffect(() => {
    if (gameType && players.length > 0) {
      const gameData = { ts: Date.now(), gameType, players, currentPlayerIndex };
      try {
        localStorage.setItem("dartrack_saved_game", JSON.stringify(gameData));
      } catch {
        /* ignore */
      }
    }
  }, [gameType, players, currentPlayerIndex]);

  return null;
};

export default GameSaver;
