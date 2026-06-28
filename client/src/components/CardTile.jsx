function CardTile({ card, faceUp = true, onClick, className = '' }) {
  const cardValue = card?.slice(0, -1) || '';
  const cardSuit = card?.slice(-1) || '';
  const isBack = card === '🂠' || !faceUp;
  const suitClass = /[♥♦]/.test(cardSuit) ? 'red-suit' : 'black-suit';
  const Tag = onClick ? 'button' : 'div';

  if (isBack) {
    return (
      <span className={`card-tile card-back ${className}`}>
        <span className="card-back-mark" />
      </span>
    );
  }

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`card-tile card-front ${suitClass} ${className}`}
      onClick={onClick}
    >
      <span className="card-corner top-left">
        {cardValue}
        <br />
        {cardSuit}
      </span>
      <span className="card-suit">{cardSuit}</span>
      <span className="card-corner bottom-right">
        {cardValue}
        <br />
        {cardSuit}
      </span>
    </Tag>
  );
}

export default CardTile;
