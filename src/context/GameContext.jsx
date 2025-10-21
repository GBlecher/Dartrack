


import React, { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameType, setGameType] = useState(null); // 301 or 501
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentThrowIndex, setCurrentThrowIndex] = useState(0);
  const [turnEnded, setTurnEnded] = useState(false);
  const [previousTurn, setPreviousTurn] = useState(null); // for undo

  const startGame = (type) => {
    setGameType(type);
    setPlayers([
      { name: "Player 1", playerScore: type, turnScore: type, lastThrowType: null, throws: [0, 0, 0] },
      { name: "Player 2", playerScore: type, turnScore: type, lastThrowType: null, throws: [0, 0, 0] },
    ]);
    setCurrentPlayerIndex(0);
    setCurrentThrowIndex(0);
    setTurnEnded(false);
  };

  const addThrow = (dartScore, throwType) => {
    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index === currentPlayerIndex) {
          const newThrows = [...player.throws];
          newThrows[currentThrowIndex] = dartScore;

          return {
            ...player,
            turnScore: player.turnScore - dartScore,
            lastThrowType: throwType,
            throws: newThrows,
          };
        }
        return player;
      })
    );

    setCurrentThrowIndex((prev) => {
      if (prev === 2) {
        setTurnEnded(true); // show turn-end modal
        return 2;
      }
      return prev + 1;
    });
  };

  const nextTurn = () => {
    setPreviousTurn({
      playerIndex: currentPlayerIndex,
      throws: players[currentPlayerIndex].throws,
      turnScore: players[currentPlayerIndex].turnScore,
    });

    setPlayers((prev) =>
      prev.map((player, index) =>
        index === (currentPlayerIndex + 1) % players.length
          ? { ...player, turnScore: player.playerScore, throws: [0, 0, 0], lastThrowType: null }
          : player
      )
    );

    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    setCurrentThrowIndex(0);
    setTurnEnded(false);
  };

  const undoTurn = () => {
    if (!previousTurn) return;
    setPlayers((prev) =>
      prev.map((player, index) =>
        index === previousTurn.playerIndex
          ? { ...player, throws: previousTurn.throws, turnScore: previousTurn.turnScore }
          : player
      )
    );
    setCurrentPlayerIndex(previousTurn.playerIndex);
    setCurrentThrowIndex(previousTurn.throws.findIndex((t) => t === 0));
    setTurnEnded(false);
  };

  const resetGame = () => {
    setGameType(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentThrowIndex(0);
    setTurnEnded(false);
    setPreviousTurn(null);
  };

  //
  const undoLastThrow = () => {
  
    setPlayers((prev) => {
      const copy = prev.map((p) => ({ ...p, throws: [...p.throws] }));
      const player = copy[currentPlayerIndex];
      if (!player) return prev;

      // find last non-zero throw index for current player
      let lastIdx = -1;
      for (let i = player.throws.length - 1; i >= 0; i--) {
        if (player.throws[i] && player.throws[i] !== 0) {
          lastIdx = i;
          break;
        }
      }

      if (lastIdx === -1) return prev; // nothing to undo for current player

      const value = player.throws[lastIdx] || 0;
      player.throws[lastIdx] = 0;
      player.turnScore = (player.turnScore || 0) + value;
      player.lastThrowType = null;

      // update indices outside of setPlayers
      setCurrentThrowIndex(lastIdx);
      setTurnEnded(false);

      return copy;
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameType,
        players,
        currentPlayerIndex,
        currentThrowIndex,
        turnEnded,
        startGame,
        addThrow,
  undoLastThrow,
        nextTurn,
        undoTurn,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
//hello