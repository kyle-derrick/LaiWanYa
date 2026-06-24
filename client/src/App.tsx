import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import RoomPage from './pages/RoomPage';
import JoinRoom from './pages/JoinRoom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/join/:roomId" element={<JoinRoom />} />
          <Route path="/lobby/:roomId" element={<Lobby />} />
          <Route path="/game/:roomId" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
