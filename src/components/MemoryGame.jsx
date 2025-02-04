import { useState, useEffect, useRef, useCallback } from 'react';

export default function MemoryGame() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [deckId, setDeckId] = useState(null);
  const isDeckSet = useRef(false);
  const cards = useRef([]);
  const cardsDrawn = useRef(false);

  const [cardsOutput, setCardsOutput] = useState(<></>);

  const chosenCards = useRef([]);

  useEffect(() => {
    setBestScore((prevBest) => Math.max(prevBest, score));
  }, [score]);

  useEffect(() => {
    if (bestScore === 12) {
      chosenCards.current = [];
      setScore(0);
      setDeckId(null);
      isDeckSet.current = false;
      cardsDrawn.current = false;
    }
  }, [bestScore]);

  useEffect(() => {
    if (!isDeckSet.current) {
      fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
        .then((response) => response.json())
        .then((data) => setDeckId(data.deck_id));
      isDeckSet.current = true;
    }
  }, [deckId, isDeckSet]);

  const cardList = useCallback(() => {
    const handleCardClick = (e) => {
      const newCard = e.target.id;
      if (!chosenCards.current.includes(newCard)) {
        chosenCards.current = [...chosenCards.current, newCard];
        setScore((prevScore) => prevScore + 1);

        // Shuffle cards
        cards.current = [...cards.current]
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);

        setCardsOutput(cardList()); // Re-render the shuffled cards
      } else {
        chosenCards.current = [];
        setScore(0);
        setDeckId(null);
        isDeckSet.current = false;
        cardsDrawn.current = false;
      }
    };

    return (
      <>
        {cards.current.map((card) => (
          <img
            className="card"
            src={card.image}
            key={card.code}
            alt={card.code}
            id={card.code}
            onClick={handleCardClick}
          />
        ))}
      </>
    );
  }, [cards]);

  useEffect(() => {
    if (deckId != null && !cardsDrawn.current) {
      fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=12`)
        .then((response) => response.json())
        .then((data) => {
          cards.current = [...data.cards];
          setCardsOutput(cardList());
        });
      cardsDrawn.current = true;
    }
  }, [deckId, cardsOutput, cardList]);

  return (
    <div className="content">
      <header>
        <h1>Memory Game</h1>
        <div>
          <p>Score: {score}</p>
          <p>Best score: {bestScore}</p>
        </div>
      </header>
      <p className="hint">
        Get points by clicking on an image but don&apos;t click on any more than
        once!
      </p>
      <div className="card-container">{cardsOutput}</div>
    </div>
  );
}
