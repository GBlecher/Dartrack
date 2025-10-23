import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useGame } from "../context/GameContext";

export default function ButtonGrid() {
  const { addThrow, turnEnded, undoLastThrow } = useGame();

  const HOLD_MS = 500;
  const holdTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const ignoreClickRef = useRef(false);
  const activePointerRef = useRef(null);

  const [popupInfo, setPopupInfo] = useState(null); // { score, anchorRect }
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);

  // Standard dartboard sequence (clockwise) used to pick colors like before
  const dartboardNumbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const getMultiplierColor = (num) => {
    const index = dartboardNumbers.indexOf(num);
    return index % 2 === 0 ? "bg-red-600" : "bg-green-600";
  };

  // Document listener closes popup on next pointerdown outside
  useEffect(() => {
    if (!popupInfo) return;
    const onDocPointer = (e) => {
      // if pointerdown occurs inside popup, do nothing (popup handlers stop propagation)
      // otherwise close popup
      if (!popupRef.current) return;
      if (!popupRef.current.contains(e.target)) closePopup();
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [popupInfo]);

  // Compute popup position synchronously after DOM updates to avoid measurement race
  useLayoutEffect(() => {
    if (!popupInfo) return;
    const anchor = popupInfo.anchorRect;
    const anchorW = anchor.width || 80;
    const anchorH = anchor.height || 40;

    // Deterministic sizing: popup width == anchor width, height == 2 * anchor height
    const popupW = anchorW;
    const popupH = anchorH * 2;

    // Align popup horizontally with the anchor
    let x = anchor.left;
    if (x + popupW > window.innerWidth) x = window.innerWidth - popupW - 8;
    x = Math.max(8, x);

    // Place directly above (touching). If not enough space, place below the anchor.
    let y = anchor.top - popupH;
    if (y < 8) y = anchor.bottom;

    setPopupPos({ x, y, width: popupW, height: popupH, anchorW, anchorH });

    const onResize = () => {
      // recompute quickly on resize
      let nx = anchor.left;
      if (nx + popupW > window.innerWidth) nx = window.innerWidth - popupW - 8;
      nx = Math.max(8, nx);
      let ny = anchor.top - popupH;
      if (ny < 8) ny = anchor.bottom;
      setPopupPos((s) => ({ ...s, x: nx, y: ny }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [popupInfo]);

  // show popup near button (store anchor rect)
  const openPopupFor = (num) => {
    const el = document.getElementById(`btn-${num}`);
    let anchorRect = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    if (el) {
      const rect = el.getBoundingClientRect();
      anchorRect = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    }
    setPopupInfo({ score: num, anchorRect });
  };

  const closePopup = () => setPopupInfo(null);

  const startPress = (num, isHoldable, e) => {
    if (turnEnded) return;
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    activePointerRef.current = e?.pointerId ?? null;
    longPressFiredRef.current = false;

    if (!isHoldable) return;

    holdTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      ignoreClickRef.current = true; // prevent next synthetic click
      openPopupFor(num);
    }, HOLD_MS);
  };

  const endPress = (num, isHoldable, e) => {
    // ignore pointerups from other pointers
    if (activePointerRef.current !== null && e && e.pointerId !== activePointerRef.current) return;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // If long press fired and popup is open, do NOT trigger an action on release.
    // The user will explicitly tap a multiplier or tap the original button again.
    if (longPressFiredRef.current && popupInfo) {
      // just reset state and keep popup open
      // (do not addThrow or closePopup here)
    } else if (!longPressFiredRef.current) {
      // quick tap: only record as a single if this is a numeric (holdable) button.
      if (isHoldable) {
        addThrow(num, "single");
      }
      // for special (non-holdable) buttons we handle actions in their onClick handler
    }

    // Reset ignore after short delay to swallow synthetic clicks
    setTimeout(() => {
      ignoreClickRef.current = false;
      longPressFiredRef.current = false;
      activePointerRef.current = null;
    }, 300);
  };

  const cancelPress = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    longPressFiredRef.current = false;
    activePointerRef.current = null;
  };

  const selectMultiplier = (mult, e) => {
    if (!popupInfo) return;
    if (e && e.stopPropagation) {
      // prevent the document handler from immediately closing before we compute
      e.stopPropagation();
      e.preventDefault();
    }
    const total = popupInfo.score * mult;
    const type = mult === 2 ? "double" : "triple";
    addThrow(total, type);
    // close popup after multiplier selection as "next" click
    closePopup();
  };

  const handleClickGuard = (e) => {
    if (ignoreClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleKeyDown = (num, e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addThrow(num, "single");
      // close popup on keyboard-triggered clicks if open
      if (popupInfo) closePopup();
    }
  };

  const specialButtons = ["MISS", "BULL", "CHERRY", "BUST", "UNDO"];
  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="buttonGrid relative flex flex-col items-center space-y-4">
      <div className="flex space-x-2 flex-wrap justify-center">
        {specialButtons.map((btn) => (
          <button
            key={btn}
            className="specialButtons bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onPointerDown={(e) => startPress(btn, false, e)}
            onPointerUp={(e) => endPress(btn, false, e)}
            onPointerCancel={cancelPress}
            onPointerLeave={cancelPress}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              switch (btn) {
                case "MISS":
                  addThrow(0, "MISS");
                  break;
                case "BULL":
                  addThrow(25, "BULL");
                  break;
                case "CHERRY":
                  addThrow(50, "CHERRY");
                  break;
                case "BUST":
                  addThrow("BUST", "BUST");
                  break;
                case "UNDO":
                  undoLastThrow();
                  break;
                default:
                  break;
              }
            }}
          >
            {btn}
          </button>
        ))}
      </div>

      <div className="regButtons grid grid-cols-5 gap-2 w-full max-w-md">
        {numbers.map((num) => (
          <button
            key={num}
            id={`btn-${num}`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 relative"
            onPointerDown={(e) => startPress(num, true, e)}
            onPointerUp={(e) => endPress(num, true, e)}
            onPointerCancel={cancelPress}
            onPointerLeave={cancelPress}
            onClick={handleClickGuard}
            onKeyDown={(e) => handleKeyDown(num, e)}
          >
            {num}
          </button>
        ))}
      </div>

      {popupInfo && (
        <div
          ref={popupRef}
          className="fixed text-white p-0 rounded shadow-lg z-50 flex flex-col items-stretch overflow-visible"
          style={{ top: popupPos.y, left: popupPos.x, width: popupPos.width || popupInfo.anchorRect.width }}
        >
          {[3, 2].map((mult) => (
            <button
              key={mult}
              className={`px-4 m-0 rounded hover:brightness-90 ${getMultiplierColor(popupInfo.score)}`}
              style={{ width: "100%", height: popupPos.anchorH ? `${popupPos.anchorH}px` : undefined }}
              onPointerDown={(e) => {
                // prevent the button behind from seeing this pointer and closing the popup
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => selectMultiplier(mult, e)}
            >
              {popupInfo.score * mult}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
