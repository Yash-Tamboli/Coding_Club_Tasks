import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";

export default function HostDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pin = "ERROR", quizDeck = null, players = [] } = location.state || {};

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [qaQuestions, setQaQuestions] = useState([]);
  const [spotlightId, setSpotlightId] = useState(null);
  const [scores, setScores] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (!quizDeck) return navigate("/");
    setTimeLeft(quizDeck.slides[0].timeLimit);
    const initialScores = {};
    players.forEach((p) => (initialScores[p] = 0));
    setScores(initialScores);
    socket.emit("create-room", pin);
  }, [quizDeck, navigate, players, pin]);

  useEffect(() => {
    const syncEverything = () => {
      if (!quizDeck) return;
      const currentSlide = quizDeck.slides[currentSlideIndex];

      const answerCounts = [0, 0, 0, 0];
      Object.values(answers).forEach((index) => {
        if (answerCounts[index] !== undefined) answerCounts[index]++;
      });

      socket.emit("sync-presenter", {
        pin,
        currentSlide,
        timeLeft,
        totalAnswers: Object.keys(answers).length,
        totalPlayers: players.length,
        showResults,
        showLeaderboard,
        quizFinished,
        answerCounts,
        scores,
        qaQuestions,
        spotlightId,
        isTimerRunning,
      });

      if (quizFinished) {
        socket.emit("end-game", pin);
      } else if (isTimerRunning) {
        socket.emit("sync-slide-type", { pin, type: currentSlide.type });
      } else {
        // If paused or looking at a chart, force phones to WAIT
        socket.emit("sync-slide-type", { pin, type: "waiting" });
      }
    };

    syncEverything();
    socket.on("player-joined", syncEverything);

    return () => socket.off("player-joined", syncEverything);
  }, [
    pin,
    quizDeck,
    currentSlideIndex,
    timeLeft,
    answers,
    showResults,
    showLeaderboard,
    quizFinished,
    scores,
    qaQuestions,
    spotlightId,
    players.length,
    isTimerRunning,
  ]);

  useEffect(() => {
    socket.on("receive-qna", (data) =>
      setQaQuestions((prev) => [...prev, { ...data, dismissed: false }]),
    );
    return () => socket.off("receive-qna");
  }, []);

  useEffect(() => {
    socket.on("player-answered", ({ nickname, answerIndex }) =>
      setAnswers((prev) => ({ ...prev, [nickname]: answerIndex })),
    );
    return () => socket.off("player-answered");
  }, []);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0 && !showResults && !showLeaderboard) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (
      isTimerRunning &&
      timeLeft === 0 &&
      !showResults &&
      !showLeaderboard &&
      quizDeck
    ) {
      const slide = quizDeck.slides[currentSlideIndex];
      if (slide.type === "multiple-choice") {
        setShowResults(true);
        setIsTimerRunning(false);
        setScores((prev) => {
          const newScores = { ...prev };
          Object.entries(answers).forEach(([nick, ans]) => {
            if (ans === slide.correctAnswerIndex)
              newScores[nick] = (newScores[nick] || 0) + 1000;
          });
          return newScores;
        });
      } else {
        setIsTimerRunning(false);
      }
    }
  }, [
    isTimerRunning,
    timeLeft,
    showResults,
    showLeaderboard,
    quizDeck,
    currentSlideIndex,
    answers,
  ]);

  if (!quizDeck) return null;
  const currentSlide = quizDeck.slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === quizDeck.slides.length - 1;

  const handleNextAction = () => {
    if (
      currentSlide.type === "multiple-choice" &&
      showResults &&
      !showLeaderboard
    ) {
      setShowLeaderboard(true);
      return;
    }
    if (!isLastSlide) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      setTimeLeft(quizDeck.slides[nextIndex].timeLimit);
      setShowResults(false);
      setShowLeaderboard(false);
      setIsTimerRunning(false);
      setAnswers({});
      setQaQuestions([]);
      setSpotlightId(null);
      socket.emit("next-slide", pin);
    } else {
      setQuizFinished(true);
      socket.emit("end-game", pin);
    }
  };

  let displayType = currentSlide.type.toUpperCase();
  let displayTitle = `"${currentSlide.question}"`;

  if (quizFinished) {
    displayType = "END OF GAME";
    displayTitle = "Final Podium Standings";
  } else if (showLeaderboard) {
    displayType = "LEADERBOARD";
    displayTitle = "Intermediate Standings";
  } else if (showResults) {
    displayType = "RESULTS";
    displayTitle = "Bar Chart & Correct Answer";
  } else if (currentSlide.type === "info") {
    displayType = "INFO CARD";
  } else if (currentSlide.type === "qna") {
    displayType = "Q&A SESSION";
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#1a1a1a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1
        style={{
          color: "#4CAF50",
          borderBottom: "2px solid #4CAF50",
          paddingBottom: "10px",
        }}
      >
        🎛️ HOST CONTROL DASHBOARD
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#222",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      >
        <h2>Room PIN: {pin}</h2>
        <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          <h2 style={{ color: isTimerRunning ? "red" : "#FFD700" }}>
            ⏱️ {timeLeft}s{" "}
            {!isTimerRunning &&
              timeLeft > 0 &&
              !showResults &&
              !showLeaderboard &&
              "(PAUSED)"}
          </h2>
          <h2>
            Answers: {Object.keys(answers).length} / {players.length}
          </h2>

          {!quizFinished ? (
            !showResults &&
            !showLeaderboard &&
            !isTimerRunning &&
            timeLeft > 0 ? (
              <button
                onClick={() => setIsTimerRunning(true)}
                style={{
                  padding: "15px 30px",
                  fontSize: "18px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ▶️ Start Timer
              </button>
            ) : (
              <button
                onClick={handleNextAction}
                disabled={
                  currentSlide.type === "multiple-choice" &&
                  !showResults &&
                  !showLeaderboard &&
                  isTimerRunning
                }
                style={{
                  padding: "15px 30px",
                  fontSize: "18px",
                  background: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  opacity:
                    currentSlide.type === "multiple-choice" &&
                    !showResults &&
                    !showLeaderboard &&
                    isTimerRunning
                      ? 0.5
                      : 1,
                }}
              >
                {isLastSlide && showLeaderboard
                  ? "Finish Game 🏆"
                  : "Next Action ➡️"}
              </button>
            )
          ) : (
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "15px 30px",
                fontSize: "18px",
                background: "#e21b3c",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              End Session
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#222",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ color: "#aaa", margin: "0 0 20px 0" }}>
          CURRENT SLIDE STATUS:
        </h2>
        <h3>
          Type: <span style={{ color: "#2196F3" }}>{displayType}</span>
        </h3>
        <h3>
          Displaying: <span style={{ color: "white" }}>{displayTitle}</span>
        </h3>
        <h3>
          Projector State:{" "}
          <span style={{ color: "#FFD700" }}>
            {quizFinished
              ? "Final Podium"
              : showLeaderboard
                ? "Leaderboard"
                : showResults
                  ? "Bar Chart"
                  : isTimerRunning
                    ? "Active & Ticking"
                    : "Waiting for Host (Paused)"}
          </span>
        </h3>
      </div>

      {currentSlide.type === "qna" && !quizFinished && (
        <div
          style={{
            marginTop: "30px",
            background: "#222",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2 style={{ color: "#aaa" }}>Live Audience Q&A Manager</h2>
          {qaQuestions
            .filter((q) => !q.dismissed)
            .map((q) => (
              <div
                key={q.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#333",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                }}
              >
                <span style={{ fontSize: "20px" }}>
                  <strong>{q.nickname}:</strong> {q.text}
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() =>
                      setSpotlightId(spotlightId === q.id ? null : q.id)
                    }
                    style={{
                      padding: "10px 20px",
                      background: spotlightId === q.id ? "#FFD700" : "#4CAF50",
                      color: spotlightId === q.id ? "black" : "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    {spotlightId === q.id
                      ? "Un-Spotlight"
                      : "Spotlight to Screen"}
                  </button>
                  <button
                    onClick={() =>
                      setQaQuestions((prev) =>
                        prev.map((item) =>
                          item.id === q.id
                            ? { ...item, dismissed: true }
                            : item,
                        ),
                      )
                    }
                    style={{
                      padding: "10px 20px",
                      background: "#e21b3c",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          {qaQuestions.filter((q) => !q.dismissed).length === 0 && (
            <p style={{ color: "#777", fontStyle: "italic" }}>
              No questions have been submitted yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
