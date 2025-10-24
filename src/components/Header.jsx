import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/*
 * Header (hamburger menu)
 * Small navigation drawer used in the game page. Provides access to the
 * Rule Book and an Exit action. The drawer manages its own open/close state
 * and keyboard escape handling.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const exitGame = () => {
    // navigate to Home without resetting current game state
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* hamburger button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          aria-label="menu"
          onClick={() => setOpen((s) => !s)}
          className="p-2 rounded bg-white/10 hover:bg-white/20 text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* overlay */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* sliding drawer */}
      <aside
        ref={menuRef}
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white transform transition-transform duration-300 shadow-lg ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="font-bold text-lg">Menu</h2>
          <button aria-label="close" onClick={() => setOpen(false)} className="p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded"
            onClick={() => {
              // navigate to rulebook and pass the current path so the rule page can return
              navigate('/rules', { state: { from: window.location.pathname } });
              setOpen(false);
            }}
          >
            Rule Book
          </button>

          <button
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded"
            onClick={() => {
              exitGame();
              setOpen(false);
            }}
          >
            Exit Game
          </button>

         
        </nav>
      </aside>
    </>
  );
}
