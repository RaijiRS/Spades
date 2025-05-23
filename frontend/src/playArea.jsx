import {useDrop} from 'react-dnd'

export default function PlayArea({onDrop}) {
    const [{isOver}, dropRef] = useDrop(() => ({
        accept: 'CARD',
        drop: (item) => onDrop(item.value),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return(
        <div 
            ref={dropRef}
            className = {`h-40 border-2 border-dashed flex items-center justify-center ${isOver? 'bg-green-100' : 'bg-gray-100'}`}
        >
            Drop card here
        </div>
    );
}