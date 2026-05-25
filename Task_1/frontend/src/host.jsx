import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

function Host() {
  const [pin] = useState(() =>
    Math.floor(1000 + Math.random() * 9000).toString(),
  );
  const [players, setPlayers] = useState([]);
  const [connectionError, setConnectionError] = useState(null);

  const [slide, setSlide] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const [qaQuestions, setQaQuestions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    socket.emit("create_room", pin);

    socket.on("connect", () => {
      console.log("✅ Host connected:", socket.id);
      setConnectionError(null);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setConnectionError("Unable to connect to server");
    });

    socket.on("update_players", (updatedParticipants) =>
      setPlayers(updatedParticipants),
    );

    socket.on("new_slide", (data) => {
      setSlide(data.slide);
      setSlideIndex(data.slideIndex);
      setIsTimeUp(false);
    });

    socket.on("timer_tick", (time) => setTimeLeft(time));
    socket.on("time_up", () => setIsTimeUp(true));

    socket.on("receive_qa", (data) => {
      setQaQuestions((prev) => [...prev, data]);
    });

    socket.on("game_over", (finalScores) => {
      setLeaderboard(finalScores);
      setIsGameOver(true);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("update_players");
      socket.off("new_slide");
      socket.off("timer_tick");
      socket.off("time_up");
      socket.off("receive_qa");
      socket.off("game_over");
    };
  }, [pin]);

  const handleStartGame = () => socket.emit("start_game", pin);
  const handleNextSlide = () =>
    socket.emit("next_slide", { pin, slideIndex: slideIndex + 1 });

  // UI: LEADERBOARD PODIUM
  if (isGameOver) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          fontFamily: "sans-serif",
          backgroundColor: "#46178f",
          height: "100vh",
          color: "white",
          overflowY: "auto",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            marginBottom: "40px",
            wordWrap: "break-word",
          }}
        >
          🏆 Final Scores 🏆
        </h1>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "rgba(0,0,0,0.3)",
            padding: "30px",
            borderRadius: "15px",
          }}
        >
          {leaderboard.map((p, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "32px",
                margin: "20px 0",
                padding: "15px",
                backgroundColor: index === 0 ? "#d89e00" : "transparent",
                borderRadius: "10px",
                wordWrap: "break-word",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : ""}{" "}
                {p.nickname}
              </span>
              <strong>{p.score} pts</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // UI: SLIDE VIEWS
  if (slide) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          fontFamily: "sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Info Slide */}
        {slide.type === "info" && (
          <div style={{ width: "100%", maxWidth: "1000px", padding: "0 20px" }}>
            <h1
              style={{
                fontSize: "clamp(40px, 5vw, 80px)",
                color: "#1368ce",
                wordWrap: "break-word",
                lineHeight: "1.2",
              }}
            >
              {slide.text}
            </h1>
            <button
              onClick={handleNextSlide}
              style={{
                marginTop: "50px",
                padding: "15px 30px",
                fontSize: "20px",
                cursor: "pointer",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Next ⏭️
            </button>
          </div>
        )}

        {/* MCQ Slide */}
        {slide.type === "mcq" && (
          <div style={{ width: "100%", maxWidth: "1000px" }}>
            <h1
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                wordWrap: "break-word",
                lineHeight: "1.2",
                padding: "0 20px",
              }}
            >
              {slide.text}
            </h1>
            <div
              style={{
                margin: "20px auto",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: isTimeUp ? "#e21b3c" : "#46178f",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                fontWeight: "bold",
              }}
            >
              {isTimeUp ? "0" : timeLeft}
            </div>
            {isTimeUp && <h2 style={{ color: "#e21b3c" }}>Time's Up!</h2>}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "20px",
                width: "100%",
                margin: "20px auto",
                padding: "0 20px",
              }}
            >
              {slide.options.map((opt, index) => {
                const isCorrectAnswer = index === slide.correctAnswerIndex;
                const opacity = isTimeUp && !isCorrectAnswer ? 0.3 : 1;
                return (
                  <div
                    key={index}
                    style={{
                      opacity: opacity,
                      transition: "opacity 0.5s",
                      padding: "30px",
                      fontSize: "clamp(18px, 2vw, 32px)",
                      backgroundColor: [
                        "#8B4513",
                        "#1368ce",
                        "#d89e00",
                        "#ff00c3",
                      ][index],
                      color: "white",
                      borderRadius: "10px",
                      wordWrap: "break-word",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>
            {isTimeUp && (
              <button
                onClick={handleNextSlide}
                style={{
                  marginTop: "30px",
                  padding: "15px 30px",
                  fontSize: "20px",
                  cursor: "pointer",
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Next ⏭️
              </button>
            )}
          </div>
        )}

        {/* Q&A Slide */}
        {slide.type === "qa" && (
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              padding: "0 20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                color: "#d89e00",
                wordWrap: "break-word",
                lineHeight: "1.2",
                margin: "0 0 20px 0",
              }}
            >
              {slide.text}
            </h1>
            <div
              style={{
                backgroundColor: "#f2f2f2",
                padding: "20px",
                borderRadius: "10px",
                height: "350px",
                overflowY: "auto",
                textAlign: "left",
                width: "100%",
              }}
            >
              {qaQuestions.length === 0 ? (
                <p
                  style={{
                    fontSize: "24px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Waiting for questions...
                </p>
              ) : (
                qaQuestions.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      wordWrap: "break-word",
                    }}
                  >
                    <strong style={{ fontSize: "20px", color: "#46178f" }}>
                      {q.nickname} asks:
                    </strong>
                    <p style={{ fontSize: "24px", margin: "10px 0 0 0" }}>
                      {q.questionText}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleNextSlide}
                style={{
                  padding: "15px 30px",
                  fontSize: "20px",
                  cursor: "pointer",
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Finish Session ⏭️
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- UI: LOBBY ---
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        fontFamily: "sans-serif",
        padding: "0 20px",
      }}
    >
      <h1>
        Join at <span style={{ color: "#007bff" }}>localhost:5173</span>
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          margin: "30px 0",
        }}
      >
        <h2 style={{ fontSize: "32px", margin: "0", color: "white" }}>
          Game PIN:
        </h2>
        <div
          style={{
            fontSize: "clamp(80px, 10vw, 120px)",
            color: "#26890c",
            fontWeight: "bold",
            lineHeight: "1",
          }}
        >
          {pin}
        </div>
      </div>

      <div
        style={{
          marginTop: "50px",
          padding: "20px",
          backgroundColor: "#222",
          borderRadius: "10px",
          display: "inline-block",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h3 style={{ color: "white" }}>Players Joined: {players.length}</h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            fontSize: "24px",
            color: "white",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {players.map((player, index) => (
            <li
              key={index}
              style={{ margin: "10px 0", wordWrap: "break-word" }}
            >
              👤 {player.nickname}
            </li>
          ))}
        </ul>
      </div>

      {players.length > 0 && (
        <button
          onClick={handleStartGame}
          style={{
            display: "block",
            margin: "30px auto",
            padding: "15px 30px",
            fontSize: "20px",
            cursor: "pointer",
            backgroundColor: "#46178f",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Start Game
        </button>
      )}
    </div>
  );
}

export default Host;
