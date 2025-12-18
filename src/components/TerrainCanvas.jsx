import { useEffect, useRef } from "react";
import { createTerrainSketch } from "../sketch.js";

export default function TerrainCanvas() {
  const frameRef = useRef(null);

  useEffect(() => {
    if (!frameRef.current) {
      return undefined;
    }
    const instance = createTerrainSketch(frameRef.current);
    return () => {
      if (instance) {
        instance.remove();
      }
    };
  }, []);

  return (
    <div
      id="map-frame"
      ref={frameRef}
      className="absolute inset-8 md:inset-6 sm:inset-4 p-4 sm:p-3 bg-white rounded-3xl shadow-frame overflow-hidden z-10"
    ></div>
  );
}
