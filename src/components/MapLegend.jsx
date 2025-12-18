import { BIOME_META } from "../biome-meta.js";

export default function MapLegend({ show = true }) {
  if (!show) {
    return null;
  }

  return (
    <div
      id="map-legend"
      className="pointer-events-auto w-fit relative z-10 bg-[rgba(7,13,26,0.65)] border border-white/10 rounded-2xl shadow-md backdrop-blur-lg p-4"
    >
      <p className="m-0 uppercase tracking-[0.12em] text-xs text-slate-300">
        Map Legend
      </p>
      <div className="flex flex-col gap-3 mt-3">
        {BIOME_META.map((biome) => (
          <div
            key={biome.key}
            className="flex items-center text-sm gap-2 font-semibold"
          >
            <span
              className={`w-4 h-4 rounded-md border border-white/30 bg-gradient-to-br from-[${biome.from}] to-[${biome.to}]`}
            ></span>
            {biome.label}
          </div>
        ))}
      </div>
    </div>
  );
}
