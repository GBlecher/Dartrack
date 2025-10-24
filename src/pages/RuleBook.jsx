import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function RuleBook() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    // If we came from a game page, go back there; otherwise go to home
    if (location.state && location.state.from) {
      navigate(location.state.from, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="rulebook min-h-screen p-6 bg-slate-50">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6" style={{ maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}>
        <h1 className="text-2xl font-bold mb-4">Darts Game Rules (301 &amp; 501)</h1>

        <h2 className="font-semibold">Objective:</h2>
        <p className="mb-3">Be the first to reduce your score from 301 or 501 to exactly zero. The first to reach zero wins.</p>

        <h2 className="font-semibold">Gameplay:</h2>
        <p className="mb-3">Players take turns throwing three darts per turn. Subtract the total points scored from your current score (starting at 301 or 501).</p>

        <h2 className="font-semibold">Scoring:</h2>
        <p className="mb-3">Each dart scores the number it hits on the board. Outer bullseye (BULL) = 25 points, inner bullseye (CHERRY) = 50 points. Doubles and triples multiply the segment score by 2 or 3.</p>

        <h2 className="font-semibold">How to Win:</h2>
        <p className="mb-3">To finish, you must reach exactly zero. Your last dart must land on a double. If your final score becomes zero without ending on a double, it is a bust.</p>

        <h2 className="font-semibold">Busting (Making a Mistake):</h2>
        <p className="mb-3">A bust occurs when:</p>
        <ul className="list-disc list-inside mb-3">
          <li>Your score goes below zero.</li>
          <li>Your score is exactly one (which is impossible to finish properly).</li>
          <li>Your score is exactly zero but your last throw was not a double (incorrect finishing).</li>
        </ul>
        <p className="mb-3">After a bust, that player's score reverts to the score before they started their turn, and the next player takes their turn.</p>

        {/* empty spacer so content doesn't sit under the fixed button */}
        <div style={{ height: 72 }} />
      </div>
      {/* fixed Back button so it remains visible while the rules scroll */}
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={goBack}
          className="px-4 py-3 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700"
          aria-label="Back to game"
        >
          Back to game
        </button>
      </div>
    </div>
  );
}
