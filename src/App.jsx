import Loader from "./components/Loader.jsx";
import Sidebar from "./components/Sidebar.jsx";
import MapArea from "./components/MapArea.jsx";

export default function App() {
  return (
    <>
      <Loader />
      <div className="flex min-h-screen">
        <Sidebar />
        <MapArea />
      </div>
    </>
  );
}
