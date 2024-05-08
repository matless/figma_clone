import { useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors"
import { useCallback } from "react";

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updatemyPresece] = useMyPresence() as any;

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updatemyPresece({ cursor: { x, y } });
    }, []);

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        event.preventDefault();
        updatemyPresece({ cursor: null, message: null });
    }, []);

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updatemyPresece({ cursor: { x, y } });
    }, []);
    return (
        <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        className="h-[100vh] w-full flex justify-center items-center text-center 
        text-2xl text-white border-2 border-green-500"
        >
            <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>
            <LiveCursors others={others}/>
        </div>
    )
}

export default Live