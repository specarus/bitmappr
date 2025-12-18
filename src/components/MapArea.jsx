import MapCanvas from "./MapCanvas.jsx";
import MapLegend from "./MapLegend.jsx";

import { useEffect, useRef, useState } from "react";

import { Eye, EyeOff } from "lucide-react";

export default function MapArea() {
  const [showTabs, setShowTabs] = useState(true);
  const [hasDestination, setHasDestination] = useState(false);
  const [biomeStats, setBiomeStats] = useState([]);
  const [popup, setPopup] = useState(null);
  const [pathDistance, setPathDistance] = useState(null);
  const popupTimerRef = useRef(null);

  useEffect(() => {
    const handler = (evt) =>
      setHasDestination(Boolean(evt?.detail?.hasDestination));
    window.addEventListener("path-state", handler);
    return () => window.removeEventListener("path-state", handler);
  }, []);

  useEffect(() => {
    const handler = (evt) => {
      const stats = evt?.detail?.stats;
      if (Array.isArray(stats)) {
        setBiomeStats(stats);
      }
    };
    window.addEventListener("biome-stats", handler);
    return () => window.removeEventListener("biome-stats", handler);
  }, []);

  useEffect(() => {
    const handler = (evt) => {
      const message = evt?.detail?.message || "Action not available here.";
      const duration = Number(evt?.detail?.duration) || 2400;
      setPopup({ message });
      if (popupTimerRef.current) {
        window.clearTimeout(popupTimerRef.current);
      }
      popupTimerRef.current = window.setTimeout(() => setPopup(null), duration);
    };
    window.addEventListener("terrain-popup", handler);
    return () => {
      window.removeEventListener("terrain-popup", handler);
      if (popupTimerRef.current) {
        window.clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (evt) => {
      const detail = evt?.detail;
      if (detail?.hasPath && typeof detail.length === "number") {
        setPathDistance(detail.length);
      } else {
        setPathDistance(null);
      }
    };
    window.addEventListener("path-summary", handler);
    return () => window.removeEventListener("path-summary", handler);
  }, []);

  const handleReset = () => {
    window.dispatchEvent(new Event("reset-path"));
    setHasDestination(false);
  };

  return (
    <div className="relative w-3/4 min-h-screen overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute w-80 h-80 -top-16 -left-10 bg-emerald-300 blur-[150px] opacity-80"></div>
        <div className="absolute w-96 h-96 -bottom-28 -right-24 bg-emerald-400 blur-[150px] opacity-80"></div>
      </div>

      <div className="w-full flex-1 p-4">
        <MapCanvas />
      </div>

      <div className="absolute z-10 bottom-7 left-7">
        <button
          type="button"
          className="flex items-center gap-4 px-4 py-2 rounded-full backdrop-blur-lg bg-[rgba(7,13,26,0.65)] border border-red-400/50 text-sm font-semibold text-white shadow-sm hover:bg-[rgba(7,13,26,0.9)] transition"
        >
          <span aria-hidden="true" className="live-dot"></span>
          Live
        </button>
      </div>

      <div className="absolute z-10 bottom-7 right-7 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowTabs(!showTabs)}
          className="p-2 rounded-full w-fit backdrop-blur-lg bg-[rgba(7,13,26,0.65)] shadow-md border border-white/10"
        >
          {showTabs ? (
            <Eye className="w-5 h-5 text-white" />
          ) : (
            <EyeOff className="w-5 h-5 text-white" />
          )}
        </button>

        {hasDestination && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full backdrop-blur-lg bg-[rgba(7,13,26,0.8)] border border-white/15 text-sm font-semibold text-white shadow-lg hover:bg-[rgba(7,13,26,0.9)] transition"
          >
            Reset
          </button>
        )}
      </div>

      {showTabs && (
        <div className="pointer-events-none absolute inset-0 z-20 left-7 top-7">
          <MapLegend />
        </div>
      )}

      {showTabs && (
        <div className="pointer-events-none absolute right-7 top-7 z-20 flex flex-col gap-3 max-w-xs">
          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[rgba(7,13,26,0.65)] backdrop-blur-lg shadow-lg p-4 space-y-3">
            <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-slate-300">
              Route markers
            </p>
            <div className="flex items-center justify-between text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                Start
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fb7185] shadow-[0_0_10px_rgba(251,113,133,0.5)]"></span>
                End
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-1.5 rounded-full bg-gradient-to-r from-[#22d3ee] via-[#a78bfa] to-[#fb7185]"></span>
                Path
              </div>
            </div>
          </div>

          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[rgba(7,13,26,0.65)] backdrop-blur-lg shadow-lg p-4 space-y-3">
            <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-slate-300">
              Biome mix
            </p>
            <div className="h-2 rounded-full overflow-hidden border border-white/10 bg-white/5 flex">
              {(biomeStats.length ? biomeStats : []).map((stat) => (
                <div
                  key={stat.key}
                  className="h-full"
                  style={{
                    width: `${Math.max(0, Math.min(stat.percent, 100)).toFixed(
                      1
                    )}%`,
                    background: `linear-gradient(90deg, ${stat.from}, ${stat.to})`,
                  }}
                ></div>
              ))}
              {!biomeStats.length && (
                <div className="h-full w-full bg-gradient-to-r from-[#1eb0fb] via-[#88e277] to-[#ffffff]"></div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-200">
              {(biomeStats.length ? biomeStats : []).map((stat) => (
                <div
                  key={`stat-${stat.key}`}
                  className="flex items-center gap-2"
                >
                  <span
                    className="w-3 h-3 rounded-sm border border-white/20"
                    style={{ background: stat.to }}
                  ></span>
                  {stat.percent < 0.1 ? "<0.1%" : `${stat.percent.toFixed(1)}%`}
                </div>
              ))}
              {!biomeStats.length && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-white/30 border border-white/20"></span>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {popup && (
        <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 z-30">
          <div className="pointer-events-auto px-4 py-2 rounded-full border border-emerald-300/40 bg-[rgba(7,13,26,0.65)] shadow-sm text-sm text-white backdrop-blur-lg">
            {popup.message}
          </div>
        </div>
      )}
    </div>
  );
}
