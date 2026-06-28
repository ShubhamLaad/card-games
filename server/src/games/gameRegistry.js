const TwoPlayerGame = require('./twoPlayerGame');

const registeredGames = {
  two_player: TwoPlayerGame,
};

function getGameConstructor(gameType) {
  return registeredGames[gameType];
}

module.exports = {
  getGameConstructor,
};
