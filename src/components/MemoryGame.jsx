import { useState, useEffect, useRef } from "react"

export default function MemoryGame() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  
  const [deckId, setDeckId] = useState(null);
  const isDeckSet = useRef(false);
  const cards = useRef([]);
  const cardsDrawn = useRef(false);
  
  const [cardsOutput, setCardsOutput] = useState(<></>);

  const chosenCards = useRef([]);

  function shuffleCards() {
    const newArray = cards.current;
    cards.current = newArray
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setCardsOutput(cardList());
  }

  const bestScoreUpdate = () => {if (bestScore < score) setBestScore(score)};

  function cardClick(e) {
    const newCard = e.target.id;
    if (!chosenCards.current.includes(newCard)) {
      chosenCards.current = [...chosenCards.current, newCard];
      setScore(score => score + 1);
      shuffleCards();
    } else {
      chosenCards.current = [];
      bestScoreUpdate();
      setScore(0);
      isDeckSet.current = false;
      cardsDrawn.current = false;
      cards.current = [];
    }
  }

  function cardList() {
    const output = cards.current.map((card) => 
        <img className="card" src={card.image} key={card.code} alt={card.code} id={card.code} onClick={cardClick} />
    );
    return (<>{output}</>);
  }

  useEffect(() => {
    if (!isDeckSet.current) {
      fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .then(response => response.json())
      .then(data => setDeckId(data.deck_id));
      isDeckSet.current = true;
    }
  },[deckId, isDeckSet]);

  useEffect(() => {
    if (deckId != null && !cardsDrawn.current) {
      fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=12`)
        .then(response => response.json())
        .then(data => {
          cards.current = [...data.cards];
          shuffleCards();
        });
      cardsDrawn.current = true;
    }
  },[deckId, cardsOutput, shuffleCards]);

  return (
    <div className="content">
      <header>
        <h1>Memory Game</h1>
        <p>Score: {score}</p>
        <p>Best score: {bestScore}</p>
        <p>Get points by clicking on an image but don&apos;t click on any more than once!</p>
      </header>
      <div className="card-container">
        {cardsOutput}
      </div>
    </div>
  )
}