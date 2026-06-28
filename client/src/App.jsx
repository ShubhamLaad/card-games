import { useEffect, useState } from 'react';
import {
  connectSocket,
  initSocketHandlers,
  emitJoinGame,
  emitPlayerMove,
} from './socket';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

function App() {
  const query = new URLSearchParams(window.location.search);
  const defaultRoomId = query.get('roomId') || 'duel-room';
  const defaultPlayerName = query.get('playerName') || 'Player 1';
  const defaultGameType = query.get('gameType') || 'two_player';
  const hasAutoJoinParams = Boolean(
    query.get('roomId') && query.get('playerName'),
  );

  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [gameType, setGameType] = useState(defaultGameType);
  const [joined, setJoined] = useState(false);
  const [skipLobby, setSkipLobby] = useState(hasAutoJoinParams);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socketClient = connectSocket();
    setSocket(socketClient);

    initSocketHandlers(socketClient, {
      onConnect: () => {
        setSocketId(socketClient.id);
      },
      onStateUpdate: (state) => {
        setGameState(state);
        if (state) {
          setJoined(true);
          setSkipLobby(true);
        }
      },
      onPlayerJoined: () => {
        setJoined(true);
        setSkipLobby(true);
      },
      onError: (payload) => {
        setError(payload.message || 'Socket error');
        if (skipLobby) {
          setSkipLobby(false);
        }
      },
    });

    return () => {
      if (socketClient.connected) {
        socketClient.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || autoJoinAttempted || !hasAutoJoinParams) {
      return;
    }

    setAutoJoinAttempted(true);
    emitJoinGame(socket, {
      roomId: defaultRoomId,
      playerName: defaultPlayerName,
      gameType: defaultGameType,
    });
  }, [
    socket,
    autoJoinAttempted,
    hasAutoJoinParams,
    defaultRoomId,
    defaultPlayerName,
    defaultGameType,
  ]);

  const handleJoin = ({ roomId, playerName, gameType }) => {
    setRoomId(roomId);
    setPlayerName(playerName);
    setGameType(gameType);
    setError(null);
    setSkipLobby(true);

    const params = new URLSearchParams({ roomId, playerName, gameType });
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`,
    );

    emitJoinGame(socket, { roomId, playerName, gameType });
  };

  const handleMove = (move) => {
    emitPlayerMove(socket, { roomId, move });
  };

  const headerTitle =
    gameState?.gameType === 'two_player'
      ? '2 Player Card Duel'
      : 'Card Games Platform';

  return (
    <div className="page-shell">
      {!joined && !skipLobby ? (
        <Lobby
          onJoin={handleJoin}
          error={error}
          initialRoomId={roomId}
          initialPlayerName={playerName}
          initialGameType={gameType}
        />
      ) : (
        <GameBoard
          gameState={gameState}
          onMakeMove={handleMove}
          localPlayerId={socketId}
          localPlayerName={playerName}
        />
      )}

      <footer>
        <small>Connected room: {roomId}</small>
      </footer>
    </div>
  );
}

export default App;
