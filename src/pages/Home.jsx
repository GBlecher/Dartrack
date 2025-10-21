import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";

export default function Home() {
  const navigate = useNavigate();
  const { startGame, resumeGame, resetGame } = useGame();
  const [savedGame, setSavedGame] = useState(null);

  useEffect(() => {
    const gameData = localStorage.getItem("dartGame");
    if (gameData) setSavedGame(JSON.parse(gameData));
  }, []);

  const handleNewGame = () => {
    resetGame();
    localStorage.removeItem("dartGame");
    navigate("/select");
  };

  const handleContinueGame = () => {
    if (savedGame) {
      resumeGame(savedGame);
      navigate(`/game/${savedGame.gameType}`);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-indigo-800 text-white text-center p-6 space-y-6">
      <h1 className="text-4xl font-bold mb-8">Welcome to Dartrack 🎯</h1>

      <button
        onClick={handleNewGame}
        className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-100 active:scale-95 transition-transform w-48"
      >
        New Game
      </button>

      <button
        onClick={handleContinueGame}
        disabled={!savedGame}
        className={`px-8 py-3 rounded-full font-semibold transition-transform w-48 ${
          savedGame
            ? "bg-white text-blue-700 hover:bg-blue-100 active:scale-95"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Continue Game
      </button>
    </div>
  );
}
