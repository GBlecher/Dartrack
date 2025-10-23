// PlayerTabs.jsx
import React, { useState, useRef } from "react";
import { useGame } from "../context/GameContext";

export default function PlayerTabs() {
  const { players, currentPlayerIndex, updatePlayerName } = useGame();
  const [editingIndex, setEditingIndex] = useState(null);
  const inputRef = useRef(null);

  return (
    <div className="buttonTabs flex justify-center space-x-4 mb-4">
      {players.map((player, index) => (
        <div
          key={index}
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            currentPlayerIndex === index ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
          onClick={() => {
            setEditingIndex(index);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          {editingIndex === index ? (
            <input
              ref={inputRef}
              defaultValue={player.name}
              onBlur={(ev) => {
                updatePlayerName(index, ev.target.value || `Player ${index + 1}`);
                setEditingIndex(null);
              }}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") {
                  updatePlayerName(index, ev.target.value || `Player ${index + 1}`);
                  setEditingIndex(null);
                }
              }}
              className="px-2 py-1 rounded"
            />
          ) : (
            <span className="inline-flex items-center gap-2">
              <span>{player.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.464.263l-4 1a1 1 0 01-1.212-1.212l1-4a1 1 0 01.263-.464l9.9-9.9a2 2 0 012.828 0zM15.172 4.828l-9.9 9.9-.586 2.343 2.343-.586 9.9-9.9-1.757-1.757z" />
              </svg>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
