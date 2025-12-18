import TerrainCanvas from "./TerrainCanvas.jsx";
import MapInfo from "./MapInfo.jsx";
import TerrainLegend from "./TerrainLegend.jsx";
import MapInstructions from "./MapInstructions.jsx";

export default function MapArea() {
  return (
    <div className="relative w-2/3 min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute w-80 h-80 -top-16 -left-10 bg-[radial-gradient(circle,#2ed5ff_0%,transparent_60%)] blur-[52px] opacity-80"></div>
        <div className="absolute w-96 h-96 -bottom-28 -right-24 bg-[radial-gradient(circle,#ff3ba6_0%,transparent_70%)] blur-[52px] opacity-80"></div>
      </div>

      <TerrainCanvas />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-4 px-7 py-7 md:px-6 sm:px-4 sm:py-5 z-20">
        <div className="flex flex-wrap gap-4">
          <MapInfo />
          <TerrainLegend />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <MapInstructions />
          <div className="pointer-events-auto px-4 py-3 rounded-xl border border-white/10 bg-[rgba(4,9,18,0.75)] text-slate-300 font-semibold shadow-panel">
            Magenta line = path | Gold dot = start | Orange pin = destination
          </div>
        </div>
      </div>
    </div>
  );
}
