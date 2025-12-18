import Loader from "./components/Loader.jsx";
import GuidedTour from "./components/GuidedTour.jsx";
import Sidebar from "./components/Sidebar.jsx";
import MapArea from "./components/MapArea.jsx";

export default function App() {
  return (
    <>
      <Loader />
      <GuidedTour />
      <div className="flex min-h-screen">
        <Sidebar />
        <MapArea />
      </div>
    </>
  );
}
