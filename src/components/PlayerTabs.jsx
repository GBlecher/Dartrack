// PlayerTabs.jsx
import React, { useState, useRef } from "react";
import { useGame } from "../context/GameContext";

/*
 * PlayerTabs
 * Renders the per-player tabs shown at the top of the game. Tabs are
 * editable inline: click a tab to edit the player's name. Uses colors
 * to indicate the active player.
 */
export default function PlayerTabs() {
  const { players, currentPlayerIndex, updatePlayerName } = useGame();
  const [editingIndex, setEditingIndex] = useState(null);
  const inputRef = useRef(null);

  const COLORS = ["#1E40AF", "#047857"]; // blue, green

  const hexToRgba = (hex, alpha = 1) => {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="buttonTabs flex w-full">
      {players.map((player, index) => (
        <div
          key={index}
          role="button"
          tabIndex={0}
          style={{
            backgroundColor: currentPlayerIndex === index ? COLORS[index % COLORS.length] : hexToRgba(COLORS[index % COLORS.length], 0.12),
          }}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-t-lg font-medium text-sm cursor-pointer flex items-center justify-center text-white`}
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
              className="flex-1 min-w-0 px-3 py-2 rounded w-full text-center text-sm truncate overflow-hidden whitespace-nowrap text-white bg-transparent"
            />
          ) : (
            <span className="flex items-center gap-2 justify-center w-full">
              <span className="flex-1 min-w-0 truncate">{player.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.464.263l-4 1a1 1 0 01-1.212-1.212l1-4a1 1 0 01.263-.464l9.9-9.9a2 2 0 012.828 0zM15.172 4.828l-9.9 9.9-.586 2.343 2.343-.586 9.9-9.9-1.757-1.757z" />
              </svg>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
