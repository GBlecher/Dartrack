import React from "react";
import { useGame } from "../context/GameContext";
import PlayerTabs from "../components/PlayerTabs";
import ScoreBoard from "../components/ScoreBoard";
import ButtonGrid from "../components/ButtonGrid";
import EndTurnModal from "../components/EndTurnModal";
import WinnerModal from "../components/WinnerModal";
import Header from "../components/Header";

/*
 * GamePage
 * Top-level game layout combining header, player tabs, scoreboard and
 * the input keypad. Uses the active player's color as a background
 * accent and mounts the various modals used during play.
 */
export default function GamePage() {
  const { players, currentPlayerIndex } = useGame();

  const activeColor = players && players.length > 0 ? (players[currentPlayerIndex]?.color || "#0f172a") : "#0f172a";

  return (
    <div className="game-page min-h-screen" >
      {/* top nav bar stays the original dark color */}
      <div className="app-nav w-full bg-slate-900 mx-auto" style={{ maxWidth: 900 }}>
        <div className="nav-inner max-w-4xl mx-auto relative" style={{ minHeight: 56 }}>
          <div className="flex items-center justify-between" style={{ minHeight: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', height: 56 }}>
              <Header />
            </div>
            {/* placeholder so header and tabs share the row */}
            <div style={{ width: 200 }} />
          </div>
          {/* position tabs so their bottom edge sits exactly at the nav bottom */}
          <div className="player-tabs-wrapper" style={{ position: 'absolute', right: 20, bottom: -1 }}>
            <PlayerTabs />
          </div>
        </div>
      </div>

      {/* main game area uses the active player's color */}
      <div
        className="game-main p-4 mx-auto max-w-4xl flex flex-col items-stretch py-6"
        style={{ backgroundColor: activeColor, minHeight: '100vh', maxWidth: '900px', gap: '6rem' }}
      >
          <div className="score-wrapper mt-4 md:mt-6">
            <ScoreBoard />
          </div>
          <div className="grid-wrapper mt-2 md:mt-3">
            <ButtonGrid />
          </div>
      </div>

      <EndTurnModal />
      <WinnerModal />
    </div>
  );
}
