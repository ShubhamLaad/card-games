const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const GameManager = require('./gameManager');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const gameManager = new GameManager(io);

app.get('/', (req, res) => {
  res.send('Card game server is running');
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_game', (payload) => {
    const result = gameManager.joinGame(socket, payload);
    if (!result.success) {
      socket.emit('error', { message: result.message });
    }
  });

  socket.on('player_move', (payload) => {
    const result = gameManager.handlePlayerMove(socket, payload);
    if (!result.success) {
      socket.emit('error', { message: result.message });
    }
  });

  socket.on('disconnect', () => {
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
