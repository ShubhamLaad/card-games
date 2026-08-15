const BaseGame = require('./baseGame');

// Two-player deck only uses spades and hearts.
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
  // Build 26 cards from the two suits and all values.
  return SUITS.flatMap((suit) => VALUES.map((value) => `${value}${suit}`));
}

// Order used for comparing card ranks.
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
  // Strip suit from card string and map the value to a compare index.
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

// TwoPlayerGame extends BaseGame with rules for a 2-player trick game.
// It uses a 26-card hearts/spades deck, handles one-or-two-card plays, and scores tricks.
class TwoPlayerGame extends BaseGame {
  constructor(roomId) {
    super(roomId);
    // Game-specific public state visible to clients.
    this.state.public = {
      history: [],
      //  - history: array of all plays made in the current match
      lastMove: null,
      //  - lastMove: the most recent move played
      currentPlays: [],
      //  - currentPlays: pending plays for the current trick
      lastTrickWinner: null,
      //  - lastTrickWinner: playerId of the last trick winner
    };
  }

  static get gameType() {
    return 'two_player';
  }

  buildDeck() {
    // Override the base deck builder with the two-player deck.
    return createTwoPlayerDeck();
  }

  start() {
    // Base initialization plus resetting round-specific public state.
    super.start();
    this.state.public.history = [];
    this.state.public.lastMove = null;
    this.state.public.currentPlays = [];
    this.state.public.lastTrickWinner = null;
  }

  getHighestCard(cards) {
    // Guard against undefined or non-array card inputs.
    if (!Array.isArray(cards) || cards.length === 0) {
      return null;
    }

    // Return the highest ranked card from an array of card strings.
    return cards.reduce((highest, card) => {
      if (!highest) {
        return card;
      }
      return compareCards(card, highest) === 1 ? card : highest;
    }, null);
  }

  resolveTrick() {
    // Only resolve after both players have submitted their plays.
    if (this.state.public.currentPlays.length !== this.players.length) {
      return;
    }

    const [firstPlay, secondPlay] = this.state.public.currentPlays;
    const firstCard = this.getHighestCard(firstPlay.move.cards);
    const secondCard = this.getHighestCard(secondPlay.move.cards);
    const comparison = compareCards(firstCard, secondCard);
    let winnerId = null;

    if (comparison === 1) {
      winnerId = firstPlay.playerId;
    } else if (comparison === -1) {
      winnerId = secondPlay.playerId;
    }

    if (winnerId) {
      const winner = this.players.find((player) => player.id === winnerId);
      if (winner) {
        winner.score += 1; // Award a point to the trick winner.
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

    // Normalize move shape so single-card moves work with resolveTrick().
    const cards = Array.isArray(move.cards)
      ? move.cards
      : move.card
        ? [move.card]
        : [];

    if (cards.length === 0) {
      return { success: false, message: 'No cards provided' };
    }

    if (!cards.every((card) => player.hand.includes(card))) {
      return { success: false, message: 'One or more cards are not in hand' };
    }

    player.hand = player.hand.filter((card) => !cards.includes(card));
    const normalizedMove = { cards };
    const play = { playerId, move: normalizedMove, timestamp: Date.now() };
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
