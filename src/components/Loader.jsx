import { useEffect, useState } from "react";

export default function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const hideLoader = () => setHidden(true);
    const onLoad = () => setTimeout(hideLoader, 200);

    window.addEventListener("map-ready", hideLoader);
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("map-ready", hideLoader);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  const classes = [
    "fixed inset-0 z-[60] flex items-center justify-center bg-[#050913] text-white transition-opacity",
    hidden ? "opacity-0 pointer-events-none" : "opacity-100",
  ].join(" ");

  return (
    <div id="page-loader" className={classes}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide">
          Preparing your map...
        </p>
      </div>
    </div>
  );
}
