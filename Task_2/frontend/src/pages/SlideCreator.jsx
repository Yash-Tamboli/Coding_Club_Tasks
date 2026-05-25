import { useState } from "react";

export default function SlideCreator() {
  const [title, setTitle] = useState("Untitled Quiz");
  const [slides, setSlides] = useState([]);

  const addSlide = (type) => {
    const newSlide = {
      type: type,
      question: "",
      options: type === "multiple-choice" ? ["", "", "", ""] : [],
      correctAnswerIndex: 0,
      timeLimit: 20,
    };
    setSlides([...slides, newSlide]);
  };

  const updateSlideQuestion = (index, text) => {
    const updatedSlides = [...slides];
    updatedSlides[index].question = text;
    setSlides(updatedSlides);
  };

  const updateOption = (slideIndex, optionIndex, text) => {
    const updatedSlides = [...slides];
    updatedSlides[slideIndex].options[optionIndex] = text;
    setSlides(updatedSlides);
  };

  const setCorrectAnswer = (slideIndex, optionIndex) => {
    const updatedSlides = [...slides];
    updatedSlides[slideIndex].correctAnswerIndex = optionIndex;
    setSlides(updatedSlides);
  };

  const updateTimeLimit = (slideIndex, time) => {
    const updatedSlides = [...slides];
    updatedSlides[slideIndex].timeLimit = Number(time);
    setSlides(updatedSlides);
  };

  const deleteSlide = (indexToDelete) => {
    setSlides(slides.filter((_, index) => index !== indexToDelete));
  };

  const moveSlide = (index, direction) => {
    if (direction === "up" && index === 0) return; 
    if (direction === "down" && index === slides.length - 1) return; 

    const updatedSlides = [...slides];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    const temp = updatedSlides[index];
    updatedSlides[index] = updatedSlides[swapIndex];
    updatedSlides[swapIndex] = temp;

    setSlides(updatedSlides);
  };

  const handleSaveDeck = async () => {
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slides }),
      });

      if (response.ok) {
        alert("✅ Quiz saved to database!");
      } else {
        alert("❌ Failed to save quiz.");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", color: "white" }}>
      <h1>Slide Creator Workspace</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          fontSize: "24px",
          padding: "10px",
          width: "100%",
          marginBottom: "20px",
          background: "#333",
          color: "white",
          border: "1px solid #555",
        }}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => addSlide("info")} style={{ padding: "8px" }}>
          + Add Info Card
        </button>
        <button
          onClick={() => addSlide("multiple-choice")}
          style={{ padding: "8px" }}
        >
          + Add Multiple Choice
        </button>
        <button onClick={() => addSlide("qna")} style={{ padding: "8px" }}>
          + Add Q&A Panel
        </button>
      </div>

      {slides.map((slide, slideIndex) => (
        <div
          key={slideIndex}
          style={{
            border: "1px solid #555",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
            background: "#222",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Slide {slideIndex + 1}: {slide.type.toUpperCase()}
            </h3>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <label>Timer (sec):</label>
              <input
                type="number"
                value={slide.timeLimit}
                onChange={(e) => updateTimeLimit(slideIndex, e.target.value)}
                style={{
                  width: "60px",
                  padding: "5px",
                  background: "#444",
                  color: "white",
                  border: "none",
                }}
              />

              <button
                onClick={() => moveSlide(slideIndex, "up")}
                disabled={slideIndex === 0}
                style={{
                  padding: "5px 10px",
                  cursor: slideIndex === 0 ? "not-allowed" : "pointer",
                }}
              >
                ⬆️
              </button>
              <button
                onClick={() => moveSlide(slideIndex, "down")}
                disabled={slideIndex === slides.length - 1}
                style={{
                  padding: "5px 10px",
                  cursor:
                    slideIndex === slides.length - 1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                ⬇️
              </button>
              <button
                onClick={() => deleteSlide(slideIndex)}
                style={{
                  padding: "5px 10px",
                  background: "red",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Enter your question here..."
            value={slide.question}
            onChange={(e) => updateSlideQuestion(slideIndex, e.target.value)}
            style={{
              width: "95%",
              padding: "10px",
              marginBottom: "15px",
              background: "#444",
              color: "white",
              border: "none",
            }}
          />

          {slide.type === "multiple-choice" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {slide.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="radio"
                    name={`correct-answer-${slideIndex}`}
                    checked={slide.correctAnswerIndex === optionIndex}
                    onChange={() => setCorrectAnswer(slideIndex, optionIndex)}
                    style={{ transform: "scale(1.5)", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) =>
                      updateOption(slideIndex, optionIndex, e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border:
                        slide.correctAnswerIndex === optionIndex
                          ? "2px solid #4CAF50"
                          : "1px solid #666",
                      background: "#333",
                      color: "white",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {slides.length > 0 && (
        <button
          onClick={handleSaveDeck}
          style={{
            marginTop: "20px",
            padding: "15px 30px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Save Slide Deck
        </button>
      )}
    </div>
  );
}
