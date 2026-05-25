import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

function Player() {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [screenState, setScreenState] = useState("login");

  const [slide, setSlide] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [qaText, setQaText] = useState("");

  const [finalRank, setFinalRank] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      setConnectionError(null);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setConnectionError("Unable to connect. Please try again.");
    });

    socket.on("new_slide", (data) => {
      setSlide(data.slide);
      setSlideIndex(data.slideIndex);
      setResultData(null);
      if (data.slide.type === "info") setScreenState("info_view");
      if (data.slide.type === "mcq") setScreenState("mcq_view");
      if (data.slide.type === "qa") setScreenState("qa_view");
    });

    socket.on("answer_result", (data) => {
      setResultData(data);
      setScreenState("result");
    });

    socket.on("time_up", () => {
      setScreenState((currentState) =>
        currentState === "mcq_view" ? "times_up" : currentState,
      );
    });

    socket.on("game_over", (leaderboard) => {
      const myData = leaderboard.find((p) => p.nickname === nickname);
      const myRank = leaderboard.findIndex((p) => p.nickname === nickname) + 1;

      if (myData) {
        setFinalRank({ score: myData.score, rank: myRank });
      }
      setScreenState("game_over");
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("new_slide");
      socket.off("answer_result");
      socket.off("time_up");
      socket.off("game_over");
    };
  }, [nickname]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (pin && nickname) {
      socket.emit("join_room", { pin, nickname });
      setScreenState("waiting");
    }
  };

  const handleAnswer = (index) => {
    socket.emit("submit_answer", {
      pin,
      nickname,
      answerIndex: index,
      slideIndex,
    });
    setScreenState("submitted");
  };

  const handleQASubmit = (e) => {
    e.preventDefault();
    if (qaText.trim()) {
      socket.emit("submit_qa", { pin, nickname, questionText: qaText });
      setQaText("");
      setScreenState("qa_submitted");
    }
  };

  const handleNoQuestions = () => {
    setScreenState("qa_submitted");
  };

  if (screenState === "info_view") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1368ce",
          color: "white",
          textAlign: "center",
          padding: "20px",
          wordWrap: "break-word",
        }}
      >
        <h1 style={{ fontSize: "32px" }}>Look up! 👀</h1>
        <p style={{ fontSize: "20px", marginTop: "10px" }}>
          Look up at the Main Screen .
        </p>
      </div>
    );
  }

  if (screenState === "qa_view") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#d89e00",
          color: "black",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ wordWrap: "break-word" }}>Submit your question:</h2>
        <form
          onSubmit={handleQASubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <textarea
            rows="4"
            value={qaText}
            onChange={(e) => setQaText(e.target.value)}
            required
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              marginBottom: "10px",
              resize: "vertical",
            }}
            placeholder="Type your question here..."
          ></textarea>
          <button
            type="submit"
            style={{
              padding: "15px",
              fontSize: "18px",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Send Question
          </button>
        </form>
        <button
          onClick={handleNoQuestions}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "transparent",
            color: "#333",
            border: "2px solid #333",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          I have no questions
        </button>
      </div>
    );
  }

  if (screenState === "mcq_view") {
    const buttons = [
      { color: "#8B4513", shape: "▲" },
      { color: "#1368ce", shape: "◆" },
      { color: "#d89e00", shape: "●" },
      { color: "#ff00c3", shape: "■" },
    ];
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          height: "100vh",
          gap: "10px",
          padding: "10px",
          backgroundColor: "#f2f2f2",
        }}
      >
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            style={{
              backgroundColor: btn.color,
              color: "white",
              fontSize: "80px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 8px 0 rgba(0,0,0,0.2)",
            }}
          >
            {btn.shape}
          </button>
        ))}
      </div>
    );
  }

  if (screenState === "result" && resultData) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: resultData.isCorrect ? "#26890c" : "#e21b3c",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(36px, 10vw, 48px)",
            margin: "0",
            wordWrap: "break-word",
          }}
        >
          {resultData.isCorrect ? "Correct!" : "Incorrect!"}
        </h1>
        <h2 style={{ fontSize: "32px", margin: "10px 0" }}>
          +{resultData.pointsEarned} Points
        </h2>
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.2)",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "20px",
            textAlign: "center",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <p style={{ fontSize: "24px", margin: "5px 0" }}>
            Total: <strong>{resultData.newScore}</strong>
          </p>
          <p style={{ fontSize: "24px", margin: "5px 0" }}>
            Rank: <strong>#{resultData.rank}</strong>
          </p>
        </div>
      </div>
    );
  }

  if (screenState === "game_over") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#46178f",
          color: "white",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1 style={{ wordWrap: "break-word" }}>🏆 Game Over!</h1>
        {finalRank && (
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "20px",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            <h2 style={{ margin: "10px 0" }}>Final Score: {finalRank.score}</h2>
            <h2 style={{ margin: "10px 0" }}>Final Rank: #{finalRank.rank}</h2>
          </div>
        )}
        <p
          style={{
            marginTop: "30px",
            fontSize: "18px",
            wordWrap: "break-word",
          }}
        >
          Look at the host screen for the podium!
        </p>
      </div>
    );
  }

  if (screenState === "times_up")
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#333",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1>⏳ Time's up!</h1>
      </div>
    );
  if (screenState === "qa_submitted")
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#46178f",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2>Waiting for host...</h2>
      </div>
    );
  if (screenState === "submitted")
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#46178f",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2>Answer submitted! Waiting...</h2>
      </div>
    );
  if (screenState === "waiting")
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#26890c",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ wordWrap: "break-word" }}>You're in, {nickname}!</h1>
        <p style={{ fontSize: "20px" }}>
          Look up at the Main Screen for questions .
        </p>
      </div>
    );

  return (
    <div
      className="App"
      style={{ textAlign: "center", marginTop: "50px", padding: "0 20px" }}
    >
      <h1>Quiz App Lobby</h1>
      {connectionError && (
        <div
          style={{
            backgroundColor: "#e21b3c",
            color: "white",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            fontSize: "16px",
          }}
        >
          ⚠️ {connectionError}
        </div>
      )}
      <form
        onSubmit={handleJoin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
          maxWidth: "300px",
          margin: "0 auto",
        }}
      >
        <input
          type="text"
          placeholder="Game PIN (4-6 digits)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input
          type="text"
          placeholder="Your Nickname (2-20 chars)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#46178f",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Join Game
        </button>
      </form>
    </div>
  );
}

export default Player;
