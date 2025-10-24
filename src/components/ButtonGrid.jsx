import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useGame } from "../context/GameContext";

/*
 * ButtonGrid
 * Numeric keypad and special buttons used to record dart throws.
 * Interaction notes:
 * - Tap a number quickly to record a single (addThrow(num, 'single')).
 * - Long-press a number to open the multiplier popup; hold-and-drag
 *   over 3 or 2 and release to commit triple/double respectively.
 * - Special buttons (BULL, CHERRY, BUST, UNDO) are handled separately.
 */
export default function ButtonGrid() {
  const { addThrow, turnEnded, undoLastThrow } = useGame();

  const HOLD_MS = 500;
  const holdTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const ignoreClickRef = useRef(false);
  const activePointerRef = useRef(null);

  const [popupInfo, setPopupInfo] = useState(null); // { score, anchorRect }
  const [hoveredMult, setHoveredMult] = useState(null); // 2 or 3 when pointer over multiplier
  const [selectingNumber, setSelectingNumber] = useState(null); // number currently being pressed (before popup)
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
    setHoveredMult(null);
  };

  const closePopup = () => setPopupInfo(null);

  const startPress = (num, isHoldable, e) => {
    if (turnEnded) return;
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    activePointerRef.current = e?.pointerId ?? null;
    longPressFiredRef.current = false;

    // if a popup is already open for another number, ignore other presses
    if (popupInfo && popupInfo.score !== num) return;

  if (!isHoldable) return;

  // mark which number is being pressed so other buttons can be visually disabled
  setSelectingNumber(num);

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
      setSelectingNumber(null);
    }, 300);
  };

  const cancelPress = (force = false) => {
    // if the long-press already fired (popup open) and not forced, don't cancel — user may be moving into popup
    if (!force && longPressFiredRef.current) return;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    longPressFiredRef.current = false;
    activePointerRef.current = null;
    setSelectingNumber(null);
  };

  // While popup is open, listen to pointermove/up to track which multiplier is under the pointer
  useEffect(() => {
    if (!popupInfo) return;

    const onPointerMove = (e) => {
      if (!popupRef.current) return;
      const children = Array.from(popupRef.current.children);
      const found = children.find((ch) => {
        const r = ch.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      });
      if (!found) {
        setHoveredMult(null);
      } else {
        // children are rendered in visual order [3, 2]
        const idx = children.indexOf(found);
        const mults = [3, 2];
        setHoveredMult(mults[idx] ?? null);
      }
    };

    const onPointerUp = (e) => {
      // only accept the pointer that started the press
      if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) return;
      if (hoveredMult) {
        const total = popupInfo.score * hoveredMult;
        const type = hoveredMult === 2 ? "double" : "triple";
        addThrow(total, type);
      } else if (popupInfo) {
        // if no hovered multiplier, but the release is inside the anchor button, count as single
        const r = popupInfo.anchorRect;
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          addThrow(popupInfo.score, "single");
        }
      }
      // close popup and reset
      setPopupInfo(null);
      setHoveredMult(null);
      setSelectingNumber(null);
      longPressFiredRef.current = false;
      ignoreClickRef.current = false;
      activePointerRef.current = null;
    };

    const onPointerCancel = () => {
      setPopupInfo(null);
      setHoveredMult(null);
      setSelectingNumber(null);
      longPressFiredRef.current = false;
      ignoreClickRef.current = false;
      activePointerRef.current = null;
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [popupInfo, hoveredMult, addThrow]);

  // selectMultiplier removed in favor of hold-and-drag selection

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
  <div className="button-grid buttonGrid relative flex flex-col items-center space-y-4">
      {/* match the numbers grid max width so special buttons never exceed other components */}
      <div className="flex space-x-2 justify-center flex-nowrap w-full mx-auto">
        {specialButtons.map((btn) => {
          const specialDisabled = Boolean(selectingNumber || popupInfo); // disable special buttons while selecting a multiplier
          return (
            <button
              key={btn}
              className={`specialButtons bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex-1 min-w-[56px] text-xs flex items-center justify-center lg:px-4 lg:py-3 lg:min-w-[112px] lg:text-sm ${specialDisabled ? 'opacity-40 pointer-events-none' : ''}`}
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
        ><span className="block text-center">{btn}</span></button>
      );
      })}
      </div>

  <div className="reg-buttons regButtons grid grid-cols-5 gap-2 w-full">
        {numbers.map((num) => {
          const disabledNum = Boolean((selectingNumber && selectingNumber !== num) || (popupInfo && popupInfo.score !== num));
          const isHeld = Boolean((selectingNumber && selectingNumber === num) || (popupInfo && popupInfo.score === num));
          return (
            <button
              key={num}
              id={`btn-${num}`}
              className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 relative touch-none ${disabledNum ? 'opacity-40 pointer-events-none' : ''} ${isHeld ? 'ring-2 ring-white scale-105' : ''} lg:px-8 lg:py-4 lg:text-2xl lg:min-w-[96px]`}
              onPointerDown={(e) => startPress(num, true, e)}
              onPointerUp={(e) => endPress(num, true, e)}
              onPointerCancel={cancelPress}
              onPointerLeave={cancelPress}
              onClick={handleClickGuard}
              onKeyDown={(e) => handleKeyDown(num, e)}
            >
              {num}
            </button>
          );
        })}
      </div>

      {popupInfo && (
        <div
          ref={popupRef}
          className="fixed text-white p-0 rounded shadow-lg z-50 flex flex-col items-stretch overflow-visible touch-none"
          style={{ top: popupPos.y, left: popupPos.x, width: popupPos.width || popupInfo.anchorRect.width }}
        >
          {[3, 2].map((mult) => (
            <button
              key={mult}
              className={`px-4 m-0 rounded transform transition-transform touch-none ${getMultiplierColor(popupInfo.score)} ${hoveredMult === mult ? 'scale-110' : ''}`}
              style={{ width: "100%", height: popupPos.anchorH ? `${popupPos.anchorH}px` : undefined }}
              onPointerDown={(e) => {
                // prevent the button behind from seeing this pointer and closing the popup
                e.stopPropagation();
                e.preventDefault();
                // also mark hovered immediately for direct presses
                setHoveredMult(mult);
              }}
            >
              {popupInfo.score * mult}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
