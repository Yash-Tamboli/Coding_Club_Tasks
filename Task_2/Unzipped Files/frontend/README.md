Real-Time Multiplayer Quiz Engine
A full-stack, distributed real-time quiz application inspired by Kahoot and Jackbox Games. This project separates the game state across three distinct client views (Host, Presenter, and Player) using a centralized WebSocket engine.
✨ Key Features
•	Distributed Architecture: * Host Dashboard: A private remote control for the host to manage the game flow, pause/start timers, and moderate incoming questions.
•	Presenter View: A clean "dumb monitor" designed for a projector that displays live questions, countdown timers, and animated bar charts.
•	Player Controller: A mobile-first interface for players to join via PIN, submit answers, and ask questions.
•	Real-Time Data: Instantaneous state synchronization across all devices using Socket.io.
•	Dynamic Leaderboards: Intermediate podiums generated dynamically after every round, with a final overall winner display.
•	Interactive Q&A: A dedicated Audience Q&A mode where players can submit text questions, and the host can privately review, dismiss, or "Spotlight" them onto the big screen.
🛠 Tech Stack
•	Frontend: React (Vite), React Router
•	Backend: Node.js, Express.js
•	Real-Time Engine: Socket.io
•	Database: MongoDB (Mongoose)
🚀 Quick Start
1. Setup the Backend
Open a terminal and navigate to the backend directory:
cd backend
npm install

Create a .env file in the backend folder and add your MongoDB URI:
MONGO_URI=your_mongodb_connection_string
PORT=5001

Start the server:
node server.js

2. Setup the Frontend
Open a new terminal and navigate to the frontend directory:
cd frontend
npm install
npm run dev

3. Play
Open http://localhost:5173 in your browser.
	1.	Use the Slide Creator to build a deck.
	2.	Go to the Host Lobby and generate a PIN.
	3.	Open http://localhost:5173/join on a mobile device (or separate window) to join and play!