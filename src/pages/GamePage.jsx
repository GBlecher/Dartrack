import React from "react";
import { useGame } from "../context/GameContext";
import PlayerTabs from "../components/PlayerTabs";
import ScoreBoard from "../components/ScoreBoard";
import ButtonGrid from "../components/ButtonGrid";
import EndTurnModal from "../components/EndTurnModal";
import WinnerModal from "../components/WinnerModal";
import Header from "../components/Header";

export default function GamePage() {
  useGame();

  // ButtonGrid already uses context's addThrow; keep GamePage simple
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <Header />
      <PlayerTabs />
      <ScoreBoard />
      <ButtonGrid />
  <EndTurnModal />
  <WinnerModal />
    </div>
  );
}
