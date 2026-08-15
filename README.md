# 2 Player Card Game

A focused 2-player card game platform using React frontend and Express + Socket.io backend.

## Card game terms

### Deck

- The full set of cards used in the game.
- In your implementation, `TwoPlayerGame.buildDeck()` creates a 26-card deck of hearts and spades.

### Hand

- The cards a player holds.
- Each player receives a hand at the start of the game.
- In code: `player.hand`.

### Turn

- When one player is allowed to play a card.
- Controlled by `state.turnIndex` and `canPlay(playerId)`.

### Move / Play

- The action of playing one or more cards from your hand.
- In your server code, a move becomes a `play` object:
  - `{ playerId, move, timestamp }`

### Trick

- A set of played cards, one from each player, that is compared to decide a winner.
- In your game, `state.public.currentPlays` holds the plays for the current trick.

### Trick winner

- The player whose card is highest in the trick.
- Decided in `resolveTrick()` and stored in `state.public.lastTrickWinner`.

### Score

- Points awarded for winning tricks.
- In your code, the winning player gets `winner.score += 1`.

### History

- The record of played moves across the match.
- Stored in `state.public.history`.
- Used by the UI to show recently played cards.

### Hidden cards / closed cards

- Cards in an opponent’s hand should not be visible.
- In `getPublicStateForPlayer()`, opponent hands are replaced with `'🂠'`.

### Phase

- The game stage:
  - `waiting_for_opponent` before enough players join
  - `active` once the game has started

### Public state

- The game information sent to clients.
- Includes room, phase, turn, players, and public game data.

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
