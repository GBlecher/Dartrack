import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import Home from "./pages/Home";
import GameSelect from "./pages/GameSelect";
import GamePage from "./pages/GamePage";
import GameSaver from "./components/GameSaver"; // auto-save component

function App() {
  return (
    <GameProvider>
      <GameSaver /> {/* saves game state automatically */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/select" element={<GameSelect />} />
          <Route path="/game/:id" element={<GamePage />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
