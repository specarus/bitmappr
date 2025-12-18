import { useEffect, useState } from "react";

export default function TerrainLegend({ show = true }) {
  const [render, setRender] = useState(show);
  const [visible, setVisible] = useState(false);
  const biomes = [
    { name: "Water", from: "#1eb0fb", to: "#28ffff" },
    { name: "Sand", from: "#d7c08c", to: "#f5e9bb" },
    { name: "Grass", from: "#41b45a", to: "#88e277" },
    { name: "Trees", from: "#1f8c50", to: "#0f6e44" },
    { name: "Mountain", from: "#64605c", to: "#a3988e" },
    { name: "Snow", from: "#dce8f0", to: "#ffffff" },
  ];

  useEffect(() => {
    if (show) {
      setRender(true);
      const timer = setTimeout(() => setVisible(true), 40);
      return () => clearTimeout(timer);
    }
    setVisible(false);
    const hideTimer = setTimeout(() => setRender(false), 500);
    return () => clearTimeout(hideTimer);
  }, [show]);

  if (!render) {
    return null;
  }

  return (
    <div
      id="terrain-legend"
      className={`pointer-events-auto w-fit relative z-10 bg-[rgba(7,13,26,0.65)] border border-white/10 rounded-2xl shadow-md backdrop-blur-lg p-4 transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
      }`}
    >
      <p className="m-0 uppercase tracking-[0.12em] text-sm text-slate-300">
        Terrain Legend
      </p>
      <div className="flex flex-col gap-3 mt-3">
        {biomes.map((biome) => (
          <div
            key={biome.name}
            className="flex items-center gap-2 font-semibold"
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
