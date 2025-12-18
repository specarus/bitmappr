import { useEffect, useRef } from "react";
import { createMapSketch } from "../sketch.js";

export default function MapCanvas() {
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
    <div
      id="map-frame"
      ref={frameRef}
      className="w-full h-full rounded-2xl overflow-hidden border-4 border-gray-200"
    ></div>
  );
}
