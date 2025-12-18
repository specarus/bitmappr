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
      className="w-full h-full rounded-2xl overflow-hidden"
    ></div>
  );
}
