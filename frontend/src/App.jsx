import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


import Card from './Card';
import PlayArea from './PlayArea';
import { Modal } from './Modal'; 


import raffey from './assets/raffey.jpg';
import dudu from './assets/dudu.jpg';
import Iggy from './assets/Iggy.jpg';
import blindMan from './assets/blindMan.jpg';

//Game Constants
const numPlayers = 4;
const cardsPerHand = 13;
const gamePhases = {
  dealing: 'dealing',
  bidding: 'bidding',
  playingTrick: 'playingTrick',
  roundEnd: 'roundEnd',
  gameEnd: 'gameEnd',

};

const suits = {'♠': 3, '♥': 2, '♦': 1, '♣': 0}; // Spades, Hearts, Diamonds, Clubs
const ranks = {'2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12};

console.log(suits)





function createAndShuffleDeck() {
  const deck = [];
  for (const suit of Object.keys(suits)) {
    for (const rank of Object.keys(ranks)) {
      deck.push(rank + suit); // e.g., '10♠'
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  console.log(deck)
  return deck;
}


//Player data
const initialPlayers = [
    {id:0, name: 'You',hand:[],bid:null,tricksWon:0,score:0,isHuman:true, avatar: dudu},
    {id:1, name: 'Iggy',hand:[],bid:null,tricksWon:0,score:0,isHuman:false, avatar: Iggy},
    {id:2, name: 'Raffey',hand:[],bid:null,tricksWon:0,score:0,isHuman:false, avatar: raffey},
    {id:3, name: 'BlindMan',hand:[],bid:null,tricksWon:0,score:0,isHuman:false, avatar:blindMan},
    


];

function App() {

//Game State
const [game, setGame] = useState({
  players: initialPlayers,              
  currentPlayerId: 0,                  
  gamePhase: gamePhases.dealing,       
  currentTrick: [],                     
  bidCounts: {},                        
  humanBidConfirmed: false,             
  trickHistory: [],                     
  trickCounts: { 0: 0, 1: 0, 2: 0, 3: 0 }, 
  teamScores: {teamA: 0, teamB: 0},
  bags: {teamA: 0, teamB: 0},

});


//modal State
const [isModalOpen,setIsModalOpen] = useState(false);
const [modalMessage,setModalMessage] = useState('');

const closeModal = useCallback(() => {
  setIsModalOpen(false);
  setModalMessage('');

},[]);


//Deal Cards
const dealCards = useCallback(() => {

  console.log(game.gamePhase)
  const shuffleDeck = createAndShuffleDeck();
  const newPlayers = game.players.map((player, index)=>{
      const startIndex = index * cardsPerHand;
      const endIndex = startIndex + cardsPerHand;
      return{
        ...player,
        hand:shuffleDeck.slice(startIndex, endIndex),
        bid:null,
        tricksWon:0,
      }; 

  });

  setGame(prevGame => ({
    ...prevGame,
    players: newPlayers,
    gamePhase: gamePhases.bidding,
    currentPlayerId: 0,
    currentTrick:[],
    bidCounts:{},
    humanBidConfirmed: false,

  }));
 
  

},[]);//took away dependency to fix card dealing error

//Human Bid
const handleHumanBid = useCallback((bidValue) =>{
  
  console.log(game.gamePhase)
  if(game.gamePhase !== gamePhases.bidding || game.players[game.currentPlayerId].isHuman === false) 
  return;

  setGame(prevGame => {
    const newPlayers = prevGame.players.map(p =>
      p.id === prevGame.currentPlayerId ? {...p,bid:bidValue} : p
    );
    const newBidCounts = {...prevGame.bidCounts, [prevGame.currentPlayerId]: bidValue };

    //next turn
    let nextPlayerId = (prevGame.currentPlayerId + 1) % numPlayers;
    let newPhase = gamePhases.bidding;

    if(Object.keys(newBidCounts).length === numPlayers ){
      newPhase = gamePhases.playingTrick;
      nextPlayerId = 0;
    }
    console.log(game.gamePhase);
    return{
      ...prevGame,
      players: newPlayers,
      bidCounts: newBidCounts,
      currentPlayerId: nextPlayerId,
      gamePhase: newPhase,
      humanBidConfirmed: true,
    }
    
  });
    
}, [game.currentPlayerId, game.players]);

// AI bidding(basic random number)
const aiBid = useCallback((playerId)=>{
  
  function smartBid(hand) {
  let score = 0;
  for (let card of hand) {
    if (card.includes('A') || card.includes('K') || card.includes('Q')) score++;
    if (card.includes('♠')) score += 0.5;
  }
  return Math.max(1, Math.floor(score / 3));
}

  const bidValue = smartBid

  setGame(prevGame => {
    const updatedPlayers = prevGame.players.map(p =>
      p.id === playerId ? {...p,bid:bidValue} : p
    );
    const updatedBidCounts = {...prevGame.bidCounts,[playerId]: bidValue};

   const allBidsIn = Object.keys(updatedBidCounts).length === prevGame.players.length;


   let nextPlayerId = prevGame.currentPlayerId;
   if(allBidsIn){
    nextPlayerId = prevGame.players[0].id;
   }else{
    const currentIndex = prevGame.players.findIndex(p => p.id === playerId);
    const nextIndex = (currentIndex + 1) % prevGame.players.length;
    nextPlayerId = prevGame.players[nextIndex].id;
    

   }

    return{
      ...prevGame,
      players: updatedPlayers,
      bidCounts:updatedBidCounts,
      gamePhase: allBidsIn? gamePhases.playingTrick: gamePhases.bidding,
      currentPlayerId: nextPlayerId,
    };

  });

}, [game.currentPlayerId]);

//human play 
const handleHumanCardPlay = useCallback((cardValue)=>{
  console.log(game.gamePhase)
  //still in dealing phase BUG!!
  if (game.gamePhase !== /*gamePhases.playingTrick||*/game.players[game.currentPlayerId].isHuman === false)
    return;

  console.log("human play")

  setGame(prevGame => {
    const newPlayers = prevGame.players.map(p =>
      p.id === prevGame.currentPlayerId? {...p, hand: p.hand.filter(c => c !== cardValue)} : p
    );
    const newTrick = [...prevGame.currentTrick,{playerId: prevGame.currentPlayerId, cardValue}];


        console.log(`Player ${prevGame.currentPlayerId} played card: ${cardValue}`);

    //next turn
    let nextPlayerId = (prevGame.currentPlayerId + 1) % numPlayers;
    let newPhase = gamePhases.playingTrick;

    
    return{
      ...prevGame,
      players: newPlayers,
      currentTrick: newTrick,
      currentPlayerId: newTrick.length === numPlayers? prevGame.currentPlayerId : nextPlayerId,
      gamePhase: newPhase,
    };


  });
},[game.gamePhase, game.currentPlayerId, game.players, closeModal,game.currentTrick]);

//ai card play
function getCardValue(card, leadSuit) {
  const rankOrder = {
    '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };

  const rankValue = rankOrder[card.rank] || 0;

  // Spades trump everything
  if (card.suit === '♠') {
    // Give spades an offset above other suits
    return 100 + rankValue;
  }

  // Cards that are not spades but follow the lead suit rank normally
  if (card.suit === leadSuit) {
    return rankValue;
  }

  // Cards that are neither lead suit nor spades are lowest value
  return 0;
}

 function chooseAICard(aiHand, currentTrick, isSpadesBroken) {
  if (!Array.isArray(aiHand) || aiHand.length === 0) return null;


  function parseCard(card) {
  const suit = card.slice(-1);
  const rank = card.slice(0, -1);
  return { rank, suit };
  }

  // Parse AI hand and trick
  const parsedHand = aiHand.map(card => ({ ...parseCard(card), original: card }));
const parsedTrick = currentTrick.map(card => parseCard(card.cardValue));
  const leadSuit = parsedTrick.length > 0 ? parsedTrick[0].suit : null;

  const cardsOfLeadSuit = parsedHand.filter(card => card.suit === leadSuit);
  const spades = parsedHand.filter(card => card.suit === '♠');
  const nonSpades = parsedHand.filter(card => card.suit !== '♠');

  

  const getLowestCard = (cards) => {
    if (!cards || cards.length === 0) return null;
    return cards.reduce((lowest, card) =>
      getCardValue(card, leadSuit) < getCardValue(lowest, leadSuit) ? card : lowest
    );
  };



  
  // Decision logic
  if (!leadSuit) {
    if (isSpadesBroken && spades.length > 0) {
      return getLowestCard(spades)?.original;
    } else {
      const fallback = nonSpades.length > 0 ? nonSpades : parsedHand;
      return getLowestCard(fallback)?.original;
    }
  }

  if (cardsOfLeadSuit.length > 0) {
    return getLowestCard(cardsOfLeadSuit)?.original;
  }

  if (spades.length > 0 && isSpadesBroken) {
    return getLowestCard(spades)?.original;
  }

  return getLowestCard(parsedHand)?.original;

}

function determineTrickWinner(currentTrick) {
  if (currentTrick.length === 0) return null;

  const leadSuit = currentTrick[0].suit;

  let winningCard = currentTrick[0];
  let highestValue = getCardValue(winningCard, leadSuit);

  for (let i = 1; i < currentTrick.length; i++) {
    const card = currentTrick[i];
    const value = getCardValue(card, leadSuit);
    if (value > highestValue) {
      winningCard = card;
      highestValue = value;
    }
  }
  console.log(currentTrick)
  console.log(winningCard);
  return winningCard; // assumed card has `.playerId`
}

const handleTrickWinner = useCallback((currentTrick) => {
   
  const winner = determineTrickWinner(currentTrick);

  setGame(prevGame => {

    const newTrickHistory = [...prevGame.trickHistory, currentTrick];
    const newTrickCounts = {...prevGame.trickCounts};
    newTrickCounts[winner.playerId] = (newTrickCounts[winner.playerId] || 0) + 1;

    return{
      ...prevGame,
      currentTrick: [],
      currentPlayerId: winner.playerId,
      trickHistory: newTrickHistory,
      trickCounts: newTrickCounts,
    };

  });
});
 
//game flow

const [hasDealtCards, setHasDealtCards] = useState(false);


useEffect(() => {
  if (!hasDealtCards) {
    dealCards();
    setHasDealtCards(true);
  }
}, [hasDealtCards, dealCards]);

useEffect(()=> {
  const currentPlayer = game.players[game.currentPlayerId];

  if(!currentPlayer || currentPlayer.isHuman){
    return;
  }

  const timer = setTimeout(()=> {
    if(game.gamePhase === gamePhases.bidding){
      aiBid(currentPlayer.id);
    }else if (game.gamePhase === gamePhases.playingTrick){
      const cardToPlay = chooseAICard(currentPlayer.hand, game.currentTrick,game.isSpadesBroken);
      console.log(cardToPlay)
      if(cardToPlay){
        setGame(prevGame => {
          const newPlayers = prevGame.players.map(p =>
            p.id === currentPlayer.id ? {...p, hand: p.hand.filter(c => c !== cardToPlay)} : p
          );
            const newTrick = [...prevGame.currentTrick, {playerId: currentPlayer.id, cardValue: cardToPlay}];

            let nextPlayerId = (currentPlayer.id + 1) % numPlayers;
            let newPhase = gamePhases.playingTrick;

            if(newTrick.length === numPlayers){
              
              const winner = determineTrickWinner(newTrick);
              handleTrickWinner(newTrick);
              newPhase = gamePhases.playingTrick;
              nextPlayerId = winner.playerId;
              console.log(winner.playerId);
              console.log(game.trickCounts)
              setModalMessage(`AI played Trick Over! Cards: ${newTrick.map(c=>c.cardValue).join(', ')}.Winner is ${winner.playerId} tricks Won ${game.trickCounts[winner.playerId]}`);
              setIsModalOpen(true);
              setTimeout(()=> {
                closeModal();
                setGame(g => ({...g, currentTrick: [], currentPlayerId: g.players[0].id}));

              },7000);
            }

            return{
              ...prevGame,
              players: newPlayers,
              currentTrick: newTrick.length === numPlayers ? [] : newTrick,
              currentPlayerId: newTrick.length === numPlayers ? (game.players[0].id): nextPlayerId,
              gamePhase: newPhase,
            };

        });
      }
    }
  }, 1000);

  return () => clearTimeout(timer);

},[game.currentPlayerId,game.gamePhase,game.players, aiBid, chooseAICard, closeModal]);
 
const humanplayer = game.players[0];


  

  
  return (
  <DndProvider backend={HTML5Backend}>
    <div className="relative h-screen w-screen bg-green-900 font-inter flex flex-col items-center justify-between">
      

        {game.players.map(player => {
          let className = 'avatar-img absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover z-20';
        // Dynamic positioning based on player ID
        if (player.id === 0) className += ' bottom-4 left-1/2 transform -translate-x-1/2'; // Human (Bottom)
        else if (player.id === 1) className += ' left-4 top-1/2 transform -translate-y-1/2'; // Iggy (Left)
        else if (player.id === 2) className += ' top-4 left-1/2 transform -translate-x-1/2'; // Raffey (Top)
        else if (player.id === 3) className += ' right-4 top-1/2 transform -translate-y-1/2'; // BlindMan (Right)
       
       if(player.id === game.currentPlayerId){
          className += 'border-purple-400 ring-4 ring-purple-400';
       }

       return(
       
          <div key={player.id} className={className}>
              <img src = {player.avatar} alt={`${player.name} Avatar`}/>
              <div className='absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold bg-gray-700 px-2 py-1 rounded'>
                {player.name}
              
              </div>
              {game.gamePhase !== gamePhases.dealing && player.bid !== null && (
                <div className='absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-md font-bold bg-purple-700 px-2 py-1 rounded'>
                  Bid: {player.bid}
                </div>
              )}
              {game.gamePhase === gamePhases.playingTrick && game.currentTrick.find(t => t.playerId === player.id) &&(
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30'>
                  <Card value ={game.currentTrick.find(t => t.playerId === player.id).cardValue} isPlayed = {true}/>
                </div>
              )}
              </div>

       );
       
       })}

        



      

      
        
        <div className="flex-grow flex flex-col items-center justify-center w-full max-w-3xl px-4 z-1">
          <h2 className = 'text-white text-xl font-bold mb-4'>
            {game.gamePhase === gamePhases.bidding && game.players[game.currentPlayerId].isHuman
              ?`Your turn to Bid ${game.currentPlayerId + 1}`
              : game.gamePhase === gamePhases.bidding
              ?`Player ${game.currentPlayerId + 1} is bidding`
              :game.players[game.currentPlayerId].isHuman
              ? `Your turn to play ${game.currentPlayerId + 1}`
              :`${game.currentPlayerId + 1} is playing`
            
            }
          </h2>

          {game.gamePhase === gamePhases.bidding && humanplayer.isHuman && game.currentPlayerId === humanplayer.id && !game.humanBidConfirmed && (
            <div className='flex items-center space-x-2 mb-4'>
              <label htmlFor= "bid" className='text-white text-lg'>Your Bid: </label>
              <select
                id='bid'
                className='p-2 rounded bg-white text-gray-800'
                onChange = {(e) => handleHumanBid(parseInt(e.target.value))}
                value = {humanplayer.bid || ''}
              >
                <option value = "">Select Bid</option>
                {Array.from({length: cardsPerHand}, (_,i) => i + 1).map(bid =>(
                  <option key = {bid} value= {bid}>{bid}</option>
                ))}
              </select>
            </div>
          )}


          <PlayArea onDrop = {handleHumanCardPlay} disabled = { false/*game.gamePhase !== gamePhases.playingTrick|| !humanplayer.isHuman || game.currentPlayerId !== humanplayer.id*/}/>

          {game.currentTrick.length > 0 && (
            <div className='flex justify-center mt-4 space-x-2'>
                {game.currentTrick.map((playedCard, index) => (
                  <div key ={index} className='relative'>
                    <Card value ={playedCard.cardValue} isPlayed = {true}/>
                    <span className='absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs bg-gray-700 px-1 py-0.5 rounded'>
                      P{playedCard.playerId + 1}
                    </span>
                  </div>
                ))}

            </div>
          )}


        </div>

        
        <div className="w-full max-w-4xl flex flex-wrap justify-center gap-4 p-4 bg-green-800 rounded-t-3xl shadow-xl border-t-4 border-green-800 z-10 mb-15">
         
         {Array.isArray(humanplayer?.hand) && humanplayer.hand.map((cardValue) => (
            <Card
              key = {cardValue}
              value = {cardValue}
              isDraggable = {game.gamePhase === gamePhases.playingTrick && humanplayer.isHuman && game.currentPlayerId === humanplayer.id}
            />
         ))}
        </div>
      

      
      {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
    </div>
    </DndProvider>
  );
}

export default App;
