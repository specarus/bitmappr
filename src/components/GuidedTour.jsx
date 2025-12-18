import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

const steps = [
  {
    id: "sidebar-intro",
    targetId: "sidebar",
    placement: "right",
    title: "Start with the brief",
    body: "Read the left panel to remember how paths are built: click the map to set a start, then an end. Water is blocked and costs vary per biome.",
  },
  {
    id: "map-interaction",
    targetId: "map-frame",
    placement: "left",
    title: "Drop points on the map",
    body: "Click once to place your origin, again to set the destination. A* draws the magenta route based on terrain cost. Click anywhere else to restart.",
  },
  {
    id: "legend-callout",
    targetId: "terrain-legend",
    placement: "bottom",
    title: "Use the terrain legend",
    body: "Check which colors mean sand, forest, or snow. Toggle the legend with the eye button when you want more room.",
  },
];

const HIGHLIGHT_PADDING = 12;

function getBubblePosition(anchor, placement) {
  const centerX = anchor.left + anchor.width / 2;
  const centerY = anchor.top + anchor.height / 2;

  switch (placement) {
    case "right":
      return { top: centerY, left: anchor.right + 20, transform: "translateY(-50%)" };
    case "left":
      return { top: centerY, left: anchor.left - 20, transform: "translate(-100%, -50%)" };
    case "bottom":
      return { top: anchor.bottom + 20, left: centerX, transform: "translate(-50%, 0)" };
    case "top":
    default:
      return { top: anchor.top - 20, left: centerX, transform: "translate(-50%, -100%)" };
  }
}

function getArrowPosition(placement) {
  switch (placement) {
    case "right":
      return { left: -6, top: "50%", transform: "translate(-50%, -50%) rotate(45deg)" };
    case "left":
      return { right: -6, top: "50%", transform: "translate(50%, -50%) rotate(45deg)" };
    case "bottom":
      return { top: -6, left: "50%", transform: "translate(-50%, -50%) rotate(45deg)" };
    case "top":
    default:
      return { bottom: -6, left: "50%", transform: "translate(-50%, 50%) rotate(45deg)" };
  }
}

function highlightStyle(anchor) {
  if (!anchor) {
    return { display: "none" };
  }
  return {
    top: anchor.top - HIGHLIGHT_PADDING,
    left: anchor.left - HIGHLIGHT_PADDING,
    width: anchor.width + HIGHLIGHT_PADDING * 2,
    height: anchor.height + HIGHLIGHT_PADDING * 2,
  };
}

function getOverlaySegments(anchor) {
  const base = {
    background: "linear-gradient(145deg, rgba(5,9,19,0.72), rgba(5,9,19,0.58))",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };

  if (!anchor) {
    return [{ ...base, top: 0, left: 0, right: 0, bottom: 0 }];
  }

  const pad = HIGHLIGHT_PADDING + 6;
  const safeTop = Math.max(anchor.top - pad, 0);
  const safeLeft = Math.max(anchor.left - pad, 0);
  const safeRight = anchor.right + pad;
  const safeBottom = anchor.bottom + pad;
  const overlayHeight = anchor.height + pad * 2;

  return [
    { ...base, top: 0, left: 0, right: 0, height: safeTop },
    { ...base, top: safeTop, left: 0, width: safeLeft, height: overlayHeight },
    { ...base, top: safeTop, left: safeRight, right: 0, height: overlayHeight },
    { ...base, top: safeBottom, left: 0, right: 0, bottom: 0 },
  ];
}

export default function GuidedTour() {
  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);

  const currentStep = useMemo(() => steps[stepIndex], [stepIndex]);
  const isLast = stepIndex === steps.length - 1;
  const hasPrev = stepIndex > 0;

  useEffect(() => {
    const startTimer = setTimeout(() => setActive(true), 450);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const updateAnchor = () => {
      const el = document.getElementById(currentStep.targetId);
      setAnchorRect(el ? el.getBoundingClientRect() : null);
    };

    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, { passive: true });
    window.addEventListener("map-ready", updateAnchor);

    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor);
      window.removeEventListener("map-ready", updateAnchor);
    };
  }, [active, currentStep]);

  if (!active) {
    return null;
  }

  const bubblePosition = anchorRect
    ? getBubblePosition(anchorRect, currentStep.placement)
    : { top: "20%", left: "50%", transform: "translateX(-50%)" };

  const arrowPosition = anchorRect ? getArrowPosition(currentStep.placement) : { display: "none" };
  const overlaySegments = getOverlaySegments(anchorRect);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {overlaySegments.map((segment, idx) => (
        <div
          key={`overlay-${idx}`}
          className="absolute inset-0 z-0 pointer-events-auto"
          style={segment}
        ></div>
      ))}

      <div
        className="absolute z-10 rounded-2xl border border-cyan-200/80 shadow-[0_0_40px_rgba(34,211,238,0.35)] animate-[pulse_2s_ease-in-out_infinite] pointer-events-none transition-all duration-300"
        style={highlightStyle(anchorRect)}
      ></div>

      <div className="absolute z-20" style={bubblePosition}>
        <div
          className="relative max-w-md bg-[rgba(10,16,28,0.95)] border border-white/10 shadow-2xl rounded-2xl p-4 text-white pointer-events-auto"
          style={{ backdropFilter: "none" }}
        >
          <div
            className="absolute w-3 h-3 bg-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.7)] rounded-[2px]"
            style={arrowPosition}
          ></div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-200/80 mb-1">
                Step {stepIndex + 1} of {steps.length}
              </p>
              <h3 className="text-lg font-semibold leading-tight">{currentStep.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setActive(false)}
              className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-200"
              aria-label="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed mt-2">{currentStep.body}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => hasPrev && setStepIndex((idx) => Math.max(0, idx - 1))}
              disabled={!hasPrev}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm border transition ${
                hasPrev
                  ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  : "border-white/5 text-slate-500 cursor-not-allowed"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Prev
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActive(false)}
                className="px-3 py-2 rounded-xl text-sm border border-white/10 bg-white/5 hover:bg-white/10 transition text-white"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => (isLast ? setActive(false) : setStepIndex((idx) => Math.min(steps.length - 1, idx + 1)))}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-[#22d3ee] text-[#05111b] hover:bg-[#1cbdd9] transition shadow-[0_10px_30px_rgba(34,211,238,0.3)]"
              >
                {isLast ? "Finish" : "Next"}
                {!isLast && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
