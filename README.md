# 2 Player Card Game

A focused 2-player card game platform using React frontend and Express + Socket.io backend.

## Project structure

- `/server`
  - `package.json` - backend dependencies and scripts
  - `src/index.js` - Express and Socket.io server entrypoint
  - `src/gameManager.js` - room lifecycle, player join, move dispatch
  - `src/games/baseGame.js` - reusable game interface and common state logic
  - `src/games/gameRegistry.js` - single game registration
  - `src/games/twoPlayerGame.js` - 2-player turn-based game implementation

- `/client`
  - `package.json` - React + Vite dependencies
  - `vite.config.js` - Vite React plugin config
  - `index.html` - React app shell
  - `src/main.jsx` - React entrypoint
  - `src/App.jsx` - top-level app state and socket lifecycle
  - `src/socket.js` - socket.io-client wrapper and event handlers
  - `src/components/Lobby.jsx` - join form for room and player name
  - `src/components/GameBoard.jsx` - 2-player game UI
  - `src/styles.css` - app styling

## Run locally

1. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

2. Install client dependencies:

   ```bash
   cd ../client
   npm install
   ```

3. Start the backend:

   ```bash
   cd ../server
   npm run dev
   ```

4. Start the frontend:

   ```bash
   cd ../client
   npm run dev
   ```

Open the Vite URL shown in the terminal and connect two browser tabs to the same room.
