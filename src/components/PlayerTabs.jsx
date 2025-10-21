// PlayerTabs.jsx
import React from "react";

export default function PlayerTabs({ players, activeIndex, setActiveIndex }) {
  return (
    <div className="buttonTabs flex justify-center space-x-4 mb-4">
      {players.map((player, index) => (
        <button
          key={index}
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeIndex === index
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setActiveIndex(index)}
        >
          {player.name}
        </button>
      ))}
    </div>
  );
}
