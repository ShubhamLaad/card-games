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

class BaseGame {
  static get maxPlayers() {
    return 2;
  }

  get maxPlayers() {
    return this.constructor.maxPlayers;
  }

  constructor(roomId) {
    this.roomId = roomId;
    this.players = [];
    this.state = {
      phase: 'waiting_for_opponent',
      turnIndex: 0,
      deck: [],
      public: {},
    };
  }

  addPlayer(playerId, playerName) {
    if (this.players.find((player) => player.id === playerId)) {
      return false;
    }
    this.players.push({ id: playerId, name: playerName, score: 0, hand: [] });
    return true;
  }

  removePlayer(playerId) {
    this.players = this.players.filter((player) => player.id !== playerId);
  }

  buildDeck() {
    return createDeck();
  }

  start() {
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

    const cardsPerPlayer = Math.floor(this.state.deck.length / playerCount);
    this.players.forEach((player) => {
      player.hand = this.state.deck.splice(0, cardsPerPlayer);
    });
  }

  getCurrentPlayerId() {
    return this.players[this.state.turnIndex]?.id;
  }

  canPlay(playerId) {
    return this.getCurrentPlayerId() === playerId;
  }

  advanceTurn() {
    if (this.players.length === 0) {
      return;
    }
    this.state.turnIndex = (this.state.turnIndex + 1) % this.players.length;
  }

  getPublicState() {
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
