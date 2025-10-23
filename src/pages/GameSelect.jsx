import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";

export default function GameSelect() {
  const navigate = useNavigate();
  const { startGame } = useGame();

  const selectGame = (type) => {
    startGame(type);
    // replace history entry so Back returns to Home instead of GameSelect
    navigate(`/game/${type}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 space-y-6">
    <h1 className="text-3xl font-bold">Select Game</h1>

    <button
      onClick={() => selectGame(301)}
      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 w-48"
    >
      301
    </button>

    <button
      onClick={() => selectGame(501)}
      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 w-48"
    >
      501
    </button>
  </div>
  );
}
