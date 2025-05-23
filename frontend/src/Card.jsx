import {useDrag} from 'react-dnd'

export default function Card({value}){
    const [{isDragging}, dragRef] = useDrag(() =>({
        type: 'CARD',
        item: {value},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return(
        <div
            ref = {dragRef}
            className = {`w-20 h-32 border rounded-lg shadow flex items-center justify-center text-3xl bg-white cursor-move ${isDragging ? 'opacity-50': ''}`} //tailwind utlity class
        >
            {value}
        </div>
    );

}