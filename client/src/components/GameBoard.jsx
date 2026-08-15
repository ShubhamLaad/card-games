import CardTile from './CardTile';

const CARD_ORDER = [
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
const SUIT_ORDER = ['♠', '♥'];
const getCardValue = (card) => card?.slice(0, -1) || '';
const getCardSuit = (card) => card?.slice(-1) || '';
const sortCards = (a, b) => {
  const suitA = SUIT_ORDER.indexOf(getCardSuit(a));
  const suitB = SUIT_ORDER.indexOf(getCardSuit(b));
  if (suitA !== suitB) {
    return suitA - suitB;
  }
  return (
    CARD_ORDER.indexOf(getCardValue(a)) - CARD_ORDER.indexOf(getCardValue(b))
  );
};

function GameBoard({ gameState, onMakeMove, localPlayerId, localPlayerName }) {
  if (!gameState) {
    return <div className="game-shell">Waiting for game state...</div>;
  }

  const playerCount = gameState.players.length;
  const localPlayer =
    gameState.players.find((player) => player.id === localPlayerId) ||
    gameState.players.find((player) => player.name === localPlayerName) ||
    gameState.players[0] ||
    {};
  const opponentPlayer =
    gameState.players.find((player) => player.id !== localPlayer.id) || {};
  const currentPlayer = gameState.players[gameState.turnIndex] || {};
  const currentPlayerName = currentPlayer.name || 'Waiting...';
  const localPlayerDisplay = localPlayer.name || 'Waiting...';
  const opponentPlayerDisplay = opponentPlayer.name || 'Waiting...';
  const isGameReady = playerCount === 2;
  const isGameActive = gameState.phase === 'active' && isGameReady;
  const isLocalPlayerTurn = currentPlayerName === localPlayerDisplay;

  const sortedLocalHand = [...(localPlayer.hand || [])].sort(sortCards);

  const playerById = gameState.players.reduce(
    (map, player) => ({ ...map, [player.id]: player }),
    {},
  );

  return (
    <section className="duel-board">
      <div className="duel-table">
        <div className={`player-area ${!isLocalPlayerTurn ? ' active' : ''}`}>
          <div className="hand-panel">
            <div className="hand-label">{opponentPlayerDisplay}</div>
            <div className="hand-row">
              {opponentPlayer.hand?.map((card, index) => (
                <CardTile
                  key={`opponent-${index}`}
                  card={card}
                  faceUp={false}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="table-center">
          <div className="table-pile">
            <div className="pile-title">Played cards</div>
            {gameState.public.history.length ? (
              <div className="pile-cards">
                {gameState.public.history.slice(-4).map((entry, index) => {
                  const cardToShow =
                    entry.move?.cards?.[0] || entry.move?.card || '🂠';
                  return (
                    <div
                      key={index}
                      className={`played-card ${
                        entry.playerId === currentPlayer.id ? 'active' : ''
                      }`}
                    >
                      <div className="played-card-owner">
                        {playerById[entry.playerId]?.name || 'Player'}
                      </div>
                      <CardTile card={cardToShow} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-pile">No moves yet</div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`player-area current-player-bottom${isLocalPlayerTurn ? ' active' : ''}`}
      >
        <div className="hand-panel">
          <div className="hand-row">
            {sortedLocalHand.map((card) => (
              <CardTile
                key={card}
                card={card}
                onClick={() => onMakeMove({ action: 'play_card', card })}
              />
            ))}
          </div>
          <div className="hand-label">{localPlayerDisplay}</div>
        </div>
      </div>

      <div className="duel-scoreboard">
        {gameState.players.map((player) => (
          <div key={player.id} className="score-card">
            <div className="player-name">{player.name}</div>
            <div className="player-score">Score: {player.score}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default GameBoard;
