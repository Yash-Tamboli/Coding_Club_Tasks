import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import SlideCreator from "./pages/SlideCreator";
import Lobby from "./pages/Lobby";
import PlayerJoin from "./pages/PlayerJoin";
import Presenter from "./pages/Presenter";
import HostDashboard from "./pages/HostDashboard";

function NavigationBar() {
  const location = useLocation();

  const showNav = location.pathname === "/" || location.pathname === "/lobby";

  if (!showNav) return null;

  return (
    <nav
      style={{
        marginBottom: "30px",
        display: "flex",
        gap: "20px",
        background: "#222",
        padding: "20px",
        borderRadius: "10px",
        justifyContent: "center",
      }}
    >
      <Link
        to="/"
        style={{
          padding: "12px 25px",
          background: "#9C27B0",
          color: "white",
          textDecoration: "none",
          fontWeight: "bold",
          borderRadius: "8px",
          fontSize: "18px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        Slide Creator
      </Link>
      <Link
        to="/lobby"
        style={{
          padding: "12px 25px",
          background: "#FF9800",
          color: "white",
          textDecoration: "none",
          fontWeight: "bold",
          borderRadius: "8px",
          fontSize: "18px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        Host Lobby
      </Link>
      <Link
        to="/join"
        style={{
          padding: "12px 25px",
          background: "#2196F3",
          color: "white",
          textDecoration: "none",
          fontWeight: "bold",
          borderRadius: "8px",
          fontSize: "18px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        Join Game
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "20px",
          background: "#111",
          minHeight: "100vh",
        }}
      >
        <NavigationBar />

        <Routes>
          <Route path="/" element={<SlideCreator />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/join" element={<PlayerJoin />} />

          <Route path="/host" element={<HostDashboard />} />
          <Route path="/presenter/:pin" element={<Presenter />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
