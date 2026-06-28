const BaseGame = require('./baseGame');

const SUITS = ['♠', '♥'];
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

function createTwoPlayerDeck() {
  return SUITS.flatMap((suit) => VALUES.map((value) => `${value}${suit}`));
}

const CARD_RANKS = [
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
  'A',
];

function getCardRank(card) {
  return CARD_RANKS.indexOf(card.slice(0, -1));
}

function compareCards(cardA, cardB) {
  const rankA = getCardRank(cardA);
  const rankB = getCardRank(cardB);

  if (rankA === rankB) {
    return 0;
  }

  return rankA > rankB ? 1 : -1;
}

class TwoPlayerGame extends BaseGame {
  constructor(roomId) {
    super(roomId);
    this.state.public = {
      history: [],
      lastMove: null,
      currentPlays: [],
      lastTrickWinner: null,
    };
  }

  static get gameType() {
    return 'two_player';
  }

  buildDeck() {
    return createTwoPlayerDeck();
  }

  start() {
    super.start();
    this.state.public.history = [];
    this.state.public.lastMove = null;
    this.state.public.currentPlays = [];
    this.state.public.lastTrickWinner = null;
  }

  resolveTrick() {
    if (this.state.public.currentPlays.length !== this.players.length) {
      return;
    }

    const [firstPlay, secondPlay] = this.state.public.currentPlays;
    const comparison = compareCards(firstPlay.move.card, secondPlay.move.card);
    let winnerId = null;

    if (comparison === 1) {
      winnerId = firstPlay.playerId;
    } else if (comparison === -1) {
      winnerId = secondPlay.playerId;
    }

    if (winnerId) {
      const winner = this.players.find((player) => player.id === winnerId);
      if (winner) {
        winner.score += 1;
      }
    }

    this.state.public.lastTrickWinner = winnerId;
    this.state.public.currentPlays = [];
  }

  handleMove(playerId, move) {
    if (this.state.phase !== 'active') {
      return { success: false, message: 'Game has not started yet' };
    }

    if (!this.canPlay(playerId)) {
      return { success: false, message: 'It is not your turn' };
    }

    const player = this.players.find((entry) => entry.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found' };
    }

    if (!player.hand.includes(move.card)) {
      return { success: false, message: 'Card not in hand' };
    }

    player.hand = player.hand.filter((card) => card !== move.card);
    const play = { playerId, move, timestamp: Date.now() };
    this.state.public.history.push(play);
    this.state.public.lastMove = play;
    this.state.public.currentPlays.push(play);

    this.advanceTurn();

    if (this.state.public.currentPlays.length === this.players.length) {
      this.resolveTrick();
    }

    return { success: true, gameState: this.getPublicState() };
  }
}

module.exports = TwoPlayerGame;
