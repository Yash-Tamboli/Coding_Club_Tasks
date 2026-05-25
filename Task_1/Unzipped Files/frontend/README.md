Task 1: Real-Time Backend & Mobile Participant App
A robust Node.js backend and mobile-responsive React participant application for a gamified presentation platform. This task focuses on the core real-time infrastructure and the player's mobile experience.
✨ Key Features
•	Real-Time Engine: Instantaneous state synchronization across devices using Socket.io, managing active room states (Lobby, Slide View, Q&A, Leaderboard).
•	Adaptive Mobile Controller: A responsive player interface that automatically transforms based on the current slide (e.g., color-coded MCQ buttons, a Q&A text box, or a standby screen).
•	Dynamic Scoring: A speed-sensitive score calculator that scales points linearly based on how fast a participant submits their correct response.
•	Instant Feedback: Immediate screen updates showing whether an answer was correct, along with the user's updated score and rank.
🛠 Tech Stack
•	Frontend (Mobile Client): React (Vite)
•	Backend: Node.js, Express.js
•	Real-Time Engine: Socket.io
•	Database: MongoDB (Local instance for zero-latency)
🚀 Quick Start
1. Setup the Backend
Open a terminal and navigate to the backend directory:
cd backend
npm install

Make sure you have a local instance of MongoDB running to avoid latency during evaluation, then start the server:
node server.js

2. Setup the Frontend
Open a new terminal and navigate to the frontend directory:
cd frontend
npm install
npm run dev

3. Join the Game
Open http://localhost:5173/join in your browser or on a mobile device.