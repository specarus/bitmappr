import { useEffect, useRef } from "react";
import { createMapSketch } from "../sketch.js";

export default function MapCanvas({ showClouds = true }) {
  const frameRef = useRef(null);

  useEffect(() => {
    if (!frameRef.current) {
      return undefined;
    }
    const instance = createMapSketch(frameRef.current);
    return () => {
      if (instance) {
        instance.remove();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-gray-200 bg-slate-950">
      <div id="map-frame" ref={frameRef} className="w-full h-full"></div>
      {showClouds && (
        <div className="clouds-overlay">
          <div className="cloud-blob cloud-one"></div>
          <div className="cloud-blob cloud-two"></div>
          <div className="cloud-blob cloud-three"></div>
          <div className="cloud-blob cloud-four"></div>
        </div>
      )}
    </div>
  );
}
