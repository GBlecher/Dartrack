import { useEffect } from "react";
import { useGame } from "../context/GameContext";

/*
 * GameSaver
 * Lightweight component that serializes a compact snapshot of the current
 * game into localStorage whenever relevant state changes. Implemented as a
 * separate component so it can be mounted at the app root and remain
 * side-effect-only (returns null).
 */
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
