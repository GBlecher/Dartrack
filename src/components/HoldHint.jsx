import React from "react";

/*
 * HoldHint
 * Small speech-bubble hint that explains the hold-to-open multiplier
 * interaction. Animated on mount/unmount via a scale+opacity transition.
 */
export default function HoldHint({ show = true, onClose = () => {}, pos = null }) {
  // pos: { x, y, width, height } in viewport coordinates for anchor element
  const style = pos
    ? {
        // Use fixed positioning so the hint anchors to viewport coordinates
        // returned by getBoundingClientRect(). This keeps the hint correctly
        // placed above the target button even when ancestors are transformed.
        position: "fixed",
        left: `${pos.x + pos.width / 2}px`,
        top: `${pos.y - 8}px`, // slightly above the anchor top
        transform: "translate(-50%, -100%)",
      }
    : { position: "fixed", left: "50%", bottom: "10rem", transform: "translateX(-50%)" };

  return (
    <div
      aria-hidden={!show}
      className={`hold-hint z-30 transition-opacity duration-300 ease-out ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={{ maxWidth: 320, ...style }}
    >
      <div className="bg-white text-black rounded-lg shadow-lg px-4 py-3 flex items-start gap-3">
        <div className="flex-1">
          <div className="font-semibold">Tip</div>
          <div className="text-sm mt-1">Hold down a number to choose Double or Triple - drag and release over the multiplier.</div>
        </div>
        <button
          aria-label="Close hint"
          onClick={onClose}
          className="ml-2 text-gray-600 hover:text-gray-800"
          style={{ lineHeight: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* little speech pointer */}
      <div className="w-0 h-0 mx-auto" style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '12px solid white' }} />
    </div>
  );
}
