import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { BIOME_META } from "../biome-meta.js";

const MOVEMENT_PACE_ENTRIES = BIOME_META.filter((meta) => meta.timePerKm > 0);

const formatDuration = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0m";
  }
  const totalMinutes = Math.max(0, Math.round(value));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (hours) {
    parts.push(`${hours}h`);
  }
  if (minutes || !parts.length) {
    parts.push(`${minutes}m`);
  }
  return parts.join(" ");
};

const formatMinutes = (value) => formatDuration(value);
const formatTimePerKm = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0 min";
  }
  const minutes = Math.max(0, Math.round(value));
  return `${minutes} min`;
};

export default function Sidebar() {
  const [pathSummary, setPathSummary] = useState({
    hasPath: false,
    timePerKm: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handler = (evt) => {
      const detail = evt?.detail || {};
      setPathSummary({
        hasPath: Boolean(detail.hasPath),
        length: detail.length,
        cost: detail.cost,
        timePerKm: detail.timePerKm,
        maps: detail.maps,
      });
    };
    window.addEventListener("path-summary", handler);
    return () => window.removeEventListener("path-summary", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      setTimeout(() => setRefreshing(false), 0);
    };
    window.addEventListener("map-ready", handler);
    return () => window.removeEventListener("map-ready", handler);
  }, []);

  const handleRegenerate = () => {
    setRefreshing(true);
    window.dispatchEvent(new Event("regenerate-map"));
  };

  const mapChips = pathSummary?.maps
    ? [
        { key: "water", label: "Water", color: "#28ffff" },
        { key: "sand", label: "Sand", color: "#f5e9bb" },
        { key: "grass", label: "Grass", color: "#88e277" },
        { key: "trees", label: "Trees", color: "#1f8c50" },
        { key: "mountain", label: "Rock", color: "#a3988e" },
        { key: "snow", label: "Snow", color: "#ffffff" },
      ].filter((item) => pathSummary.maps[item.key] > 0)
    : [];

  return (
    <div
      id="sidebar"
      className="w-1/4 min-h-screen relative overflow-hidden border-r border-white/10 bg-white/5 backdrop-blur-md"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-48 h-48 -top-10 -right-6 bg-gradient-to-br from-emerald-800 to-emerald-500 blur-[70px] opacity-40 animate-pulse"></div>
        <div className="absolute w-52 h-52 -bottom-16 -left-10 bg-gradient-to-br from-emerald-400 to-emerald-200 blur-[80px] opacity-40 animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute w-28 h-28 top-24 left-10 rounded-full border border-white/20 animate-ping"></div>
      </div>

      <div className="relative h-full flex flex-col gap-5 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-panel backdrop-blur-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-300 mb-1">
                Route flow
              </p>
              <h2 className="text-xl font-semibold leading-tight">
                Tap &gt; Tap &gt; Done
              </h2>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={refreshing}
              className={`w-fit p-2 rounded-full transition border border-white/10 shadow-sm ${
                refreshing
                  ? "bg-emerald-400/60 text-slate-900/70 cursor-not-allowed"
                  : "bg-emerald-400 text-slate-900 hover:bg-emerald-400/90"
              }`}
            >
              <div
                className={`grid place-items-center ${
                  refreshing ? "animate-spin" : ""
                }`}
              >
                <RotateCw className="w-4 h-4" />
              </div>
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full border border-white/15 bg-gradient-to-br from-[#0ea5e9] to-[#22d3ee] text-[#04101c] font-semibold text-sm grid place-items-center">
                1
              </span>
              <div className="text-sm">
                <p className="m-0 font-semibold">Start</p>
                <p className="m-0 text-[11px] text-slate-300">First click</p>
              </div>
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/0 via-white/30 to-white/0"></div>
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full border border-white/15 bg-gradient-to-br from-[#f472b6] to-[#fb7185] text-[#1a0a13] font-semibold text-sm grid place-items-center">
                2
              </span>
              <div className="text-sm">
                <p className="m-0 font-semibold">Destination</p>
                <p className="m-0 text-[11px] text-slate-300">Second click</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 shadow-panel backdrop-blur-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400 mb-1">
                Path summary
              </p>
              <p className="text-sm font-semibold m-0 text-white">
                {pathSummary.hasPath ? "Route found" : "Awaiting selection"}
              </p>
            </div>
          </div>
          {pathSummary.hasPath && (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <p className="m-0 text-[11px] uppercase tracking-[0.08em] text-slate-300">
                    Length
                  </p>
                  <p className="m-0 text-sm font-semibold text-white">
                    {pathSummary.length || 0} km
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <p className="m-0 text-[11px] uppercase tracking-[0.08em] text-slate-300">
                    Total time
                  </p>
                  <p className="m-0 text-sm font-semibold text-white">
                    {formatMinutes(pathSummary.cost)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs text-slate-200">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <p className="m-0 text-[11px] uppercase tracking-[0.08em] text-slate-300">
                    Time / km
                  </p>
                  <p className="m-0 text-sm font-semibold text-white">
                    {formatTimePerKm(pathSummary.timePerKm)}
                  </p>
                </div>
              </div>
              {mapChips.length > 0 && (
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {mapChips.map((chip) => {
                    const total = Object.values(pathSummary.maps).reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percent = total
                      ? Math.round((pathSummary.maps[chip.key] / total) * 100)
                      : 0;
                    return (
                      <span
                        key={chip.key}
                        className="px-2 py-1 rounded-full border border-white/15 bg-white/5 text-slate-100 flex items-center gap-2"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: chip.color }}
                        ></span>
                        {chip.label}
                        <span className="text-slate-400">{percent}%</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 shadow-panel backdrop-blur-lg p-4 space-y-3 pointer-events-auto">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400 mb-1">
              Movement pace
            </p>
            <p className="text-[11px] text-slate-300 m-0">
              Time per kilometer by terrain
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MOVEMENT_PACE_ENTRIES.map((entry) => (
              <div
                key={`pace-${entry.key}`}
                className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 space-y-1"
              >
                <p className="m-0 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  {entry.label}
                </p>
                <div className="flex items-center gap-2">
                  <p className="m-0 text-sm font-semibold text-white">
                    {formatTimePerKm(entry.timePerKm)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
