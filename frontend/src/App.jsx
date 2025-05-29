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

// Card Generation Logic 
function generateRandomHand(numCards = 13) {
  const suits = ['♠', '♥', '♦', '♣']; // Spades, Hearts, Diamonds, Clubs
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(rank + suit); 
    }
  }

  // Shuffle the deck (Fisher-Yates algorithm)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [deck[i], deck[j]] = [deck[j], deck[i]]; 
  }

  // Draw the specified number of cards
  return deck.slice(0, numCards);
}

function App() {
  // State for managing the custom modal messages
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  
  const [playerCards, setPlayerCards] = useState([]);

  // Initialize the player's hand with 13 random cards when the component mounts
  useEffect(() => {
    setPlayerCards(generateRandomHand(13));
  }, []); 

  // Avatars array (kept from your original code, though not directly used in rendering below)
  const avatars = [
    raffey,
    dudu,
    Iggy,
    blindMan
  ];

 
  const handleDrop = useCallback((cardValue) => {
    setModalMessage(`Card played: ${cardValue}`);
    setIsModalOpen(true);
    // Remove the played card from the player's hand
    setPlayerCards(prevCards => prevCards.filter(card => card !== cardValue));
  }, []);

  // Function to close the modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMessage('');
  }, []);

  return (
    <div className="relative h-screen w-screen bg-green-500 font-inter flex flex-col items-center justify-between">
      
      <img
        src={raffey}
        alt='Top Player Avatar' 
        className='avatar-img absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover z-20'
      />
      <img
        src={Iggy}
        alt='Left Player Avatar' 
        className='avatar-img absolute left-4 top-1/2 transform -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover z-20'
      />
      <img
        src={blindMan}
        alt='Right Player Avatar' 
        className='avatar-img absolute right-4 top-1/2 transform -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover z-20'
      />
      <img
        src={dudu}
        alt='Bottom Player Avatar' 
        className='avatar-img absolute bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover z-20'
      />

      <DndProvider backend={HTML5Backend}>
        
        <div className="flex-grow flex items-center justify-center w-full max-w-3xl px-4">
          <PlayArea onDrop={handleDrop} />
        </div>

        
        <div className="w-full max-w-4xl flex flex-wrap justify-center gap-4 p-4 bg-green-600 rounded-t-3xl shadow-xl border-t-4 border-green-700 z-10 mb-15">
         
          {playerCards.map((c, i) => (
            <Card key={i} value={c} />
          ))}
        </div>
      </DndProvider>

      
      {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
    </div>
  );
}

export default App;
