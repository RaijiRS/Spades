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
            className = {`w-12.5 h-20 border rounded-lg shadow flex items-center justify-center text-3xl cursor-move`} //tailwind utlity class
        >
            {value}
        </div>
    );

}