export default function TerrainLegend() {
  return (
    <div
      id="terrain-legend"
      className="pointer-events-auto relative z-10 bg-[rgba(7,13,26,0.65)] border border-white/10 rounded-2xl shadow-panel backdrop-blur-lg p-5 min-w-[280px]"
    >
      <p className="m-0 uppercase tracking-[0.12em] text-xs text-slate-300">
        Terrain key
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-4 h-4 rounded-md border border-white/30 bg-gradient-to-br from-[#1eb0fb] to-[#28ffff]"></span>
          Water (blocked)
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-4 h-4 rounded-md border border-white/30 bg-gradient-to-br from-[#d7c08c] to-[#f5e9bb]"></span>
          Sand
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-4 h-4 rounded-md border border-white/30 bg-gradient-to-br from-[#41b45a] to-[#88e277]"></span>
          Grass
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-4 h-4 rounded-md border border-white/30 bg-gradient-to-br from-[#1f8c50] to-[#0f6e44]"></span>
          Trees
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-4 h-4 rounded-md border border-white/30 bg-gradient-to-br from-[#64605c] to-[#a3988e]"></span>
          Mountain
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-4 h-4 rounded-md border border-white/30 bg-gradient-to-br from-[#dce8f0] to-[#ffffff]"></span>
          Snow
        </div>
      </div>
    </div>
  );
}
