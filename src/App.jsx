import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import ModelViewer from "./components/ModelViewer";
import DebugPanel from "./components/DebugPanel";

function Home() {
  return (
    <div>
      <div className="model-wrapper">
        <ModelViewer />
        <p className="overlay-text">
          𝘯𝘰𝘶𝘯 [in·​for·​mi·​vist] <br />
          an individual or someone; who shares information.
        </p>
      </div>
      <DebugPanel />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;