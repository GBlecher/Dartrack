import React from "react";
import { useGame } from "../context/GameContext";
import { useNavigate } from "react-router-dom";

/*
 * WinnerModal
 * Shown when a player finishes the game. Allows undoing the last throw
 * (to revert an accidental winning throw), starting a new game, or exit.
 */
export default function WinnerModal() {
  const { winner, players, clearWinner, resetGame, undoLastThrow } = useGame();
  const navigate = useNavigate();

  if (!winner) return null;

  const otherPlayers = players.filter((_, idx) => idx !== winner.playerIndex);

  return (
    <div className="winner-modal fixed inset-0 bg-black/50 flex items-center justify-center z-60">
      <div className="winner-modal__panel bg-white rounded-lg p-4 md:p-8 w-full max-w-md md:max-w-2xl text-black">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">Congrats {winner.name} — you won!!!</h2>

        <div className="mb-4 text-lg md:text-xl">
          {otherPlayers.map((p, i) => (
            <div key={i} className="py-1">
              {p.name}: {p.playerScore}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded bg-yellow-300"
            onClick={() => {
              // undo the last throw that ended the game and close the winner modal
              undoLastThrow();
              clearWinner();
            }}
          >
            Undo
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-200"
            onClick={() => {
              // start a new game -> go to game select
              clearWinner();
              resetGame();
              navigate("/select", { replace: true });
            }}
          >
            New Game
          </button>

          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={() => {
              clearWinner();
              resetGame();
              navigate("/", { replace: true });
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
