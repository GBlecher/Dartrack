import React, { createContext, useContext, useState, useEffect } from "react";

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
  const [showEndTurnModal, setShowEndTurnModal] = useState(false);
  const [isBust, setIsBust] = useState(false);
  const [winner, setWinner] = useState(null);

  const startGame = (type) => {
    setGameType(type);
    setPlayers([
      {
        name: "Player 1",
        playerScore: type,
        turnScore: type,
        lastThrowType: null,
        throws: [
          { score: 0, type: null },
          { score: 0, type: null },
          { score: 0, type: null },
        ],
      },
      {
        name: "Player 2",
        playerScore: type,
        turnScore: type,
        lastThrowType: null,
        throws: [
          { score: 0, type: null },
          { score: 0, type: null },
          { score: 0, type: null },
        ],
      },
    ]);
    setCurrentPlayerIndex(0);
    setCurrentThrowIndex(0);
    setTurnEnded(false);
    setShowEndTurnModal(false);
  };

  const addThrow = (dartScore, throwType) => {
    // snapshot current player before change (for undo/bust)
    const current = players[currentPlayerIndex];
    if (!current) return;

    const newTurnScore = (current.turnScore || 0) - dartScore;

    // build new player object
    const newPlayer = {
      ...current,
      throws: [...current.throws],
      lastThrowType: throwType,
      turnScore: newTurnScore,
    };
    newPlayer.throws[currentThrowIndex] = { score: dartScore, type: throwType };

  // detect bust: explicit BUST button, below zero, or exactly zero but not finished on a double
  const busted = throwType === "BUST" || newTurnScore < 0 || (newTurnScore === 0 && throwType !== "double") || newTurnScore === 1;

  // detect a winning finish: exactly zero on a double
  const finished = newTurnScore === 0 && throwType === "double";

    // snapshot previous turn
    setPreviousTurn({
      playerIndex: currentPlayerIndex,
      throws: current.throws.map((t) => ({ ...t })),
      turnScore: current.turnScore,
      playerScoreBefore: current.playerScore,
    });

    // apply the new throws/turnScore
    setPlayers((prev) => prev.map((p, idx) => (idx === currentPlayerIndex ? newPlayer : p)));

    if (finished) {
      // mark winner and show winner modal
      setWinner({ playerIndex: currentPlayerIndex, name: newPlayer.name });
      setTurnEnded(true);
      // keep throws as-is and stop the normal end-turn flow
      setShowEndTurnModal(false);
      setCurrentThrowIndex(2);
      return;
    }

    if (busted) {
      setIsBust(true);
      setTurnEnded(true);
      setShowEndTurnModal(true);
      // when busted, we keep currentThrowIndex as-is (turn ends)
      setCurrentThrowIndex(2);
      return;
    }

    // not busted: advance throw index or end turn as usual
    setCurrentThrowIndex((prev) => {
      if (prev === 2) {
        setTurnEnded(true);
        setShowEndTurnModal(true);
        return 2;
      }
      return prev + 1;
    });
  };

  const nextTurn = () => {
    setPreviousTurn({
      playerIndex: currentPlayerIndex,
      throws: players[currentPlayerIndex].throws.map((t) => ({ ...t })),
      turnScore: players[currentPlayerIndex].turnScore,
    });

    setPlayers((prev) =>
      prev.map((player, index) =>
        index === (currentPlayerIndex + 1) % prev.length
          ? {
              ...player,
              turnScore: player.playerScore,
              throws: [
                { score: 0, type: null },
                { score: 0, type: null },
                { score: 0, type: null },
              ],
              lastThrowType: null,
            }
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
          ? { ...player, throws: previousTurn.throws.map((t) => ({ ...t })), turnScore: previousTurn.turnScore }
          : player
      )
    );
    setCurrentPlayerIndex(previousTurn.playerIndex);
    setCurrentThrowIndex(previousTurn.throws.findIndex((t) => t.score === 0));
    setTurnEnded(false);
  };

  const resetGame = () => {
    setGameType(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentThrowIndex(0);
    setTurnEnded(false);
    setPreviousTurn(null);
    setShowEndTurnModal(false);
  };

  const undoLastThrow = () => {
    setPlayers((prev) => {
      const copy = prev.map((p) => ({ ...p, throws: p.throws.map((t) => ({ ...t })) }));
      const player = copy[currentPlayerIndex];
      if (!player) return prev;

      let targetIdx = Math.max(0, currentThrowIndex - 1);

      if (currentThrowIndex === 0 && (!player.throws[0] || player.throws[0].score === 0)) {
        return prev;
      }

      const t = player.throws[targetIdx];
      if (!t || typeof t.score !== "number" || t.score === 0) {
        return prev;
      }

      const value = t.score;
      player.throws[targetIdx] = { score: 0, type: null };
      player.turnScore = (player.turnScore || 0) + value;
      player.lastThrowType = null;

      setCurrentThrowIndex(targetIdx);
      setTurnEnded(false);

      return copy;
    });
  };

  // update a player's name
  const updatePlayerName = (index, name) => {
    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, name } : p)));
  };

  // allow editing a throw for the current player
  const updateThrowForCurrentPlayer = (index, score, type = null) => {
    setPlayers((prev) =>
      prev.map((player, pIdx) => {
        if (pIdx !== currentPlayerIndex) return player;
        const newThrows = player.throws.map((t, i) => (i === index ? { score: Number(score) || 0, type } : { ...t }));
        const newTurnScore = (player.playerScore || 0) - newThrows.reduce((s, x) => s + (x.score || 0), 0);
        return { ...player, throws: newThrows, turnScore: newTurnScore };
      })
    );
  };

  // confirm end-turn from modal: snapshot and advance
  const confirmEndTurn = (commit = true) => {
    // snapshot previous turn (already done earlier on addThrow)

    const nextIdx = (currentPlayerIndex + 1) % players.length;

    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index === currentPlayerIndex) {
          // if commit is true, set playerScore to turnScore; otherwise revert turnScore
          if (commit) return { ...player, playerScore: player.turnScore };
          return { ...player, turnScore: player.playerScore };
        }
        if (index === nextIdx) {
          return {
            ...player,
            turnScore: player.playerScore,
            throws: [
              { score: 0, type: null },
              { score: 0, type: null },
              { score: 0, type: null },
            ],
            lastThrowType: null,
          };
        }
        return player;
      })
    );

    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    setCurrentThrowIndex(0);
    setTurnEnded(false);
    setShowEndTurnModal(false);
    setIsBust(false);
  };

  const triggerBust = () => {
    setIsBust(true);
    setTurnEnded(true);
    setShowEndTurnModal(true);
  };

  const clearBust = () => setIsBust(false);

  // undo specifically the bust-causing throw by restoring the previousTurn snapshot
  const undoBust = () => {
    if (!previousTurn) return;
    setPlayers((prev) =>
      prev.map((player, index) =>
        index === previousTurn.playerIndex
          ? {
              ...player,
              throws: previousTurn.throws.map((t) => ({ ...t })),
              turnScore: previousTurn.turnScore,
              // restore playerScore if we saved it
              playerScore: typeof previousTurn.playerScoreBefore === "number" ? previousTurn.playerScoreBefore : player.playerScore,
              lastThrowType: null,
            }
          : player
      )
    );

    // set current throw index back to the first empty slot, or 2 if none
    const firstEmpty = previousTurn.throws.findIndex((t) => t.score === 0);
    setCurrentThrowIndex(firstEmpty >= 0 ? firstEmpty : 2);
    setShowEndTurnModal(false);
    setIsBust(false);
  };

  const clearWinner = () => setWinner(null);

  // --- persistence: save/load from localStorage with 3-hour expiry ---
  const STORAGE_KEY = "dartrack_saved_game";
  const MAX_AGE_MS = 3 * 60 * 60 * 1000; // 3 hours

  const saveGameToStorage = () => {
    if (!players || players.length === 0) return;
    try {
      const payload = {
        ts: Date.now(),
        gameType,
        players,
        currentPlayerIndex,
        currentThrowIndex,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
      // console.error('saveGame error', e);
    }
  };

  const loadGameFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.ts || Date.now() - parsed.ts > MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };

  // load saved game once on mount
  useEffect(() => {
    const saved = loadGameFromStorage();
    if (saved) {
      if (saved.gameType) setGameType(saved.gameType);
      if (saved.players) setPlayers(saved.players);
      if (typeof saved.currentPlayerIndex === "number") setCurrentPlayerIndex(saved.currentPlayerIndex);
      if (typeof saved.currentThrowIndex === "number") setCurrentThrowIndex(saved.currentThrowIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // save at the beginning of each turn (when currentPlayerIndex changes)
  useEffect(() => {
    if (players && players.length > 0) saveGameToStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerIndex]);

  return (
    <GameContext.Provider
      value={{
        gameType,
        players,
        currentPlayerIndex,
        currentThrowIndex,
        turnEnded,
        startGame,
        resumeGame: (payload) => {
          if (!payload) return;
          if (payload.gameType) setGameType(payload.gameType);
          if (payload.players) setPlayers(payload.players);
          if (typeof payload.currentPlayerIndex === "number") setCurrentPlayerIndex(payload.currentPlayerIndex);
          if (typeof payload.currentThrowIndex === "number") setCurrentThrowIndex(payload.currentThrowIndex);
          // persist when resuming
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), ...payload }));
          } catch {
            /* ignore */
          }
        },
  addThrow,
  undoLastThrow,
  undoBust,
  winner,
  clearWinner,
        updatePlayerName,
        nextTurn,
        undoTurn,
        resetGame,
        showEndTurnModal,
    setShowEndTurnModal,
        updateThrowForCurrentPlayer,
  confirmEndTurn,
  isBust,
  triggerBust,
  clearBust,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
