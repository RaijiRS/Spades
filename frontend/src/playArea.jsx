import {useDrop} from 'react-dnd'

export default function PlayArea({onDrop}) {
    const [isOver, dropRef] = useDrop(() => ({
        accept: 'CARD',
        drop: (item) => onDrop(item.value),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return(
        <div 
            ref={dropRef}
            className = {`
                h-40 
                w-40
                border-4
                border-dashed
                border-black
                flex items-center
                justify-center
                bg-green
                rounded-full
                

                `}
        >
            Drop card here 
        </div>
    );
}