export default function MapInfo() {
  return (
    <div className="pointer-events-auto relative z-10 bg-[rgba(7,13,26,0.65)] border border-white/10 rounded-2xl shadow-panel backdrop-blur-lg p-5 max-w-xl">
      <p className="m-0 uppercase tracking-[0.16em] text-xs text-slate-300">
        BitMappr
      </p>
      <h1 className="mt-2 mb-2 text-2xl md:text-3xl font-semibold leading-tight">
        Terrain pathfinding playground
      </h1>
      <p className="m-0 text-slate-300 text-[15px]">
        Click to set a start point, then a destination. The map uses
        terrain-aware A* - water is impassable and tougher terrain slows paths.
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="px-3 py-2 rounded-full text-sm font-semibold text-[#0e0813] bg-gradient-to-r from-[#ff8f70] to-[#ff2fb0] shadow-[0_10px_30px_rgba(255,47,176,0.45)]">
          Procedural map
        </span>
        <span className="px-3 py-2 rounded-full text-sm font-semibold text-slate-200 border border-white/10 bg-white/5 backdrop-blur-md">
          Weighted A*
        </span>
      </div>
    </div>
  );
}
