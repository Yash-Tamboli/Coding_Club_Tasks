import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

export default function Presenter() {
  const { pin } = useParams();
  const [viewState, setViewState] = useState(null);

  useEffect(() => {
    socket.emit("join-room", { pin, nickname: "PROJECTOR_SCREEN" });
    socket.on("presenter-update", (data) => setViewState(data));
    return () => socket.off("presenter-update");
  }, [pin]);

  if (!viewState)
    return (
      <h1 style={{ color: "white", textAlign: "center", marginTop: "20vh" }}>
        Waiting for Host to start presentation...
      </h1>
    );

  const {
    currentSlide,
    timeLeft,
    totalAnswers,
    totalPlayers,
    showResults,
    showLeaderboard,
    quizFinished,
    answerCounts,
    scores,
    qaQuestions,
    spotlightId,
    isTimerRunning,
  } = viewState;
  const colors = ["#e21b3c", "#1368ce", "#d89e00", "#26890c"];

  const isWaitingToStart =
    !isTimerRunning &&
    timeLeft === currentSlide.timeLimit &&
    !showResults &&
    !showLeaderboard;

  const renderPodium = (title) => {
    const sortedPlayers = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return (
      <div style={{ textAlign: "center", width: "100%", marginTop: "30px" }}>
        <h1
          style={{
            fontSize: "80px",
            color: "#FFD700",
            textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
            marginBottom: "50px",
          }}
        >
          {title} 🏆
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "30px",
            height: "450px",
          }}
        >
          {sortedPlayers[1] && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: "10px", fontSize: "40px" }}>
                {sortedPlayers[1][0]}
              </h2>
              <h3
                style={{
                  margin: "0 0 10px 0",
                  color: "#C0C0C0",
                  fontSize: "30px",
                }}
              >
                {sortedPlayers[1][1]} pts
              </h3>
              <div
                style={{
                  width: "200px",
                  height: "180px",
                  background: "#C0C0C0",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: "20px",
                  fontSize: "60px",
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                2
              </div>
            </div>
          )}
          {sortedPlayers[0] && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: "10px", fontSize: "50px" }}>
                {sortedPlayers[0][0]}
              </h2>
              <h3
                style={{
                  margin: "0 0 10px 0",
                  color: "#FFD700",
                  fontSize: "40px",
                }}
              >
                {sortedPlayers[0][1]} pts
              </h3>
              <div
                style={{
                  width: "200px",
                  height: "260px",
                  background: "#FFD700",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: "20px",
                  fontSize: "80px",
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                1
              </div>
            </div>
          )}
          {sortedPlayers[2] && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: "10px", fontSize: "30px" }}>
                {sortedPlayers[2][0]}
              </h2>
              <h3
                style={{
                  margin: "0 0 10px 0",
                  color: "#cd7f32",
                  fontSize: "24px",
                }}
              >
                {sortedPlayers[2][1]} pts
              </h3>
              <div
                style={{
                  width: "200px",
                  height: "110px",
                  background: "#cd7f32",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: "20px",
                  fontSize: "50px",
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                3
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (quizFinished) {
    return (
      <div
        style={{
          color: "white",
          padding: "50px",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#111",
        }}
      >
        {renderPodium("Final Leaderboard")}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#111",
        color: "white",
        padding: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "40px" }}>
          PIN: <span style={{ color: "#4CAF50" }}>{pin}</span>
        </h2>
        {currentSlide.type === "multiple-choice" && !showLeaderboard && (
          <div
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              background: timeLeft <= 5 ? "red" : "#333",
              padding: "10px 40px",
              borderRadius: "50px",
              transition: "background 0.3s",
            }}
          >
            {timeLeft}
          </div>
        )}
        {currentSlide.type === "multiple-choice" && !showLeaderboard && (
          <h2 style={{ margin: 0, fontSize: "40px" }}>
            Answers: {totalAnswers} / {totalPlayers}
          </h2>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {showLeaderboard ? (
          renderPodium("Current Standings")
        ) : isWaitingToStart ? ( 
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "100px",
                color: "#2196F3",
                marginBottom: "30px",
              }}
            >
              Get Ready!
            </h1>
            <h2 style={{ fontSize: "50px", color: "#aaa" }}>
              Waiting for the host to start the slide...
            </h2>
          </div>
        ) : (
          <div style={{ width: "100%", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "50px",
                marginBottom: "40px",
                maxWidth: "1200px",
                margin: "0 auto 40px auto",
              }}
            >
              {currentSlide.question}
            </h1>

            {currentSlide.type === "multiple-choice" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  maxWidth: "1200px",
                  margin: "0 auto",
                  width: "100%",
                }}
              >
                {currentSlide.options.map((option, index) => (
                  <div
                    key={index}
                    style={{
                      background: colors[index],
                      padding: "40px",
                      fontSize: "36px",
                      fontWeight: "bold",
                      borderRadius: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}

            {currentSlide.type === "multiple-choice" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: "40px",
                  height: "250px",
                  borderBottom: "4px solid #555",
                  width: "100%",
                  maxWidth: "1000px",
                  margin: "40px auto 0 auto",
                }}
              >
                {answerCounts.map((count, index) => {
                  const maxCount = Math.max(...answerCounts, 1);
                  const heightPercentage = (count / maxCount) * 100;
                  const isCorrect = index === currentSlide.correctAnswerIndex;
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "150px",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "10px",
                          fontSize: "30px",
                          fontWeight: "bold",
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          height: `${heightPercentage}%`,
                          width: "100%",
                          background: colors[index],
                          opacity: !showResults || isCorrect ? 1 : 0.3,
                          transition: "height 0.3s ease-out",
                          borderRadius: "10px 10px 0 0",
                        }}
                      ></div>
                      {showResults && (
                        <div style={{ marginTop: "15px", fontSize: "40px" }}>
                          {isCorrect ? "✅" : "❌"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {currentSlide.type === "qna" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "30px",
                  maxWidth: "1400px",
                  margin: "0 auto",
                  width: "100%",
                }}
              >
                {qaQuestions
                  .filter((q) => !q.dismissed)
                  .map((q) => (
                    <div
                      key={q.id}
                      style={{
                        background: spotlightId === q.id ? "#FFD700" : "#222",
                        color: spotlightId === q.id ? "black" : "white",
                        padding: "40px",
                        borderRadius: "15px",
                        textAlign: "left",
                        transform:
                          spotlightId === q.id ? "scale(1.15)" : "none",
                        transition:
                          "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        zIndex: spotlightId === q.id ? 10 : 1,
                        boxShadow:
                          spotlightId === q.id
                            ? "0 20px 50px rgba(255,215,0,0.5)"
                            : "none",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 15px 0",
                          opacity: 0.8,
                          fontSize: "24px",
                        }}
                      >
                        {q.nickname} asks:
                      </h4>
                      <p
                        style={{
                          fontSize: "32px",
                          margin: 0,
                          fontWeight: "bold",
                        }}
                      >
                        {q.text}
                      </p>
                    </div>
                  ))}
                {qaQuestions.filter((q) => !q.dismissed).length === 0 && (
                  <h3
                    style={{
                      color: "#666",
                      gridColumn: "1 / -1",
                      fontSize: "40px",
                    }}
                  >
                    Waiting for audience questions...
                  </h3>
                )}
              </div>
            )}

            {currentSlide.type === "info" && (
              <h2
                style={{ color: "#aaa", fontSize: "60px", marginTop: "100px" }}
              >
                ℹ️ Information Card
              </h2>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
