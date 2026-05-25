import { useState } from "react";
import Player from "./Player";
import Host from "./Host";

function App() {
  const [view, setView] = useState("home");

  if (view === "host") return <Host />;
  if (view === "player") return <Player />;

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "clamp(50px, 10vw, 100px)",
        fontFamily: "sans-serif",
        padding: "0 20px",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(40px, 8vw, 64px)",
          color: "#46178f",
          wordWrap: "break-word",
          lineHeight: "1.2",
          margin: "0 auto",
          maxWidth: "800px",
        }}
      >
        IITG Coding Club Quiz
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "50px",
        }}
      >
        <button
          onClick={() => setView("host")}
          style={{
            padding: "20px 40px",
            fontSize: "24px",
            backgroundColor: "#26890c",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
            flex: "1 1 auto",
            maxWidth: "300px",
          }}
        >
          📺 Host a Game
        </button>

        <button
          onClick={() => setView("player")}
          style={{
            padding: "20px 40px",
            fontSize: "24px",
            backgroundColor: "#e21b3c",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
            flex: "1 1 auto",
            maxWidth: "300px",
          }}
        >
          📱 Join as Player
        </button>
      </div>
    </div>
  );
}

export default App;
