export default function MapInstructions() {
  return (
    <div
      id="map-instructions"
      className="pointer-events-auto flex flex-wrap gap-2 bg-[#0b1120]/80 border border-white/15 rounded-xl px-3 py-3 shadow-panel"
    >
      <span className="px-3 py-2 rounded-full text-sm font-semibold text-white border border-white/25 bg-[#111a2e] shadow-md">
        1st click: start
      </span>
      <span className="px-3 py-2 rounded-full text-sm font-semibold text-white border border-white/25 bg-[#111a2e] shadow-md">
        2nd click: destination
      </span>
      <span className="px-3 py-2 rounded-full text-sm font-semibold text-white border border-white/25 bg-[#111a2e] shadow-md">
        3rd click: reset start
      </span>
    </div>
  );
}
