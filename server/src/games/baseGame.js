const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

function createDeck() {
  return SUITS.flatMap((suit) => VALUES.map((value) => `${value}${suit}`));
}

function shuffleDeck(deck) {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// BaseGame provides generic multiplayer game lifecycle behavior.
// It manages players, the game deck, turn order, and public state serialization.
class BaseGame {
  // Class-wide limit for how many players this game supports.
  static get maxPlayers() {
    return 2;
  }

  // Instance-level accessor that reads the class maxPlayers.
  get maxPlayers() {
    return this.constructor.maxPlayers;
  }

  constructor(roomId) {
    this.roomId = roomId;
    // Unique room ID for this game instance.
    this.players = [];
    // All joined players, each with id/name/score/hand.
    this.state = {
      phase: 'waiting_for_opponent',
      //  - phase: current game phase, e.g. 'waiting_for_opponent' or 'active'
      turnIndex: 0,
      //  - turnIndex: index of the current player in the players array
      deck: [],
      //  - deck: shuffled card deck remaining after dealing
      public: {},
      //  - public: game-specific data exposed to all clients
    };
  }

  addPlayer(playerId, playerName) {
    // Prevent duplicate joins by the same socket ID.
    if (this.players.find((player) => player.id === playerId)) {
      return false;
    }
    // Add a player object with a score and an empty hand.
    this.players.push({ id: playerId, name: playerName, score: 0, hand: [] });
    return true;
  }

  removePlayer(playerId) {
    // Remove a player from the active player list.
    this.players = this.players.filter((player) => player.id !== playerId);
  }

  buildDeck() {
    // Default deck builder for a generic card game.
    return createDeck();
  }

  start() {
    // Activate the game, reset turn order and build/shuffle the deck.
    this.state.phase = 'active';
    this.state.turnIndex = 0;
    this.state.deck = shuffleDeck(this.buildDeck());
    this.dealHands();
  }

  dealHands() {
    const playerCount = this.players.length;
    if (playerCount === 0) {
      return;
    }

    // Divide the deck evenly among players.
    const cardsPerPlayer = Math.floor(this.state.deck.length / playerCount);
    this.players.forEach((player) => {
      player.hand = this.state.deck.splice(0, cardsPerPlayer);
    });
  }

  getCurrentPlayerId() {
    // Which player index is currently allowed to act.
    return this.players[this.state.turnIndex]?.id;
  }

  canPlay(playerId) {
    // Only the current player may make a move.
    return this.getCurrentPlayerId() === playerId;
  }

  advanceTurn() {
    if (this.players.length === 0) {
      return;
    }
    // Move to the next player in round-robin order.
    this.state.turnIndex = (this.state.turnIndex + 1) % this.players.length;
  }

  getPublicState() {
    // Full game state broadcast to all players.
    return {
      roomId: this.roomId,
      gameType: this.constructor.gameType,
      phase: this.state.phase,
      turnIndex: this.state.turnIndex,
      currentPlayerId: this.getCurrentPlayerId(),
      players: this.players.map((player) => ({
        id: player.id,
        name: player.name,
        score: player.score,
        hand: player.hand,
      })),
      public: this.state.public,
    };
  }

  getPublicStateForPlayer(playerId) {
    // Personalized state view where other players' hands are hidden.
    return {
      roomId: this.roomId,
      gameType: this.constructor.gameType,
      phase: this.state.phase,
      turnIndex: this.state.turnIndex,
      currentPlayerId: this.getCurrentPlayerId(),
      players: this.players.map((player) => ({
        id: player.id,
        name: player.name,
        score: player.score,
        hand:
          player.id === playerId
            ? player.hand
            : Array.from({ length: player.hand.length }, () => '🂠'),
      })),
      public: this.state.public,
    };
  }

  handleMove(playerId, move) {
    throw new Error('handleMove must be implemented by a game subclass');
  }
}

module.exports = BaseGame;
