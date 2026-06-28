import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
const socket = io(SERVER_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function initSocketHandlers(
  socketClient,
  { onConnect, onStateUpdate, onPlayerJoined, onError },
) {
  socketClient.on('connect', () => {
    console.log('Connected to server', socketClient.id);
    onConnect?.();
  });

  socketClient.on('game_state', (state) => {
    console.log('Received game_state:', state);
    onStateUpdate?.(state);
  });

  socketClient.on('player_joined', (payload) => {
    console.log('Received player_joined:', payload);
    onPlayerJoined?.(payload);
  });

  socketClient.on('player_left', (payload) => {
    console.log('Received player_left:', payload);
    onStateUpdate?.(null);
  });

  socketClient.on('error', (payload) => {
    console.error('Socket error:', payload);
    onError?.(payload);
  });
}

export function emitJoinGame(socketClient, payload) {
  console.log('Sending join_game:', payload);
  socketClient.emit('join_game', payload);
}

export function emitPlayerMove(socketClient, payload) {
  console.log('Sending player_move:', payload);
  socketClient.emit('player_move', payload);
}
