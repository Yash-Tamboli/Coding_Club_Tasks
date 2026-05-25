import { useState, useEffect } from "react";
import socket from "../socket";

export default function PlayerJoin() {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [qaText, setQaText] = useState("");

  // 🚨 THE NEW HARD SHIELDS
  const [phase, setPhase] = useState("login");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    socket.on("player-was-kicked", (kickedName) => {
      if (kickedName === nickname) {
        alert("You were kicked from the lobby by the host.");
        setPhase("login");
        setPin("");
      }
    });

    socket.on("game-started", () => setPhase("waiting"));

    socket.on("slide-type-update", (type) => {
      if (type === "waiting") {
        setHasAnswered(false);
        setPhase("waiting");
      } else if (type === "qna") {
        setPhase("qna-input");
      } else if (type === "info") {
        setPhase("info-view");
      } else if (type === "multiple-choice") {
        setPhase("playing");
      }
    });

    socket.on("game-over", () => {
      setIsGameOver(true);
    });

    return () => {
      socket.off("player-was-kicked");
      socket.off("game-started");
      socket.off("slide-type-update");
      socket.off("game-over");
    };
  }, [nickname]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (pin && nickname) {
      socket.emit("join-room", { pin, nickname });
      setPhase("waiting");
    }
  };

  const submitAnswer = (index) => {
    socket.emit("submit-answer", { pin, nickname, answerIndex: index });
    setHasAnswered(true); 
  };

  const submitQA = (e) => {
    e.preventDefault();
    if (qaText.trim()) {
      socket.emit("submit-qna", { pin, nickname, text: qaText });
      setQaText("");
      setHasAnswered(true);
    }
  };

  if (isGameOver) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
        <h1 style={{ color: "#FFD700", fontSize: "60px" }}>Game Over! 🏆</h1>
        <h2>Look at the big screen to see who won!</h2>
      </div>
    );
  }

  if (hasAnswered) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
        <h1 style={{ color: "#2196F3", fontSize: "50px" }}>Submitted!</h1>
        <h2>Waiting for the host...</h2>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
        <h1 style={{ color: "#4CAF50", fontSize: "50px" }}>You're in!</h1>
        <h2>Look at the big screen...</h2>
      </div>
    );
  }

  if (phase === "info-view") {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          color: "white",
          padding: "20px",
        }}
      >
        <h1 style={{ color: "#9C27B0", fontSize: "50px" }}>Heads up! 👀</h1>
        <h2>Read the information on the big screen.</h2>
      </div>
    );
  }

  if (phase === "qna-input") {
    return (
      <div
        style={{
          padding: "30px",
          textAlign: "center",
          color: "white",
          maxWidth: "500px",
          margin: "50px auto",
        }}
      >
        <h1 style={{ marginBottom: "30px", fontSize: "40px" }}>
          Ask a Question! 💬
        </h1>
        <form
          onSubmit={submitQA}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <textarea
            value={qaText}
            onChange={(e) => setQaText(e.target.value)}
            placeholder="Type your question for the presenter here..."
            style={{
              padding: "20px",
              borderRadius: "10px",
              height: "180px",
              fontSize: "20px",
              resize: "none",
              border: "none",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "20px",
              background: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "24px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Submit to Big Screen
          </button>
        </form>
      </div>
    );
  }

  if (phase === "playing") {
    const colors = ["#e21b3c", "#1368ce", "#d89e00", "#26890c"];
    const shapes = ["▲", "◆", "●", "■"];
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          height: "90vh",
          gap: "15px",
          padding: "15px",
          background: "#111",
        }}
      >
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => submitAnswer(index)}
            style={{
              background: color,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 8px rgba(0,0,0,0.2)",
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "80px",
              color: "white",
            }}
          >
            {shapes[index]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        textAlign: "center",
        color: "white",
        background: "#222",
        padding: "30px",
        borderRadius: "15px",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "30px" }}>Kahoot!</h1>
      <form
        onSubmit={handleJoin}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          placeholder="Game PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={{
            fontSize: "24px",
            padding: "15px",
            textAlign: "center",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
          }}
        />
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{
            fontSize: "24px",
            padding: "15px",
            textAlign: "center",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
          }}
        />
        <button
          type="submit"
          style={{
            fontSize: "24px",
            padding: "15px",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}
