import CardTile from './CardTile';

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
  const isWaitingForOpponent = gameState.phase === 'waiting_for_opponent';
  const isLocalPlayerTurn = currentPlayerName === localPlayerDisplay;

  const playerById = gameState.players.reduce(
    (map, player) => ({ ...map, [player.id]: player }),
    {},
  );

  if (isWaitingForOpponent) {
    return (
      <section className="duel-board">
        <div className="waiting-state">
          <h2>Waiting for opponent</h2>
          <p>Waiting for another player to join room.</p>
          <div className="waiting-players">
            <div>{localPlayerDisplay}</div>
            {opponentPlayer.name ? (
              <div>{opponentPlayer.name}</div>
            ) : (
              <div>Waiting for opponent...</div>
            )}
          </div>
        </div>
      </section>
    );
  }

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
            {gameState.public.currentPlays?.length ? (
              <div className="pile-cards">
                {gameState.public.currentPlays.map((entry, index) => (
                  <div
                    key={index}
                    className={`played-card ${
                      entry.playerId === currentPlayer.id ? 'active' : ''
                    }`}
                  >
                    <div className="played-card-owner">
                      {playerById[entry.playerId]?.name || 'Player'}
                    </div>
                    <CardTile card={entry.move?.card || '🂠'} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-pile">No cards on table</div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`player-area current-player-bottom${isLocalPlayerTurn ? ' active' : ''}`}
      >
        <div className="hand-panel">
          <div className="hand-row">
            {localPlayer.hand?.map((card) => (
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
