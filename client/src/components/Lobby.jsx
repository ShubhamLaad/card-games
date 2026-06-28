import { useState } from 'react';

const availableGames = [
  { value: 'two_player', label: '2 Player Card Game' },
];

function Lobby({ onJoin, error, initialRoomId, initialPlayerName, initialGameType }) {
  const [roomId, setRoomId] = useState(initialRoomId || 'duel-room');
  const [playerName, setPlayerName] = useState(initialPlayerName || 'Player 1');
  const [gameType, setGameType] = useState(initialGameType || 'two_player');

  return (
    <section className="lobby-shell">
      <h2>Join a game room</h2>

      <label>
        Room ID
        <input value={roomId} onChange={(event) => setRoomId(event.target.value)} />
      </label>

      <label>
        Player name
        <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
      </label>

      <label>
        Game type
        <select value={gameType} onChange={(event) => setGameType(event.target.value)}>
          {availableGames.map((game) => (
            <option key={game.value} value={game.value}>
              {game.label}
            </option>
          ))}
        </select>
      </label>

      <button type="button" onClick={() => onJoin({ roomId, playerName, gameType })}>
        Join Room
      </button>

      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
}

export default Lobby;
