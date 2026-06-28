const { getGameConstructor } = require('./games/gameRegistry');

class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.socketRoom = new Map();
  }

  joinGame(socket, payload = {}) {
    const { roomId, gameType, playerName } = payload;
    if (!roomId || !gameType || !playerName) {
      return {
        success: false,
        message: 'roomId, gameType and playerName are required',
      };
    }

    let room = this.rooms.get(roomId);
    if (!room) {
      const GameConstructor = getGameConstructor(gameType);
      if (!GameConstructor) {
        return { success: false, message: `Unknown game type: ${gameType}` };
      }
      room = {
        gameType,
        game: new GameConstructor(roomId),
        players: [],
      };
      this.rooms.set(roomId, room);
    }

    if (room.players.length >= room.game.maxPlayers) {
      return { success: false, message: 'Room is full' };
    }

    const player = { id: socket.id, name: playerName };
    room.players.push(player);
    this.socketRoom.set(socket.id, roomId);
    socket.join(roomId);

    room.game.addPlayer(player.id, player.name);

    if (
      room.players.length === room.game.maxPlayers &&
      room.game.state.phase !== 'active'
    ) {
      room.game.start();
    }

    room.players.forEach((player) => {
      const gameState = room.game.getPublicStateForPlayer(player.id);
      this.io.to(player.id).emit('game_state', gameState);
    });

    this.io.to(roomId).emit('player_joined', {
      players: room.players.map((playerItem) => ({ name: playerItem.name })),
    });

    return { success: true };
  }

  handlePlayerMove(socket, payload = {}) {
    const { roomId, move } = payload;
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    const playerId = socket.id;
    const result = room.game.handleMove(playerId, move);
    if (!result.success) {
      return result;
    }

    room.players.forEach((player) => {
      const gameState = room.game.getPublicStateForPlayer(player.id);
      this.io.to(player.id).emit('game_state', gameState);
    });

    return { success: true };
  }

  handleDisconnect(socket) {
    const roomId = this.socketRoom.get(socket.id);
    if (!roomId) {
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    room.players = room.players.filter((player) => player.id !== socket.id);
    room.game.removePlayer(socket.id);
    this.socketRoom.delete(socket.id);

    this.io.to(roomId).emit('player_left', {
      playerId: socket.id,
      players: room.players.map((playerItem) => ({ name: playerItem.name })),
    });

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    }
  }
}

module.exports = GameManager;
