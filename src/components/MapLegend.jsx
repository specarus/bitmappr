export default function MapLegend({ show = true }) {
  const biomes = [
    { name: "Water", from: "#1eb0fb", to: "#28ffff" },
    { name: "Sand", from: "#d7c08c", to: "#f5e9bb", cost: 1 },
    { name: "Grass", from: "#41b45a", to: "#88e277", cost: 1 },
    { name: "Trees", from: "#1f8c50", to: "#0f6e44", cost: 2 },
    { name: "Mountain", from: "#64605c", to: "#a3988e", cost: 3 },
    { name: "Snow", from: "#dce8f0", to: "#ffffff", cost: 4 },
  ];

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
        {biomes.map((biome) => (
          <div
            key={biome.name}
            className="flex items-center text-sm gap-2 font-semibold"
          >
            <span
              className={`w-4 h-4 rounded-md border border-white/30 bg-gradient-to-br from-[${biome.from}] to-[${biome.to}]`}
            ></span>
            {biome.name}
          </div>
        ))}
      </div>
    </div>
  );
}
