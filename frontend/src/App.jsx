import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend';
import Card from './Card'
import PlayArea from './playArea'

function App() {
  const cards = ['🂡', '🂢', '🂣', '🂤'];

  const handleDrop = (card) => {
    alert('Card played: ${card}');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className = "p-4 space-y-4">
        <div className = "flex gap-4">
          {cards.map((c,i) =>(
            <Card key={i} value={c}/>
          ))}
        </div>
        <PlayArea onDrop = {handleDrop}/>
      </div>

      
    </DndProvider>
  );
}

export default App
