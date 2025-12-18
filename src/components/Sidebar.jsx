export default function Sidebar() {
  return (
    <div
      id="sidebar"
      className="w-1/3 min-h-screen relative overflow-hidden border-r border-white/10 bg-white/5 backdrop-blur-md"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-48 h-48 -top-10 -right-6 bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] blur-[70px] opacity-40 animate-pulse"></div>
        <div className="absolute w-52 h-52 -bottom-16 -left-10 bg-gradient-to-br from-[#ff8f70] to-[#ff2fb0] blur-[80px] opacity-40 animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute w-28 h-28 top-24 left-10 rounded-full border border-white/20 animate-ping"></div>
      </div>

      <div className="relative h-full flex flex-col gap-5 p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-panel backdrop-blur-lg p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-300 mb-1">
            Explorer
          </p>
          <h2 className="text-xl font-semibold mb-2">Navigation brief</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Plot start and end points on the right map. A* respects terrain
            weight and avoids water. Reset by clicking a new start.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 shadow-panel backdrop-blur-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
              Terrain modes
            </p>
            <p className="text-lg font-semibold">6 biomes</p>
            <p className="text-xs text-slate-400">Water blocks | Snow costly</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 shadow-panel backdrop-blur-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
              Path weight
            </p>
            <p className="text-lg font-semibold">Cost-aware</p>
            <p className="text-xs text-slate-400">Higher cost slows routes</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-panel backdrop-blur-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2ed5ff] animate-ping"></span>
              <p className="text-sm font-semibold m-0">Live generation</p>
            </div>
            <span className="text-xs text-slate-400">Click to refresh</span>
          </div>
          <p className="text-xs text-slate-300">
            Refresh the page to regenerate the procedural map. Zoom level and
            noise blend create new coastlines and elevation.
          </p>
        </div>
      </div>
    </div>
  );
}
