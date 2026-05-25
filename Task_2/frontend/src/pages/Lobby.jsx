import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

export default function Lobby() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [pin, setPin] = useState("");
  const [players, setPlayers] = useState([]);

  // Fetch Quizzes from MongoDB
  useEffect(() => {
    fetch("http://localhost:5001/api/quizzes")
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
      .catch((err) => console.error("Error fetching quizzes:", err));
  }, []);

  const generatePin = () => {
    if (!selectedQuiz) return alert("Select a quiz first!");
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(newPin);
    setPlayers([]);
    socket.emit("create-room", newPin);
  };

  useEffect(() => {
    socket.on("player-joined", (nickname) => {
      setPlayers((prev) => [...prev, nickname]);
    });
    return () => socket.off("player-joined");
  }, []);

  const kickPlayer = (nickname) => {
    socket.emit("kick-player", { pin, nickname });
    setPlayers((prev) => prev.filter((p) => p !== nickname));
  };

  const startGame = () => {
    if (players.length === 0) {
      alert("Waiting for players to join!");
      return;
    }

    socket.emit("start-game", pin);

    window.open(`/presenter/${pin}`, "_blank");

    navigate("/host", { state: { pin, quizDeck: selectedQuiz, players } });
  };

  return (
    <div
      style={{
        color: "white",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "40px", color: "#4CAF50" }}>Host a Game</h1>

      {!pin ? (
        <div
          style={{ background: "#222", padding: "30px", borderRadius: "10px" }}
        >
          <h2>Select a Quiz to Host</h2>
          <select
            onChange={(e) => setSelectedQuiz(quizzes[e.target.value])}
            style={{
              padding: "10px",
              fontSize: "18px",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <option value="">-- Choose Quiz --</option>
            {quizzes.map((q, index) => (
              <option key={index} value={index}>
                {q.title}
              </option>
            ))}
          </select>
          <button
            onClick={generatePin}
            style={{
              padding: "15px 30px",
              fontSize: "20px",
              background: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Generate Lobby PIN
          </button>
        </div>
      ) : (
        <div>
          <h1
            style={{
              fontSize: "80px",
              margin: "20px 0",
              background: "#333",
              padding: "20px",
              borderRadius: "15px",
            }}
          >
            PIN: <span style={{ color: "#FFD700" }}>{pin}</span>
          </h1>
          <button
            onClick={startGame}
            style={{
              padding: "20px 50px",
              fontSize: "24px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              marginBottom: "30px",
            }}
          >
            Start Game 🚀
          </button>

          <div
            style={{
              background: "#222",
              padding: "30px",
              borderRadius: "10px",
            }}
          >
            <h2>Players Joined ({players.length})</h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              {players.map((p, i) => (
                <div
                  key={i}
                  onClick={() => kickPlayer(p)}
                  style={{
                    background: "#444",
                    padding: "15px 25px",
                    borderRadius: "30px",
                    fontSize: "20px",
                    cursor: "pointer",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  {p}{" "}
                  <span style={{ color: "#e21b3c", fontSize: "16px" }}>✖</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
