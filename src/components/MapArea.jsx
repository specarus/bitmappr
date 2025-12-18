import TerrainCanvas from "./TerrainCanvas.jsx";
import TerrainLegend from "./TerrainLegend.jsx";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

export default function MapArea() {
  const [showTabs, setShowTabs] = useState(true);

  return (
    <div className="relative w-2/3 min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute w-80 h-80 -top-16 -left-10 bg-[radial-gradient(circle,#2ed5ff_0%,transparent_60%)] blur-[52px] opacity-80"></div>
        <div className="absolute w-96 h-96 -bottom-28 -right-24 bg-[radial-gradient(circle,#ff3ba6_0%,transparent_70%)] blur-[52px] opacity-80"></div>
      </div>

      <div className="w-full h-full p-4">
        <TerrainCanvas />
      </div>

      <button
        onClick={() => setShowTabs(!showTabs)}
        className="absolute z-10 p-3 rounded-full backdrop-blur-lg bg-[rgba(7,13,26,0.65)] bottom-7 right-7 shadow-md"
      >
        {showTabs ? (
          <Eye className="w-7 h-7 text-white" />
        ) : (
          <EyeOff className="w-7 h-7 text-white" />
        )}
      </button>

      {showTabs && (
        <div className="pointer-events-none absolute inset-0 z-20 left-7 top-7">
          <TerrainLegend />
        </div>
      )}
    </div>
  );
}
